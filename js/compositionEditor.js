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

        /*this.getAutoOpenTitle = () => {
            return this.autoOpen === true
                ? "Will also open the editor, click to change"
                : "Will only add the asset in the background, click to change";
        };*/
    }

    generateId() {
        return "layer-" + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    }

    init() {
        this.canvas = document.getElementById("compositionCanvas");
        if (!this.canvas) return;

        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
        this.ctx = this.canvas.getContext("2d", { alpha: true });

        this.setupCanvasEventHandlers();
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

                if (
                    mouseX >= layer.x &&
                    mouseX <= layer.x + layer.width &&
                    mouseY >= layer.y &&
                    mouseY <= layer.y + layer.height
                ) {
                    this.selectLayer(layer.id);

                    this.isDragging = true;
                    this.dragStartX = mouseX;
                    this.dragStartY = mouseY;
                    this.dragLayerStartX = layer.x;
                    this.dragLayerStartY = layer.y;

                    this.canvas.style.cursor = "grabbing";
                    this.render();
                    break;
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

            this.updateLayerPosition(this.selectedLayerId, newX, newY);
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

                if (
                    mouseX >= layer.x &&
                    mouseX <= layer.x + layer.width &&
                    mouseY >= layer.y &&
                    mouseY <= layer.y + layer.height
                ) {
                    hovering = true;
                    break;
                }
            }

            this.canvas.style.cursor = hovering ? "grab" : "default";
        });
    }

    open() {
        const modal = document.getElementById("compositionEditorModal");
        if (modal) {
            modal.style.display = "flex";
            this.isOpen = true;
            this.init();
            this.render();
        }
    }

    close() {
        const modal = document.getElementById("compositionEditorModal");
        if (modal) {
            modal.style.display = "none";
            this.isOpen = false;
            if (this.animationFrameId) {
                cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = null;
            }
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
        };

        if (layer.type === "sprite" && layer.spriteCanvases.length > 0) {
            layer.imageLoaded = true;
        } else if (layer.blobUrl) {
            const img = new Image();
            img.onload = () => {
                layer.image = img;
                layer.imageLoaded = true;
                layer.width = layer.width || img.width;
                layer.height = layer.height || img.height;

                if (this.layers.length === 1 && layer.x === 0 && layer.y === 0) {
                    layer.x = Math.max(0, (this.canvasWidth - layer.width) / 2);
                    layer.y = Math.max(0, (this.canvasHeight - layer.height) / 2);
                }
                this.updateLayersList();
                this.render();
            };
            img.src = layer.blobUrl;
        }

        this.layers.push(layer);
        this.updateLayersList();

        this.render();

        return layer.id;
    }

    removeLayer(layerId) {
        const index = this.layers.findIndex((l) => l.id === layerId);
        if (index !== -1) {
            this.layers.splice(index, 1);

            this.layers.forEach((layer, idx) => {
                layer.zIndex = idx;
            });
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

    updateLayerPosition(layerId, x, y) {
        const layer = this.layers.find((l) => l.id === layerId);
        if (layer) {
            if (layer.type === "sprite") {
                layer.x = Math.round(x / layer.width) * layer.width;
                layer.y = Math.round(y / layer.height) * layer.height;
            } else {
                layer.x = Math.round(x);
                layer.y = Math.round(y);
            }

            layer.x = Math.max(0, Math.min(this.canvasWidth - layer.width, layer.x));
            layer.y = Math.max(0, Math.min(this.canvasHeight - layer.height, layer.y));

            this.updateLayersList();
            this.render();
        }
    }

    selectLayer(layerId) {
        this.selectedLayerId = layerId;
        this.updateLayersList();
        this.render();
    }

    render() {
        if (!this.ctx || !this.canvas) return;

        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

        this.ctx.fillStyle = "#000000";
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

        const sortedLayers = [...this.layers].sort((a, b) => a.zIndex - b.zIndex);

        sortedLayers.forEach((layer) => {
            if (!layer.visible) return;

            if (layer.type === "sprite" && layer.spriteCanvases.length > 0) {
                if (layer.isAnimated) {
                    const now = Date.now();
                    if (now - layer.lastAnimationTime >= layer.animationSpeed) {
                        layer.currentSpriteIndex = (layer.currentSpriteIndex + 1) % layer.spriteIndices.length;
                        layer.lastAnimationTime = now;
                    }
                    const spriteIndex = layer.spriteIndices[layer.currentSpriteIndex];
                    const spriteCanvas = layer.spriteCanvases[spriteIndex];
                    if (spriteCanvas) {
                        this.ctx.drawImage(spriteCanvas, layer.x, layer.y);
                    }
                } else {
                    const spriteIndex = layer.spriteIndices[0];
                    const spriteCanvas = layer.spriteCanvases[spriteIndex];
                    if (spriteCanvas) {
                        this.ctx.drawImage(spriteCanvas, layer.x, layer.y);
                    }
                }
            } else if (layer.image && layer.imageLoaded) {
                this.ctx.drawImage(layer.image, layer.x, layer.y, layer.width, layer.height);
            }
        });

        if (this.selectedLayerId) {
            const selectedLayer = this.layers.find((l) => l.id === this.selectedLayerId);
            if (selectedLayer && selectedLayer.visible) {
                this.ctx.strokeStyle = "#4a90e2";
                this.ctx.lineWidth = 3;
                this.ctx.setLineDash([8, 4]);
                this.ctx.strokeRect(selectedLayer.x, selectedLayer.y, selectedLayer.width, selectedLayer.height);
                this.ctx.setLineDash([]);
            }
        }

        const hasAnimatedSprites = this.layers.some((l) => l.visible && l.isAnimated && l.spriteCanvases.length > 0);
        if (hasAnimatedSprites && this.isOpen) {
            this.animationFrameId = requestAnimationFrame(() => this.render());
        }
    }

    updateLayersList() {
        const container = document.getElementById("compositionLayersList");
        if (!container) return;

        container.innerHTML = "";

        if (this.layers.length === 0) {
            container.innerHTML = '<div class="no-layers-message">No layers yet. Add assets from the gallery!</div>';

            const gifBtn = document.getElementById("exportGifBtn");
            if (gifBtn) gifBtn.style.display = "none";
            const pngBtn = document.getElementById("exportPngBtn");
            if (pngBtn) pngBtn.style.display = "none";
            return;
        }

        const hasAnimatedLayers = this.layers.some((l) => l.isAnimated && l.spriteCanvases.length > 0);
        const gifBtn = document.getElementById("exportGifBtn");
        if (gifBtn) {
            gifBtn.style.display = hasAnimatedLayers ? "inline-block" : "none";
        }
        const pngBtn = document.getElementById("exportPngBtn");
        if (pngBtn) {
            pngBtn.style.display = "inline-block";
        }

        const reversedLayers = [...this.layers].reverse();

        reversedLayers.forEach((layer, displayIndex) => {
            const actualIndex = this.layers.length - 1 - displayIndex;
            const layerDiv = document.createElement("div");
            layerDiv.className = "composition-layer-item";
            if (this.selectedLayerId === layer.id) {
                layerDiv.classList.add("selected");
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
                this.selectLayer(layer.id);
            });

            layerDiv.innerHTML = `
                <div class="layer-preview">
                    ${this.getLayerThumbnail(layer)}
                </div>
                <div class="layer-info">
                    <div class="layer-name" title="${layer.name}">${this.truncate(layer.name, 20)}</div>
                    <div class="layer-type">${layer.type}${layer.isAnimated ? " (animated)" : ""}</div>
                </div>
                <div class="layer-controls">
                    <button class="layer-control-btn visibility-btn ${layer.visible ? "active" : ""}"
                            onclick="compositionEditor.toggleLayerVisibility('${layer.id}')"
                            title="${layer.visible ? "Hide" : "Show"} layer">
                        ${layer.visible ? "☑" : "☐"}
                    </button>
                    <button class="layer-control-btn"
                            onclick="compositionEditor.moveLayerUp('${layer.id}')"
                            title="Move layer up"
                            ${actualIndex === this.layers.length - 1 ? "disabled" : ""}>
                        ↑
                    </button>
                    <button class="layer-control-btn"
                            onclick="compositionEditor.moveLayerDown('${layer.id}')"
                            title="Move layer down"
                            ${actualIndex === 0 ? "disabled" : ""}>
                        ↓
                    </button>
                    <button class="layer-control-btn delete-btn"
                            onclick="compositionEditor.removeLayer('${layer.id}')"
                            title="Remove layer">
                        ✕
                    </button>
                </div>
                <div class="layer-position">
                    <label>
                        X: <input type="number" value="${layer.x}" min="0" max="${this.canvasWidth}" step="${layer.type === "sprite" ? layer.width : 1}"
                                  onchange="compositionEditor.updateLayerPosition('${layer.id}', parseInt(this.value), ${layer.y})"
                                  class="position-input">
                    </label>
                    <label>
                        Y: <input type="number" value="${layer.y}" min="0" max="${this.canvasHeight}" step="${layer.type === "sprite" ? layer.height : 1}"
                                  onchange="compositionEditor.updateLayerPosition('${layer.id}', ${layer.x}, parseInt(this.value))"
                                  class="position-input">
                    </label>
                </div>
            `;

            container.appendChild(layerDiv);
        });
    }

    getLayerThumbnail(layer) {
        const thumbnailCanvas = document.createElement("canvas");
        const thumbSize = 40;
        thumbnailCanvas.width = thumbSize;
        thumbnailCanvas.height = thumbSize;
        const thumbCtx = thumbnailCanvas.getContext("2d");

        thumbCtx.fillStyle = "rgba(0, 0, 0, 0.3)";
        thumbCtx.fillRect(0, 0, thumbSize, thumbSize);

        if (layer.type === "sprite" && layer.spriteCanvases.length > 0) {
            const spriteIndex = layer.spriteIndices[0];
            const spriteCanvas = layer.spriteCanvases[spriteIndex];
            if (spriteCanvas) {
                const scale = Math.min(thumbSize / spriteCanvas.width, thumbSize / spriteCanvas.height);
                const scaledWidth = spriteCanvas.width * scale;
                const scaledHeight = spriteCanvas.height * scale;
                const x = (thumbSize - scaledWidth) / 2;
                const y = (thumbSize - scaledHeight) / 2;
                thumbCtx.drawImage(spriteCanvas, x, y, scaledWidth, scaledHeight);
            }
        } else if (layer.image && layer.imageLoaded) {
            const scale = Math.min(thumbSize / layer.width, thumbSize / layer.height);
            const scaledWidth = layer.width * scale;
            const scaledHeight = layer.height * scale;
            const x = (thumbSize - scaledWidth) / 2;
            const y = (thumbSize - scaledHeight) / 2;
            thumbCtx.drawImage(layer.image, x, y, scaledWidth, scaledHeight);
        }

        const thumbnailUrl = thumbnailCanvas.toDataURL();
        return `<img src="${thumbnailUrl}" style="width:40px;height:40px;border-radius:4px;object-fit:contain;" alt="${layer.name}">`;
    }

    truncate(str, maxLen) {
        return str.length > maxLen ? str.substring(0, maxLen - 3) + "..." : str;
    }

    async exportComposition() {
        if (!this.canvas) return;

        const exportCanvas = document.createElement("canvas");
        exportCanvas.width = this.canvasWidth;
        exportCanvas.height = this.canvasHeight;
        const exportCtx = exportCanvas.getContext("2d");

        exportCtx.fillStyle = "#000000";
        exportCtx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

        const sortedLayers = [...this.layers].sort((a, b) => a.zIndex - b.zIndex);

        for (const layer of sortedLayers) {
            if (!layer.visible) continue;

            if (layer.type === "sprite" && layer.spriteCanvases.length > 0) {
                const spriteIndex = layer.isAnimated
                    ? layer.spriteIndices[layer.currentSpriteIndex]
                    : layer.spriteIndices[0];
                const spriteCanvas = layer.spriteCanvases[spriteIndex];
                if (spriteCanvas) {
                    exportCtx.drawImage(spriteCanvas, layer.x, layer.y);
                }
            } else if (layer.image && layer.imageLoaded) {
                exportCtx.drawImage(layer.image, layer.x, layer.y, layer.width, layer.height);
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

    async exportAsGif() {
        if (!this.canvas) return;

        if (typeof GIF === "undefined") {
            alert("Loading GIF encoder...");
            const script = document.createElement("script");
            script.src = "js/libs/gif.js";
            script.onload = () => this.exportAsGif();
            document.head.appendChild(script);
            return;
        }

        const animatedLayers = this.layers.filter((l) => l.visible && l.isAnimated && l.spriteCanvases.length > 0);

        if (animatedLayers.length === 0) {
            alert("No animated layers to export");
            return;
        }

        const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
        const lcm = (a, b) => (a * b) / gcd(a, b);
        const totalFrames = animatedLayers.reduce((acc, layer) => lcm(acc, layer.spriteIndices.length), 1);

        const avgSpeed = Math.round(
            animatedLayers.reduce((sum, l) => sum + l.animationSpeed, 0) / animatedLayers.length,
        );

        alert(`Generating GIF with ${totalFrames} frames...\nThis may take a moment.`);

        const gif = new GIF({
            workers: 2,
            quality: 10,
            width: this.canvasWidth,
            height: this.canvasHeight,
            workerScript: "js/libs/gif.worker.js",
        });

        const frameCanvas = document.createElement("canvas");
        frameCanvas.width = this.canvasWidth;
        frameCanvas.height = this.canvasHeight;
        const frameCtx = frameCanvas.getContext("2d");

        const sortedLayers = [...this.layers].sort((a, b) => a.zIndex - b.zIndex);

        for (let frameIndex = 0; frameIndex < totalFrames; frameIndex++) {
            frameCtx.fillStyle = "#000000";
            frameCtx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

            for (const layer of sortedLayers) {
                if (!layer.visible) continue;

                if (layer.type === "sprite" && layer.spriteCanvases.length > 0) {
                    if (layer.isAnimated) {
                        const spriteFrameIndex = frameIndex % layer.spriteIndices.length;
                        const spriteIndex = layer.spriteIndices[spriteFrameIndex];
                        const spriteCanvas = layer.spriteCanvases[spriteIndex];
                        if (spriteCanvas) {
                            frameCtx.drawImage(spriteCanvas, layer.x, layer.y);
                        }
                    } else {
                        const spriteIndex = layer.spriteIndices[0];
                        const spriteCanvas = layer.spriteCanvases[spriteIndex];
                        if (spriteCanvas) {
                            frameCtx.drawImage(spriteCanvas, layer.x, layer.y);
                        }
                    }
                } else if (layer.image && layer.imageLoaded) {
                    frameCtx.drawImage(layer.image, layer.x, layer.y, layer.width, layer.height);
                }
            }

            gif.addFrame(frameCtx, { copy: true, delay: avgSpeed });
        }

        gif.on("finished", (blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `composition_animated_${Date.now()}.gif`;
            a.click();
            URL.revokeObjectURL(url);
        });

        gif.render();
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
            alert("No layers to save!");
            return null;
        }

        const portableLayers = [];
        let hasNonGalleryAssets = false;

        for (const layer of this.layers) {
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
        }

        if (portableLayers.length === 0) {
            alert("No gallery assets in composition. Only gallery assets can be shared.");
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

    async saveToGallery() {
        const compositionName = prompt("Enter a name for this composition:");
        if (!compositionName || compositionName.trim() === "") {
            return;
        }

        const descriptor = this.createCompositionDescriptor(compositionName.trim());
        if (!descriptor) {
            return;
        }

        const blob = await this.renderToBlob();
        if (!blob) {
            alert("Failed to render composition");
            return;
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

            const fileName = `${compositionName}.png`;
            const blobUrl = URL.createObjectURL(blob);

            window.gameImporterAssets.images["Misc"][fileName] = {
                url: blobUrl,
                blob: blob,
                cropped: false,
                isComposition: true,
                compositionId: descriptor.id,
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

                    //console.log(`Composition "${compositionName}" saved to IndexedDB for persistence`);
                } catch (error) {
                    console.error("Failed to save composition to IndexedDB:", error);
                }
            }

            if (typeof updateGalleryCategories === "function") {
                updateGalleryCategories();
            }

            this.navigateToCompositionInGallery(fileName);

            alert(`Composition "${compositionName}" saved to gallery (Misc category)!`);
        } else {
            alert("Gallery not available. Composition descriptor created but not added to gallery.");
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
            const exportCtx = exportCanvas.getContext("2d");

            exportCtx.fillStyle = "#000000";
            exportCtx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

            const sortedLayers = [...this.layers].sort((a, b) => a.zIndex - b.zIndex);

            for (const layer of sortedLayers) {
                if (!layer.visible) continue;

                if (layer.type === "sprite" && layer.spriteCanvases.length > 0) {
                    const spriteIndex = layer.isAnimated
                        ? layer.spriteIndices[layer.currentSpriteIndex]
                        : layer.spriteIndices[0];
                    const spriteCanvas = layer.spriteCanvases[spriteIndex];
                    if (spriteCanvas) {
                        exportCtx.drawImage(spriteCanvas, layer.x, layer.y);
                    }
                } else if (layer.image && layer.imageLoaded) {
                    exportCtx.drawImage(layer.image, layer.x, layer.y, layer.width, layer.height);
                }
            }

            exportCanvas.toBlob((blob) => {
                resolve(blob);
            }, "image/png");
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

        //console.log(`Reconstructing composition "${descriptor.name}" with ${descriptor.layers.length} layers...`);

        const editor = new CompositionEditor();
        editor.init();

        let missingAssets = [];

        for (const layerDesc of descriptor.layers) {
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

            //console.log(`Adding layer: ${layerDesc.type} - ${category}/${name}`);

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
                    //console.log(`Extracting sprites for ${name}...`);

                    const extractedSprites = await window.galleryManager.extractSpritesFromAsset(
                        asset,
                        name,
                        layerDesc.spriteVariant,
                    );
                    //console.log(`Extracted ${extractedSprites.length} sprites`);
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

        if (missingAssets.length > 0) {
            console.warn(`Composition "${descriptor.name}" is missing ${missingAssets.length} assets:`, missingAssets);
            return null;
        }

        if (editor.layers.length === 0) {
            console.warn(`Composition "${descriptor.name}" has no valid layers`);
            return null;
        }

        //console.log(`Waiting for ${editor.layers.length} layers to load...`);
        await new Promise((resolve) => {
            const checkLoaded = setInterval(() => {
                const allLoaded = editor.layers.every((layer) => layer.type === "sprite" || layer.imageLoaded);
                if (allLoaded) {
                    clearInterval(checkLoaded);
                    //console.log(`All layers loaded for composition "${descriptor.name}"`);
                    resolve();
                }
            }, 100);

            setTimeout(() => {
                clearInterval(checkLoaded);
                console.warn(`Timeout waiting for layers to load in composition "${descriptor.name}"`);
                resolve();
            }, 10000);
        });

        //console.log(`Rendering composition "${descriptor.name}"...`);
        const blob = await editor.renderToBlob();
        //console.log(`Composition "${descriptor.name}" rendered successfully, blob size: ${blob?.size || 0} bytes`);
        return blob;
    }
}

if (!window.compositionEditor) {
    window.compositionEditor = new CompositionEditor();
}
