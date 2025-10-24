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
                    "0": "Add to editor",
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

        /*this.getAutoOpenTitle = () => {
            return this.autoOpen === true
                ? "Will also open the editor, click to change"
                : "Will only add the asset in the background, click to change";
        };*/
    }

    generateId() {
        return "layer-" + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
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
        this.ensureNotificationArea();
        const area = document.getElementById("compositionNotificationArea");
        if (!area) return;

        const notification = document.createElement("div");
        notification.className = `composition-notification composition-notification-${type} ${customClass}`;

        if (customClass === "move-as-keyframe-notification") {
            notification.innerHTML = `
                <span class="notification-message">${message}</span>
                <button class="notification-close notification-btn" onclick="compositionEditor.cancelMoveAsKeyframeMode()">Cancel</button>
            `;
        } else {
            notification.innerHTML = `
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="this.parentElement.remove()">✕</button>
            `;
        }

        area.appendChild(notification);

        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.classList.add("fade-out");
                    setTimeout(() => notification.remove(), 300);
                }
            }, duration);
        }
    }

    clearNotifications() {
        const area = document.getElementById("compositionNotificationArea");
        if (area) {
            area.innerHTML = "";
        }
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
            img.onload = () => {
                layer.image = img;
                layer.imageLoaded = true;
                layer.width = layer.width || img.width;
                layer.height = layer.height || img.height;

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
        this.updateLayersList();
        this.renderPreviewFrame();
    }

    stopPreview() {
        this.isPlayingPreview = false;
        if (this.previewAnimationId) {
            cancelAnimationFrame(this.previewAnimationId);
            this.previewAnimationId = null;
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
                const layerMax = Math.max(...layer.keyframes.map((kf) => kf.time));
                maxDuration = Math.max(maxDuration, layerMax);
            }
        }

        const currentTime = maxDuration > 0 ? elapsed % maxDuration : 0;

        if (!this.ctx || !this.canvas) return;

        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

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
        }

        this.previewAnimationId = requestAnimationFrame(() => this.renderPreviewFrame());
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
            };

            const secondKeyframe = {
                id: this.generateId(),
                name: "KF 2",
                time: 1000,
                x: layer.x,
                y: layer.y,
                assetRef: null,
                blobUrl: null,
                image: null,
                imageLoaded: false,
                type: layer.type,
                spriteIndices: null,
                isAnimated: null,
                animationSpeed: null,
                spriteCanvases: null,
                spriteVariant: null,
                width: layer.width,
                height: layer.height,
            };

            layer.keyframes.push(initialKeyframe, secondKeyframe);
            layer.hasKeyframes = true;
            layer.selectedKeyframeIndex = 1;

            this.updateCanvasSize();
            this.updateLayersList();
            this.render();
            return secondKeyframe.id;
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
        };

        layer.keyframes.splice(layer.selectedKeyframeIndex + 1, 0, newKeyframe);

        layer.selectedKeyframeIndex = layer.selectedKeyframeIndex + 1;

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
            this.showNotification("Cannot remove the only keyframe. Use the delete layer button instead.", "warning");
            return;
        }

        layer.keyframes.splice(index, 1);

        if (layer.keyframes.length === 1) {
            const kf = layer.keyframes[0];
            layer.hasKeyframes = false;
            layer.x = kf.x;
            layer.y = kf.y;
            layer.assetRef = kf.assetRef;
            layer.blobUrl = kf.blobUrl;
            layer.image = kf.image;
            layer.imageLoaded = kf.imageLoaded;
            layer.keyframes = [];
            layer.selectedKeyframeIndex = 0;
        } else {
            layer.selectedKeyframeIndex = Math.min(layer.selectedKeyframeIndex, layer.keyframes.length - 1);
        }

        this.updateCanvasSize();
        this.updateLayersList();
        this.render();
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

    showMoveAsKeyframeMenu(sourceLayerId) {
        const sourceLayer = this.layers.find((l) => l.id === sourceLayerId);
        if (!sourceLayer) return;

        const otherLayers = this.layers.filter((l) => l.id !== sourceLayerId);
        if (otherLayers.length === 0) {
            this.showNotification("No other layers available to move to", "warning");
            return;
        }

        this.moveAsKeyframeMode = true;
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
        };

        targetLayer.keyframes.push(newKeyframe);
        targetLayer.keyframes.sort((a, b) => a.time - b.time);

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

        if (this.layers.length === 0) {
            this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
            return;
        }

        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

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

        if (this.layers.length === 0) {
            container.innerHTML += '<div class="no-layers-message">No layers yet. Add assets from the gallery!</div>';

            const gifBtn = document.getElementById("exportGifBtn");
            if (gifBtn) gifBtn.style.display = "none";
            const pngBtn = document.getElementById("exportPngBtn");
            if (pngBtn) pngBtn.style.display = "none";
            return;
        }

        const hasAnimatedLayers =
            this.layers.some((l) => l.isAnimated && l.spriteCanvases.length > 0) ||
            this.layers.some((l) => l.hasKeyframes && l.keyframes.length > 1);

        const gifBtn = document.getElementById("exportGifBtn");
        if (gifBtn) {
            gifBtn.style.display = hasAnimatedLayers ? "inline-block" : "none";
        }
        const pngBtn = document.getElementById("exportPngBtn");
        if (pngBtn) {
            pngBtn.style.display = "inline-block";
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
                layersHeader.insertBefore(playBtn, layersHeader.firstChild);
            }
        }

        if (playBtn) {
            if (hasAnimatedLayers) {
                playBtn.style.display = "inline-block";
                playBtn.textContent = this.isPlayingPreview ? "⏸ Pause" : "▶ Play";
                playBtn.className = this.isPlayingPreview
                    ? "preview-control-btn danger"
                    : "preview-control-btn success";
            } else {
                playBtn.style.display = "none";
            }
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
                    layerDiv.title = "Click to move source layer as keyframe of this layer";
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

                    this.convertLayerToKeyframe(this.moveAsKeyframeSourceId, layer.id);
                    return;
                }

                this.selectLayer(layer.id);
            });

            const renderData = this.getLayerRenderData(layer);

            let layerDisplayName = layer.name;
            if (renderData.type === "sprite" && renderData.spriteIndices && renderData.spriteIndices.length > 0) {
                const spriteIndex = renderData.isAnimated
                    ? renderData.spriteIndices[layer.currentSpriteIndex]
                    : renderData.spriteIndices[0];
                layerDisplayName = `${layer.name} [${spriteIndex}]`;
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
                    </div>
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
                    thumbnailsHTML += `
                        <div style="border: 2px solid ${isSelected ? "var(--green)" : "transparent"}; border-radius: 6px; padding: 2px; ${isSelected ? "box-shadow: 0 0 8px var(--green);" : ""} cursor: pointer;"
                             onclick="compositionEditor.selectKeyframe('${layer.id}', ${idx})"
                             title="Click to select this keyframe">
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
                        <div class="layer-name" title="${layerDisplayName}" style="font-weight: 600; font-size: 0.95em;">${this.truncate(layerDisplayName, 40)}</div>
                        <div class="layer-type" style="font-size: 0.75em; opacity: 0.7;">${layer.type}${layer.isAnimated ? " (animated)" : ""}${layer.hasKeyframes ? " (keyframed)" : ""}</div>
                    </div>
                    <div class="layer-top-actions" style="display: flex; gap: 6px; align-items: center;">
                        <div style="display: flex; gap: 3px; border-right: 1px solid var(--txt-color); padding-right: 6px;">
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
                            <div style="display: flex; gap: 4px;">
                                ${
                                    otherLayers.length > 0
                                        ? `
                                    <button class="layer-control-btn"
                                            onclick="compositionEditor.showMoveAsKeyframeMenu('${layer.id}')"
                                            title="Move this layer into another, by turning it into a keyframe of the target"
                                            style="font-size: 0.75vmax; padding: 4px 8px;">
                                        Move to other layer
                                    </button>
                                `
                                        : ""
                                }
                                <button class="layer-control-btn"
                                        onclick="compositionEditor.addKeyframe('${layer.id}')"
                                        title="Enable a timeline and adds a keyframe to this layer"
                                        style="font-size: 0.75vmax; padding: 4px 8px;">
                                    Enable keyframes
                                </button>
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

    generateVisualTimeline(currentLayer) {
        let maxTime = 0;
        for (const layer of this.layers) {
            if (layer.hasKeyframes && layer.keyframes.length > 0) {
                const layerMaxTime = Math.max(...layer.keyframes.map((kf) => kf.time));
                maxTime = Math.max(maxTime, layerMaxTime);
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
                                  title="Click to select ${kfName}">
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
                         title="Click to select ${kfName}">
                        ${kfName}
                    </div>
                `;
            }
        }
        html += "</div>";

        html += '<div class="visual-timeline-track">';

        for (let sec = 0; sec <= maxSeconds; sec++) {
            const position = ((sec * 1000) / maxTime) * 100;
            html += `
                <div class="timeline-second-marker" style="left: ${position}%">
                    <div class="timeline-second-tick"></div>
                    <div class="timeline-second-label" style="${sec === 0 ? "font-weight: 600; opacity: 1;" : ""}">${sec}s</div>
                </div>
            `;
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

        for (let i = 0; i < currentLayer.keyframes.length; i++) {
            const kf = currentLayer.keyframes[i];
            const position = (kf.time / maxTime) * 100;
            const isSelected = i === currentLayer.selectedKeyframeIndex;
            const kfName = kf.name || `KF ${i + 1}`;

            html += `
                <div class="timeline-keyframe-marker timeline-keyframe-current ${isSelected ? "timeline-keyframe-selected" : ""}"
                     style="left: ${position}%"
                     onclick="event.stopPropagation(); compositionEditor.selectKeyframe('${currentLayer.id}', ${i})"
                     title="${kfName} at ${kf.time}ms - Click to select">
                    <div class="timeline-keyframe-diamond"></div>
                </div>
            `;
        }

        html += "</div>";
        html += "</div>";

        return html;
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
        const lastKeyframeTime = layer.keyframes[layer.keyframes.length - 1].time;

        if (time < firstKeyframeTime) {
            return null;
        }

        if (time > lastKeyframeTime) {
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

        if (time === lastKeyframeTime) {
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

        if (typeof GIF === "undefined") {
            this.showNotification("No GIF renderer loaded", "error");
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

        if (window.location.protocol === "file:") {
            console.error("GIF generation requires a web server");
            return;
        }

        let totalDuration = 0;
        let frameDelay = 100;

        if (keyframedLayers.length > 0) {
            totalDuration = Math.max(...keyframedLayers.map((l) => Math.max(...l.keyframes.map((kf) => kf.time))));
            frameDelay = 33;
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

        let gif;
        try {
            gif = new GIF({
                workers: 1,
                quality: 10,
                width: this.canvasWidth,
                height: this.canvasHeight,
                workerScript: "js/libs/gif.worker.js",
            });
        } catch (error) {
            this.hideLoading();
            console.error("Failed to initialize GIF encoder:", error);
            return;
        }

        const frameCanvas = document.createElement("canvas");
        frameCanvas.width = this.canvasWidth;
        frameCanvas.height = this.canvasHeight;
        const frameCtx = frameCanvas.getContext("2d", { alpha: true, willReadFrequently: false });

        const sortedLayers = [...this.layers].sort((a, b) => a.zIndex - b.zIndex);

        this.updateLoadingProgress(0, totalFrames);

        const renderFrames = async () => {
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
                            const spriteFrameIndex = frameIndex % renderData.spriteIndices.length;
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

                gif.addFrame(frameCtx, { copy: true, delay: frameDelay });
            }
        };

        await renderFrames();

        gif.on("finished", (blob) => {
            this.hideLoading();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `composition_animated_${Date.now()}.gif`;
            a.click();
            URL.revokeObjectURL(url);
            this.showNotification("GIF exported successfully!", "success");
        });

        gif.on("error", (error) => {
            this.hideLoading();
            console.error("GIF rendering error:", error);
            this.showNotification("Failed to generate GIF. Error: " + error.message, "error", 6000);
        });

        gif.on("progress", (progress) => {
            this.showLoading(`Encoding GIF... ${Math.round(progress * 100)}%</br>This can take some time`);
        });

        this.showLoading("Rendering frames...");

        try {
            gif.render();
        } catch (error) {
            this.hideLoading();
            console.error("Failed to start GIF rendering:", error);
            this.showNotification("Failed to start GIF rendering. Error: " + error.message, "error", 6000);
        }
    }

    clearAllLayers() {
        if (this.layers.length > 0 && confirm("Are you sure you want to remove all layers?")) {
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
                `<strong>Name Already Exists</strong><br>A composition named "${compositionName}" already exists in the gallery. Overwrite it?`,
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
            blob = await this.renderToGifBlob();
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
                cropped: false,
                isComposition: true,
                compositionId: descriptor.id,
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

            if (typeof updateGalleryCategories === "function") {
                updateGalleryCategories();
            }

            this.navigateToCompositionInGallery(fileName);

            this.showNotification(
                `Composition "${compositionName}" saved to gallery (Misc category)!`,
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
        return new Promise((resolve) => {
            if (!this.canvas) {
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
                resolve(blob);
            }, "image/png");
        });
    }

    async renderToGifBlob() {
        if (!this.canvas) return null;

        if (typeof GIF === "undefined") {
            this.showNotification("No GIF renderer loaded", "error");
            return null;
        }

        const spriteAnimatedLayers = this.layers.filter(
            (l) => l.visible && l.isAnimated && l.spriteCanvases.length > 0,
        );
        const keyframedLayers = this.layers.filter((l) => l.visible && l.hasKeyframes && l.keyframes.length > 1);

        if (spriteAnimatedLayers.length === 0 && keyframedLayers.length === 0) {
            return null;
        }

        if (window.location.protocol === "file:") {
            /*alert(
                "GIF export requires running from a web server due to browser security restrictions.\n\n" +
                    "Please either:\n" +
                    "1. Use a local web server (e.g., 'python -m http.server' or 'npx serve')\n" +
                    "2. Or use a browser extension to allow local file access\n\n" +
                    "The composition will be saved as PNG instead.",
            );*/
            this.showNotification("No GIF renderer loaded", "error");
            return await this.renderToBlob();
        }

        let totalDuration = 0;
        let frameDelay = 100;

        if (keyframedLayers.length > 0) {
            totalDuration = Math.max(...keyframedLayers.map((l) => Math.max(...l.keyframes.map((kf) => kf.time))));
            frameDelay = 33;
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

        this.showLoading(`Rendering GIF for gallery...</br>This can take some time`);

        return new Promise((resolve, reject) => {
            try {
                const gif = new GIF({
                    workers: 1,
                    quality: 10,
                    width: this.canvasWidth,
                    height: this.canvasHeight,
                    workerScript: "js/libs/gif.worker.js",
                });

                const frameCanvas = document.createElement("canvas");
                frameCanvas.width = this.canvasWidth;
                frameCanvas.height = this.canvasHeight;
                const frameCtx = frameCanvas.getContext("2d", { alpha: true, willReadFrequently: false });

                const sortedLayers = [...this.layers].sort((a, b) => a.zIndex - b.zIndex);

                for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
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
                                const spriteFrameIndex = frameIndex % renderData.spriteIndices.length;
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

                    gif.addFrame(frameCtx, { copy: true, delay: frameDelay });
                }

                gif.on("finished", (blob) => {
                    this.hideLoading();
                    resolve(blob);
                });

                gif.on("error", (error) => {
                    this.hideLoading();
                    console.error("GIF rendering error:", error);
                    reject(error);
                });

                gif.render();
            } catch (error) {
                this.hideLoading();
                console.error("Failed to create GIF:", error);
                reject(error);
            }
        });
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

        const blob = hasKeyframes ? await editor.renderToGifBlob() : await editor.renderToBlob();
        return blob;
    }
}

if (!window.compositionEditor) {
    window.compositionEditor = new CompositionEditor();
}
