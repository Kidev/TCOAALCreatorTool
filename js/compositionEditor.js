/*
 *  TCOAAL Creator Tool
 *  Copyright (C) 2025, Alexandre 'kidev' Poumaroux
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as published
 *  by the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

class CompositionEditor {
    constructor() {
        this.layers = [];
        this.canvas = null;
        this.ctx = null;
        this.selectedLayerId = null;
        this.animationFrameId = null;
        this.gridSize = 48;
        this.canvasWidth = 1296;
        this.canvasHeight = 720;
        this.isOpen = false;
        this.autoOpen = false;
        this.autoOpenButtonManager = new DropDownButton(
            (mode) => {
                this.autoOpen = +mode;
            },
            () => {
                return +this.autoOpen;
            },
            () => {
                return {
                    "0": "Add to compositor",
                    "1": "Add to editor and view",
                };
            },
        );

        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.dragLayerStartX = 0;
        this.dragLayerStartY = 0;

        this.isPlayingPreview = false;
        this.previewStartTime = null;
        this.previewAnimationId = null;

        this.moveAsKeyframeMode = false;
        this.moveAsKeyframeSourceId = null;
        this.importAsKeyframeMode = false;

        this.previewBackgroundImage = null;
        this.previewBackgroundBlobUrl = null;
        this.previewBackgroundVisible = true;

        this.audioLayer = null;
        this.audioKeyframes = [];
        this.selectedAudioKeyframeIndex = 0;
        this.audioLayerVisible = true;
        this.audioContext = null;
        this.currentAudioPlayback = [];
        this.currentAudioPreview = null;
        this.isPlayingAudioPreview = false;

        this.notificationQueue = [];
        this.currentNotificationIndex = 0;
        this.notificationTimeout = null;

        /*this.getAutoOpenTitle = () => {
            return this.autoOpen === true
                ? "Will also open the editor, click to change"
                : "Will only add the asset in the background, click to change";
        };*/

        this.GIF_RENDER_SETTINGS = {
            maxColors: 256,
            colorFormat: "rgba565",
            oneBitAlpha: false,

            paletteFormat: "rgba565",

            enableTransparency: true,
            transparentIndex: 0,

            useDithering: true,

            defaultFrameDelay: 33,
            spriteFrameDelay: 50,

            replaceTransparencyWithBlack: true,
        };
    }

    generateId() {
        return "layer-" + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }

    async parseGifDuration(blobUrl) {
        try {
            const response = await fetch(blobUrl);
            const arrayBuffer = await response.arrayBuffer();
            const bytes = new Uint8Array(arrayBuffer);

            const header = String.fromCharCode(...bytes.slice(0, 6));
            if (!header.startsWith("GIF")) {
                return null;
            }

            let totalDuration = 0;
            let frameCount = 0;
            let pos = 13;

            const packed = bytes[10];
            if (packed & 0x80) {
                const globalColorTableSize = 3 * Math.pow(2, (packed & 0x07) + 1);
                pos += globalColorTableSize;
            }

            while (pos < bytes.length) {
                const separator = bytes[pos];

                if (separator === 0x21) {
                    const label = bytes[pos + 1];
                    if (label === 0xf9) {
                        const delay = bytes[pos + 4] | (bytes[pos + 5] << 8);
                        totalDuration += delay * 10; // delay is in 1/100 seconds
                        frameCount++;
                    }

                    pos += 2;
                    let blockSize = bytes[pos];
                    pos++;
                    while (blockSize !== 0) {
                        pos += blockSize;
                        blockSize = bytes[pos];
                        pos++;
                    }
                } else if (separator === 0x2c) {
                    pos += 9;
                    const packed = bytes[pos];
                    pos++;
                    if (packed & 0x80) {
                        const localColorTableSize = 3 * Math.pow(2, (packed & 0x07) + 1);
                        pos += localColorTableSize;
                    }

                    pos++;
                    let blockSize = bytes[pos];
                    pos++;
                    while (blockSize !== 0) {
                        pos += blockSize;
                        if (pos >= bytes.length) break;
                        blockSize = bytes[pos];
                        pos++;
                    }
                } else if (separator === 0x3b) {
                    break;
                } else {
                    pos++;
                }
            }

            return frameCount > 1 ? totalDuration : null;
        } catch (error) {
            console.error("Error parsing GIF:", error);
            return null;
        }
    }

    calculateAnimationDuration(keyframeOrLayer) {
        if (keyframeOrLayer.type === "sprite" && keyframeOrLayer.isAnimated && keyframeOrLayer.spriteIndices) {
            const frameCount = keyframeOrLayer.spriteIndices.length;
            const speed = keyframeOrLayer.animationSpeed || 250;
            return frameCount * speed;
        }

        if (keyframeOrLayer.gifDuration) {
            return keyframeOrLayer.gifDuration;
        }
        return null;
    }

    calculateRequiredCanvasSize() {
        let maxRight = 0;
        let maxBottom = 0;

        for (const layer of this.layers) {
            if (layer.hasKeyframes && layer.keyframes.length > 0) {
                for (const kf of layer.keyframes) {
                    if (kf.width && kf.height) {
                        const right = kf.x + kf.width;
                        const bottom = kf.y + kf.height;
                        maxRight = Math.max(maxRight, right);
                        maxBottom = Math.max(maxBottom, bottom);
                    }
                }
            } else {
                if (layer.width && layer.height) {
                    const right = layer.x + layer.width;
                    const bottom = layer.y + layer.height;
                    maxRight = Math.max(maxRight, right);
                    maxBottom = Math.max(maxBottom, bottom);
                }
            }
        }

        return { width: maxRight || 1296, height: maxBottom || 720 };
    }

    updateCanvasSize() {
        const { width, height } = this.calculateRequiredCanvasSize();

        if (this.canvasWidth !== width || this.canvasHeight !== height) {
            this.canvasWidth = width;
            this.canvasHeight = height;

            if (this.canvas) {
                this.canvas.width = width;
                this.canvas.height = height;
            }
        }
    }

    init() {
        this.canvas = document.getElementById("compositionCanvas");
        if (!this.canvas) return;

        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;

        this.updateCanvasSize();

        this.ctx = this.canvas.getContext("2d", { alpha: true, willReadFrequently: false });

        this.setupCanvasEventHandlers();
    }

    getPixelAtPosition(layer, x, y) {
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = this.canvasWidth;
        tempCanvas.height = this.canvasHeight;
        const tempCtx = tempCanvas.getContext("2d", { alpha: true, willReadFrequently: true });

        const renderData = this.getLayerRenderData(layer);

        if (renderData.type === "sprite" && renderData.spriteCanvases && renderData.spriteCanvases.length > 0) {
            const spriteIndex = renderData.isAnimated
                ? renderData.spriteIndices[layer.currentSpriteIndex]
                : renderData.spriteIndices[0];
            const spriteCanvas = renderData.spriteCanvases[spriteIndex];
            if (spriteCanvas) {
                tempCtx.drawImage(spriteCanvas, renderData.x, renderData.y);
            }
        } else if (renderData.image && renderData.imageLoaded) {
            tempCtx.drawImage(renderData.image, renderData.x, renderData.y, renderData.width, renderData.height);
        }

        try {
            const pixelData = tempCtx.getImageData(Math.floor(x), Math.floor(y), 1, 1).data;
            return {
                r: pixelData[0],
                g: pixelData[1],
                b: pixelData[2],
                a: pixelData[3],
            };
        } catch (e) {
            return { r: 0, g: 0, b: 0, a: 0 };
        }
    }

    setupCanvasEventHandlers() {
        if (!this.canvas) return;

        this.canvas.onmousedown = null;
        this.canvas.onmousemove = null;
        this.canvas.onmouseup = null;
        this.canvas.onmouseleave = null;

        this.canvas.addEventListener("mousedown", (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvasWidth / rect.width;
            const scaleY = this.canvasHeight / rect.height;
            const mouseX = (e.clientX - rect.left) * scaleX;
            const mouseY = (e.clientY - rect.top) * scaleY;

            const reversedLayers = [...this.layers].reverse();
            for (const layer of reversedLayers) {
                if (!layer.visible) continue;

                const renderData = this.getLayerRenderData(layer);

                if (
                    mouseX >= renderData.x &&
                    mouseX <= renderData.x + renderData.width &&
                    mouseY >= renderData.y &&
                    mouseY <= renderData.y + renderData.height
                ) {
                    const pixel = this.getPixelAtPosition(layer, mouseX, mouseY);

                    if (pixel.a > 0) {
                        this.selectLayer(layer.id);

                        this.isDragging = true;
                        this.dragStartX = mouseX;
                        this.dragStartY = mouseY;
                        this.dragLayerStartX = renderData.x;
                        this.dragLayerStartY = renderData.y;

                        this.canvas.style.cursor = "grabbing";
                        this.render();
                        break;
                    }
                }
            }
        });

        this.canvas.addEventListener("mousemove", (e) => {
            if (!this.isDragging || !this.selectedLayerId) return;

            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvasWidth / rect.width;
            const scaleY = this.canvasHeight / rect.height;
            const mouseX = (e.clientX - rect.left) * scaleX;
            const mouseY = (e.clientY - rect.top) * scaleY;

            const deltaX = mouseX - this.dragStartX;
            const deltaY = mouseY - this.dragStartY;

            const newX = this.dragLayerStartX + deltaX;
            const newY = this.dragLayerStartY + deltaY;

            this.updateLayerPosition(this.selectedLayerId, newX, newY, true);
        });

        this.canvas.addEventListener("mouseup", () => {
            if (this.isDragging) {
                this.isDragging = false;
                this.canvas.style.cursor = "default";
            }
        });

        this.canvas.addEventListener("mouseleave", () => {
            if (this.isDragging) {
                this.isDragging = false;
                this.canvas.style.cursor = "default";
            }
        });

        this.canvas.addEventListener("mousemove", (e) => {
            if (this.isDragging) return;

            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvasWidth / rect.width;
            const scaleY = this.canvasHeight / rect.height;
            const mouseX = (e.clientX - rect.left) * scaleX;
            const mouseY = (e.clientY - rect.top) * scaleY;

            const reversedLayers = [...this.layers].reverse();
            let hovering = false;
            for (const layer of reversedLayers) {
                if (!layer.visible) continue;

                const renderData = this.getLayerRenderData(layer);

                if (
                    mouseX >= renderData.x &&
                    mouseX <= renderData.x + renderData.width &&
                    mouseY >= renderData.y &&
                    mouseY <= renderData.y + renderData.height
                ) {
                    const pixel = this.getPixelAtPosition(layer, mouseX, mouseY);
                    if (pixel.a > 0) {
                        hovering = true;
                        break;
                    }
                }
            }

            this.canvas.style.cursor = hovering ? "grab" : "default";
        });
    }

    generateDefaultCompositionName() {
        const existingNames = new Set();

        if (window.gameImporterAssets && window.gameImporterAssets.images && window.gameImporterAssets.images["Misc"]) {
            const miscAssets = window.gameImporterAssets.images["Misc"];
            for (const fileName in miscAssets) {
                const nameWithoutExt = fileName.replace(/\.(png|gif)$/i, "");
                existingNames.add(nameWithoutExt);
            }
        }

        let counter = 1;
        let name = `composition_${counter}`;

        while (existingNames.has(name)) {
            counter++;
            name = `composition_${counter}`;
        }

        return name;
    }

    open() {
        const modal = document.getElementById("compositionEditorModal");
        if (modal) {
            modal.style.display = "flex";
            this.isOpen = true;

            if (!this.canvas || !this.ctx) {
                this.init();
            } else {
                this.updateCanvasSize();
            }

            this.render();
            this.ensureLoadingOverlay();
            this.ensureNotificationArea();

            const inputEl = document.getElementById("compositionNameInput");
            if (inputEl) {
                const currentValue = inputEl.value?.trim();

                if (!currentValue || /^composition_\d+$/.test(currentValue)) {
                    inputEl.value = this.generateDefaultCompositionName();
                }
            }
        }
    }

    close() {
        const modal = document.getElementById("compositionEditorModal");
        if (modal) {
            modal.style.display = "none";
            this.isOpen = false;
            this.stopPreview();
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }
        }
    }

    loadPreviewBackground(file) {
        if (!file) return;

        if (this.previewBackgroundBlobUrl) {
            URL.revokeObjectURL(this.previewBackgroundBlobUrl);
        }

        this.previewBackgroundBlobUrl = URL.createObjectURL(file);
        const img = new Image();

        img.onload = () => {
            this.previewBackgroundImage = img;
            this.previewBackgroundVisible = true;
            this.updateBackgroundControls();
            this.render();
            if (this.isPlayingPreview) {
                this.renderPreviewFrame();
            }
        };

        img.onerror = () => {
            this.showNotification("Failed to load background image", "error");
            URL.revokeObjectURL(this.previewBackgroundBlobUrl);
            this.previewBackgroundBlobUrl = null;
        };

        img.src = this.previewBackgroundBlobUrl;
    }

    togglePreviewBackground() {
        this.previewBackgroundVisible = !this.previewBackgroundVisible;
        this.updateBackgroundControls();
        this.render();
        if (this.isPlayingPreview) {
            this.renderPreviewFrame();
        }
    }

    removePreviewBackground() {
        if (this.previewBackgroundBlobUrl) {
            URL.revokeObjectURL(this.previewBackgroundBlobUrl);
        }
        this.previewBackgroundImage = null;
        this.previewBackgroundBlobUrl = null;
        this.previewBackgroundVisible = true;
        this.updateBackgroundControls();
        this.render();
        if (this.isPlayingPreview) {
            this.renderPreviewFrame();
        }
    }

    updateBackgroundControls() {
        const toggleBtn = document.getElementById("previewBackgroundToggleBtn");
        const removeBtn = document.getElementById("previewBackgroundRemoveBtn");
        const templateBtn = document.getElementById("previewBackgroundSelectBtn");

        if (this.previewBackgroundImage) {
            if (toggleBtn) {
                toggleBtn.style.display = "inline-block";
                toggleBtn.textContent = this.previewBackgroundVisible ? "☑" : "☐";
                toggleBtn.classList.toggle("success", this.previewBackgroundVisible);
            }
            if (removeBtn) {
                removeBtn.style.display = "inline-block";
            }
            if (templateBtn) {
                templateBtn.style.display = "none";
            }
        } else {
            if (toggleBtn) toggleBtn.style.display = "none";
            if (removeBtn) removeBtn.style.display = "none";
            templateBtn.style.display = "";
        }
    }

    ensureLoadingOverlay() {
        if (document.getElementById("compositionLoadingOverlay")) return;

        const overlay = document.createElement("div");
        overlay.id = "compositionLoadingOverlay";
        overlay.className = "composition-loading-overlay";
        overlay.style.display = "none";
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <div class="loading-text">Generating GIF...</div>
                <div class="loading-progress"></div>
            </div>
        `;

        const modal = document.getElementById("compositionEditorModal");
        if (modal) {
            modal.appendChild(overlay);
        }
    }

    ensureNotificationArea() {
        if (document.getElementById("compositionNotificationArea")) return;

        const notificationArea = document.createElement("div");
        notificationArea.id = "compositionNotificationArea";
        notificationArea.className = "composition-notification-area";

        const modal = document.getElementById("compositionEditorModal");
        const header = modal?.querySelector(".composition-editor-header");
        if (header) {
            header.appendChild(notificationArea);
        }
    }

    showNotification(message, type = "info", duration = 4000, customClass = "") {
        if (customClass === "move-as-keyframe-notification") {
            this.ensureNotificationArea();
            const area = document.getElementById("compositionNotificationArea");
            if (!area) return;

            const notification = document.createElement("div");
            notification.className = `composition-notification composition-notification-${type} ${customClass}`;
            notification.innerHTML = `
                <span class="notification-message">${message}</span>
                <button class="notification-close notification-btn" onclick="compositionEditor.cancelMoveAsKeyframeMode()">Cancel</button>
            `;
            area.appendChild(notification);
            return;
        }

        this.notificationQueue.push({
            message,
            type,
            duration,
            customClass,
            timestamp: Date.now(),
        });

        if (this.notificationQueue.length === 1) {
            this.currentNotificationIndex = 0;
            this.displayCurrentNotification();
        } else {
            this.currentNotificationIndex = this.notificationQueue.length - 1;
            this.displayCurrentNotification();
        }
    }

    displayCurrentNotification() {
        this.ensureNotificationArea();
        const area = document.getElementById("compositionNotificationArea");
        if (!area || this.notificationQueue.length === 0) return;

        const existing = area.querySelectorAll(".composition-notification:not(.move-as-keyframe-notification)");
        existing.forEach((n) => n.remove());

        const currentNotif = this.notificationQueue[this.currentNotificationIndex];
        const totalNotifs = this.notificationQueue.length;

        const notification = document.createElement("div");
        const customClassStr = currentNotif.customClass ? ` ${currentNotif.customClass}` : "";
        notification.className = `composition-notification composition-notification-${currentNotif.type}${customClassStr}`;

        const hasMultiple = totalNotifs > 1;
        const canGoPrev = this.currentNotificationIndex > 0;
        const canGoNext = this.currentNotificationIndex < totalNotifs - 1;

        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px; width: 100%;">
                ${
                    hasMultiple
                        ? `
                    <button class="notification-nav-btn"
                            onclick="compositionEditor.navigateNotification(-1)"
                            ${!canGoPrev ? 'disabled style="opacity: 0.3;"' : ""}
                            title="Previous notification">◀</button>
                `
                        : ""
                }
                <span class="notification-message" style="flex: 1;">${currentNotif.message}</span>
                ${
                    hasMultiple
                        ? `
                    <span style="font-size: 0.85em; opacity: 0.8; white-space: nowrap;">${this.currentNotificationIndex + 1}/${totalNotifs}</span>
                    <button class="notification-nav-btn"
                            onclick="compositionEditor.navigateNotification(1)"
                            ${!canGoNext ? 'disabled style="opacity: 0.3;"' : ""}
                            title="Next notification">▶</button>
                `
                        : ""
                }
                <button class="notification-close" onclick="compositionEditor.closeCurrentNotification()">✕</button>
            </div>
        `;

        area.appendChild(notification);

        const totalDuration = this.notificationQueue.reduce((sum, n) => sum + (n.duration > 0 ? n.duration : 0), 0);

        if (this.notificationTimeout) {
            clearTimeout(this.notificationTimeout);
            this.notificationTimeout = null;
        }

        if (totalDuration > 0) {
            this.notificationTimeout = setTimeout(() => {
                this.clearAllNotifications();
            }, totalDuration);
        }
    }

    navigateNotification(direction) {
        const newIndex = this.currentNotificationIndex + direction;
        if (newIndex >= 0 && newIndex < this.notificationQueue.length) {
            this.currentNotificationIndex = newIndex;
            this.displayCurrentNotification();
        }
    }

    closeCurrentNotification() {
        if (this.notificationQueue.length === 0) return;

        this.notificationQueue.splice(this.currentNotificationIndex, 1);

        if (this.currentNotificationIndex >= this.notificationQueue.length) {
            this.currentNotificationIndex = Math.max(0, this.notificationQueue.length - 1);
        }

        if (this.notificationQueue.length > 0) {
            this.displayCurrentNotification();
        } else {
            const area = document.getElementById("compositionNotificationArea");
            if (area) {
                const existing = area.querySelectorAll(".composition-notification:not(.move-as-keyframe-notification)");
                existing.forEach((n) => n.remove());
            }
            if (this.notificationTimeout) {
                clearTimeout(this.notificationTimeout);
                this.notificationTimeout = null;
            }
        }
    }

    clearAllNotifications() {
        this.notificationQueue = [];
        this.currentNotificationIndex = 0;

        if (this.notificationTimeout) {
            clearTimeout(this.notificationTimeout);
            this.notificationTimeout = null;
        }

        const area = document.getElementById("compositionNotificationArea");
        if (area) {
            const existing = area.querySelectorAll(".composition-notification:not(.move-as-keyframe-notification)");
            existing.forEach((n) => {
                n.classList.add("fade-out");
                setTimeout(() => n.remove(), 300);
            });
        }
    }

    clearNotifications() {
        this.clearAllNotifications();
    }

    showLoading(text = "Processing...") {
        const overlay = document.getElementById("compositionLoadingOverlay");
        if (overlay) {
            overlay.querySelector(".loading-text").innerHTML = text;
            overlay.querySelector(".loading-progress").textContent = "";
            overlay.style.display = "flex";
        }
    }

    updateLoadingProgress(current, total) {
        const overlay = document.getElementById("compositionLoadingOverlay");
        if (overlay) {
            const percent = Math.round((current / total) * 100);
            overlay.querySelector(".loading-progress").textContent = `Frame ${current} / ${total} (${percent}%)`;
        }
    }

    hideLoading() {
        const overlay = document.getElementById("compositionLoadingOverlay");
        if (overlay) {
            overlay.style.display = "none";
        }
    }

    toggleAutoOpen() {
        this.autoOpen = !this.autoOpen;
    }

    navigateToCompositionInGallery(fileName) {
        if (typeof switchGalleryTab === "function") {
            switchGalleryTab("images");
        }

        setTimeout(() => {
            if (typeof selectGalleryCategory === "function") {
                selectGalleryCategory("Misc");
            }

            setTimeout(() => {
                const galleryItems = document.querySelectorAll(".gallery-item");
                for (const item of galleryItems) {
                    const itemFileName = item.getAttribute("data-filename");
                    if (itemFileName === fileName) {
                        item.click();

                        if (window.galleryManager) {
                            window.galleryManager.scrollIfRequired(item);
                        }
                        break;
                    }
                }
            }, 100);
        }, 100);
    }

    addLayer(assetData) {
        const layer = {
            id: this.generateId(),
            name: assetData.name || "Layer " + (this.layers.length + 1),
            type: assetData.type || "background",
            assetRef: assetData.assetRef || null,
            blobUrl: assetData.blobUrl || null,
            x: assetData.x || 0,
            y: assetData.y || 0,
            width: assetData.width || 0,
            height: assetData.height || 0,
            visible: true,
            zIndex: this.layers.length,

            isAnimated: assetData.isAnimated || false,
            spriteIndices: assetData.spriteIndices || [],
            currentSpriteIndex: 0,
            animationSpeed: assetData.animationSpeed || 250,
            spriteCanvases: assetData.spriteCanvases || [],
            spriteVariant: assetData.spriteVariant || null,
            lastAnimationTime: Date.now(),

            image: null,
            imageLoaded: false,

            hasKeyframes: assetData.hasKeyframes || false,
            keyframes: assetData.keyframes || [],
            selectedKeyframeIndex: 0,
        };

        if (layer.type === "sprite" && layer.spriteCanvases.length > 0) {
            layer.imageLoaded = true;
            this.layers.push(layer);
            this.updateCanvasSize();
            this.updateLayersList();
            this.render();
        } else if (layer.blobUrl) {
            this.layers.push(layer);
            const img = new Image();
            img.onload = async () => {
                layer.image = img;
                layer.imageLoaded = true;
                layer.width = layer.width || img.width;
                layer.height = layer.height || img.height;

                const gifDuration = await this.parseGifDuration(layer.blobUrl);
                if (gifDuration) {
                    layer.gifDuration = gifDuration;
                }

                if (this.layers.length === 1 && layer.x === 0 && layer.y === 0) {
                    layer.x = 0;
                    layer.y = 0;
                }
                this.updateCanvasSize();
                this.updateLayersList();
                this.render();
            };
            img.src = layer.blobUrl;
        } else {
            this.layers.push(layer);
            this.updateCanvasSize();
            this.updateLayersList();
            this.render();
        }

        if (window.galleryManager) {
            window.galleryManager.flashSuccessOnButton();
        }

        return layer.id;
    }

    removeLayer(layerId) {
        const index = this.layers.findIndex((l) => l.id === layerId);
        if (index !== -1) {
            this.layers.splice(index, 1);

            this.layers.forEach((layer, idx) => {
                layer.zIndex = idx;
            });
            this.updateCanvasSize();
            this.updateLayersList();
            this.render();
        }
    }

    addAudioKeyframe(assetData) {
        if (!this.audioLayer) {
            this.audioLayer = {
                id: this.generateId(),
                name: "Audio track",
                type: "audio",
                visible: true,
            };
            this.selectedAudioKeyframeIndex = 0;
        }

        let time = assetData.time;
        if (time === undefined || time === null) {
            if (this.audioKeyframes.length > 0) {
                const lastTime = Math.max(...this.audioKeyframes.map((kf) => kf.time));
                time = lastTime + 1000;
            } else {
                time = 0;
            }
        }

        const keyframe = {
            id: this.generateId(),
            name: assetData.name,
            time: time,
            speed: assetData.speed || 1.0,
            pitch: assetData.pitch || 0,
            assetRef: assetData.assetRef,
            blobUrl: assetData.blobUrl,
            duration: 3000,
        };

        this.audioKeyframes.push(keyframe);
        this.audioKeyframes.sort((a, b) => a.time - b.time);

        this.selectedAudioKeyframeIndex = this.audioKeyframes.findIndex((kf) => kf.id === keyframe.id);

        const audio = new Audio(assetData.blobUrl);
        audio.addEventListener("loadedmetadata", () => {
            keyframe.duration = audio.duration * 1000;
            this.updateLayersList();
        });

        this.updateLayersList();
        this.render();

        return keyframe.id;
    }

    removeAudioKeyframe(keyframeId) {
        const index = this.audioKeyframes.findIndex((kf) => kf.id === keyframeId);
        if (index !== -1) {
            this.audioKeyframes.splice(index, 1);
            if (this.audioKeyframes.length === 0) {
                this.audioLayer = null;
                this.selectedAudioKeyframeIndex = 0;
            } else {
                this.selectedAudioKeyframeIndex = Math.min(
                    this.selectedAudioKeyframeIndex,
                    this.audioKeyframes.length - 1,
                );
            }
            this.updateLayersList();
            this.render();
        }
    }

    removeAllAudioKeyframes() {
        if (confirm("Remove all audio keyframes?")) {
            this.audioKeyframes = [];
            this.audioLayer = null;
            this.selectedAudioKeyframeIndex = 0;
            this.updateLayersList();
            this.render();
        }
    }

    toggleAudioLayerVisibility() {
        this.audioLayerVisible = !this.audioLayerVisible;
        this.updateLayersList();
        this.render();
    }

    selectAudioKeyframe(index) {
        this.selectedAudioKeyframeIndex = index;
        this.updateLayersList();
        this.render();
    }

    startEditingAudioKeyframe(keyframeId) {
        const displayEl = document.getElementById(`akf-display-${keyframeId}`);
        const inputEl = document.getElementById(`akf-input-${keyframeId}`);

        if (displayEl && inputEl) {
            displayEl.style.display = "none";
            inputEl.style.display = "inline";
            inputEl.focus();
            inputEl.select();
        }
    }

    saveAudioKeyframeName(keyframeId) {
        const displayEl = document.getElementById(`akf-display-${keyframeId}`);
        const inputEl = document.getElementById(`akf-input-${keyframeId}`);

        if (!inputEl || !displayEl) return;

        const keyframe = this.audioKeyframes.find((kf) => kf.id === keyframeId);
        if (!keyframe) return;

        const newName = inputEl.value.trim();
        if (newName !== "" && newName.match(/^A\d+$/)) {
            displayEl.style.display = "inline";
            inputEl.style.display = "none";
        } else if (newName !== "") {
            keyframe.customName = newName;
            this.updateLayersList();
        } else {
            inputEl.value = `A${this.audioKeyframes.indexOf(keyframe) + 1}`;
            displayEl.style.display = "inline";
            inputEl.style.display = "none";
        }
    }

    updateAudioKeyframeTime(keyframeId, newTime) {
        const keyframe = this.audioKeyframes.find((kf) => kf.id === keyframeId);
        if (keyframe) {
            keyframe.time = Math.max(0, newTime);
            this.audioKeyframes.sort((a, b) => a.time - b.time);
            this.selectedAudioKeyframeIndex = this.audioKeyframes.findIndex((kf) => kf.id === keyframeId);
            this.updateLayersList();
            this.render();
        }
    }

    updateAudioKeyframe(keyframeId, updates) {
        const keyframe = this.audioKeyframes.find((kf) => kf.id === keyframeId);
        if (keyframe) {
            Object.assign(keyframe, updates);
            if (updates.time !== undefined) {
                this.audioKeyframes.sort((a, b) => a.time - b.time);
                this.selectedAudioKeyframeIndex = this.audioKeyframes.findIndex((kf) => kf.id === keyframeId);
            }
            this.updateLayersList();
            this.render();
        }
    }

    addAudioKeyframeAtTime(time) {
        if (this.audioKeyframes.length === 0) return;

        const selectedKf = this.audioKeyframes[this.selectedAudioKeyframeIndex];
        if (!selectedKf) return;

        let newTime = time;
        if (newTime === null || newTime === undefined) {
            const nextIndex = this.selectedAudioKeyframeIndex + 1;
            if (nextIndex < this.audioKeyframes.length) {
                const nextTime = this.audioKeyframes[nextIndex].time;
                newTime = selectedKf.time + Math.max(100, Math.floor((nextTime - selectedKf.time) / 2));
            } else {
                newTime = selectedKf.time + 1000;
            }
        }

        const newKeyframe = {
            id: this.generateId(),
            name: `${selectedKf.name}`,
            time: newTime,
            speed: selectedKf.speed,
            pitch: selectedKf.pitch,
            assetRef: selectedKf.assetRef,
            blobUrl: selectedKf.blobUrl,
            duration: selectedKf.duration || 3000,
        };

        this.audioKeyframes.splice(this.selectedAudioKeyframeIndex + 1, 0, newKeyframe);
        this.selectedAudioKeyframeIndex = this.selectedAudioKeyframeIndex + 1;

        this.updateLayersList();
        this.render();
        return newKeyframe.id;
    }

    moveAudioKeyframeUp(index) {
        if (index >= this.audioKeyframes.length - 1) return;

        const temp = this.audioKeyframes[index];
        this.audioKeyframes[index] = this.audioKeyframes[index + 1];
        this.audioKeyframes[index + 1] = temp;

        this.selectedAudioKeyframeIndex = index + 1;
        this.updateLayersList();
        this.render();
    }

    moveAudioKeyframeDown(index) {
        if (index <= 0) return;

        const temp = this.audioKeyframes[index];
        this.audioKeyframes[index] = this.audioKeyframes[index - 1];
        this.audioKeyframes[index - 1] = temp;

        this.selectedAudioKeyframeIndex = index - 1;
        this.updateLayersList();
        this.render();
    }

    toggleAudioLayerVisibility() {
        this.audioLayerVisible = !this.audioLayerVisible;
        this.updateLayersList();
        this.render();
    }

    deleteAudioLayer() {
        if (confirm("Delete entire audio timeline?")) {
            this.audioLayer = null;
            this.audioKeyframes = [];
            this.selectedAudioKeyframeIndex = 0;
            this.audioLayerVisible = true;
            this.updateLayersList();
            this.render();
        }
    }

    toggleAudioPreview() {
        if (this.isPlayingAudioPreview) {
            this.stopAudioPreview();
        } else {
            this.playAudioKeyframe();
        }
    }

    stopAudioPreview() {
        if (this.currentAudioPreview) {
            try {
                this.currentAudioPreview.pause();
                this.currentAudioPreview.currentTime = 0;
            } catch (e) {}
        }
        this.isPlayingAudioPreview = false;
        this.updateLayersList();
    }

    playAudioKeyframe() {
        if (this.currentAudioPreview) {
            try {
                this.currentAudioPreview.pause();
                this.currentAudioPreview.currentTime = 0;
            } catch (e) {}
        }

        const selectedKf = this.audioKeyframes[this.selectedAudioKeyframeIndex];
        if (!selectedKf) return;

        this.currentAudioPreview = new Audio(selectedKf.blobUrl);

        const speed = selectedKf.speed || 1.0;
        const pitchSemitones = selectedKf.pitch || 0;
        const pitchRatio = Math.pow(2, pitchSemitones / 12);
        this.currentAudioPreview.playbackRate = speed * pitchRatio;

        if (this.currentAudioPreview.preservesPitch !== undefined) {
            this.currentAudioPreview.preservesPitch = false;
        }
        if (this.currentAudioPreview.mozPreservesPitch !== undefined) {
            this.currentAudioPreview.mozPreservesPitch = false;
        }
        if (this.currentAudioPreview.webkitPreservesPitch !== undefined) {
            this.currentAudioPreview.webkitPreservesPitch = false;
        }

        this.currentAudioPreview.onended = () => {
            this.isPlayingAudioPreview = false;
            this.updateLayersList();
        };

        this.currentAudioPreview.play().catch((e) => {
            console.warn("Audio preview failed:", e);
            this.isPlayingAudioPreview = false;
            this.updateLayersList();
        });

        this.isPlayingAudioPreview = true;
        this.updateLayersList();
    }

    moveLayerUp(layerId) {
        const index = this.layers.findIndex((l) => l.id === layerId);
        if (index !== -1 && index < this.layers.length - 1) {
            const temp = this.layers[index];
            this.layers[index] = this.layers[index + 1];
            this.layers[index + 1] = temp;

            this.layers[index].zIndex = index;
            this.layers[index + 1].zIndex = index + 1;
            this.updateLayersList();
            this.render();
        }
    }

    moveLayerDown(layerId) {
        const index = this.layers.findIndex((l) => l.id === layerId);
        if (index > 0) {
            const temp = this.layers[index];
            this.layers[index] = this.layers[index - 1];
            this.layers[index - 1] = temp;

            this.layers[index].zIndex = index;
            this.layers[index - 1].zIndex = index - 1;
            this.updateLayersList();
            this.render();
        }
    }

    toggleLayerVisibility(layerId) {
        const layer = this.layers.find((l) => l.id === layerId);
        if (layer) {
            layer.visible = !layer.visible;
            this.updateLayersList();
            this.render();
        }
    }

    updateLayerPosition(layerId, x, y, fromDrag = false) {
        const layer = this.layers.find((l) => l.id === layerId);
        if (!layer) return;

        if (layer.hasKeyframes && layer.keyframes.length > 0) {
            const keyframe = layer.keyframes[layer.selectedKeyframeIndex];
            if (keyframe) {
                const renderData = this.getLayerRenderData(layer);
                if (renderData.type === "sprite" && fromDrag) {
                    const snapInterval = 48;
                    keyframe.x = Math.round(x / snapInterval) * snapInterval;
                    keyframe.y = Math.round(y / snapInterval) * snapInterval;
                } else {
                    keyframe.x = Math.round(x);
                    keyframe.y = Math.round(y);
                }

                keyframe.x = Math.max(0, Math.min(this.canvasWidth - renderData.width, keyframe.x));
                keyframe.y = Math.max(0, Math.min(this.canvasHeight - renderData.height, keyframe.y));
            }
        } else {
            if (layer.type === "sprite" && fromDrag) {
                const snapInterval = 48;
                layer.x = Math.round(x / snapInterval) * snapInterval;
                layer.y = Math.round(y / snapInterval) * snapInterval;
            } else {
                layer.x = Math.round(x);
                layer.y = Math.round(y);
            }

            layer.x = Math.max(0, Math.min(this.canvasWidth - layer.width, layer.x));
            layer.y = Math.max(0, Math.min(this.canvasHeight - layer.height, layer.y));
        }

        this.updateCanvasSize();
        this.updateLayersList();
        this.render();
    }

    selectLayer(layerId) {
        this.selectedLayerId = layerId;
        this.updateLayersList();
        this.render();
    }

    togglePreview() {
        if (this.isPlayingPreview) {
            this.stopPreview();
        } else {
            this.playPreview();
        }
    }

    playPreview() {
        this.isPlayingPreview = true;
        this.previewStartTime = Date.now();
        this.currentAudioPlayback = [];

        if (this.audioKeyframes && this.audioKeyframes.length > 0 && this.audioLayerVisible) {
            this.audioKeyframes.forEach((kf) => {
                const audio = new Audio(kf.blobUrl);

                const speed = kf.speed || 1.0;
                const pitchSemitones = kf.pitch || 0;
                const pitchRatio = Math.pow(2, pitchSemitones / 12);
                audio.playbackRate = speed * pitchRatio;

                if (audio.preservesPitch !== undefined) {
                    audio.preservesPitch = false;
                }
                if (audio.mozPreservesPitch !== undefined) {
                    audio.mozPreservesPitch = false;
                }
                if (audio.webkitPreservesPitch !== undefined) {
                    audio.webkitPreservesPitch = false;
                }

                this.currentAudioPlayback.push({
                    audio: audio,
                    startTime: kf.time,
                    started: false,
                    keyframe: kf,
                });
            });
        }

        this.updateLayersList();
        this.renderPreviewFrame();
    }

    stopPreview() {
        this.isPlayingPreview = false;
        if (this.previewAnimationId) {
            cancelAnimationFrame(this.previewAnimationId);
            this.previewAnimationId = null;
        }

        if (this.currentAudioPlayback && this.currentAudioPlayback.length > 0) {
            this.currentAudioPlayback.forEach((playback) => {
                try {
                    playback.audio.pause();
                    playback.audio.currentTime = 0;
                } catch (e) {}
            });
            this.currentAudioPlayback = [];
        }

        this.updateLayersList();
        this.render();
    }

    renderPreviewFrame() {
        if (!this.isPlayingPreview) return;

        const elapsed = Date.now() - this.previewStartTime;

        let maxDuration = 0;
        for (const layer of this.layers) {
            if (layer.hasKeyframes && layer.keyframes.length > 0) {
                for (const kf of layer.keyframes) {
                    const animDuration = this.calculateAnimationDuration(kf);
                    const keyframeEnd = kf.time + (animDuration || 0);
                    maxDuration = Math.max(maxDuration, keyframeEnd);
                }
            }
        }

        if (this.currentAudioPlayback && this.currentAudioPlayback.length > 0) {
            this.currentAudioPlayback.forEach((playback) => {
                if (!playback.started && elapsed >= playback.startTime) {
                    playback.audio.play().catch((e) => console.warn("Audio playback failed:", e));
                    playback.started = true;
                }
            });

            const stillPlaying = this.currentAudioPlayback.some(
                (playback) => playback.started && !playback.audio.paused && !playback.audio.ended,
            );

            if (stillPlaying) {
                const anyAudioDuration = Math.max(
                    ...this.currentAudioPlayback.map((playback) => {
                        if (playback.audio.duration && isFinite(playback.audio.duration)) {
                            return playback.startTime + (playback.audio.duration * 1000) / playback.keyframe.speed;
                        }
                        return 0;
                    }),
                );
                maxDuration = Math.max(maxDuration, anyAudioDuration);
            }
        }

        const currentTime = maxDuration > 0 ? elapsed % maxDuration : 0;

        if (maxDuration > 0 && elapsed >= maxDuration) {
            this.stopPreview();
            return;
        }

        if (!this.ctx || !this.canvas) return;

        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

        if (this.previewBackgroundImage && this.previewBackgroundVisible) {
            this.ctx.drawImage(this.previewBackgroundImage, 0, 0, this.canvasWidth, this.canvasHeight);
        }

        const sortedLayers = [...this.layers].sort((a, b) => a.zIndex - b.zIndex);

        for (const layer of sortedLayers) {
            if (!layer.visible) continue;

            let renderData;

            if (layer.hasKeyframes && layer.keyframes.length > 0) {
                renderData = this.getLayerStateAtTime(layer, currentTime);
                if (!renderData) continue;
            } else {
                renderData = layer;
            }

            if (renderData.type === "sprite" && renderData.spriteCanvases && renderData.spriteCanvases.length > 0) {
                if (renderData.isAnimated) {
                    let spriteFrameIndex;

                    if (layer.hasKeyframes && layer.keyframes.length > 0) {
                        const firstKeyframeTime = layer.keyframes[0].time;
                        const timeInAnimation = currentTime - firstKeyframeTime;
                        const animSpeed = layer.animationSpeed || 250;
                        spriteFrameIndex = Math.floor(timeInAnimation / animSpeed) % renderData.spriteIndices.length;
                    } else {
                        const now = Date.now();
                        if (now - layer.lastAnimationTime >= layer.animationSpeed) {
                            layer.currentSpriteIndex = (layer.currentSpriteIndex + 1) % renderData.spriteIndices.length;
                            layer.lastAnimationTime = now;
                        }
                        spriteFrameIndex = layer.currentSpriteIndex;
                    }

                    const spriteIndex = renderData.spriteIndices[spriteFrameIndex];
                    const spriteCanvas = renderData.spriteCanvases[spriteIndex];
                    if (spriteCanvas) {
                        this.ctx.drawImage(spriteCanvas, renderData.x, renderData.y);
                    }
                } else {
                    const spriteIndex = renderData.spriteIndices[0];
                    const spriteCanvas = renderData.spriteCanvases[spriteIndex];
                    if (spriteCanvas) {
                        this.ctx.drawImage(spriteCanvas, renderData.x, renderData.y);
                    }
                }
            } else if (renderData.image && renderData.imageLoaded) {
                this.ctx.drawImage(renderData.image, renderData.x, renderData.y, renderData.width, renderData.height);
            }
        }

        this.updatePlayheadPositions(elapsed);

        this.previewAnimationId = requestAnimationFrame(() => this.renderPreviewFrame());
    }

    updatePlayheadPositions(currentTime) {
        const playheads = document.querySelectorAll(".timeline-playhead");
        playheads.forEach((playhead) => {
            const timeline = playhead.closest(".visual-timeline-wrapper");
            if (!timeline) return;

            const maxTime = parseFloat(timeline.dataset.maxTime);
            if (!maxTime) return;

            const percentage = (currentTime / maxTime) * 100;
            playhead.style.left = `${Math.min(percentage, 100)}%`;
        });
    }

    updateLayerTypeFromKeyframes(layer) {
        if (layer.hasKeyframes && layer.keyframes && layer.keyframes.length > 0) {
            let maxTime = 0;
            for (const kf of layer.keyframes) {
                const animDuration = this.calculateAnimationDuration(kf);
                const keyframeEnd = kf.time + (animDuration || 0);
                maxTime = Math.max(maxTime, keyframeEnd);
            }

            const durationMinutes = Math.floor(maxTime / 60000);
            const durationSeconds = Math.floor((maxTime % 60000) / 1000);
            const durationMs = Math.floor(maxTime % 1000);
            layer.type = `${durationMinutes}:${durationSeconds.toString().padStart(2, "0")}.${durationMs.toString().padStart(3, "0")}`;
        }
    }

    addKeyframe(layerId, time = null) {
        const layer = this.layers.find((l) => l.id === layerId);
        if (!layer) return;

        if (!layer.hasKeyframes) {
            const initialKeyframe = {
                id: this.generateId(),
                name: "KF 1",
                time: 0,
                x: layer.x,
                y: layer.y,
                assetRef: layer.assetRef,
                blobUrl: layer.blobUrl,
                image: layer.image,
                imageLoaded: layer.imageLoaded,
                type: layer.type,
                spriteIndices: layer.spriteIndices,
                isAnimated: layer.isAnimated,
                animationSpeed: layer.animationSpeed,
                spriteCanvases: layer.spriteCanvases,
                spriteVariant: layer.spriteVariant,
                width: layer.width,
                height: layer.height,
                gifDuration: layer.gifDuration || null,
            };

            layer.keyframes.push(initialKeyframe);
            layer.hasKeyframes = true;
            layer.selectedKeyframeIndex = 0;

            const existingLayerNumbers = this.layers
                .map((l) => {
                    const match = l.name.match(/^Layer (\d+)$/);
                    return match ? parseInt(match[1]) : 0;
                })
                .filter((n) => n > 0);
            const nextLayerNumber = existingLayerNumbers.length > 0 ? Math.max(...existingLayerNumbers) + 1 : 1;
            layer.name = `Layer ${nextLayerNumber}`;

            this.updateLayerTypeFromKeyframes(layer);

            this.updateCanvasSize();
            this.updateLayersList();
            this.render();
            return initialKeyframe.id;
        }

        const selectedKeyframe = layer.keyframes[layer.selectedKeyframeIndex];

        let newTime;
        if (time !== null) {
            newTime = time;
        } else {
            const nextIndex = layer.selectedKeyframeIndex + 1;
            if (nextIndex < layer.keyframes.length) {
                const nextTime = layer.keyframes[nextIndex].time;
                newTime = selectedKeyframe.time + Math.max(100, Math.floor((nextTime - selectedKeyframe.time) / 2));
            } else {
                newTime = selectedKeyframe.time + 1000;
            }
        }

        let sourceKeyframe = selectedKeyframe;
        if (!selectedKeyframe.assetRef && !selectedKeyframe.blobUrl) {
            for (let i = layer.selectedKeyframeIndex - 1; i >= 0; i--) {
                if (layer.keyframes[i].assetRef || layer.keyframes[i].blobUrl) {
                    sourceKeyframe = layer.keyframes[i];
                    break;
                }
            }
        }

        const defaultName = `KF ${layer.keyframes.length + 1}`;

        const newKeyframe = {
            id: this.generateId(),
            name: defaultName,
            time: newTime,
            x: selectedKeyframe.x,
            y: selectedKeyframe.y,
            assetRef: sourceKeyframe.assetRef,
            blobUrl: sourceKeyframe.blobUrl,
            image: sourceKeyframe.image,
            imageLoaded: sourceKeyframe.imageLoaded,
            type: sourceKeyframe.type,
            spriteIndices: sourceKeyframe.spriteIndices,
            isAnimated: sourceKeyframe.isAnimated,
            animationSpeed: sourceKeyframe.animationSpeed,
            spriteCanvases: sourceKeyframe.spriteCanvases,
            spriteVariant: sourceKeyframe.spriteVariant,
            width: sourceKeyframe.width,
            height: sourceKeyframe.height,
            gifDuration: sourceKeyframe.gifDuration || null,
        };

        layer.keyframes.splice(layer.selectedKeyframeIndex + 1, 0, newKeyframe);

        layer.selectedKeyframeIndex = layer.selectedKeyframeIndex + 1;

        this.updateLayerTypeFromKeyframes(layer);

        this.updateCanvasSize();
        this.updateLayersList();
        this.render();
        return newKeyframe.id;
    }

    removeKeyframe(layerId, keyframeId) {
        const layer = this.layers.find((l) => l.id === layerId);
        if (!layer || !layer.hasKeyframes) return;

        const index = layer.keyframes.findIndex((kf) => kf.id === keyframeId);
        if (index === -1) return;

        if (layer.keyframes.length === 1) {
            this.showNotification(
                "Cannot remove the only keyframe. Use the eject button to convert it to a simple layer.",
                "warning",
            );
            return;
        }

        layer.keyframes.splice(index, 1);

        layer.selectedKeyframeIndex = Math.min(layer.selectedKeyframeIndex, layer.keyframes.length - 1);

        this.updateLayerTypeFromKeyframes(layer);

        this.updateCanvasSize();
        this.updateLayersList();
        this.render();
    }

    ejectKeyframe(layerId, keyframeId) {
        const layer = this.layers.find((l) => l.id === layerId);
        if (!layer || !layer.hasKeyframes) return;

        const index = layer.keyframes.findIndex((kf) => kf.id === keyframeId);
        if (index === -1) return;

        const keyframe = layer.keyframes[index];

        const filename = keyframe.assetRef.split("/").pop();

        const newLayer = {
            id: this.generateId(),
            //name: `${layer.name}: ${keyframe.name}`,
            name: `${filename}`,
            x: keyframe.x,
            y: keyframe.y,
            width: keyframe.width,
            height: keyframe.height,
            zIndex: this.layers.length,
            visible: true,
            assetRef: keyframe.assetRef,
            blobUrl: keyframe.blobUrl,
            image: keyframe.image,
            imageLoaded: keyframe.imageLoaded,
            type: keyframe.type,
            spriteIndices: keyframe.spriteIndices || [],
            isAnimated: keyframe.isAnimated || false,
            animationSpeed: keyframe.animationSpeed || 250,
            spriteCanvases: keyframe.spriteCanvases || [],
            spriteVariant: keyframe.spriteVariant || null,
            currentSpriteIndex: 0,
            lastAnimationTime: Date.now(),
            hasKeyframes: false,
            keyframes: [],
            selectedKeyframeIndex: 0,
            gifDuration: keyframe.gifDuration || null,
        };

        this.layers.unshift(newLayer);

        layer.keyframes.splice(index, 1);

        if (layer.keyframes.length >= 1) {
            layer.selectedKeyframeIndex = Math.min(layer.selectedKeyframeIndex, layer.keyframes.length - 1);
            this.updateLayerTypeFromKeyframes(layer);
        } else {
            layer.hasKeyframes = false;
            layer.keyframes = [];
            layer.selectedKeyframeIndex = 0;
        }

        this.updateCanvasSize();
        this.updateLayersList();
        this.render();
        this.showNotification(`Keyframe ejected as layer "${newLayer.name}"`, "success", 3000);
    }

    selectKeyframe(layerId, keyframeIndex) {
        const layer = this.layers.find((l) => l.id === layerId);
        if (!layer || !layer.hasKeyframes) return;

        layer.selectedKeyframeIndex = keyframeIndex;
        this.updateLayersList();
        this.render();
    }

    moveKeyframeUp(layerId, keyframeIndex) {
        const layer = this.layers.find((l) => l.id === layerId);
        if (!layer || !layer.hasKeyframes) return;
        if (keyframeIndex >= layer.keyframes.length - 1) return;

        for (let i = 0; i < layer.keyframes.length; i++) {
            const kf = layer.keyframes[i];

            if (!kf.assetRef && !kf.blobUrl) {
                for (let j = i - 1; j >= 0; j--) {
                    const prevKf = layer.keyframes[j];
                    if (prevKf.assetRef || prevKf.blobUrl) {
                        kf.assetRef = prevKf.assetRef;
                        kf.blobUrl = prevKf.blobUrl;
                        kf.image = prevKf.image;
                        kf.imageLoaded = prevKf.imageLoaded;
                        kf.spriteIndices = prevKf.spriteIndices;
                        kf.isAnimated = prevKf.isAnimated;
                        kf.animationSpeed = prevKf.animationSpeed;
                        kf.spriteCanvases = prevKf.spriteCanvases;
                        kf.spriteVariant = prevKf.spriteVariant;
                        break;
                    }
                }
            }
        }

        const kf1 = layer.keyframes[keyframeIndex];
        const kf2 = layer.keyframes[keyframeIndex + 1];
        const movedKeyframeId = kf1.id;

        const tempTime = kf1.time;
        kf1.time = kf2.time;
        kf2.time = tempTime;

        layer.keyframes = [...layer.keyframes].sort((a, b) => a.time - b.time);

        const movedIndex = layer.keyframes.findIndex((kf) => kf.id === movedKeyframeId);
        layer.selectedKeyframeIndex = movedIndex !== -1 ? movedIndex : 0;

        this.updateLayerTypeFromKeyframes(layer);
        this.updateLayersList();
        this.render();
    }

    moveKeyframeDown(layerId, keyframeIndex) {
        const layer = this.layers.find((l) => l.id === layerId);
        if (!layer || !layer.hasKeyframes) return;
        if (keyframeIndex <= 0) return;

        for (let i = 0; i < layer.keyframes.length; i++) {
            const kf = layer.keyframes[i];

            if (!kf.assetRef && !kf.blobUrl) {
                for (let j = i - 1; j >= 0; j--) {
                    const prevKf = layer.keyframes[j];
                    if (prevKf.assetRef || prevKf.blobUrl) {
                        kf.assetRef = prevKf.assetRef;
                        kf.blobUrl = prevKf.blobUrl;
                        kf.image = prevKf.image;
                        kf.imageLoaded = prevKf.imageLoaded;
                        kf.spriteIndices = prevKf.spriteIndices;
                        kf.isAnimated = prevKf.isAnimated;
                        kf.animationSpeed = prevKf.animationSpeed;
                        kf.spriteCanvases = prevKf.spriteCanvases;
                        kf.spriteVariant = prevKf.spriteVariant;
                        break;
                    }
                }
            }
        }

        const kf1 = layer.keyframes[keyframeIndex];
        const kf2 = layer.keyframes[keyframeIndex - 1];
        const movedKeyframeId = kf1.id;

        const tempTime = kf1.time;
        kf1.time = kf2.time;
        kf2.time = tempTime;

        layer.keyframes = [...layer.keyframes].sort((a, b) => a.time - b.time);

        const movedIndex = layer.keyframes.findIndex((kf) => kf.id === movedKeyframeId);
        layer.selectedKeyframeIndex = movedIndex !== -1 ? movedIndex : 0;

        this.updateLayerTypeFromKeyframes(layer);
        this.updateLayersList();
        this.render();
    }

    startEditingKeyframe(layerId, keyframeId) {
        const displayEl = document.getElementById(`kf-display-${keyframeId}`);
        const inputEl = document.getElementById(`kf-input-${keyframeId}`);

        if (displayEl && inputEl) {
            displayEl.style.display = "none";
            inputEl.style.display = "inline";
            inputEl.focus();
            inputEl.select();
        }
    }

    saveKeyframeName(layerId, keyframeId) {
        const displayEl = document.getElementById(`kf-display-${keyframeId}`);
        const inputEl = document.getElementById(`kf-input-${keyframeId}`);

        if (!inputEl || !displayEl) return;

        const layer = this.layers.find((l) => l.id === layerId);
        if (!layer || !layer.hasKeyframes) return;

        const keyframe = layer.keyframes.find((kf) => kf.id === keyframeId);
        if (!keyframe) return;

        const newName = inputEl.value.trim();
        if (newName !== "") {
            keyframe.name = newName;
            this.updateLayersList();
        } else {
            inputEl.value = keyframe.name || `KF`;
            displayEl.style.display = "inline";
            inputEl.style.display = "none";
        }
    }

    renameKeyframe(layerId, keyframeId) {
        this.startEditingKeyframe(layerId, keyframeId);
    }

    startEditingLayerName(layerId) {
        const displayEl = document.getElementById(`layer-display-${layerId}`);
        const inputEl = document.getElementById(`layer-input-${layerId}`);

        if (displayEl && inputEl) {
            displayEl.style.display = "none";
            inputEl.style.display = "inline";
            inputEl.focus();
            inputEl.select();
        }
    }

    saveLayerName(layerId) {
        const displayEl = document.getElementById(`layer-display-${layerId}`);
        const inputEl = document.getElementById(`layer-input-${layerId}`);

        if (!inputEl || !displayEl) return;

        const layer = this.layers.find((l) => l.id === layerId);
        if (!layer) return;

        const newName = inputEl.value.trim();
        if (newName !== "") {
            layer.name = newName;
            this.updateLayersList();
        } else {
            inputEl.value = layer.name || "Layer";
            displayEl.style.display = "inline";
            inputEl.style.display = "none";
        }
    }

    updateKeyframeTime(layerId, keyframeId, newTime) {
        const layer = this.layers.find((l) => l.id === layerId);
        if (!layer || !layer.hasKeyframes) return;

        const keyframe = layer.keyframes.find((kf) => kf.id === keyframeId);
        if (!keyframe) return;

        const oldIndex = layer.keyframes.findIndex((kf) => kf.id === keyframeId);
        const oldTime = keyframe.time;

        keyframe.time = Math.max(0, newTime);

        layer.keyframes.sort((a, b) => a.time - b.time);

        const newIndex = layer.keyframes.findIndex((kf) => kf.id === keyframeId);

        if (oldIndex !== newIndex) {
            const direction = newIndex > oldIndex ? 1 : -1;

            for (let i = oldIndex; direction > 0 ? i < newIndex : i > newIndex; i += direction) {
                const swappedIndex = i + direction;
                if (swappedIndex >= 0 && swappedIndex < layer.keyframes.length) {
                    const movedKf = layer.keyframes[newIndex];
                    const otherKf = layer.keyframes[i];

                    if ((movedKf.assetRef || movedKf.blobUrl) && !otherKf.assetRef && !otherKf.blobUrl) {
                        otherKf.assetRef = movedKf.assetRef;
                        otherKf.blobUrl = movedKf.blobUrl;
                        otherKf.image = movedKf.image;
                        otherKf.imageLoaded = movedKf.imageLoaded;
                        otherKf.type = movedKf.type;
                        otherKf.spriteIndices = movedKf.spriteIndices;
                        otherKf.spriteCanvases = movedKf.spriteCanvases;
                        otherKf.isAnimated = movedKf.isAnimated;
                        otherKf.animationSpeed = movedKf.animationSpeed;
                        otherKf.spriteVariant = movedKf.spriteVariant;
                        otherKf.width = movedKf.width;
                        otherKf.height = movedKf.height;
                    }
                }
            }
        }

        layer.selectedKeyframeIndex = newIndex;

        this.updateLayerTypeFromKeyframes(layer);

        this.updateLayersList();
        this.render();
    }

    updateKeyframePosition(layerId, keyframeId, x, y) {
        const layer = this.layers.find((l) => l.id === layerId);
        if (!layer || !layer.hasKeyframes) return;

        const keyframe = layer.keyframes.find((kf) => kf.id === keyframeId);
        if (!keyframe) return;

        keyframe.x = Math.max(0, Math.min(this.canvasWidth - keyframe.width, Math.round(x)));
        keyframe.y = Math.max(0, Math.min(this.canvasHeight - keyframe.height, Math.round(y)));

        this.updateLayersList();
        this.render();
    }

    showImportAsKeyframeMenu(targetLayerId) {
        const targetLayer = this.layers.find((l) => l.id === targetLayerId);
        if (!targetLayer) return;

        const otherLayers = this.layers.filter((l) => l.id !== targetLayerId);
        if (otherLayers.length === 0) {
            this.showNotification("No other layers available to import from", "warning");
            return;
        }

        this.moveAsKeyframeMode = true;
        this.importAsKeyframeMode = true;
        this.moveAsKeyframeSourceId = targetLayerId;

        this.showNotification(
            `<strong>Import as Keyframe Mode</strong><br>Click a layer to import it as a keyframe into "${targetLayer.name}"`,
            "info",
            0,
            "move-as-keyframe-notification",
        );

        this.updateLayersList();
        this.render();
    }

    showMoveAsKeyframeMenu(sourceLayerId) {
        const sourceLayer = this.layers.find((l) => l.id === sourceLayerId);
        if (!sourceLayer) return;

        const otherLayers = this.layers.filter((l) => l.id !== sourceLayerId);
        if (otherLayers.length === 0) {
            this.showNotification("No other layers available to move to", "warning");
            return;
        }

        this.moveAsKeyframeMode = true;
        this.importAsKeyframeMode = false;
        this.moveAsKeyframeSourceId = sourceLayerId;

        this.showNotification(
            `<strong>Move as Keyframe Mode</strong><br>Click a layer to add "${sourceLayer.name}" as its keyframe`,
            "info",
            0,
            "move-as-keyframe-notification",
        );

        this.updateLayersList();
        this.render();
    }

    cancelMoveAsKeyframeMode() {
        this.moveAsKeyframeMode = false;
        this.importAsKeyframeMode = false;
        this.moveAsKeyframeSourceId = null;

        const notification = document.querySelector(".composition-notification.move-as-keyframe-notification");
        if (notification) {
            notification.remove();
        }

        this.updateLayersList();
        this.render();
    }

    convertLayerToKeyframe(sourceLayerId, targetLayerId) {
        const sourceLayer = this.layers.find((l) => l.id === sourceLayerId);
        const targetLayer = this.layers.find((l) => l.id === targetLayerId);

        if (!sourceLayer || !targetLayer) return;

        if (!targetLayer.hasKeyframes) {
            this.addKeyframe(targetLayerId);
        }

        const maxTime = targetLayer.keyframes.reduce((max, kf) => Math.max(max, kf.time), 0);

        const newKeyframe = {
            id: this.generateId(),
            name: `KF ${targetLayer.keyframes.length + 1}`,
            time: maxTime + 1000,
            x: sourceLayer.x,
            y: sourceLayer.y,
            assetRef: sourceLayer.assetRef,
            blobUrl: sourceLayer.blobUrl,
            image: sourceLayer.image,
            imageLoaded: sourceLayer.imageLoaded,
            type: sourceLayer.type,
            spriteIndices: sourceLayer.spriteIndices,
            isAnimated: sourceLayer.isAnimated,
            animationSpeed: sourceLayer.animationSpeed,
            spriteCanvases: sourceLayer.spriteCanvases,
            spriteVariant: sourceLayer.spriteVariant,
            width: sourceLayer.width,
            height: sourceLayer.height,
            gifDuration: sourceLayer.gifDuration || null,
        };

        targetLayer.keyframes.push(newKeyframe);
        targetLayer.keyframes.sort((a, b) => a.time - b.time);

        this.updateLayerTypeFromKeyframes(targetLayer);

        this.removeLayer(sourceLayerId);

        this.cancelMoveAsKeyframeMode();

        this.showNotification(`Layer moved as keyframe at ${newKeyframe.time}ms`, "success");
    }

    getLayerRenderData(layer) {
        if (layer.hasKeyframes && layer.keyframes.length > 0) {
            const keyframe = layer.keyframes[layer.selectedKeyframeIndex];

            let assetKeyframe = keyframe;
            if (!keyframe.assetRef && !keyframe.blobUrl) {
                for (let i = layer.selectedKeyframeIndex - 1; i >= 0; i--) {
                    if (layer.keyframes[i].assetRef || layer.keyframes[i].blobUrl) {
                        assetKeyframe = layer.keyframes[i];
                        break;
                    }
                }
            }
            return {
                x: keyframe.x,
                y: keyframe.y,
                width: keyframe.width || assetKeyframe.width,
                height: keyframe.height || assetKeyframe.height,
                type: assetKeyframe.type,
                image: assetKeyframe.image,
                imageLoaded: assetKeyframe.imageLoaded,
                spriteCanvases: assetKeyframe.spriteCanvases,
                spriteIndices: assetKeyframe.spriteIndices,
                isAnimated: assetKeyframe.isAnimated,
            };
        }
        return layer;
    }

    render() {
        if (!this.ctx || !this.canvas) return;

        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

        if (this.previewBackgroundImage && this.previewBackgroundVisible) {
            this.ctx.drawImage(this.previewBackgroundImage, 0, 0, this.canvasWidth, this.canvasHeight);
        }

        if (this.layers.length === 0) {
            return;
        }

        const sortedLayers = [...this.layers].sort((a, b) => a.zIndex - b.zIndex);

        sortedLayers.forEach((layer) => {
            if (!layer.visible) return;

            const renderData = this.getLayerRenderData(layer);

            if (renderData.type === "sprite" && renderData.spriteCanvases && renderData.spriteCanvases.length > 0) {
                if (renderData.isAnimated) {
                    const now = Date.now();
                    if (now - layer.lastAnimationTime >= layer.animationSpeed) {
                        layer.currentSpriteIndex = (layer.currentSpriteIndex + 1) % renderData.spriteIndices.length;
                        layer.lastAnimationTime = now;
                    }
                    const spriteIndex = renderData.spriteIndices[layer.currentSpriteIndex];
                    const spriteCanvas = renderData.spriteCanvases[spriteIndex];
                    if (spriteCanvas) {
                        this.ctx.drawImage(spriteCanvas, renderData.x, renderData.y);
                    }
                } else {
                    const spriteIndex = renderData.spriteIndices[0];
                    const spriteCanvas = renderData.spriteCanvases[spriteIndex];
                    if (spriteCanvas) {
                        this.ctx.drawImage(spriteCanvas, renderData.x, renderData.y);
                    }
                }
            } else if (renderData.image && renderData.imageLoaded) {
                this.ctx.drawImage(renderData.image, renderData.x, renderData.y, renderData.width, renderData.height);
            }
        });

        if (this.selectedLayerId) {
            const selectedLayer = this.layers.find((l) => l.id === this.selectedLayerId);
            if (selectedLayer && selectedLayer.visible) {
                const renderData = this.getLayerRenderData(selectedLayer);
                this.ctx.strokeStyle = "#4a90e2";
                this.ctx.lineWidth = 3;
                this.ctx.setLineDash([8, 4]);
                this.ctx.strokeRect(renderData.x, renderData.y, renderData.width, renderData.height);
                this.ctx.setLineDash([]);
            }
        }

        const hasAnimatedSprites = this.layers.some((l) => {
            if (!l.visible) return false;
            const renderData = this.getLayerRenderData(l);
            return renderData.isAnimated && renderData.spriteCanvases && renderData.spriteCanvases.length > 0;
        });
        if (hasAnimatedSprites && this.isOpen) {
            this.animationFrameId = requestAnimationFrame(() => this.render());
        }
    }

    updateLayersList() {
        const container = document.getElementById("compositionLayersList");
        if (!container) return;

        container.innerHTML = "";

        if (this.layers.length === 0 && !this.audioLayer) {
            container.innerHTML += '<div class="no-layers-message">No layers yet. Add assets from the gallery!</div>';

            const gifBtn = document.getElementById("exportGifBtn");
            if (gifBtn) gifBtn.style.display = "none";
            const pngBtn = document.getElementById("exportPngBtn");
            if (pngBtn) pngBtn.style.display = "none";
            const oggBtn = document.getElementById("exportOggBtn");
            if (oggBtn) oggBtn.style.display = "none";
            const pBtn = document.getElementById("previewPlayBtn");
            if (pBtn) pBtn.style.display = "none";
            return;
        }

        const hasAnimatedLayers =
            this.layers.some((l) => l.isAnimated && l.spriteCanvases.length > 0) ||
            this.layers.some((l) => l.hasKeyframes && l.keyframes.length > 1);

        const hasAudioKeyframes = this.audioKeyframes && this.audioKeyframes.length > 0;

        const gifBtn = document.getElementById("exportGifBtn");
        if (gifBtn) {
            gifBtn.style.display = hasAnimatedLayers ? "inline-block" : "none";
        }
        const pngBtn = document.getElementById("exportPngBtn");
        if (pngBtn) {
            pngBtn.style.display = this.layers.length > 0 ? "inline-block" : "none";
        }
        const oggBtn = document.getElementById("exportOggBtn");
        if (oggBtn) {
            oggBtn.style.display = hasAudioKeyframes ? "inline-block" : "none";
        }

        let playBtn = document.getElementById("previewPlayBtn");
        if (!playBtn) {
            const layersHeader = document.querySelector(".composition-layers-header > div:last-child");
            if (layersHeader) {
                playBtn = document.createElement("button");
                playBtn.id = "previewPlayBtn";
                playBtn.className = "preview-control-btn success";
                playBtn.title = "Play animation preview";
                playBtn.onclick = () => this.togglePreview();
                //layersHeader.insertBefore(playBtn, layersHeader.firstChild);
                layersHeader.appendChild(playBtn);
            }
        }

        if (playBtn) {
            if (hasAnimatedLayers || hasAudioKeyframes) {
                playBtn.style.display = "inline-block";
                playBtn.textContent = this.isPlayingPreview ? "⏸ Pause" : "▶ Play";
                playBtn.className = this.isPlayingPreview
                    ? "preview-control-btn danger"
                    : "preview-control-btn success";
            } else {
                playBtn.style.display = "none";
            }
        }

        if (this.audioLayer && this.audioKeyframes.length > 0) {
            const audioLayerDiv = document.createElement("div");
            audioLayerDiv.className = "composition-layer-item-audio audio-layer";
            audioLayerDiv.style.borderRadius = "0";
            audioLayerDiv.style.borderLeft = "none";
            audioLayerDiv.style.borderRight = "none";
            audioLayerDiv.style.borderTop = "none";
            audioLayerDiv.style.cursor = "default";

            const selectedKf = this.audioKeyframes[this.selectedAudioKeyframeIndex];
            const selectedIdx = this.selectedAudioKeyframeIndex;
            const kfName = selectedKf.customName || `A${selectedIdx + 1}`;

            let maxAudioDuration = 0;
            for (const kf of this.audioKeyframes) {
                const estimatedDuration = (kf.duration || 3000) / (kf.speed || 1);
                const endTime = kf.time + estimatedDuration;
                maxAudioDuration = Math.max(maxAudioDuration, endTime);
            }
            const durationMinutes = Math.floor(maxAudioDuration / 60000);
            const durationSeconds = Math.floor((maxAudioDuration % 60000) / 1000);
            const durationMs = Math.floor(maxAudioDuration % 1000);
            const durationText = `${durationMinutes}:${durationSeconds.toString().padStart(2, "0")}.${durationMs.toString().padStart(3, "0")}`;

            let keyframeTimelineHTML = `
                <div style="display:flex;justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <div style="display:flex;flex-direction: column; flex: 1; min-width: 0;">
                        <div class="layer-name" style="font-weight: 600; font-size: 0.95em;">${this.audioLayer.name}</div>
                        <div class="layer-type" style="font-size: 0.75em; opacity: 0.7;">${durationText}</div>
                        <div style="font-size: 0.75em; opacity: 0.7; display: flex; flex-direction: row; flex-wrap: wrap; gap: 2px; margin-top: 4px;">
                            ${this.audioKeyframes
                                .map((kf, idx) => {
                                    const isSelected = idx === this.selectedAudioKeyframeIndex;
                                    const label = kf.customName || `A${idx + 1}`;
                                    return `<div onclick="compositionEditor.selectAudioKeyframe(${idx})"
                                             style="cursor: pointer; padding: 2px 4px; border-radius: 3px; background: ${isSelected ? "var(--green)" : "transparent"}; color: ${isSelected ? "black" : "inherit"}; font-weight: ${isSelected ? "600" : "normal"};"
                                             title="${kf.name} (${label})">
                                    ${kf.name}
                                </div>`;
                                })
                                .join("")}
                        </div>
                    </div>
                    <div style="display: flex; gap: 6px;">
                        <button class="layer-control-btn visibility-btn ${this.audioLayerVisible ? "active" : ""}"
                                onclick="compositionEditor.toggleAudioLayerVisibility()"
                                title="${this.audioLayerVisible ? "Mute" : "Play"} the audio track">
                            ${this.audioLayerVisible ? "☑" : "☐"}
                        </button>
                        <button class="layer-control-btn delete-btn"
                                onclick="compositionEditor.removeAllAudioKeyframes()"
                                title="Remove all audio keyframes">
                            🗑
                        </button>
                    </div>
                </div>
                <div class="keyframe-timeline-section" style="overflow-x: hidden;">`;

            keyframeTimelineHTML +=
                '<div class="keyframe-header" style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">';
            keyframeTimelineHTML += `
                <div style="flex: 1; display: flex; align-items: stretch; gap: 4px;">
                    <button class="keyframe-tab active" ondblclick="event.stopPropagation(); compositionEditor.startEditingAudioKeyframe('${selectedKf.id}')" title="Double-click to rename">
                        <span id="akf-display-${selectedKf.id}">${kfName}</span>
                        <input type="text" id="akf-input-${selectedKf.id}" value="${kfName}"
                               style="display: none; width: 50px; padding: 0.25vmax; font-size: inherit; font-family: inherit; background: var(--bg-color-section-lighter); color: var(--txt-color); border: 1px solid var(--accent-color); border-radius: 2px;"
                               onkeydown="if(event.key === 'Enter') { event.preventDefault(); compositionEditor.saveAudioKeyframeName('${selectedKf.id}'); }"
                               onblur="compositionEditor.saveAudioKeyframeName('${selectedKf.id}')"
                               onclick="event.stopPropagation()">
                    </button>
                    <button class="layer-control-btn"
                            onclick="compositionEditor.addAudioKeyframeAtTime()"
                            title="Add new audio keyframe based on current one"
                            style="font-size: 1vmax; padding: 0.25vmax; font-weight: normal;">
                        ⥅
                    </button>
                </div>
            `;

            keyframeTimelineHTML += `
                <button class="layer-control-btn delete-btn"
                       onclick="compositionEditor.removeAudioKeyframe('${selectedKf.id}')"
                       title="Delete current audio keyframe">
                   ✕
               </button>
            `;
            keyframeTimelineHTML += "</div>";

            const audioTimelineHTML = this.generateAudioTimeline();
            keyframeTimelineHTML += audioTimelineHTML;

            let maxTime = 0;
            for (const layer of this.layers) {
                if (layer.hasKeyframes && layer.keyframes.length > 0) {
                    for (const kf of layer.keyframes) {
                        const animDuration = this.calculateAnimationDuration(kf);
                        const keyframeEnd = kf.time + (animDuration || 0);
                        maxTime = Math.max(maxTime, keyframeEnd);
                    }
                }
            }
            if (this.audioKeyframes && this.audioKeyframes.length > 0) {
                for (const kf of this.audioKeyframes) {
                    const audioEnd = kf.time + (kf.duration || 0);
                    maxTime = Math.max(maxTime, audioEnd);
                }
            }
            maxTime = Math.max(maxTime + 1000, 2000);

            const selectedKfPosition = (selectedKf.time / maxTime) * 100;
            keyframeTimelineHTML += `
                <div style="position: relative; height: 30px; margin-bottom: 8px;">
                    <button class="layer-control-btn ${this.isPlayingAudioPreview ? "danger" : ""}"
                            onclick="compositionEditor.toggleAudioPreview()"
                            title="${this.isPlayingAudioPreview ? "Pause" : "Play"} this audio"
                            style="position: absolute; left: ${selectedKfPosition}%; transform: translateX(-50%); font-size: 0.25vmax; padding: 0.1vmax; font-weight: normal;border-radius: 0;background: none;">
                        ${this.isPlayingAudioPreview ? "⏸" : "▶"}
                    </button>
                </div>
            `;

            keyframeTimelineHTML += `
                <div style="display: flex; gap: 8px; margin-top: 8px;">
                    <div class="layer-position" style="flex: 0 0 20%; padding: 8px; background: var(--bg-color-section); border-radius: 4px;">
                        <div style="display: flex; flex-direction: column; gap: 2px;">
                            <label style="font-size: 0.7em; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.5px;">Time (ms)</label>
                            <input type="number" value="${selectedKf.time}" min="0" step="100"
                                   onchange="compositionEditor.updateAudioKeyframeTime('${selectedKf.id}', parseInt(this.value))"
                                   class="position-input">
                        </div>
                    </div>
                    <div class="layer-position" style="flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 8px; background: var(--bg-color-section); border-radius: 4px;">
                        <div style="display: flex; flex-direction: column; gap: 2px;">
                            <label style="font-size: 0.7em; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.5px;">Speed</label>
                            <input type="number" value="${selectedKf.speed}" min="0.25" max="2" step="0.05"
                                   onchange="compositionEditor.updateAudioKeyframe('${selectedKf.id}', {speed: parseFloat(this.value)})"
                                   class="position-input" style="width: 100%;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 2px;">
                            <label style="font-size: 0.7em; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.5px;">Pitch</label>
                            <input type="number" value="${selectedKf.pitch}" min="-12" max="12" step="0.5"
                                   onchange="compositionEditor.updateAudioKeyframe('${selectedKf.id}', {pitch: parseFloat(this.value)})"
                                   class="position-input" style="width: 100%;">
                        </div>
                    </div>
                </div>
            `;

            keyframeTimelineHTML += "</div>";

            audioLayerDiv.innerHTML = keyframeTimelineHTML;

            container.appendChild(audioLayerDiv);
        }

        const reversedLayers = [...this.layers].reverse();

        reversedLayers.forEach((layer, displayIndex) => {
            const actualIndex = this.layers.length - 1 - displayIndex;
            const layerDiv = document.createElement("div");
            layerDiv.className = "composition-layer-item";
            if (this.selectedLayerId === layer.id) {
                layerDiv.classList.add("selected");
            }

            if (this.moveAsKeyframeMode && this.moveAsKeyframeSourceId) {
                if (layer.id === this.moveAsKeyframeSourceId) {
                    layerDiv.classList.add("move-as-keyframe-source");
                    layerDiv.style.opacity = "0.6";
                } else {
                    layerDiv.classList.add("move-as-keyframe-target");
                    layerDiv.style.cursor = "pointer";
                    if (this.importAsKeyframeMode) {
                        layerDiv.title = "Click to import this layer as keyframe into the target";
                    } else {
                        layerDiv.title = "Click to move source layer as keyframe of this layer";
                    }
                }
            }

            layerDiv.addEventListener("click", (e) => {
                if (
                    e.target.tagName === "BUTTON" ||
                    e.target.tagName === "INPUT" ||
                    e.target.closest("button") ||
                    e.target.closest("input")
                ) {
                    return;
                }

                if (this.moveAsKeyframeMode && this.moveAsKeyframeSourceId) {
                    if (layer.id === this.moveAsKeyframeSourceId) {
                        this.cancelMoveAsKeyframeMode();
                        return;
                    }

                    if (this.importAsKeyframeMode) {
                        this.convertLayerToKeyframe(layer.id, this.moveAsKeyframeSourceId);
                    } else {
                        this.convertLayerToKeyframe(this.moveAsKeyframeSourceId, layer.id);
                    }
                    return;
                }

                this.selectLayer(layer.id);
            });

            const renderData = this.getLayerRenderData(layer);

            let layerDisplayName = layer.name;
            /*if (
                layer.hasKeyframes &&
                renderData.type === "sprite" &&
                renderData.spriteIndices &&
                renderData.spriteIndices.length > 0
            ) {
                const spriteIndex = renderData.isAnimated
                    ? renderData.spriteIndices[layer.currentSpriteIndex]
                    : renderData.spriteIndices[0];
                layerDisplayName = `${layer.name} [${renderData.spriteIndices.join("-")}]`;
            }*/
            let typeDetailed = renderData.type;
            if (renderData.type === "sprite" && renderData.spriteIndices && renderData.spriteIndices.length > 0) {
                typeDetailed = `Animated sprites [${renderData.spriteIndices.join("-")}]`;
            }

            let keyframeTimelineHTML = "";
            let positionHTML = "";

            if (layer.hasKeyframes && layer.keyframes.length > 0) {
                const selectedKf = layer.keyframes[layer.selectedKeyframeIndex];
                const selectedIdx = layer.selectedKeyframeIndex;
                const kfName = selectedKf.name || `KF ${selectedIdx + 1}`;

                keyframeTimelineHTML = '<div class="keyframe-timeline-section" style="overflow-x: hidden;">';

                keyframeTimelineHTML +=
                    '<div class="keyframe-header" style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">';
                keyframeTimelineHTML += `
                    <div style="flex: 1; display: flex; align-items: stretch; gap: 4px;">
                        <button class="keyframe-tab active"
                                ondblclick="event.stopPropagation(); compositionEditor.startEditingKeyframe('${layer.id}', '${selectedKf.id}')"
                                title="Double-click to rename">
                            <span id="kf-display-${selectedKf.id}">${kfName}</span>
                            <input type="text"
                                   id="kf-input-${selectedKf.id}"
                                   value="${kfName}"
                                   style="display: none; width: 50px; padding: 0.25vmax; font-size: inherit; font-family: inherit; background: var(--bg-color-section-lighter); color: var(--txt-color); border: 1px solid var(--accent-color); border-radius: 2px;"
                                   onkeydown="if(event.key === 'Enter') { event.preventDefault(); compositionEditor.saveKeyframeName('${layer.id}', '${selectedKf.id}'); }"
                                   onblur="compositionEditor.saveKeyframeName('${layer.id}', '${selectedKf.id}')"
                                   onclick="event.stopPropagation()">
                        </button>
                        <button class="layer-control-btn"
                                onclick="compositionEditor.addKeyframe('${layer.id}')"
                                title="Add new keyframe in 1s based on the current one"
                                style="font-size: 1vmax; padding: 0.25vmax; font-weight: normal;">
                            ⥅
                        </button>
                        <button class="layer-control-btn"
                                onclick="compositionEditor.showImportAsKeyframeMenu('${layer.id}')"
                                title="Import another layer as a new keyframe in this timeline"
                                style="font-size: 1vmax; padding: 0.25vmax; font-weight: normal;">
                            +
                        </button>
                    </div>
                `;

                keyframeTimelineHTML += `
                    <button class="layer-control-btn"
                           onclick="compositionEditor.ejectKeyframe('${layer.id}', '${selectedKf.id}')"
                           title="Eject keyframe as a new simple image layer"
                           style="font-size: 1vmax; padding: 0.25vmax; font-weight: normal;">
                        ⏏
                    </button>
                `;

                if (layer.keyframes.length > 1) {
                    keyframeTimelineHTML += `
                        <button class="layer-control-btn delete-btn"
                               onclick="compositionEditor.removeKeyframe('${layer.id}', '${selectedKf.id}')"
                               title="Delete current keyframe">
                           ✕
                       </button>
                    `;
                }
                keyframeTimelineHTML += "</div>";

                keyframeTimelineHTML += this.generateVisualTimeline(layer);

                positionHTML = `
                    <div style="display: flex; gap: 8px; margin-top: 8px;">
                        <div class="layer-position" style="flex: 0 0 20%; padding: 8px; background: var(--bg-color-section); border-radius: 4px;">
                            <div style="display: flex; flex-direction: column; gap: 2px;">
                                <label style="font-size: 0.7em; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.5px;">Time (ms)</label>
                                <input type="number" value="${selectedKf.time}" min="0" step="100"
                                       onchange="compositionEditor.updateKeyframeTime('${layer.id}', '${selectedKf.id}', parseInt(this.value))"
                                       class="position-input">
                            </div>
                        </div>
                        <div class="layer-position" style="flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 8px; background: var(--bg-color-section); border-radius: 4px;">
                            <div style="display: flex; flex-direction: column; gap: 2px;">
                                <label style="font-size: 0.7em; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.5px;">X</label>
                                <input type="number" value="${renderData.x}" min="0" max="${this.canvasWidth}" step="1"
                                       onchange="compositionEditor.updateLayerPosition('${layer.id}', parseInt(this.value), ${renderData.y}, false)"
                                       class="position-input" style="width: 100%;">
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 2px;">
                                <label style="font-size: 0.7em; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.5px;">Y</label>
                                <input type="number" value="${renderData.y}" min="0" max="${this.canvasHeight}" step="1"
                                       onchange="compositionEditor.updateLayerPosition('${layer.id}', ${renderData.x}, parseInt(this.value), false)"
                                       class="position-input" style="width: 100%;">
                            </div>
                        </div>
                    </div>
                `;

                keyframeTimelineHTML += positionHTML;
                keyframeTimelineHTML += "</div>";
            } else {
                positionHTML = `
                    <div class="layer-position" style="flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 8px; background: var(--bg-color-section); border-radius: 4px;">
                        <div style="display: flex; flex-direction: column; gap: 2px;">
                            <label style="font-size: 0.7em; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.5px;">X</label>
                            <input type="number" value="${renderData.x}" min="0" max="${this.canvasWidth}" step="1"
                                   onchange="compositionEditor.updateLayerPosition('${layer.id}', parseInt(this.value), ${renderData.y}, false)"
                                   class="position-input" style="width: 100%;">
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 2px;">
                            <label style="font-size: 0.7em; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.5px;">Y</label>
                            <input type="number" value="${renderData.y}" min="0" max="${this.canvasHeight}" step="1"
                                   onchange="compositionEditor.updateLayerPosition('${layer.id}', ${renderData.x}, parseInt(this.value), false)"
                                   class="position-input" style="width: 100%;">
                        </div>
                    </div>
                `;
            }

            const otherLayers = this.layers.filter((l) => l.id !== layer.id);

            let thumbnailsHTML = "";
            if (layer.hasKeyframes && layer.keyframes.length > 0) {
                thumbnailsHTML = '<div style="display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 8px;">';
                layer.keyframes.forEach((kf, idx) => {
                    const isSelected = idx === layer.selectedKeyframeIndex;
                    const kfRenderData = this.getKeyframeRenderData(layer, idx);
                    const thumb = this.getLayerThumbnailFromRenderData(kfRenderData);

                    let tooltipText = "";
                    if (kf.assetRef) {
                        const filename = kf.assetRef.split("/").pop();
                        tooltipText += filename;

                        if (kf.spriteIndices && kf.spriteIndices.length > 0) {
                            tooltipText += `[${kf.spriteIndices.join("-")}]`;
                        }
                        tooltipText += ` (${kf.name})`;
                    } else {
                        tooltipText += kf.name;
                    }

                    thumbnailsHTML += `
                        <div style="border: 2px solid ${isSelected ? "var(--green)" : "transparent"}; border-radius: 6px; padding: 2px; ${isSelected ? "box-shadow: 0 0 8px var(--green);" : ""} cursor: pointer;"
                             onclick="compositionEditor.selectKeyframe('${layer.id}', ${idx})"
                             title="${tooltipText}">
                            ${thumb}
                        </div>
                    `;
                });
                thumbnailsHTML += "</div>";
            } else {
                thumbnailsHTML = "";
            }

            layerDiv.style.position = "relative";

            layerDiv.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; padding-right: 8px;">
                    <div class="layer-info" style="flex: 1; min-width: 0;">
                        <div class="layer-name" title="${layerDisplayName}" style="font-weight: 600; font-size: 0.95em; ${layer.hasKeyframes ? "cursor: text;" : ""}" ${layer.hasKeyframes ? `ondblclick="compositionEditor.startEditingLayerName('${layer.id}')"` : ""}>
                            <span id="layer-display-${layer.id}">${this.truncate(layerDisplayName, 40)}</span>
                            ${
                                layer.hasKeyframes
                                    ? `<input type="text"
                                       id="layer-input-${layer.id}"
                                       value="${layer.name}"
                                       style="display: none; width: 150px; padding: 0.25vmax; font-size: inherit; font-family: inherit; background: var(--bg-color-section-lighter); color: var(--txt-color); border: 1px solid var(--accent-color); border-radius: 2px;"
                                       onkeydown="if(event.key === 'Enter') { event.preventDefault(); compositionEditor.saveLayerName('${layer.id}'); }"
                                       onblur="compositionEditor.saveLayerName('${layer.id}')"
                                       onclick="event.stopPropagation()">`
                                    : ""
                            }
                        </div>
                        <div class="layer-type" style="font-size: 0.75em; opacity: 0.7;">${layer.hasKeyframes ? layer.type : typeDetailed}</div>
                    </div>
                    ${
                        !layer.hasKeyframes
                            ? `<div style="display: flex; gap: 3px;padding-right: 6px;">
                                                <button class="layer-control-btn"
                                                        onclick="compositionEditor.addKeyframe('${layer.id}')"
                                                        title="Add a timeline and a keyframe to this layer"
                                                ">⏱</button></div>`
                            : ""
                    }
                    <div class="layer-top-actions" style="display: flex; gap: 6px; align-items: center;">
                        <div style="display: flex; gap: 3px; border-right: 1px solid var(--txt-color); padding-right: 6px; ${!layer.hasKeyframes ? `border-left: 1px solid var(--txt-color);padding-left: 6px;` : ""}">
                            <button class="layer-control-btn"
                                    onclick="compositionEditor.moveLayerUp('${layer.id}')"
                                    title="Move layer forward (higher z-index)"
                                    ${actualIndex === this.layers.length - 1 ? "disabled" : ""}>
                                ⬆
                            </button>
                            <button class="layer-control-btn"
                                    onclick="compositionEditor.moveLayerDown('${layer.id}')"
                                    title="Move layer backward (lower z-index)"
                                    ${actualIndex === 0 ? "disabled" : ""}>
                                ⬇
                            </button>
                        </div>
                        <div style="display: flex; gap: 3px;">
                            <button class="layer-control-btn visibility-btn ${layer.visible ? "active" : ""}"
                                    onclick="compositionEditor.toggleLayerVisibility('${layer.id}')"
                                    title="${layer.visible ? "Hide layer" : "Show layer"}">
                                ${layer.visible ? "☑" : "☐"}
                            </button>
                            <button class="layer-control-btn delete-btn"
                                    onclick="compositionEditor.removeLayer('${layer.id}')"
                                    title="Remove this layer from composition">
                                🗑
                            </button>
                        </div>
                    </div>
                </div>

                ${thumbnailsHTML}

                ${keyframeTimelineHTML}

                ${
                    !layer.hasKeyframes
                        ? `
                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <div>
                                ${this.getLayerThumbnail(layer)}
                            </div>
                        </div>
                        ${positionHTML}
                    </div>
                `
                        : ""
                }
            `;

            container.appendChild(layerDiv);
        });

        this.attachKeyframeDragListeners();
    }

    getLayerThumbnail(layer) {
        const renderData = this.getLayerRenderData(layer);
        return this.getLayerThumbnailFromRenderData(renderData);
    }

    getKeyframeRenderData(layer, keyframeIndex) {
        if (!layer.hasKeyframes || !layer.keyframes[keyframeIndex]) {
            return this.getLayerRenderData(layer);
        }

        const keyframe = layer.keyframes[keyframeIndex];

        let assetKeyframe = keyframe;
        if (!keyframe.assetRef && !keyframe.blobUrl) {
            for (let i = keyframeIndex - 1; i >= 0; i--) {
                if (layer.keyframes[i].assetRef || layer.keyframes[i].blobUrl) {
                    assetKeyframe = layer.keyframes[i];
                    break;
                }
            }
        }

        return {
            x: keyframe.x,
            y: keyframe.y,
            width: keyframe.width || assetKeyframe.width,
            height: keyframe.height || assetKeyframe.height,
            type: assetKeyframe.type,
            image: assetKeyframe.image,
            imageLoaded: assetKeyframe.imageLoaded,
            spriteCanvases: assetKeyframe.spriteCanvases,
            spriteIndices: assetKeyframe.spriteIndices,
            isAnimated: assetKeyframe.isAnimated,
        };
    }

    getLayerThumbnailFromRenderData(renderData) {
        const thumbnailCanvas = document.createElement("canvas");
        const thumbSize = 40;
        thumbnailCanvas.width = thumbSize;
        thumbnailCanvas.height = thumbSize;
        const thumbCtx = thumbnailCanvas.getContext("2d");

        thumbCtx.fillStyle = "rgba(0, 0, 0, 0.3)";
        thumbCtx.fillRect(0, 0, thumbSize, thumbSize);

        if (renderData.type === "sprite" && renderData.spriteCanvases && renderData.spriteCanvases.length > 0) {
            const spriteIndex = renderData.spriteIndices[0];
            const spriteCanvas = renderData.spriteCanvases[spriteIndex];
            if (spriteCanvas) {
                const scale = Math.min(thumbSize / spriteCanvas.width, thumbSize / spriteCanvas.height);
                const scaledWidth = spriteCanvas.width * scale;
                const scaledHeight = spriteCanvas.height * scale;
                const x = (thumbSize - scaledWidth) / 2;
                const y = (thumbSize - scaledHeight) / 2;
                thumbCtx.drawImage(spriteCanvas, x, y, scaledWidth, scaledHeight);
            }
        } else if (renderData.image && renderData.imageLoaded) {
            const scale = Math.min(thumbSize / renderData.width, thumbSize / renderData.height);
            const scaledWidth = renderData.width * scale;
            const scaledHeight = renderData.height * scale;
            const x = (thumbSize - scaledWidth) / 2;
            const y = (thumbSize - scaledHeight) / 2;
            thumbCtx.drawImage(renderData.image, x, y, scaledWidth, scaledHeight);
        }

        const thumbnailUrl = thumbnailCanvas.toDataURL();
        return `<img src="${thumbnailUrl}" style="width:40px;height:40px;border-radius:4px;object-fit:contain;">`;
    }

    truncate(str, maxLen) {
        return str.length > maxLen ? str.substring(0, maxLen - 3) + "..." : str;
    }

    attachKeyframeDragListeners() {
        const markers = document.querySelectorAll(".timeline-keyframe-marker.timeline-keyframe-current");

        markers.forEach((marker) => {
            marker.addEventListener("mousedown", (e) => {
                if (e.button !== 0) return;

                const isSelected = marker.dataset.isSelected === "true";
                if (!isSelected) return;

                const startX = e.clientX;
                const startY = e.clientY;
                let hasMoved = false;
                let isDragging = false;

                const layerId = marker.dataset.layerId;
                const keyframeId = marker.dataset.keyframeId;
                const audioKeyframeId = marker.dataset.audioKeyframeId;
                const isAudioKeyframe = !!audioKeyframeId;
                const timeline = marker.closest(".visual-timeline-wrapper");
                if (!timeline) return;

                const timelineTrack = marker.closest(".visual-timeline-track");
                if (!timelineTrack) return;

                const maxTime = parseFloat(timeline.dataset.maxTime);
                const rect = timelineTrack.getBoundingClientRect();

                const onMouseMove = (moveEvent) => {
                    const deltaX = Math.abs(moveEvent.clientX - startX);
                    const deltaY = Math.abs(moveEvent.clientY - startY);

                    if (!hasMoved && (deltaX > 3 || deltaY > 3)) {
                        hasMoved = true;
                        isDragging = true;
                        e.preventDefault();
                        e.stopPropagation();
                        marker.style.opacity = "0.6";
                    }

                    if (!isDragging) return;

                    const currentX = moveEvent.clientX;
                    const relativeX = currentX - rect.left;
                    const clampedX = Math.max(0, Math.min(relativeX, rect.width));
                    const percentage = clampedX / rect.width;
                    const newTime = Math.max(0, Math.round(percentage * maxTime));

                    if (isAudioKeyframe) {
                        const kfIndex = this.audioKeyframes.findIndex((kf) => kf.id === audioKeyframeId);
                        if (kfIndex !== -1) {
                            this.audioKeyframes[kfIndex].time = newTime;
                            this.audioKeyframes.sort((a, b) => a.time - b.time);
                            this.selectedAudioKeyframeIndex = this.audioKeyframes.findIndex(
                                (kf) => kf.id === audioKeyframeId,
                            );
                        }
                    } else {
                        const layer = this.layers.find((l) => l.id === layerId);
                        if (layer && layer.hasKeyframes) {
                            const kfIndex = layer.keyframes.findIndex((kf) => kf.id === keyframeId);
                            if (kfIndex !== -1) {
                                layer.keyframes[kfIndex].time = newTime;
                                layer.keyframes.sort((a, b) => a.time - b.time);
                                layer.selectedKeyframeIndex = layer.keyframes.findIndex((kf) => kf.id === keyframeId);
                                this.updateLayerTypeFromKeyframes(layer);
                            }
                        }
                    }

                    this.updateLayersList();
                };

                const onMouseUp = (upEvent) => {
                    if (isDragging) {
                        marker.style.opacity = "";

                        this.render();
                    }

                    document.removeEventListener("mousemove", onMouseMove);
                    document.removeEventListener("mouseup", onMouseUp);
                };

                document.addEventListener("mousemove", onMouseMove);
                document.addEventListener("mouseup", onMouseUp);
            });
        });
    }

    generateVisualTimeline(currentLayer) {
        let maxTime = 0;
        for (const layer of this.layers) {
            if (layer.hasKeyframes && layer.keyframes.length > 0) {
                for (const kf of layer.keyframes) {
                    const animDuration = this.calculateAnimationDuration(kf);
                    const keyframeEnd = kf.time + (animDuration || 0);
                    maxTime = Math.max(maxTime, keyframeEnd);
                }
            }
        }

        if (this.audioKeyframes && this.audioKeyframes.length > 0) {
            for (const kf of this.audioKeyframes) {
                const audioEnd = kf.time + (kf.duration || 0);
                maxTime = Math.max(maxTime, audioEnd);
            }
        }

        maxTime = Math.max(maxTime + 1000, 2000);

        const maxSeconds = Math.ceil(maxTime / 1000);

        let html = '<div class="visual-timeline-container">';

        html += '<div style="position: relative; min-height: 20px; margin-bottom: 4px;">';
        for (let i = 0; i < currentLayer.keyframes.length; i++) {
            const kf = currentLayer.keyframes[i];
            const position = (kf.time / maxTime) * 100;
            const isSelected = i === currentLayer.selectedKeyframeIndex;
            const kfName = kf.name || `KF ${i + 1}`;
            const canMoveDown = i > 0;
            const canMoveUp = i < currentLayer.keyframes.length - 1;

            if (isSelected) {
                html += `
                    <div style="position: absolute; top: 0; left: ${position}%; transform: translateX(-50%); z-index: 10;">
                        <div style="position: relative; display: inline-block;">
                            ${
                                canMoveDown
                                    ? `
                                <button class="keyframe-reorder-btn"
                                        style="position: absolute; right: 100%; top: 50%; transform: translateY(-50%); margin-right: 2px; font-size: 0.65em; padding: 1px 3px; min-width: 16px; height: 16px; line-height: 1;"
                                        onclick="event.stopPropagation(); compositionEditor.moveKeyframeDown('${currentLayer.id}', ${i})"
                                        title="Swap with previous">
                                    ⥃
                                </button>
                            `
                                    : ""
                            }
                            <span style="cursor: pointer; font-size: 0.75em; white-space: nowrap; font-weight: 600; color: var(--green); text-shadow: 0 0 8px var(--green);"
                                  onclick="event.stopPropagation(); compositionEditor.selectKeyframe('${currentLayer.id}', ${i})"
                                  title="${kfName}">
                                ${kfName}
                            </span>
                            ${
                                canMoveUp
                                    ? `
                                <button class="keyframe-reorder-btn"
                                        style="position: absolute; left: 100%; top: 50%; transform: translateY(-50%); margin-left: 2px; font-size: 0.65em; padding: 1px 3px; min-width: 16px; height: 16px; line-height: 1;"
                                        onclick="event.stopPropagation(); compositionEditor.moveKeyframeUp('${currentLayer.id}', ${i})"
                                        title="Swap with next">
                                    ⥂
                                </button>
                            `
                                    : ""
                            }
                        </div>
                    </div>
                `;
            } else {
                html += `
                    <div style="position: absolute; top: 69px; left: ${position}%; transform: translateX(-50%); cursor: pointer; font-size: 0.75em; white-space: nowrap; color: var(--grey); z-index: 5;"
                         onclick="event.stopPropagation(); compositionEditor.selectKeyframe('${currentLayer.id}', ${i})"
                         title="${kfName}">
                        ${kfName}
                    </div>
                `;
            }
        }
        html += "</div>";

        html += '<div class="visual-timeline-track">';

        if (maxTime <= 10000) {
            for (let sec = 0; sec <= maxSeconds; sec++) {
                const position = ((sec * 1000) / maxTime) * 100;
                html += `
                    <div class="timeline-second-marker" style="left: ${position}%">
                        <div class="timeline-second-tick"></div>
                        <div class="timeline-second-label" style="${sec === 0 ? "font-weight: 600; opacity: 1;" : ""}">${sec}s</div>
                    </div>
                `;
            }
            const totalSubdivisions = Math.ceil(maxTime / 200);
            for (let i = 1; i < totalSubdivisions; i++) {
                const time = i * 200;
                if (time % 1000 !== 0) {
                    const position = (time / maxTime) * 100;
                    html += `
                        <div style="position: absolute; left: ${position}%; top: 0; width: 1px; height: 8px; background: var(--txt-color); opacity: 0.2;"></div>
                    `;
                }
            }
        } else if (maxTime <= 60000) {
            const maxMarkers = Math.ceil(maxTime / 5000);
            for (let i = 0; i <= maxMarkers; i++) {
                const time = i * 5000;
                const position = (time / maxTime) * 100;
                const seconds = time / 1000;
                html += `
                    <div class="timeline-second-marker" style="left: ${position}%">
                        <div class="timeline-second-tick"></div>
                        <div class="timeline-second-label" style="${i === 0 ? "font-weight: 600; opacity: 1;" : ""}">${seconds}s</div>
                    </div>
                `;
            }

            const totalSubdivisions = Math.ceil(maxTime / 1000);
            for (let i = 1; i < totalSubdivisions; i++) {
                const time = i * 1000;
                if (time % 5000 !== 0) {
                    const position = (time / maxTime) * 100;
                    html += `
                        <div style="position: absolute; left: ${position}%; top: 0; width: 1px; height: 8px; background: var(--txt-color); opacity: 0.2;"></div>
                    `;
                }
            }
        } else {
            const maxMinutes = Math.ceil(maxTime / 60000);
            for (let min = 0; min <= maxMinutes; min++) {
                const time = min * 60000;
                const position = (time / maxTime) * 100;
                html += `
                    <div class="timeline-second-marker" style="left: ${position}%">
                        <div class="timeline-second-tick"></div>
                        <div class="timeline-second-label" style="${min === 0 ? "font-weight: 600; opacity: 1;" : ""}">${min}m</div>
                    </div>
                `;
            }

            const totalSubdivisions = Math.ceil(maxTime / 10000);
            for (let i = 1; i < totalSubdivisions; i++) {
                const time = i * 10000;
                if (time % 60000 !== 0) {
                    const position = (time / maxTime) * 100;
                    html += `
                        <div style="position: absolute; left: ${position}%; top: 0; width: 1px; height: 8px; background: var(--txt-color); opacity: 0.2;"></div>
                    `;
                }
            }
        }

        for (const layer of this.layers) {
            if (layer.id === currentLayer.id) continue;
            if (!layer.hasKeyframes || layer.keyframes.length === 0) continue;

            for (const kf of layer.keyframes) {
                const position = (kf.time / maxTime) * 100;
                html += `
                    <div class="timeline-keyframe-marker timeline-keyframe-other"
                         style="left: ${position}%"
                         title="Other layer keyframe at ${kf.time}ms">
                    </div>
                `;
            }
        }

        if (this.audioKeyframes && this.audioKeyframes.length > 0) {
            for (const kf of this.audioKeyframes) {
                const position = (kf.time / maxTime) * 100;

                if (kf.duration) {
                    const durationWidth = (kf.duration / maxTime) * 100;
                    html += `
                        <div class="timeline-audio-duration-line"
                             style="left: ${position}%; width: ${durationWidth}%"
                             title="Audio duration: ${(kf.duration / 1000).toFixed(2)}s">
                        </div>
                    `;
                }

                const tooltipText = `🔊 ${kf.name}
Time: ${kf.time}ms
Speed: ${kf.speed.toFixed(1)}x
Pitch: ${kf.pitch >= 0 ? "+" : ""}${kf.pitch.toFixed(1)}`;
                html += `
                    <div style="position: absolute; left: ${position}%; bottom: -18px; transform: translateX(-50%); font-size: 1em; opacity: 0.6; cursor: help; z-index: 3;"
                         title="${tooltipText}">
                        ♫
                    </div>
                `;
            }
        }

        for (let i = 0; i < currentLayer.keyframes.length; i++) {
            const kf = currentLayer.keyframes[i];
            const position = (kf.time / maxTime) * 100;
            const isSelected = i === currentLayer.selectedKeyframeIndex;
            const kfName = kf.name || `KF ${i + 1}`;

            const animDuration = this.calculateAnimationDuration(kf);
            if (animDuration) {
                const durationWidth = (animDuration / maxTime) * 100;
                const durationType = kf.type === "sprite" ? "Animation" : "GIF";
                const durationColor = isSelected ? "var(--success-color)" : "var(--grey)";
                html += `
                    <div class="timeline-duration-line"
                         style="left: ${position}%; width: ${durationWidth}%; background: ${durationColor}; opacity: ${isSelected ? "0.7" : "0.3"};"
                         title="${durationType} duration: ${(animDuration / 1000).toFixed(2)}s">
                    </div>
                `;
            }

            //title="${kfName} at ${kf.time}ms - Click to select${isSelected ? " | Drag to move" : ""}">
            html += `
                <div class="timeline-keyframe-marker timeline-keyframe-current ${isSelected ? "timeline-keyframe-selected" : ""}"
                     style="left: ${position}%"
                     onclick="event.stopPropagation(); compositionEditor.selectKeyframe('${currentLayer.id}', ${i})"
                     data-layer-id="${currentLayer.id}"
                     data-keyframe-id="${kf.id}"
                     data-keyframe-index="${i}"
                     data-is-selected="${isSelected}"
                     title="${kfName} at ${kf.time}ms">
                    <div class="timeline-keyframe-diamond"></div>
                </div>
            `;
        }

        html += `<div class="timeline-playhead ${this.isPlayingPreview ? "active" : ""}" data-playhead="visual-${currentLayer.id}" style="left: 0%"></div>`;

        html += "</div>";
        html += "</div>";

        return `<div class="visual-timeline-wrapper" data-max-time="${maxTime}">${html}</div>`;
    }

    generateAudioTimeline() {
        let maxTime = 0;

        for (const layer of this.layers) {
            if (layer.hasKeyframes && layer.keyframes.length > 0) {
                for (const kf of layer.keyframes) {
                    const animDuration = this.calculateAnimationDuration(kf);
                    const keyframeEnd = kf.time + (animDuration || 0);
                    maxTime = Math.max(maxTime, keyframeEnd);
                }
            }
        }

        if (this.audioKeyframes && this.audioKeyframes.length > 0) {
            for (const kf of this.audioKeyframes) {
                const audioEnd = kf.time + (kf.duration || 0);
                maxTime = Math.max(maxTime, audioEnd);
            }
        }

        maxTime = Math.max(maxTime + 1000, 2000);
        const maxSeconds = Math.ceil(maxTime / 1000);

        let html = '<div class="visual-timeline-container">';

        html += '<div style="position: relative; min-height: 20px; margin-bottom: 4px;">';
        for (let i = 0; i < this.audioKeyframes.length; i++) {
            const kf = this.audioKeyframes[i];
            const position = (kf.time / maxTime) * 100;
            const isSelected = i === this.selectedAudioKeyframeIndex;
            const kfLabel = kf.customName || `A${i + 1}`;
            const canMoveDown = i > 0;
            const canMoveUp = i < this.audioKeyframes.length - 1;

            if (isSelected) {
                html += `
                    <div style="position: absolute; top: 0; left: ${position}%; transform: translateX(-50%); z-index: 10;">
                        <div style="position: relative; display: inline-block;">
                            ${
                                canMoveDown
                                    ? `
                                <button class="keyframe-reorder-btn"
                                        style="position: absolute; right: 100%; top: 50%; transform: translateY(-50%); margin-right: 2px; font-size: 0.65em; padding: 1px 3px; min-width: 16px; height: 16px; line-height: 1;"
                                        onclick="event.stopPropagation(); compositionEditor.moveAudioKeyframeDown(${i})"
                                        title="Swap with previous">
                                    ⥃
                                </button>
                            `
                                    : ""
                            }
                            <span style="cursor: pointer; font-size: 0.75em; white-space: nowrap; font-weight: 600; color: var(--green); text-shadow: 0 0 8px var(--green);"
                                  onclick="event.stopPropagation(); compositionEditor.selectAudioKeyframe(${i})"
                                  title="${kf.name}">
                                ${kfLabel}
                            </span>
                            ${
                                canMoveUp
                                    ? `
                                <button class="keyframe-reorder-btn"
                                        style="position: absolute; left: 100%; top: 50%; transform: translateY(-50%); margin-left: 2px; font-size: 0.65em; padding: 1px 3px; min-width: 16px; height: 16px; line-height: 1;"
                                        onclick="event.stopPropagation(); compositionEditor.moveAudioKeyframeUp(${i})"
                                        title="Swap with next">
                                    ⥂
                                </button>
                            `
                                    : ""
                            }
                        </div>
                    </div>
                `;
            } else {
                html += `
                    <div style="position: absolute; top: 69px; left: ${position}%; transform: translateX(-50%); cursor: pointer; font-size: 0.75em; white-space: nowrap; color: var(--grey); z-index: 5;"
                         onclick="event.stopPropagation(); compositionEditor.selectAudioKeyframe(${i})"
                         title="${kf.name}">
                        ${kfLabel}
                    </div>
                `;
            }
        }
        html += "</div>";

        html += '<div class="visual-timeline-track">';

        if (maxTime <= 10000) {
            for (let sec = 0; sec <= maxSeconds; sec++) {
                const position = ((sec * 1000) / maxTime) * 100;
                html += `
                    <div class="timeline-second-marker" style="left: ${position}%">
                        <div class="timeline-second-tick"></div>
                        <div class="timeline-second-label" style="${sec === 0 ? "font-weight: 600; opacity: 1;" : ""}">${sec}s</div>
                    </div>
                `;
            }
            const totalSubdivisions = Math.ceil(maxTime / 200);
            for (let i = 1; i < totalSubdivisions; i++) {
                const time = i * 200;
                if (time % 1000 !== 0) {
                    const position = (time / maxTime) * 100;
                    html += `
                        <div style="position: absolute; left: ${position}%; top: 0; width: 1px; height: 8px; background: var(--txt-color); opacity: 0.2;"></div>
                    `;
                }
            }
        } else if (maxTime <= 60000) {
            const maxMarkers = Math.ceil(maxTime / 5000);
            for (let i = 0; i <= maxMarkers; i++) {
                const time = i * 5000;
                const position = (time / maxTime) * 100;
                const seconds = time / 1000;
                html += `
                    <div class="timeline-second-marker" style="left: ${position}%">
                        <div class="timeline-second-tick"></div>
                        <div class="timeline-second-label" style="${i === 0 ? "font-weight: 600; opacity: 1;" : ""}">${seconds}s</div>
                    </div>
                `;
            }

            const totalSubdivisions = Math.ceil(maxTime / 1000);
            for (let i = 1; i < totalSubdivisions; i++) {
                const time = i * 1000;
                if (time % 5000 !== 0) {
                    const position = (time / maxTime) * 100;
                    html += `
                        <div style="position: absolute; left: ${position}%; top: 0; width: 1px; height: 8px; background: var(--txt-color); opacity: 0.2;"></div>
                    `;
                }
            }
        } else {
            const maxMinutes = Math.ceil(maxTime / 60000);
            for (let min = 0; min <= maxMinutes; min++) {
                const time = min * 60000;
                const position = (time / maxTime) * 100;
                html += `
                    <div class="timeline-second-marker" style="left: ${position}%">
                        <div class="timeline-second-tick"></div>
                        <div class="timeline-second-label" style="${min === 0 ? "font-weight: 600; opacity: 1;" : ""}">${min}m</div>
                    </div>
                `;
            }

            const totalSubdivisions = Math.ceil(maxTime / 10000);
            for (let i = 1; i < totalSubdivisions; i++) {
                const time = i * 10000;
                if (time % 60000 !== 0) {
                    const position = (time / maxTime) * 100;
                    html += `
                        <div style="position: absolute; left: ${position}%; top: 0; width: 1px; height: 8px; background: var(--txt-color); opacity: 0.2;"></div>
                    `;
                }
            }
        }

        for (const layer of this.layers) {
            if (!layer.hasKeyframes || layer.keyframes.length === 0) continue;

            for (const kf of layer.keyframes) {
                const position = (kf.time / maxTime) * 100;
                html += `
                    <div class="timeline-keyframe-marker timeline-keyframe-other"
                         style="left: ${position}%"
                         title="Image layer keyframe at ${kf.time}ms">
                    </div>
                `;
            }
        }

        for (let i = 0; i < this.audioKeyframes.length; i++) {
            const kf = this.audioKeyframes[i];
            const position = (kf.time / maxTime) * 100;
            const isSelected = i === this.selectedAudioKeyframeIndex;
            const kfLabel = `A${i + 1}`;

            if (isSelected && kf.duration) {
                const durationWidth = (kf.duration / maxTime) * 100;
                html += `
                    <div class="timeline-duration-line"
                         style="left: ${position}%; width: ${durationWidth}%"
                         title="Audio duration: ${(kf.duration / 1000).toFixed(2)}s">
                    </div>
                `;
            }

            html += `
                <div class="timeline-keyframe-marker timeline-keyframe-current ${isSelected ? "timeline-keyframe-selected" : ""}"
                     style="left: ${position}%"
                     onclick="event.stopPropagation(); compositionEditor.selectAudioKeyframe(${i})"
                     data-audio-keyframe-id="${kf.id}"
                     data-keyframe-index="${i}"
                     data-is-selected="${isSelected}"
                     title="${kf.name} at ${kf.time}ms">
                    <div class="timeline-keyframe-diamond"></div>
                </div>
            `;
        }

        html += `<div class="timeline-playhead ${this.isPlayingPreview ? "active" : ""}" data-playhead="audio" style="left: 0%"></div>`;

        html += "</div>";
        html += "</div>";

        return `<div class="visual-timeline-wrapper audio-timeline-wrapper" data-max-time="${maxTime}">${html}</div>`;
    }

    async exportComposition() {
        if (!this.canvas) return;

        const exportCanvas = document.createElement("canvas");
        exportCanvas.width = this.canvasWidth;
        exportCanvas.height = this.canvasHeight;
        const exportCtx = exportCanvas.getContext("2d", { alpha: true });

        const sortedLayers = [...this.layers].sort((a, b) => a.zIndex - b.zIndex);

        for (const layer of sortedLayers) {
            if (!layer.visible) continue;

            const renderData = this.getLayerRenderData(layer);

            if (renderData.type === "sprite" && renderData.spriteCanvases && renderData.spriteCanvases.length > 0) {
                const spriteIndex = renderData.isAnimated
                    ? renderData.spriteIndices[layer.currentSpriteIndex]
                    : renderData.spriteIndices[0];
                const spriteCanvas = renderData.spriteCanvases[spriteIndex];
                if (spriteCanvas) {
                    exportCtx.drawImage(spriteCanvas, renderData.x, renderData.y);
                }
            } else if (renderData.image && renderData.imageLoaded) {
                exportCtx.drawImage(renderData.image, renderData.x, renderData.y, renderData.width, renderData.height);
            }
        }

        exportCanvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `composition_${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(url);
        }, "image/png");
    }

    getLayerStateAtTime(layer, time) {
        if (!layer.hasKeyframes || layer.keyframes.length === 0) {
            return null;
        }

        const firstKeyframeTime = layer.keyframes[0].time;
        const lastKeyframe = layer.keyframes[layer.keyframes.length - 1];
        const lastKeyframeTime = lastKeyframe.time;
        const lastKeyframeDuration = this.calculateAnimationDuration(lastKeyframe) || 0;
        const lastKeyframeEndTime = lastKeyframeTime + lastKeyframeDuration;

        if (time < firstKeyframeTime) {
            return null;
        }

        if (time > lastKeyframeEndTime) {
            return null;
        }

        if (time === firstKeyframeTime) {
            const kf = layer.keyframes[0];
            return {
                x: kf.x,
                y: kf.y,
                width: kf.width,
                height: kf.height,
                type: kf.type,
                image: kf.image,
                imageLoaded: kf.imageLoaded,
                spriteCanvases: kf.spriteCanvases,
                spriteIndices: kf.spriteIndices,
                isAnimated: kf.isAnimated,
            };
        }

        if (time >= lastKeyframeTime) {
            const lastKf = layer.keyframes[layer.keyframes.length - 1];

            let assetKeyframe = lastKf;
            if (!assetKeyframe.assetRef && !assetKeyframe.blobUrl) {
                for (let i = layer.keyframes.length - 1; i >= 0; i--) {
                    if (layer.keyframes[i].assetRef || layer.keyframes[i].blobUrl) {
                        assetKeyframe = layer.keyframes[i];
                        break;
                    }
                }
            }
            return {
                x: lastKf.x,
                y: lastKf.y,
                width: lastKf.width || assetKeyframe.width,
                height: lastKf.height || assetKeyframe.height,
                type: assetKeyframe.type,
                image: assetKeyframe.image,
                imageLoaded: assetKeyframe.imageLoaded,
                spriteCanvases: assetKeyframe.spriteCanvases,
                spriteIndices: assetKeyframe.spriteIndices,
                isAnimated: assetKeyframe.isAnimated,
            };
        }

        let prevKeyframe = layer.keyframes[0];
        let nextKeyframe = layer.keyframes[1];

        for (let i = 0; i < layer.keyframes.length - 1; i++) {
            if (layer.keyframes[i].time <= time && layer.keyframes[i + 1].time > time) {
                prevKeyframe = layer.keyframes[i];
                nextKeyframe = layer.keyframes[i + 1];
                break;
            }
        }

        let assetKeyframe = prevKeyframe;
        if (!assetKeyframe.assetRef && !assetKeyframe.blobUrl) {
            for (let i = layer.keyframes.indexOf(prevKeyframe) - 1; i >= 0; i--) {
                if (layer.keyframes[i].assetRef || layer.keyframes[i].blobUrl) {
                    assetKeyframe = layer.keyframes[i];
                    break;
                }
            }
        }

        let nextAssetKeyframe = nextKeyframe;
        if (nextKeyframe.assetRef || nextKeyframe.blobUrl) {
            nextAssetKeyframe = nextKeyframe;
        } else {
            nextAssetKeyframe = assetKeyframe;
        }

        let currentAsset = assetKeyframe;
        if (nextAssetKeyframe !== assetKeyframe && time >= nextKeyframe.time) {
            currentAsset = nextAssetKeyframe;
        }

        const timeDelta = nextKeyframe.time - prevKeyframe.time;
        const progress = timeDelta > 0 ? (time - prevKeyframe.time) / timeDelta : 0;

        const interpolatedX = prevKeyframe.x + (nextKeyframe.x - prevKeyframe.x) * progress;
        const interpolatedY = prevKeyframe.y + (nextKeyframe.y - prevKeyframe.y) * progress;

        return {
            x: Math.round(interpolatedX),
            y: Math.round(interpolatedY),
            width: prevKeyframe.width || currentAsset.width,
            height: prevKeyframe.height || currentAsset.height,
            type: currentAsset.type,
            image: currentAsset.image,
            imageLoaded: currentAsset.imageLoaded,
            spriteCanvases: currentAsset.spriteCanvases,
            spriteIndices: currentAsset.spriteIndices,
            isAnimated: currentAsset.isAnimated,
        };
    }

    async exportAsGif() {
        if (!this.canvas) return;

        if (typeof gifenc === "undefined") {
            this.showNotification("No GIF encoder loaded", "error");
            return;
        }

        const spriteAnimatedLayers = this.layers.filter(
            (l) => l.visible && l.isAnimated && l.spriteCanvases.length > 0,
        );
        const keyframedLayers = this.layers.filter((l) => l.visible && l.hasKeyframes && l.keyframes.length > 1);

        if (spriteAnimatedLayers.length === 0 && keyframedLayers.length === 0) {
            this.showNotification("No animated or keyframed layers to export", "warning");
            return;
        }

        let totalDuration = 0;
        let frameDelay = this.GIF_RENDER_SETTINGS.spriteFrameDelay;

        if (keyframedLayers.length > 0) {
            totalDuration = Math.max(
                ...keyframedLayers.map((l) =>
                    Math.max(
                        ...l.keyframes.map((kf) => {
                            const animDuration = this.calculateAnimationDuration(kf);
                            return kf.time + (animDuration || 0);
                        }),
                    ),
                ),
            );
            frameDelay = this.GIF_RENDER_SETTINGS.defaultFrameDelay;
        }

        if (spriteAnimatedLayers.length > 0) {
            const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
            const lcm = (a, b) => (a * b) / gcd(a, b);
            const spriteFrameCount = spriteAnimatedLayers.reduce(
                (acc, layer) => lcm(acc, layer.spriteIndices.length),
                1,
            );
            const avgSpriteSpeed = Math.round(
                spriteAnimatedLayers.reduce((sum, l) => sum + l.animationSpeed, 0) / spriteAnimatedLayers.length,
            );
            const spriteDuration = spriteFrameCount * avgSpriteSpeed;

            if (keyframedLayers.length === 0) {
                totalDuration = spriteDuration;
                frameDelay = avgSpriteSpeed;
            } else {
                totalDuration = Math.max(totalDuration, spriteDuration);
            }
        }

        const totalFrames = Math.ceil(totalDuration / frameDelay);

        this.showLoading(`Initializing GIF encoder...`);

        try {
            const encoder = gifenc.GIFEncoder();

            const frameCanvas = document.createElement("canvas");
            frameCanvas.width = this.canvasWidth;
            frameCanvas.height = this.canvasHeight;
            const frameCtx = frameCanvas.getContext("2d", { alpha: true, willReadFrequently: false });

            const sortedLayers = [...this.layers].sort((a, b) => a.zIndex - b.zIndex);

            this.updateLoadingProgress(0, totalFrames);

            let palette = null;

            for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
                if (frameIndex % 5 === 0 || frameIndex === totalFrames - 1) {
                    this.updateLoadingProgress(frameIndex + 1, totalFrames);
                    await new Promise((resolve) => setTimeout(resolve, 0));
                }

                const currentTime = frameIndex * frameDelay;

                frameCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

                for (const layer of sortedLayers) {
                    if (!layer.visible) continue;

                    let renderX, renderY, renderData;

                    if (layer.hasKeyframes && layer.keyframes.length > 0) {
                        renderData = this.getLayerStateAtTime(layer, currentTime);
                        if (!renderData) continue;
                        renderX = renderData.x;
                        renderY = renderData.y;
                    } else {
                        renderData = layer;
                        renderX = layer.x;
                        renderY = layer.y;
                    }

                    if (
                        renderData.type === "sprite" &&
                        renderData.spriteCanvases &&
                        renderData.spriteCanvases.length > 0
                    ) {
                        if (renderData.isAnimated) {
                            let spriteFrameIndex;

                            if (layer.hasKeyframes && layer.keyframes.length > 0) {
                                const firstKeyframeTime = layer.keyframes[0].time;
                                const timeInAnimation = currentTime - firstKeyframeTime;
                                const animSpeed = layer.animationSpeed || 250;
                                spriteFrameIndex =
                                    Math.floor(timeInAnimation / animSpeed) % renderData.spriteIndices.length;
                            } else {
                                spriteFrameIndex = frameIndex % renderData.spriteIndices.length;
                            }

                            const spriteIndex = renderData.spriteIndices[spriteFrameIndex];
                            const spriteCanvas = renderData.spriteCanvases[spriteIndex];
                            if (spriteCanvas) {
                                frameCtx.drawImage(spriteCanvas, renderX, renderY);
                            }
                        } else {
                            const spriteIndex = renderData.spriteIndices[0];
                            const spriteCanvas = renderData.spriteCanvases[spriteIndex];
                            if (spriteCanvas) {
                                frameCtx.drawImage(spriteCanvas, renderX, renderY);
                            }
                        }
                    } else if (renderData.image && renderData.imageLoaded) {
                        frameCtx.drawImage(renderData.image, renderX, renderY, renderData.width, renderData.height);
                    }
                }

                const imageData = frameCtx.getImageData(0, 0, this.canvasWidth, this.canvasHeight);

                if (!palette) {
                    palette = gifenc.quantize(imageData.data, this.GIF_RENDER_SETTINGS.maxColors, {
                        format: this.GIF_RENDER_SETTINGS.colorFormat,
                        oneBitAlpha: this.GIF_RENDER_SETTINGS.oneBitAlpha,
                    });
                }

                const indexed = gifenc.applyPalette(imageData.data, palette, this.GIF_RENDER_SETTINGS.paletteFormat);

                const frameOptions = {
                    palette,
                    delay: frameDelay,
                    transparent: this.GIF_RENDER_SETTINGS.enableTransparency,
                    transparentIndex: this.GIF_RENDER_SETTINGS.transparentIndex,
                    first: frameIndex === 0,
                };

                encoder.writeFrame(indexed, this.canvasWidth, this.canvasHeight, frameOptions);
            }

            this.showLoading("Finalizing GIF...");
            encoder.finish();

            const buffer = encoder.bytes();
            const blob = new Blob([buffer], { type: "image/gif" });

            this.hideLoading();

            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `composition_animated_${Date.now()}.gif`;
            a.click();
            URL.revokeObjectURL(url);

            this.showNotification("GIF exported successfully!", "success");
        } catch (error) {
            this.hideLoading();
            console.error("Failed to create GIF:", error);
            this.showNotification("Failed to generate GIF. Error: " + error.message, "error", 6000);
        }
    }

    async saveAudioTrackToGallery(compositionName) {
        if (!this.audioKeyframes || this.audioKeyframes.length === 0 || !this.audioLayerVisible) {
            return;
        }

        try {
            const wavBlob = await this.renderAudioTrack();
            if (!wavBlob) {
                throw new Error("Failed to render audio track");
            }

            if (window.gameImporterAssets) {
                if (!window.gameImporterAssets.audio) {
                    window.gameImporterAssets.audio = {};
                }
                if (!window.gameImporterAssets.audio["Misc"]) {
                    window.gameImporterAssets.audio["Misc"] = {};
                }

                const fileName = `${compositionName}.wav`;
                const blobUrl = URL.createObjectURL(wavBlob);

                window.gameImporterAssets.audio["Misc"][fileName] = {
                    url: blobUrl,
                    blob: wavBlob,
                    baseFileName: fileName,
                };

                if (window.memoryManager) {
                    try {
                        const assetData = {
                            name: fileName,
                            originalName: fileName,
                            baseFileName: fileName,
                            blob: wavBlob,
                            isSprite: false,
                            variants: null,
                        };

                        await window.memoryManager.savePartialAsset(assetData, "audio", "Misc", "audio");
                    } catch (error) {
                        console.error("Failed to save audio to IndexedDB:", error);
                    }
                }
            }
        } catch (error) {
            console.error("Failed to save audio track to gallery:", error);
            throw error;
        }
    }

    async renderAudioTrack() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();

            let maxDuration = 0;
            for (const kf of this.audioKeyframes) {
                const response = await fetch(kf.blobUrl);
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
                const adjustedDuration = (audioBuffer.duration / kf.speed) * 1000;
                const totalTime = kf.time + adjustedDuration;
                maxDuration = Math.max(maxDuration, totalTime);
            }

            for (const layer of this.layers) {
                if (layer.hasKeyframes && layer.keyframes.length > 0) {
                    for (const kf of layer.keyframes) {
                        const animDuration = this.calculateAnimationDuration(kf);
                        const keyframeEnd = kf.time + (animDuration || 0);
                        maxDuration = Math.max(maxDuration, keyframeEnd);
                    }
                }
            }

            const durationSeconds = maxDuration / 1000;
            const offlineContext = new OfflineAudioContext(
                2,
                audioContext.sampleRate * durationSeconds,
                audioContext.sampleRate,
            );

            for (const kf of this.audioKeyframes) {
                const response = await fetch(kf.blobUrl);
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await offlineContext.decodeAudioData(arrayBuffer);

                const source = offlineContext.createBufferSource();
                source.buffer = audioBuffer;
                source.playbackRate.value = kf.speed;

                source.connect(offlineContext.destination);
                source.start(kf.time / 1000);
            }

            const renderedBuffer = await offlineContext.startRendering();
            const wavBlob = await this.audioBufferToWav(renderedBuffer);

            return wavBlob;
        } catch (error) {
            console.error("Failed to render audio track:", error);
            return null;
        }
    }

    async exportAsOgg(save = true) {
        if (!this.audioKeyframes || this.audioKeyframes.length === 0) {
            this.showNotification("No audio keyframes to export", "warning");
            return;
        }

        /*this.showNotification(
            "Audio export with pitch/speed adjustment requires Web Audio API processing. Preparing audio composition...",
            "info",
            3000,
        );*/

        try {
            this.showNotification("Rendering audio composition...", "info");

            const wavBlob = await this.renderAudioTrack();

            if (!wavBlob) {
                throw new Error("Failed to render audio track");
            }

            const compositionName = this.generateDefaultCompositionName();
            const url = URL.createObjectURL(wavBlob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${compositionName}.wav`;
            a.click();
            URL.revokeObjectURL(url);

            this.showNotification("Audio exported as WAV (OGG encoding requires additional library)", "success", 4000);

            if (save && window.gameImporterAssets && window.gameImporterAssets.audio) {
                if (!window.gameImporterAssets.audio["Misc"]) {
                    window.gameImporterAssets.audio["Misc"] = {};
                }

                const fileName = `${compositionName}.wav`;
                const blobUrl = URL.createObjectURL(wavBlob);

                window.gameImporterAssets.audio["Misc"][fileName] = {
                    url: blobUrl,
                    blob: wavBlob,
                    baseFileName: fileName,
                };

                if (window.memoryManager) {
                    try {
                        const assetData = {
                            name: fileName,
                            originalName: fileName,
                            baseFileName: fileName,
                            blob: wavBlob,
                            isSprite: false,
                            variants: null,
                        };

                        await window.memoryManager.savePartialAsset(assetData, "audio", "Misc", "audio");
                        this.showNotification("Audio saved to Audio > Misc category and IndexedDB", "success", 3000);
                    } catch (error) {
                        console.error("Failed to save audio to IndexedDB:", error);
                        /*this.showNotification(
                            "Audio saved to Audio > Misc category (IndexedDB save failed)",
                            "warning",
                            3000,
                        );*/
                    }
                } else {
                    this.showNotification("Audio saved to Audio > Misc category", "success", 3000);
                }
            }
        } catch (error) {
            console.error("Failed to export audio:", error);
            this.showNotification("Failed to export audio: " + error.message, "error", 6000);
        }
    }

    audioBufferToWav(audioBuffer) {
        return new Promise((resolve) => {
            const numberOfChannels = audioBuffer.numberOfChannels;
            const length = audioBuffer.length * numberOfChannels * 2;
            const buffer = new ArrayBuffer(44 + length);
            const view = new DataView(buffer);

            const writeString = (offset, string) => {
                for (let i = 0; i < string.length; i++) {
                    view.setUint8(offset + i, string.charCodeAt(i));
                }
            };

            let offset = 0;
            writeString(offset, "RIFF");
            offset += 4;
            view.setUint32(offset, 36 + length, true);
            offset += 4;
            writeString(offset, "WAVE");
            offset += 4;
            writeString(offset, "fmt ");
            offset += 4;
            view.setUint32(offset, 16, true);
            offset += 4;
            view.setUint16(offset, 1, true);
            offset += 2;
            view.setUint16(offset, numberOfChannels, true);
            offset += 2;
            view.setUint32(offset, audioBuffer.sampleRate, true);
            offset += 4;
            view.setUint32(offset, audioBuffer.sampleRate * numberOfChannels * 2, true);
            offset += 4;
            view.setUint16(offset, numberOfChannels * 2, true);
            offset += 2;
            view.setUint16(offset, 16, true);
            offset += 2;
            writeString(offset, "data");
            offset += 4;
            view.setUint32(offset, length, true);
            offset += 4;

            const channels = [];
            for (let i = 0; i < numberOfChannels; i++) {
                channels.push(audioBuffer.getChannelData(i));
            }

            let index = offset;
            for (let i = 0; i < audioBuffer.length; i++) {
                for (let channel = 0; channel < numberOfChannels; channel++) {
                    const sample = Math.max(-1, Math.min(1, channels[channel][i]));
                    view.setInt16(index, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
                    index += 2;
                }
            }

            resolve(new Blob([buffer], { type: "audio/wav" }));
        });
    }

    clearAllLayers(skipConfirm = false) {
        if (skipConfirm || (this.layers.length > 0 && confirm("Are you sure you want to remove all layers?"))) {
            this.layers = [];
            this.selectedLayerId = null;
            this.updateLayersList();
            this.render();
        }
    }

    getGalleryRefFromBlobUrl(blobUrl) {
        if (!blobUrl || !window.gameImporterAssets) return null;

        for (const [category, assets] of Object.entries(window.gameImporterAssets.images)) {
            for (const [name, asset] of Object.entries(assets)) {
                if (asset.url === blobUrl || asset.croppedUrl === blobUrl) {
                    return `gallery:${category}/${name}`;
                }
            }
        }

        return null;
    }

    createCompositionDescriptor(compositionName) {
        if (this.layers.length === 0) {
            this.showNotification("No layers to save!", "warning");
            return null;
        }

        const portableLayers = [];
        let hasNonGalleryAssets = false;

        for (const layer of this.layers) {
            if (!layer.hasKeyframes || layer.keyframes.length === 0) {
                let galleryRef = layer.assetRef;
                if (!galleryRef && layer.blobUrl) {
                    galleryRef = this.getGalleryRefFromBlobUrl(layer.blobUrl);
                }

                if (!galleryRef) {
                    hasNonGalleryAssets = true;
                    console.warn(`Layer "${layer.name}" has no gallery reference, skipping...`);
                    continue;
                }

                const layerDescriptor = {
                    type: layer.type,
                    galleryRef: galleryRef,
                    x: layer.x,
                    y: layer.y,
                    width: layer.width,
                    height: layer.height,
                    visible: layer.visible,
                    zIndex: layer.zIndex,
                };

                if (layer.type === "sprite") {
                    layerDescriptor.spriteIndices = layer.spriteIndices;
                    layerDescriptor.isAnimated = layer.isAnimated;
                    layerDescriptor.animationSpeed = layer.animationSpeed;
                    layerDescriptor.spriteVariant = layer.spriteVariant;
                }

                portableLayers.push(layerDescriptor);
            } else {
                const keyframeDescriptors = [];
                for (const kf of layer.keyframes) {
                    let kfGalleryRef = kf.assetRef;
                    if (!kfGalleryRef && kf.blobUrl) {
                        kfGalleryRef = this.getGalleryRefFromBlobUrl(kf.blobUrl);
                    }

                    const keyframeDescriptor = {
                        time: kf.time,
                        x: kf.x,
                        y: kf.y,
                        width: kf.width,
                        height: kf.height,
                        galleryRef: kfGalleryRef || null,
                    };

                    if (kf.type === "sprite" && kfGalleryRef) {
                        keyframeDescriptor.type = kf.type;
                        keyframeDescriptor.spriteIndices = kf.spriteIndices;
                        keyframeDescriptor.isAnimated = kf.isAnimated;
                        keyframeDescriptor.animationSpeed = kf.animationSpeed;
                        keyframeDescriptor.spriteVariant = kf.spriteVariant;
                    }

                    if (kf.gifDuration) {
                        keyframeDescriptor.gifDuration = kf.gifDuration;
                    }

                    keyframeDescriptors.push(keyframeDescriptor);
                }

                const firstKf = layer.keyframes[0];
                let mainGalleryRef = firstKf.assetRef;
                if (!mainGalleryRef && firstKf.blobUrl) {
                    mainGalleryRef = this.getGalleryRefFromBlobUrl(firstKf.blobUrl);
                }

                if (!mainGalleryRef) {
                    hasNonGalleryAssets = true;
                    console.warn(`Keyframed layer "${layer.name}" has no gallery reference, skipping...`);
                    continue;
                }

                const layerDescriptor = {
                    type: firstKf.type,
                    galleryRef: mainGalleryRef,
                    visible: layer.visible,
                    zIndex: layer.zIndex,
                    hasKeyframes: true,
                    keyframes: keyframeDescriptors,
                };

                portableLayers.push(layerDescriptor);
            }
        }

        if (portableLayers.length === 0) {
            this.showNotification(
                "No gallery assets in composition. Only gallery assets can be shared.",
                "warning",
                5000,
            );
            return null;
        }

        if (hasNonGalleryAssets) {
            if (
                !confirm(
                    "Some layers use non-gallery assets and will be excluded from the shared composition. Continue?",
                )
            ) {
                return null;
            }
        }

        return {
            id: "comp_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9),
            name: compositionName,
            width: this.canvasWidth,
            height: this.canvasHeight,
            layers: portableLayers,
        };
    }

    checkIfCompositionNameExists(compositionName) {
        if (
            !window.gameImporterAssets ||
            !window.gameImporterAssets.images ||
            !window.gameImporterAssets.images["Misc"]
        ) {
            return false;
        }

        const miscAssets = window.gameImporterAssets.images["Misc"];
        return (
            miscAssets.hasOwnProperty(`${compositionName}.png`) || miscAssets.hasOwnProperty(`${compositionName}.gif`)
        );
    }

    async saveToGallery() {
        const inputEl = document.getElementById("compositionNameInput");
        const compositionName = inputEl?.value?.trim() || this.generateDefaultCompositionName();

        if (!compositionName) {
            this.showNotification("Please enter a composition name", "warning");
            return;
        }

        if (this.checkIfCompositionNameExists(compositionName)) {
            this.clearNotifications();
            this.showNotification(
                `<strong>Name Already Exists</strong><br>"${compositionName}" already exists in the gallery, continue to overwrite it`,
                "warning",
                0,
                "composition-overwrite-confirmation",
            );

            setTimeout(() => {
                const notification = document.querySelector(
                    ".composition-notification.composition-overwrite-confirmation",
                );
                if (notification) {
                    const closeBtn = notification.querySelector(".notification-close");
                    if (closeBtn) {
                        closeBtn.remove();
                    }

                    const buttonsContainer = document.createElement("div");
                    buttonsContainer.style.display = "flex";
                    buttonsContainer.style.gap = "0.5vmax";

                    const continueBtn = document.createElement("button");
                    continueBtn.className = "notification-btn notification-btn-success";
                    continueBtn.textContent = "Continue";
                    continueBtn.onclick = async () => {
                        notification.remove();
                        await this.performSaveToGallery(compositionName);
                    };

                    const cancelBtn = document.createElement("button");
                    cancelBtn.className = "notification-btn notification-btn-cancel";
                    cancelBtn.textContent = "Cancel";
                    cancelBtn.onclick = () => {
                        notification.remove();
                    };

                    buttonsContainer.appendChild(continueBtn);
                    buttonsContainer.appendChild(cancelBtn);
                    notification.appendChild(buttonsContainer);
                }
            }, 0);

            return;
        }

        await this.performSaveToGallery(compositionName);
    }

    async performSaveToGallery(compositionName) {
        const descriptor = this.createCompositionDescriptor(compositionName);
        if (!descriptor) {
            return;
        }

        const hasKeyframes = this.layers.some((l) => l.hasKeyframes && l.keyframes.length > 1);
        const hasSpriteAnimations = this.layers.some(
            (l) => l.visible && l.isAnimated && l.spriteCanvases && l.spriteCanvases.length > 0,
        );
        const shouldExportAsGif = hasKeyframes || hasSpriteAnimations;

        let blob;
        let fileExtension;

        if (shouldExportAsGif) {
            blob = await this.renderToGifBlob(true); // true = gallery save
            fileExtension = "gif";
            if (!blob) {
                this.showNotification("Failed to render composition as GIF", "error", 6000);
                return;
            }
        } else {
            blob = await this.renderToBlob();
            fileExtension = "png";
            if (!blob) {
                this.showNotification("Failed to render composition", "error", 6000);
                return;
            }
        }

        if (typeof projectData !== "undefined") {
            if (!projectData.compositions) {
                projectData.compositions = [];
            }
            projectData.compositions.push(descriptor);
        }

        if (window.gameImporterAssets) {
            if (!window.gameImporterAssets.images["Misc"]) {
                window.gameImporterAssets.images["Misc"] = {};
            }

            const fileName = `${compositionName}.${fileExtension}`;
            const blobUrl = URL.createObjectURL(blob);

            window.gameImporterAssets.images["Misc"][fileName] = {
                url: blobUrl,
                blob: blob,
                name: fileName,
                originalName: fileName,
                baseFileName: fileName,
                isSprite: false,
                cropped: false,
                originalPath: "compositions",
                variants: null,
                isComposition: true,
                compositionId: descriptor.id,
                compositionDescriptor: descriptor,
                isAnimated: shouldExportAsGif,
            };

            if (window.memoryManager) {
                try {
                    const assetData = {
                        name: fileName,
                        originalName: fileName,
                        baseFileName: fileName,
                        blob: blob,
                        isSprite: false,
                        variants: null,
                        isComposition: true,
                        compositionId: descriptor.id,
                        compositionDescriptor: descriptor,
                    };

                    await window.memoryManager.savePartialAsset(assetData, "compositions", "Misc", "images");
                } catch (error) {
                    console.error("Failed to save composition to IndexedDB:", error);
                }
            }

            if (this.audioKeyframes && this.audioKeyframes.length > 0) {
                try {
                    await this.saveAudioTrackToGallery(compositionName);
                } catch (error) {
                    console.error("Failed to save audio track:", error);
                    this.showNotification(
                        `Composition saved, but audio track save failed: ${error.message}`,
                        "warning",
                        5000,
                    );
                }
            }

            if (typeof updateGalleryCategories === "function") {
                updateGalleryCategories();
            }

            this.navigateToCompositionInGallery(fileName);

            const audioMessage = this.audioKeyframes && this.audioKeyframes.length > 0 ? ` (with audio track)` : "";

            this.showNotification(
                `Composition "${compositionName}"${audioMessage} saved to gallery (Misc category)!`,
                "success",
                5000,
            );
        } else {
            this.showNotification(
                "Gallery not available. Composition descriptor created but not added to gallery.",
                "warning",
                5000,
            );
        }

        this.close();
    }

    async renderToBlob() {
        this.showLoading("Rendering composition...");

        return new Promise((resolve) => {
            if (!this.canvas) {
                this.hideLoading();
                resolve(null);
                return;
            }

            const exportCanvas = document.createElement("canvas");
            exportCanvas.width = this.canvasWidth;
            exportCanvas.height = this.canvasHeight;
            const exportCtx = exportCanvas.getContext("2d", { alpha: true });

            const sortedLayers = [...this.layers].sort((a, b) => a.zIndex - b.zIndex);

            for (const layer of sortedLayers) {
                if (!layer.visible) continue;

                const renderData = this.getLayerRenderData(layer);

                if (renderData.type === "sprite" && renderData.spriteCanvases && renderData.spriteCanvases.length > 0) {
                    const spriteIndex = renderData.isAnimated
                        ? renderData.spriteIndices[layer.currentSpriteIndex]
                        : renderData.spriteIndices[0];
                    const spriteCanvas = renderData.spriteCanvases[spriteIndex];
                    if (spriteCanvas) {
                        exportCtx.drawImage(spriteCanvas, renderData.x, renderData.y);
                    }
                } else if (renderData.image && renderData.imageLoaded) {
                    exportCtx.drawImage(
                        renderData.image,
                        renderData.x,
                        renderData.y,
                        renderData.width,
                        renderData.height,
                    );
                }
            }

            exportCanvas.toBlob((blob) => {
                this.hideLoading();
                resolve(blob);
            }, "image/png");
        });
    }

    async renderToGifBlob(isGallerySave = false) {
        if (!this.canvas) return null;

        if (typeof gifenc === "undefined") {
            this.showNotification("No GIF encoder loaded", "error");
            return null;
        }

        const spriteAnimatedLayers = this.layers.filter(
            (l) => l.visible && l.isAnimated && l.spriteCanvases.length > 0,
        );
        const keyframedLayers = this.layers.filter((l) => l.visible && l.hasKeyframes && l.keyframes.length > 1);

        if (spriteAnimatedLayers.length === 0 && keyframedLayers.length === 0) {
            return null;
        }

        let totalDuration = 0;
        let frameDelay = this.GIF_RENDER_SETTINGS.spriteFrameDelay;

        if (keyframedLayers.length > 0) {
            totalDuration = Math.max(
                ...keyframedLayers.map((l) =>
                    Math.max(
                        ...l.keyframes.map((kf) => {
                            const animDuration = this.calculateAnimationDuration(kf);
                            return kf.time + (animDuration || 0);
                        }),
                    ),
                ),
            );
            frameDelay = this.GIF_RENDER_SETTINGS.defaultFrameDelay;
        }

        if (spriteAnimatedLayers.length > 0) {
            const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
            const lcm = (a, b) => (a * b) / gcd(a, b);
            const spriteFrameCount = spriteAnimatedLayers.reduce(
                (acc, layer) => lcm(acc, layer.spriteIndices.length),
                1,
            );
            const avgSpriteSpeed = Math.round(
                spriteAnimatedLayers.reduce((sum, l) => sum + l.animationSpeed, 0) / spriteAnimatedLayers.length,
            );
            const spriteDuration = spriteFrameCount * avgSpriteSpeed;

            if (keyframedLayers.length === 0) {
                totalDuration = spriteDuration;
                frameDelay = avgSpriteSpeed;
            } else {
                totalDuration = Math.max(totalDuration, spriteDuration);
            }
        }

        const totalFrames = Math.ceil(totalDuration / frameDelay);

        this.showLoading(`Initializing GIF encoder...`);
        this.updateLoadingProgress(0, totalFrames);

        try {
            const encoder = gifenc.GIFEncoder();

            const frameCanvas = document.createElement("canvas");
            frameCanvas.width = this.canvasWidth;
            frameCanvas.height = this.canvasHeight;
            const frameCtx = frameCanvas.getContext("2d", { alpha: true, willReadFrequently: false });

            const sortedLayers = [...this.layers].sort((a, b) => a.zIndex - b.zIndex);

            let palette = null;

            for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
                if (frameIndex % 5 === 0 || frameIndex === totalFrames - 1) {
                    this.updateLoadingProgress(frameIndex + 1, totalFrames);
                    await new Promise((resolve) => setTimeout(resolve, 0));
                }
                const currentTime = frameIndex * frameDelay;

                frameCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

                for (const layer of sortedLayers) {
                    if (!layer.visible) continue;

                    let renderX, renderY, renderData;

                    if (layer.hasKeyframes && layer.keyframes.length > 0) {
                        renderData = this.getLayerStateAtTime(layer, currentTime);
                        if (!renderData) continue;
                        renderX = renderData.x;
                        renderY = renderData.y;
                    } else {
                        renderData = layer;
                        renderX = layer.x;
                        renderY = layer.y;
                    }

                    if (
                        renderData.type === "sprite" &&
                        renderData.spriteCanvases &&
                        renderData.spriteCanvases.length > 0
                    ) {
                        if (renderData.isAnimated) {
                            let spriteFrameIndex;

                            if (layer.hasKeyframes && layer.keyframes.length > 0) {
                                const firstKeyframeTime = layer.keyframes[0].time;
                                const timeInAnimation = currentTime - firstKeyframeTime;
                                const animSpeed = layer.animationSpeed || 250;
                                spriteFrameIndex =
                                    Math.floor(timeInAnimation / animSpeed) % renderData.spriteIndices.length;
                            } else {
                                spriteFrameIndex = frameIndex % renderData.spriteIndices.length;
                            }

                            const spriteIndex = renderData.spriteIndices[spriteFrameIndex];
                            const spriteCanvas = renderData.spriteCanvases[spriteIndex];
                            if (spriteCanvas) {
                                frameCtx.drawImage(spriteCanvas, renderX, renderY);
                            }
                        } else {
                            const spriteIndex = renderData.spriteIndices[0];
                            const spriteCanvas = renderData.spriteCanvases[spriteIndex];
                            if (spriteCanvas) {
                                frameCtx.drawImage(spriteCanvas, renderX, renderY);
                            }
                        }
                    } else if (renderData.image && renderData.imageLoaded) {
                        frameCtx.drawImage(renderData.image, renderX, renderY, renderData.width, renderData.height);
                    }
                }

                const imageData = frameCtx.getImageData(0, 0, this.canvasWidth, this.canvasHeight);

                if (isGallerySave && this.GIF_RENDER_SETTINGS.replaceTransparencyWithBlack) {
                    const data = imageData.data;
                    for (let i = 0; i < data.length; i += 4) {
                        const alpha = data[i + 3];
                        if (alpha < 255) {
                            const alphaRatio = alpha / 255;
                            data[i] = Math.round(data[i] * alphaRatio);
                            data[i + 1] = Math.round(data[i + 1] * alphaRatio);
                            data[i + 2] = Math.round(data[i + 2] * alphaRatio);
                            data[i + 3] = 255;
                        }
                    }
                }

                if (!palette) {
                    palette = gifenc.quantize(imageData.data, this.GIF_RENDER_SETTINGS.maxColors, {
                        format: this.GIF_RENDER_SETTINGS.colorFormat,
                        oneBitAlpha: this.GIF_RENDER_SETTINGS.oneBitAlpha,
                    });
                }

                const indexed = gifenc.applyPalette(imageData.data, palette, this.GIF_RENDER_SETTINGS.paletteFormat);

                const frameOptions = {
                    palette,
                    delay: frameDelay,
                    transparent: this.GIF_RENDER_SETTINGS.enableTransparency && !isGallerySave,
                    transparentIndex: this.GIF_RENDER_SETTINGS.transparentIndex,
                    first: frameIndex === 0,
                };

                encoder.writeFrame(indexed, this.canvasWidth, this.canvasHeight, frameOptions);
            }

            this.showLoading("Finalizing GIF...");
            encoder.finish();

            const buffer = encoder.bytes();
            const blob = new Blob([buffer], { type: "image/gif" });

            this.hideLoading();
            return blob;
        } catch (error) {
            this.hideLoading();
            console.error("Failed to create GIF:", error);
            throw error;
        }
    }

    static async reconstructComposition(descriptor) {
        if (!descriptor || !descriptor.layers) {
            console.error("Invalid composition descriptor");
            return null;
        }

        if (!window.gameImporterAssets) {
            console.error("Gallery assets not loaded");
            return null;
        }

        const editor = new CompositionEditor();
        editor.init();

        let missingAssets = [];

        for (const layerDesc of descriptor.layers) {
            if (layerDesc.hasKeyframes && layerDesc.keyframes) {
                const reconstructedKeyframes = [];

                for (const kfDesc of layerDesc.keyframes) {
                    let kfAsset = null;
                    let kfBlobUrl = null;
                    let kfImage = null;
                    let kfImageLoaded = false;
                    let kfSpriteCanvases = null;

                    if (kfDesc.galleryRef) {
                        const kfMatch = kfDesc.galleryRef.match(/^gallery:([^/]+)\/(.+)$/);
                        if (kfMatch) {
                            const [, kfCategory, kfName] = kfMatch;
                            kfAsset = window.gameImporterAssets.images[kfCategory]?.[kfName];

                            if (kfAsset) {
                                kfBlobUrl = kfAsset.url;

                                if (kfDesc.type === "sprite" && kfAsset.isSprite && window.galleryManager) {
                                    try {
                                        const extractedSprites = await window.galleryManager.extractSpritesFromAsset(
                                            kfAsset,
                                            kfName,
                                            kfDesc.spriteVariant,
                                        );
                                        kfSpriteCanvases = extractedSprites.map((s) => s.canvas);
                                    } catch (error) {
                                        console.error(
                                            `Failed to extract sprites for keyframe at time ${kfDesc.time}ms:`,
                                            error,
                                        );
                                    }
                                } else {
                                    kfImage = new Image();
                                    await new Promise((resolve) => {
                                        kfImage.onload = () => {
                                            kfImageLoaded = true;
                                            resolve();
                                        };
                                        kfImage.onerror = () => resolve();
                                        kfImage.src = kfBlobUrl;
                                    });
                                }
                            }
                        }
                    }

                    reconstructedKeyframes.push({
                        id: editor.generateId(),
                        time: kfDesc.time,
                        x: kfDesc.x,
                        y: kfDesc.y,
                        width: kfDesc.width,
                        height: kfDesc.height,
                        assetRef: kfDesc.galleryRef,
                        blobUrl: kfBlobUrl,
                        image: kfImage,
                        imageLoaded: kfImageLoaded,
                        type: kfDesc.type || layerDesc.type,
                        spriteIndices: kfDesc.spriteIndices || null,
                        isAnimated: kfDesc.isAnimated || null,
                        animationSpeed: kfDesc.animationSpeed || null,
                        spriteCanvases: kfSpriteCanvases,
                        spriteVariant: kfDesc.spriteVariant || null,
                        gifDuration: kfDesc.gifDuration || null,
                    });
                }

                const firstKf = reconstructedKeyframes[0];
                const layerData = {
                    name: layerDesc.name || "Keyframed Layer",
                    type: firstKf.type,
                    assetRef: firstKf.assetRef,
                    blobUrl: firstKf.blobUrl,
                    x: firstKf.x,
                    y: firstKf.y,
                    width: firstKf.width,
                    height: firstKf.height,
                    hasKeyframes: true,
                    keyframes: reconstructedKeyframes,
                };

                if (firstKf.type === "sprite" && firstKf.spriteCanvases) {
                    layerData.spriteCanvases = firstKf.spriteCanvases;
                    layerData.spriteIndices = firstKf.spriteIndices;
                    layerData.isAnimated = firstKf.isAnimated;
                    layerData.animationSpeed = firstKf.animationSpeed;
                    layerData.spriteVariant = firstKf.spriteVariant;
                }

                const layerId = editor.addLayer(layerData);

                const addedLayer = editor.layers.find((l) => l.id === layerId);
                if (addedLayer) {
                    addedLayer.visible = layerDesc.visible;
                }
            } else {
                const galleryRef = layerDesc.galleryRef;
                if (!galleryRef) {
                    console.warn(`Layer has no gallery reference, skipping`);
                    continue;
                }

                const match = galleryRef.match(/^gallery:([^/]+)\/(.+)$/);
                if (!match) {
                    console.warn(`Invalid gallery reference format: ${galleryRef}`);
                    continue;
                }

                const [, category, name] = match;
                const asset = window.gameImporterAssets.images[category]?.[name];

                if (!asset) {
                    console.warn(`Missing asset: ${category}/${name}`);
                    missingAssets.push(`${category}/${name}`);
                    continue;
                }

                const assetData = {
                    name: name,
                    type: layerDesc.type,
                    blobUrl: asset.url,
                    x: layerDesc.x,
                    y: layerDesc.y,
                    width: layerDesc.width,
                    height: layerDesc.height,
                };

                if (layerDesc.type === "sprite" && asset.isSprite && window.galleryManager) {
                    try {
                        const extractedSprites = await window.galleryManager.extractSpritesFromAsset(
                            asset,
                            name,
                            layerDesc.spriteVariant,
                        );

                        assetData.isAnimated = layerDesc.isAnimated;
                        assetData.spriteIndices = layerDesc.spriteIndices;
                        assetData.animationSpeed = layerDesc.animationSpeed;
                        assetData.spriteCanvases = extractedSprites.map((s) => s.canvas);
                        assetData.spriteVariant = layerDesc.spriteVariant;
                    } catch (error) {
                        console.error(`Failed to extract sprites for ${name}:`, error);
                        continue;
                    }
                }

                const layerId = editor.addLayer(assetData);

                const addedLayer = editor.layers.find((l) => l.id === layerId);
                if (addedLayer && addedLayer.visible !== layerDesc.visible) {
                    addedLayer.visible = layerDesc.visible;
                }
            }
        }

        if (missingAssets.length > 0) {
            console.error(`Composition "${descriptor.name}" is missing ${missingAssets.length} assets:`, missingAssets);
            return null;
        }

        if (editor.layers.length === 0) {
            console.error(
                `Composition "${descriptor.name}" has no valid layers (expected ${descriptor.layers.length} layers)`,
            );
            return null;
        }

        await new Promise((resolve) => {
            const timeoutCompo = setTimeout(() => {
                clearInterval(checkLoaded);
                console.warn(`Timeout waiting for layers to load in composition "${descriptor.name}"`);
                resolve();
            }, 10000);

            const checkLoaded = setInterval(() => {
                const allLoaded = editor.layers.every((layer) => {
                    if (layer.type === "sprite") return true;

                    if (layer.hasKeyframes && layer.keyframes && layer.keyframes.length > 0) {
                        return true;
                    }

                    return layer.imageLoaded;
                });

                if (allLoaded) {
                    clearInterval(checkLoaded);
                    clearTimeout(timeoutCompo);
                    resolve();
                }
            }, 100);
        });

        const hasKeyframes = editor.layers.some((l) => l.hasKeyframes && l.keyframes.length > 1);
        const hasSpriteAnimations = editor.layers.some(
            (l) => l.visible && l.isAnimated && l.spriteCanvases && l.spriteCanvases.length > 0,
        );
        const shouldRenderAsGif = hasKeyframes || hasSpriteAnimations;

        const blob = shouldRenderAsGif ? await editor.renderToGifBlob(true) : await editor.renderToBlob();
        return blob;
    }
}

if (!window.compositionEditor) {
    window.compositionEditor = new CompositionEditor();
}
