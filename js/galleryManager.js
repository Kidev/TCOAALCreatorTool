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

class GalleryManager {
    constructor() {
        this.currentAsset = null;
        this.currentAudio = null;
        this.animationInterval = null;
        this.selectedSprites = [];
        this.currentTab = "images";
        this.lastImageCategory = "Portraits";
        this.lastAudioCategory = "Background songs";
        this.audioContext = null;
        this.isLooping = false;
        this.spriteSheetData = null;
        this.extractedSprites = [];
        this.globalImageViewMode = "original";
        this.currentlyCropping = false;
        this.cropQueue = [];
        this.isCropping = false;
        this.willReadFrequently = true;
        this.favouriteStarUrl = null;
    }

    async extractFavouriteStar() {
        if (this.favouriteStarUrl) return this.favouriteStarUrl;

        const spriteSheetName = "spritessheet_12x8_characters_14.png";
        const spriteIndex = 6;
        const cols = 12;
        const rows = 8;

        if (!window.gameImporterAssets?.images?.["Game sprites"]?.[spriteSheetName]) {
            return null;
        }

        const asset = window.gameImporterAssets.images["Game sprites"][spriteSheetName];

        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const cellWidth = img.width / cols;
                const cellHeight = img.height / rows;
                const col = spriteIndex % cols;
                const row = Math.floor(spriteIndex / cols);

                const canvas = document.createElement("canvas");
                canvas.width = cellWidth;
                canvas.height = cellHeight;
                const ctx = canvas.getContext("2d", { alpha: true });

                ctx.drawImage(
                    img,
                    col * cellWidth,
                    row * cellHeight,
                    cellWidth,
                    cellHeight,
                    0,
                    0,
                    cellWidth,
                    cellHeight,
                );

                canvas.toBlob((blob) => {
                    if (blob) {
                        this.favouriteStarUrl = URL.createObjectURL(blob);
                        resolve(this.favouriteStarUrl);
                    } else {
                        resolve(null);
                    }
                }, "image/png");
            };
            img.onerror = () => resolve(null);
            img.src = asset.url;
        });
    }

    setGlobalImageViewMode(mode) {
        this.globalImageViewMode = mode;
        if (this.currentAsset && this.currentAsset.type === "images") {
            const { name, category, asset } = this.currentAsset;
            const contentDiv = document.getElementById("previewPanelContent");
            const controlsDiv = document.getElementById("previewControls");
            this.previewImage(asset, name, contentDiv, controlsDiv);
        }
    }

    init() {}

    detectSpriteSheetFromName(filename) {
        if (filename in spritesSheetsVariants) {
            const variant = spritesSheetsVariants[filename];
            const size = variant.sizes[variant.default];
            return {
                cols: size.cols,
                rows: size.rows,
                isSprite: true,
            };
        }

        const match = filename.match(/spritessheet_(\d+)x(\d+)_/);
        if (match) {
            return {
                cols: parseInt(match[1]),
                rows: parseInt(match[2]),
                isSprite: true,
            };
        }
        return null;
    }

    scrollIfRequired(el) {
        const galModal = document.getElementById("galleryModal");
        if (galModal) {
            this.scrollIfRequiredModal(el);
        } else {
            this.scrollIfRequiredGallery(el);
        }
    }

    scrollIfRequiredModal(el) {
        const container = document.getElementById("galleryContent");
        if (!container || !el) return;

        const cRect = container.getBoundingClientRect();
        const eRect = el.getBoundingClientRect();

        const hiddenTop = eRect.top < cRect.top;
        const hiddenBottom = eRect.bottom > cRect.bottom;

        if (!hiddenTop && !hiddenBottom) return;

        const scrollOffset = el.offsetTop - container.offsetTop;

        if (hiddenTop) {
            container.scrollTo({ top: scrollOffset, behavior: "smooth" });
        } else if (hiddenBottom) {
            const diff = eRect.bottom - cRect.bottom;
            container.scrollBy({ top: diff, behavior: "smooth" });
        }
    }

    scrollIfRequiredGallery(el) {
        const rect = el.getBoundingClientRect();
        const viewHeight = window.innerHeight || document.documentElement.clientHeight;
        const offset = document.getElementById("editorHeader")?.offsetHeight || 0;
        const container = document.getElementById("editorOverlay") || document.documentElement;

        const fullyVisible = rect.top >= offset && rect.bottom <= viewHeight;
        const hiddenTop = rect.top < offset;
        const hiddenBottom = rect.bottom > viewHeight;

        if (fullyVisible) return;

        if (hiddenTop) {
            const targetTop = rect.top + container.scrollTop - offset;
            container.scrollTo({ top: targetTop, behavior: "smooth" });
        } else if (hiddenBottom) {
            el.scrollIntoView({ behavior: "smooth", block: "end" });
        }
    }

    previewAsset(name, category, type, variant = null) {
        const assets =
            type === "images" ? window.gameImporterAssets.images[category] : window.gameImporterAssets.audio[category];

        const asset = assets[name];
        if (!asset) return;

        if (this.currentAsset?.asset?.isSprite) {
            this.clearSpriteSelection();
        }

        this.currentAsset = { name, category, type, asset };

        if (
            type === "images" &&
            category !== "Portraits" &&
            !asset.isSprite &&
            !asset.croppedBlob &&
            !asset.cropped &&
            !asset.cropping
        ) {
            this.enqueueCropImage(asset, name, category);
        }

        const downloadBtn = document.getElementById("previewDownloadBtn");
        downloadBtn.classList.add("active");

        const contentDiv = document.getElementById("previewPanelContent");
        const controlsDiv = document.getElementById("previewControls");

        if (type === "images") {
            let spriteInfo = null;
            if (name in spritesSheetsVariants) {
                const variants = spritesSheetsVariants[name];
                spriteInfo = variant === null ? variants.sizes[variants.default] : variant;
            } else {
                spriteInfo = this.detectSpriteSheetFromName(name);
            }
            if (spriteInfo && asset.isSprite) {
                this.previewSpriteSheet(asset, name, contentDiv, controlsDiv, spriteInfo);
            } else {
                this.previewImage(asset, name, contentDiv, controlsDiv);
            }
        } else {
            this.previewAudio(asset, name, contentDiv, controlsDiv);
        }
    }

    animateSelectedSprites() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }

        const canvas = document.getElementById("animationCanvas");
        const previewContainer = document.getElementById("preview-canvas-location");
        const sheetControlsDiv = document.getElementById("previewControlsSheetSpecific");
        const previewSpriteGifButton = document.getElementById("previewSpriteGifButton");
        const addToEditorSpritesButton = document.getElementById("addToEditorSpritesButton");
        if (!canvas || !previewContainer) return;

        if (this.selectedSprites.length === 0) {
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            canvas.style.width = "0px";
            canvas.style.height = "0px";
            previewContainer.style.display = "none";
            sheetControlsDiv.style.display = "none";
            addToEditorSpritesButton.classList.toggle("hidden", true);
            return;
        }

        if (this.selectedSprites.length > 1) {
            previewSpriteGifButton.classList.toggle("hidden", false);
        } else {
            previewSpriteGifButton.classList.toggle("hidden", true);
        }

        sheetControlsDiv.style.display = "block";
        addToEditorSpritesButton.classList.toggle("hidden", false);

        previewContainer.style.display = "inline-flex";

        const speed = parseInt(document.getElementById("animationSpeed").value) || 100;
        let currentIndex = 0;

        const firstSprite = this.extractedSprites[this.selectedSprites[0]];
        canvas.width = firstSprite.canvas.width;
        canvas.height = firstSprite.canvas.height;

        const displayWidth = Math.min(firstSprite.canvas.width * 2, 200);
        const displayHeight = Math.min(firstSprite.canvas.height * 2, 200);
        canvas.style.width = displayWidth + "px";
        canvas.style.height = displayHeight + "px";

        const ctx = canvas.getContext("2d");

        const animate = () => {
            const spriteIndex = this.selectedSprites[currentIndex];
            const sprite = this.extractedSprites[spriteIndex];

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (sprite !== undefined) {
                ctx.drawImage(sprite.canvas, 0, 0);
            }

            currentIndex = (currentIndex + 1) % this.selectedSprites.length;
        };

        animate();
        if (this.selectedSprites.length > 1) {
            this.animationInterval = setInterval(animate, speed);
        }
    }

    updateAnimationSpeed() {
        if (this.selectedSprites.length === 0) return;

        const newSpeed = parseInt(document.getElementById("animationSpeed").value) || 250;

        if (this.selectedSprites.length === 1) return;

        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }

        const canvas = document.getElementById("animationCanvas");
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        let currentIndex = 0;

        const animate = () => {
            const spriteIndex = this.selectedSprites[currentIndex];
            const sprite = this.extractedSprites[spriteIndex];

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (sprite !== undefined) {
                ctx.drawImage(sprite.canvas, 0, 0);
            }

            currentIndex = (currentIndex + 1) % this.selectedSprites.length;
        };

        this.animationInterval = setInterval(animate, newSpeed);
    }

    async extractSpritesFromAsset(asset, name, spriteInfo = null) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                let cols, rows;

                if (spriteInfo) {
                    cols = spriteInfo.cols;
                    rows = spriteInfo.rows;
                } else if (name in spritesSheetsVariants) {
                    const variants = spritesSheetsVariants[name];
                    const defaultVariant = variants.sizes[variants.default];
                    cols = defaultVariant.cols;
                    rows = defaultVariant.rows;
                } else {
                    const detectedInfo = this.detectSpriteSheetFromName(name);
                    if (detectedInfo) {
                        cols = detectedInfo.cols;
                        rows = detectedInfo.rows;
                    } else {
                        cols = Math.floor(img.width / 48);
                        rows = Math.floor(img.height / 48);
                    }
                }

                const cellWidth = img.width / cols;
                const cellHeight = img.height / rows;

                const extractedSprites = [];
                for (let row = 0; row < rows; row++) {
                    for (let col = 0; col < cols; col++) {
                        const canvas = document.createElement("canvas");
                        canvas.width = cellWidth;
                        canvas.height = cellHeight;
                        const ctx = canvas.getContext("2d", { alpha: true });

                        ctx.drawImage(
                            img,
                            col * cellWidth,
                            row * cellHeight,
                            cellWidth,
                            cellHeight,
                            0,
                            0,
                            cellWidth,
                            cellHeight,
                        );

                        extractedSprites.push({
                            canvas: canvas,
                            index: row * cols + col,
                            row: row,
                            col: col,
                        });
                    }
                }

                resolve(extractedSprites);
            };
            img.onerror = () => reject(new Error(`Failed to load sprite sheet: ${name}`));
            img.src = asset.croppedUrl || asset.url;
        });
    }

    previewSpriteSheet(asset, name, contentDiv, controlsDiv, spriteInfo) {
        this.updateCropButtonInPreviewTitle(false);

        const img = new Image();
        img.onload = () => {
            let cols, rows;

            if (spriteInfo) {
                cols = spriteInfo.cols;
                rows = spriteInfo.rows;
            } else {
                cols = Math.floor(img.width / 48);
                rows = Math.floor(img.height / 48);
            }

            const cellWidth = img.width / cols;
            const cellHeight = img.height / rows;

            this.extractedSprites = [];
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    const canvas = document.createElement("canvas");
                    canvas.width = cellWidth;
                    canvas.height = cellHeight;
                    const ctx = canvas.getContext("2d", { alpha: true });

                    ctx.drawImage(
                        img,
                        col * cellWidth,
                        row * cellHeight,
                        cellWidth,
                        cellHeight,
                        0,
                        0,
                        cellWidth,
                        cellHeight,
                    );

                    const imageData = ctx.getImageData(0, 0, cellWidth, cellHeight);
                    const data = imageData.data;
                    for (let i = 0; i < data.length; i += 4) {
                        if (data[i + 3] === 0) {
                            data[i] = 0; // R
                            data[i + 1] = 0; // G
                            data[i + 2] = 0; // B
                        }
                    }
                    ctx.putImageData(imageData, 0, 0);

                    this.extractedSprites.push({
                        canvas: canvas,
                        index: row * cols + col,
                        row: row,
                        col: col,
                    });
                }
            }

            if (asset.variants !== null && asset.variants.length > 0) {
                const selectId = `variantSelect-${Math.random().toString(36).slice(2)}`;
                contentDiv.innerHTML = `
                    <div class="sprite-sheet-preview">
                        <div style="display: flex; flex-direction: row; align-items: center;">
                        <h4 class="sprite-sheet-preview-info-title">
                            Sprite Sheet:</h4>
                        <select id="${selectId}" class="preview-control-input inline compact">
                            ${asset.variants
                                .map(
                                    (v, idx) =>
                                        `<option value="${idx}" ${v.rows === rows && v.cols === cols ? "selected" : ""}>
                                            ${v.rows}x${v.cols}
                                        </option>`,
                                )
                                .join("")}
                        </select></div>
                        
                        <div class="sprite-grid" style="grid-template-columns: repeat(${cols}, 1fr);">
                            ${this.extractedSprites
                                .map(
                                    (sprite, i) => `
                                        <div class="sprite-cell-preview"
                                            data-index="${i}"
                                            title="${asset.name} #${i}"
                                            onclick="galleryManager.toggleSpriteSelection(${i})">
                                            <canvas id="sprite-preview-${i}" width="${cellWidth}" height="${cellHeight}"></canvas>
                                        </div>`,
                                )
                                .join("")}
                        </div>
                    </div>`;

                const select = contentDiv.querySelector(`#${selectId}`);
                select.addEventListener("change", (e) => {
                    const idx = parseInt(e.target.value, 10);
                    const variant = asset.variants[idx];
                    this.previewAsset(name, "System sprites", "images", variant);
                });
            } else {
                contentDiv.innerHTML = `
                    <div class="sprite-sheet-preview">
                    <div style="display: flex; flex-direction: row; align-items: center;">
                        <h4 class="sprite-sheet-preview-info-title">Sprite Sheet: ${cols}x${rows}</h4>
                        </div>
                        <div class="sprite-grid" style="grid-template-columns: repeat(${cols}, 1fr);">
                            ${this.extractedSprites
                                .map(
                                    (sprite, i) => `
                                        <div class="sprite-cell-preview"
                                            data-index="${i}"
                                            title="${asset.name} #${i}"
                                            onclick="galleryManager.toggleSpriteSelection(${i})">
                                            <canvas id="sprite-preview-${i}" width="${cellWidth}" height="${cellHeight}"></canvas>
                                        </div>`,
                                )
                                .join("")}
                        </div>
                    </div>`;
            }

            this.extractedSprites.forEach((sprite, i) => {
                const targetCanvas = document.getElementById(`sprite-preview-${i}`);
                if (targetCanvas) {
                    const ctx = targetCanvas.getContext("2d", { willReadFrequently: this.willReadFrequently });
                    ctx.drawImage(sprite.canvas, 0, 0);
                }
            });

            let titleName = this.formatAssetTitle(name, "images").split(" ");
            titleName.pop();
            const titleWithoutSize = titleName.join(" ");

            controlsDiv.innerHTML = `
                <div class="asset-image-preview-title-line"><div class="asset-filename-title">${titleWithoutSize}<div class="asset-filename-subtitle">${asset.baseFileName}</div></div>
</div>
                <div id="previewControlsSheetSpecific">
                <div class="preview-control-group preview-sprite-controls compact">
                    <button class="preview-control-btn" onclick="galleryManager.clearSpriteSelection()">Clear</button>
                    <button class="preview-control-btn" onclick="galleryManager.exportAsPng()">PNG(s)</button>
                    <button id="previewSpriteGifButton" class="preview-control-btn" onclick="galleryManager.exportAsGif()">GIF&nbsp(
                        <label class="preview-control-label inline" style="display: inline;"><input type="number" id="animationSpeed" style="display: inline; width: 2.5vmax;" class="preview-control-input inline compact" value="250" min="10" max="5000" step="10" oninput="galleryManager.updateAnimationSpeed();" onclick="event.stopPropagation()" onmousedown="event.stopPropagation()">ms)</label>
                    </button>
                    <div></div>
                    <div id="addToEditorSpritesButton" class="preview-control-group-add-editor">
                        <div class="split-button" id="spritesOpenEditorChoiceButton">
                            <button class="btn main"></button>
                            <button class="btn arrow">▼</button>
                        <div class="menu"></div>
                        </div>
                    </div>
                </div>
                <div class="preview-control-group" style="display: flex; justify-content: center;">
                    <div id="preview-canvas-location" class="animation-preview" style="display: none;">
                        <canvas id="animationCanvas" style="display: block;"></canvas>
                    </div>
                </div>

                </div>`;

            if (window.compositionEditor.autoOpenButtonManager) {
                window.compositionEditor.autoOpenButtonManager.attachTo(
                    document.getElementById("spritesOpenEditorChoiceButton"),
                    this,
                    this.addSpriteToCompositionEditor,
                );
            }

            const sheetControlsDiv = document.getElementById("previewControlsSheetSpecific");
            const addToEditorSpritesButton = document.getElementById("addToEditorSpritesButton");
            const previewSpriteGifButton = document.getElementById("previewSpriteGifButton");
            if (this.selectedSprites.length === 0) {
                sheetControlsDiv.style.display = "none";
                addToEditorSpritesButton.classList.toggle("hidden", true);
                previewSpriteGifButton.classList.toggle("hidden", true);
            } else {
                sheetControlsDiv.style.display = "block";
                addToEditorSpritesButton.classList.toggle("hidden", false);
                if (this.selectedSprites.length > 1) {
                    previewSpriteGifButton.classList.toggle("hidden", false);
                }
            }

            this.spriteSheetData = { img, cols, rows, cellWidth, cellHeight };
        };
        img.src = asset.url;
    }

    previewImage(asset, name, contentDiv, controlsDiv) {
        let showCroppedBox = asset.croppedUrl;
        const src = this.globalImageViewMode === "cropped" && asset.croppedUrl ? asset.croppedUrl : asset.url;
        contentDiv.innerHTML = `
        <div class="preview-image-container">
            <img src="${src}" alt="${name}" class="preview-image" id="previewMainImage">
        </div>`;

        controlsDiv.innerHTML = `
            <div class="asset-image-preview-title-line"><div class="asset-filename-title">${this.formatAssetTitle(name, "images")}<div class="asset-filename-subtitle">${asset.baseFileName}</div></div>
            </div>
                                        <div class="preview-control-group-add-editor">
                <div class="split-button" id="imageOpenEditorChoiceButton">
                    <button class="btn main"></button>
                    <button class="btn arrow">▼</button>
                    <div class="menu"></div>
                </div>
            </div>`;

        this.updateCropButtonInPreviewTitle(showCroppedBox);

        if (window.compositionEditor.autoOpenButtonManager) {
            window.compositionEditor.autoOpenButtonManager.attachTo(
                document.getElementById("imageOpenEditorChoiceButton"),
                this,
                this.addImageToCompositionEditor,
            );
        }
    }

    updateCropButtonInPreviewTitle(show) {
        const previewBox = document.getElementById("previewCropBoxContainer");
        if (show) {
            previewBox.innerHTML = `
                <button ${show ? "style='padding:0 0.2vmax;margin-left:0.5vmax;width:auto;'" : ""} 
                    title="${this.globalImageViewMode === "cropped" ? "Preview is cropped to content: click for original" : "Preview is original: click for cropped to content"}"
                    onclick="window.galleryManager.setGlobalImageViewMode(window.galleryManager.globalImageViewMode === 'original' ? 'cropped' : 'original');window.galleryManager.updateCropButtonInPreviewTitle(${show ? "true" : "false"});">${this.globalImageViewMode === "cropped" ? "cropped" : "original"}</button>
            `;
        } else {
            previewBox.innerHTML = ``;
        }
    }

    previewAudio(asset, name, contentDiv, controlsDiv) {
        if (!this._audioSessionId) this._audioSessionId = 0;
        this._audioSessionId++;
        const sessionId = this._audioSessionId;

        this.updateCropButtonInPreviewTitle(false);

        if (this.currentAudio) {
            try {
                this.currentAudio.pause();
            } catch (_) {}
            if (this._onTimeUpdate) this.currentAudio.removeEventListener("timeupdate", this._onTimeUpdate);
            if (this._onLoadedMeta) this.currentAudio.removeEventListener("loadedmetadata", this._onLoadedMeta);
            if (this._onEnded) this.currentAudio.removeEventListener("ended", this._onEnded);
            this.currentAudio.src = "";
            this.currentAudio.load();
            this.currentAudio = null;
        }

        contentDiv.innerHTML = `
            <div class="audio-player-container compact">
            <div class="audio-player-controls">
            <button class="audio-player-btn" id="audioPlayBtn" onclick="galleryManager.toggleAudioPlay()">▶ Play</button>
            <button class="audio-player-btn" onclick="galleryManager.restartAudio()">⏮ Restart</button>
            <div style="display:flex;flex-direction: column; gap: 4px;">

                <div style="display: flex; align-items: center; gap: 8px;">
                    <input id="volumeSlider" type="range" min="0" max="1" step="0.01" value="1"
                    oninput="galleryManager.setAudioVolume(this.value)" title="Volume: 100%"
                    style="flex: 1; height: 12px; border-radius: 3px; cursor: pointer;">
                    <span id="volumeValue" style="font-size: 12px; font-weight: bold; min-width: 80px; text-align: right;">Volume: 100%</span>
                </div>

                <div style="display: flex; align-items: center; gap: 8px;">
                    <input id="speedSlider" type="range" min="0.25" max="2" step="0.05" value="1"
                    oninput="galleryManager.setAudioSpeed(this.value)" title="Speed: 100%"
                    style="flex: 1; height: 12px; border-radius: 3px; cursor: pointer;">
                    <span id="speedValue" style="font-size: 12px; font-weight: bold; min-width: 80px; text-align: right;">Speed: 1.0x</span>
                </div>


               <div style="display: flex; align-items: center; gap: 8px;">
                    <input id="pitchSlider" type="range" min="-12" max="12" step="0.5" value="0"
                    oninput="galleryManager.setAudioPitch(this.value)" title="Pitch: 0"
                    style="flex: 1; height: 12px; border-radius: 3px; cursor: pointer;">
                    <span id="pitchValue" style="font-size: 12px; font-weight: bold; min-width: 80px; text-align: right;">Pitch: +0.0</span>
                </div>

            
            </div>
            </div>
            <div class="audio-player-progress">
            <div class="audio-progress-bar" onclick="galleryManager.seekAudio(event)">
            <div class="audio-progress-fill" id="audioProgressFill" style="width: 0%;"></div>
            </div>
            <div class="audio-player-time">
            <span id="audioCurrentTime">0:00</span>
            <span id="audioDuration">0:00</span>
            </div>
            </div>
            </div>`;

        const progressFill = document.getElementById("audioProgressFill");
        const curTimeEl = document.getElementById("audioCurrentTime");
        const durEl = document.getElementById("audioDuration");
        if (progressFill) progressFill.style.width = "0%";
        if (curTimeEl) curTimeEl.textContent = "0:00";
        if (durEl) durEl.textContent = "0:00";

        controlsDiv.innerHTML = `
            <div class="asset-filename-title">${this.formatAssetTitle(name, "audio")}<div class="asset-filename-subtitle">${asset.baseFileName}</div></div>
            <div class="preview-control-group-add-editor">
                <div class="split-button" id="audioOpenEditorChoiceButton">
                    <button class="btn main"></button>
                    <button class="btn arrow">▼</button>
                    <div class="menu"></div>
                </div>
            </div>`;

        const audio = new Audio(asset.url);
        this.currentAudio = audio;

        if (this.currentAudio.preservesPitch !== undefined) {
            this.currentAudio.preservesPitch = false;
        }
        if (this.currentAudio.mozPreservesPitch !== undefined) {
            this.currentAudio.mozPreservesPitch = false;
        }
        if (this.currentAudio.webkitPreservesPitch !== undefined) {
            this.currentAudio.webkitPreservesPitch = false;
        }

        this._onLoadedMeta = () => {
            if (sessionId !== this._audioSessionId) return;
            if (durEl) durEl.textContent = this.formatTime(audio.duration);
        };
        this._onTimeUpdate = () => {
            if (sessionId !== this._audioSessionId) return;
            const pct = audio.duration && isFinite(audio.duration) ? (audio.currentTime / audio.duration) * 100 : 0;
            if (progressFill) progressFill.style.width = `${Math.max(0, Math.min(100, pct))}%`;
            if (curTimeEl) curTimeEl.textContent = this.formatTime(audio.currentTime);
        };
        this._onEnded = () => {
            if (sessionId !== this._audioSessionId) return;
            const playBtn = document.getElementById("audioPlayBtn");
            if (playBtn) playBtn.textContent = "▶ Play";
        };

        audio.addEventListener("loadedmetadata", this._onLoadedMeta);
        audio.addEventListener("timeupdate", this._onTimeUpdate);
        audio.addEventListener("ended", this._onEnded);

        const volSlider = document.getElementById("volumeSlider");
        if (volSlider) this.setAudioVolume(volSlider.value);

        const speedSlider = document.getElementById("speedSlider");
        const pitchSlider = document.getElementById("pitchSlider");

        this.currentAudioSpeed = speedSlider ? parseFloat(speedSlider.value) : 1.0;
        this.currentAudioPitch = pitchSlider ? parseFloat(pitchSlider.value) : 0;

        this.updateAudioPlaybackRate();

        if (window.compositionEditor.autoOpenButtonManager) {
            window.compositionEditor.autoOpenButtonManager.attachTo(
                document.getElementById("audioOpenEditorChoiceButton"),
                this,
                this.addAudioToCompositionEditor,
            );
        }
    }

    formatAssetTitle(rawName, category = null, type = null) {
        const withExt = rawName;
        const base = rawName.replace(/\.[^/.]+$/, "");
        const lower = base.toLowerCase();

        const toSentenceCase = (s) => {
            const parts = s.replace(/[_-]+/g, " ").split(" ").filter(Boolean);
            if (parts.length === 0) return "";
            const first = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
            const rest = parts.slice(1).map((w) => w.toLowerCase());
            return [first, ...rest].join(" ");
        };

        {
            const m = lower.match(/^spritessheet_(\d+)x(\d+)_([^_]+)_(\d+)$/);
            if (m) {
                const cols = m[1],
                    rows = m[2],
                    group = m[3],
                    num = m[4];
                return `Sprites sheet ${group} #${num} (${cols}x${rows})`;
            }
        }

        {
            const mbgm = lower.match(/^bgm_(\d+)$/);
            if (mbgm) return `Background music #${mbgm[1]}`;

            const mme = lower.match(/^me_(\d+)$/);
            if (mme) return `Event music #${mme[1]}`;

            const mse = lower.match(/^se_(\d+)$/);
            if (mse) return `Sound effect #${mse[1]}`;
        }

        {
            const mt = lower.match(/^titles1_(\d+)$/);
            if (mt) return `Titles #${mt[1]}`;
        }

        {
            const mpic = lower.match(/^pictures_(\d+)$/);
            if (mpic) return `Picture #${mpic[1]}`;
            const mpar = lower.match(/^parallaxes_(\d+)$/);
            if (mpar) return `Parallax #${mpar[1]}`;
            const mbg = lower.match(/^backgrounds_(\d+)$/);
            if (mbg) return `Background #${mbg[1]}`;
        }

        {
            const mNum = base.match(/^(.*?)[ _-]?(\d+)$/);
            if (mNum) {
                const head = mNum[1].trim();
                const num = mNum[2];
                if (head.includes("-")) {
                    const [main, ...rest] = head.split("-");
                    const mainTitle = main.charAt(0).toUpperCase() + main.slice(1);
                    const suffix = rest.join("-");
                    return `${mainTitle} (${suffix}) #${num}`;
                } else {
                    return `${toSentenceCase(head)} #${num}`;
                }
            }
        }

        const words = base
            .replace(/[_-]+/g, " ")
            .split(" ")
            .filter(Boolean)
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1));
        return words.join(" ");
    }

    setAudioVolume(value) {
        const vol = parseFloat(value);
        if (isNaN(vol)) return;

        const volume = Math.pow(vol, 2.5);

        if (this.currentAudio) {
            this.currentAudio.volume = volume;
        }

        const slider = document.getElementById("volumeSlider");
        const label = document.getElementById("volumeValue");
        const pct = Math.round(vol * 100);

        if (slider) slider.title = `Volume: ${pct}%`;
        if (label) label.textContent = `Volume: ${pct}%`;
    }

    setAudioSpeed(value) {
        const speed = parseFloat(value);
        if (isNaN(speed)) return;

        this.currentAudioSpeed = speed;

        this.updateAudioPlaybackRate();

        const slider = document.getElementById("speedSlider");
        const label = document.getElementById("speedValue");

        if (slider) slider.title = `${speed.toFixed(1)}x`;
        if (label) label.textContent = `Speed: ${speed.toFixed(1)}x`;
    }

    setAudioPitch(value) {
        const pitchSemitones = parseFloat(value);
        if (isNaN(pitchSemitones)) return;

        this.currentAudioPitch = pitchSemitones;

        this.updateAudioPlaybackRate();

        const slider = document.getElementById("pitchSlider");
        const label = document.getElementById("pitchValue");

        if (slider) slider.title = `Pitch: ${pitchSemitones >= 0 ? "+" : ""}${pitchSemitones.toFixed(1)}`;
        if (label) label.textContent = `Pitch: ${pitchSemitones >= 0 ? "+" : ""}${pitchSemitones.toFixed(1)}`;
    }

    updateAudioPlaybackRate() {
        if (!this.currentAudio) return;

        const speed = this.currentAudioSpeed || 1.0;
        const pitchSemitones = this.currentAudioPitch || 0;

        const pitchRatio = Math.pow(2, pitchSemitones / 12);

        this.currentAudio.playbackRate = speed * pitchRatio;

        if (this.currentAudio.preservesPitch !== undefined) {
            this.currentAudio.preservesPitch = false;
        }
        if (this.currentAudio.mozPreservesPitch !== undefined) {
            this.currentAudio.mozPreservesPitch = false;
        }
        if (this.currentAudio.webkitPreservesPitch !== undefined) {
            this.currentAudio.webkitPreservesPitch = false;
        }
    }

    toggleSpriteSelection(index) {
        const cell = document.querySelector(`.sprite-cell-preview[data-index="${index}"]`);

        const selectedIndex = this.selectedSprites.indexOf(index);
        if (selectedIndex > -1) {
            this.selectedSprites.splice(selectedIndex, 1);
            cell.classList.remove("selected");
        } else {
            this.selectedSprites.push(index);
            cell.classList.add("selected");
        }
        this.animateSelectedSprites();
    }

    selectAllSprites() {
        this.selectedSprites = this.extractedSprites.map((_, i) => i);
        document.querySelectorAll(".sprite-cell-preview").forEach((cell) => {
            cell.classList.add("selected");
        });
    }

    clearSpriteSelection() {
        this.selectedSprites = [];
        document.querySelectorAll(".sprite-cell-preview").forEach((cell) => {
            cell.classList.remove("selected");
        });
        this.animateSelectedSprites();
    }

    exportAsGif() {
        if (this.selectedSprites.length === 0) {
            alert("Please select sprites to export");
            return;
        }

        const speed = parseInt(document.getElementById("animationSpeed").value) || 100;
        this.createGif(speed);
    }

    createGif(speed) {
        const firstSprite = this.extractedSprites[this.selectedSprites[0]];
        const encoder = gifenc.GIFEncoder();

        const width = firstSprite.canvas.width;
        const height = firstSprite.canvas.height;

        const firstFrameData = firstSprite.canvas.getContext("2d").getImageData(0, 0, width, height);
        const palette = gifenc.quantize(firstFrameData.data, 256, { format: "rgba4444", oneBitAlpha: true });

        this.selectedSprites.forEach((index, frameIndex) => {
            const sprite = this.extractedSprites[index];
            const ctx = sprite.canvas.getContext("2d");
            const imageData = ctx.getImageData(0, 0, width, height);
            const indexed = gifenc.applyPalette(imageData.data, palette, "rgba4444");

            encoder.writeFrame(indexed, width, height, {
                palette,
                delay: speed,
                transparent: true,
                transparentIndex: 0,
                first: frameIndex === 0,
            });
        });

        encoder.finish();

        const buffer = encoder.bytes();
        const blob = new Blob([buffer], { type: "image/gif" });

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `animation_${Date.now()}.gif`;
        a.click();
        URL.revokeObjectURL(url);
    }

    exportAsPng() {
        if (this.selectedSprites.length === 0) {
            alert("Please select sprites to export");
            return;
        }
        if (typeof JSZip === "undefined") {
            const script = document.createElement("script");
            script.src = "js/libs/jszip.min.js";
            script.onload = () => this.exportAsPng();
            document.head.appendChild(script);
            return;
        }
        const zip = new JSZip();
        const promises = this.selectedSprites.map((index) => {
            return new Promise((resolve) => {
                const sprite = this.extractedSprites[index];
                sprite.canvas.toBlob((blob) => {
                    zip.file(`sprite_${index}.png`, blob);
                    resolve();
                }, "image/png");
            });
        });
        Promise.all(promises).then(() => {
            zip.generateAsync({ type: "blob" }).then((zipBlob) => {
                const url = URL.createObjectURL(zipBlob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `sprites_${Date.now()}.zip`;
                a.click();
                URL.revokeObjectURL(url);
            });
        });
    }

    toggleAudioPlay() {
        if (!this.currentAudio) return;

        const btn = document.getElementById("audioPlayBtn");
        if (this.currentAudio.paused) {
            this.currentAudio.play();
            btn.textContent = "⏸ Pause";
        } else {
            this.currentAudio.pause();
            btn.textContent = "▶ Play";
        }
    }

    restartAudio() {
        if (!this.currentAudio) return;

        this.currentAudio.currentTime = 0;
        this.currentAudio.play();
        document.getElementById("audioPlayBtn").textContent = "⏸ Pause";
    }

    seekAudio(event) {
        if (!this.currentAudio) return;

        const bar = event.currentTarget;
        const rect = bar.getBoundingClientRect();
        const percent = (event.clientX - rect.left) / rect.width;

        this.currentAudio.currentTime = percent * this.currentAudio.duration;
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    }

    clearPreview() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }

        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }

        this.selectedSprites = [];
        this.extractedSprites = [];
        this.spriteSheetData = null;

        document.getElementById("previewPanelContent").innerHTML =
            '<div class="preview-placeholder">Select an item to preview</div>';
        document.getElementById("previewControls").innerHTML = "";
        document.getElementById("previewDownloadBtn").classList.remove("active");
    }

    downloadAsset() {
        if (!this.currentAsset) return;

        const { name, asset } = this.currentAsset;
        const a = document.createElement("a");
        a.href = asset.croppedUrl && this.globalImageViewMode === "cropped" ? asset.croppedUrl : asset.url;
        a.download = name;
        a.click();
    }

    enqueueCropImage(asset, name, category) {
        if (asset.croppedBlob || asset.cropping) return;
        asset.cropping = true;
        this.cropQueue.unshift({ asset, name, category });
        if (!this.isCropping) {
            this.processCropQueue().then((r) => {});
        }
    }

    async enqueueBatch(assets) {
        if (assets.length <= 0) return;
        if (!this.isCropping) {
            this.cropQueue.concat(assets);
            await this.processCropQueue();
        }
    }

    unselectCurrent() {
        const current = document.querySelector(".gallery-item.selected");
        if (current?.classList?.contains("selected")) {
            current.classList.remove("selected");
        }
    }
    selectFirstElement() {
        const items = Array.from(document.querySelectorAll(".gallery-item")).filter(
            (el) => el.style.display !== "none",
        );

        if (items.length === 0) return;

        const first = items.reduce((min, el) =>
            parseInt(el.dataset.assetIndex, 10) < parseInt(min.dataset.assetIndex, 10) ? el : min,
        );

        if (first.checkVisibility()) {
            first.click();
        }
    }

    async processCropQueue() {
        if (this.isCropping) return;
        this.isCropping = true;

        const lenQueue = this.cropQueue.length;
        let count = 0;

        while (this.cropQueue.length > 0) {
            count++;
            const { asset, name, category } = this.cropQueue.shift();
            if (!asset.blob || asset.cropped === true || asset.croppedBlob?.size > 0) {
                asset.cropping = false;
                continue;
            }
            try {
                const imgBitmap = await createImageBitmap(asset.blob);
                const w = imgBitmap.width,
                    h = imgBitmap.height;
                const canvas = document.createElement("canvas");
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext("2d", { willReadFrequently: this.willReadFrequently });
                ctx.drawImage(imgBitmap, 0, 0);
                const imgData = ctx.getImageData(0, 0, w, h).data;
                let minX = w,
                    minY = h,
                    maxX = 0,
                    maxY = 0,
                    found = false;
                for (let y = 0; y < h; y++) {
                    for (let x = 0; x < w; x++) {
                        const alpha = imgData[(y * w + x) * 4 + 3];
                        if (alpha > 0) {
                            found = true;
                            minX = Math.min(minX, x);
                            maxX = Math.max(maxX, x);
                            minY = Math.min(minY, y);
                            maxY = Math.max(maxY, y);
                        }
                    }
                }
                if (found) {
                    const trimW = maxX - minX + 1;
                    const trimH = maxY - minY + 1;
                    if (trimW < w || trimH < h) {
                        const croppedCanvas = document.createElement("canvas");
                        croppedCanvas.width = trimW;
                        croppedCanvas.height = trimH;
                        const croppedCtx = croppedCanvas.getContext("2d");
                        croppedCtx.drawImage(canvas, minX, minY, trimW, trimH, 0, 0, trimW, trimH);
                        const blob = await new Promise((r) => croppedCanvas.toBlob(r, "image/png"));
                        asset.croppedBlob = blob;
                        asset.croppedUrl = URL.createObjectURL(blob);
                        asset.cropped = true;

                        if (window.memoryManager && asset.baseFileName && !asset.isComposition) {
                            try {
                                const assetId = window.memoryManager.generateAssetId(asset.baseFileName, name);
                                await window.memoryManager.saveCompleteAsset(assetId, blob);
                            } catch (error) {
                                console.warn("Failed to save cropped asset to memory:", name, error);
                            }
                        }

                        updateLoadingBar((100 * (count + 1)) / lenQueue, name);

                        const thumbImg = document.querySelector(`.gallery-item[data-filename="${name}"] img`);
                        if (thumbImg) {
                            thumbImg.src = asset.croppedUrl;
                            thumbImg.click();
                        }
                        asset.cropping = false;
                        window.gameImporterAssets.images[category][name] = asset;
                    }
                }
            } catch (err) {
                console.error("Cropping failed for", name, err);
            }
            asset.cropping = false;
        }
        this.isCropping = false;
        updateLoadingBar();
    }

    async addImageToCompositionEditor() {
        if (!this.currentAsset || this.currentAsset.type !== "images") {
            alert("No image selected");
            return;
        }

        const { name, category, asset } = this.currentAsset;

        if (!window.compositionEditor) {
            console.error("Composition editor not initialized");
            return;
        }

        if (asset.isComposition && window.compositionEditor.isOpen && window.compositionEditor.layers.length > 0) {
            if (!confirm(`The compositor already has layers loaded. Replace them with "${name}"?`)) {
                return;
            }

            window.compositionEditor.clearAllLayers(true);
        }

        if (asset.isComposition && asset.compositionDescriptor) {
            for (const layerDesc of asset.compositionDescriptor.layers) {
                const galleryRef = layerDesc.galleryRef;
                if (!galleryRef) continue;

                const match = galleryRef.match(/^gallery:([^/]+)\/(.+)$/);
                if (!match) continue;

                const [, srcCategory, srcName] = match;
                const srcAsset = window.gameImporterAssets.images[srcCategory]?.[srcName];

                if (!srcAsset) {
                    console.warn(`Missing asset for layer: ${srcCategory}/${srcName}`);
                    continue;
                }

                const assetData = {
                    name: srcName,
                    type: layerDesc.type,
                    assetRef: galleryRef,
                    blobUrl: srcAsset.url,
                    x: layerDesc.x,
                    y: layerDesc.y,
                    width: layerDesc.width,
                    height: layerDesc.height,
                };

                if (layerDesc.type === "sprite" && srcAsset.isSprite) {
                    try {
                        const extractedSprites = await this.extractSpritesFromAsset(
                            srcAsset,
                            srcName,
                            layerDesc.spriteVariant,
                        );
                        assetData.isAnimated = layerDesc.isAnimated;
                        assetData.spriteIndices = layerDesc.spriteIndices;
                        assetData.animationSpeed = layerDesc.animationSpeed;
                        assetData.spriteCanvases = extractedSprites.map((s) => s.canvas);
                        assetData.spriteVariant = layerDesc.spriteVariant;
                    } catch (error) {
                        console.error(`Failed to extract sprites for ${srcName}:`, error);
                        continue;
                    }
                }

                const layerId = window.compositionEditor.addLayer(assetData);

                const addedLayer = window.compositionEditor.layers.find((l) => l.id === layerId);
                if (addedLayer && addedLayer.visible !== layerDesc.visible) {
                    addedLayer.visible = layerDesc.visible;
                }
            }
        } else {
            let assetType = "background";
            if (category === "Portraits") {
                assetType = "portrait";
            }

            const assetData = {
                name: name,
                type: assetType,
                assetRef: `gallery:${category}/${name}`,
                blobUrl: asset.url,
                x: 0,
                y: 0,
            };

            window.compositionEditor.addLayer(assetData);
        }

        this.flashSuccessOnButton();

        if (window.compositionEditor.autoOpen === true && !window.compositionEditor.isOpen) {
            window.compositionEditor.open();
        }
    }

    flashSuccessOnButton(audio = false, buttonId = null) {
        let btn = null;
        if (buttonId) {
            btn = document.getElementById(buttonId);
        } else {
            btn = document.getElementById("composition-editor-btn");
        }

        if (btn) {
            btn.classList.remove("success");
            void btn.offsetWidth;
            btn.classList.add("success");

            setTimeout(() => {
                if (btn) {
                    btn.classList.remove("success");
                }
            }, 500);
        }

        btn = document.getElementById("composition-editor-btn-header");

        if (btn) {
            btn.classList.remove("success");
            void btn.offsetWidth;
            btn.classList.add("success");

            setTimeout(() => {
                if (btn) {
                    btn.classList.remove("success");
                }
            }, 500);
        }
    }

    addSpriteToCompositionEditor() {
        if (!this.currentAsset || this.currentAsset.type !== "images") {
            alert("No sprite selected");
            return;
        }

        if (this.selectedSprites.length === 0) {
            alert("Please select at least one sprite frame first");
            return;
        }

        const { name, category } = this.currentAsset;
        const animationSpeed = parseInt(document.getElementById("animationSpeed")?.value) || 250;
        const isAnimated = this.selectedSprites.length > 1;

        const firstSpriteIndex = this.selectedSprites[0];
        const firstSprite = this.extractedSprites[firstSpriteIndex];

        if (!firstSprite) {
            alert("Error: Sprite data not found");
            return;
        }

        const assetData = {
            name: name,
            type: "sprite",
            assetRef: `gallery:${category}/${name}`,
            blobUrl: null,
            x: 0,
            y: 0,
            width: firstSprite.canvas.width,
            height: firstSprite.canvas.height,
            isAnimated: isAnimated,
            spriteIndices: [...this.selectedSprites],
            animationSpeed: animationSpeed,
            spriteCanvases: this.extractedSprites.map((s) => s.canvas),
            spriteVariant: this.spriteSheetData
                ? {
                      cols: this.spriteSheetData.cols,
                      rows: this.spriteSheetData.rows,
                  }
                : null,
        };

        if (!window.compositionEditor) {
            console.error("Composition editor not initialized");
            return;
        }

        window.compositionEditor.addLayer(assetData);

        this.clearSpriteSelection();
        this.flashSuccessOnButton();

        if (window.compositionEditor.autoOpen === true && !window.compositionEditor.isOpen) {
            window.compositionEditor.open();
        }
    }

    addAudioToCompositionEditor() {
        if (!this.currentAsset || this.currentAsset.type !== "audio") {
            alert("No audio selected");
            return;
        }

        const { name, category, asset } = this.currentAsset;

        const speedSlider = document.getElementById("speedSlider");
        const pitchSlider = document.getElementById("pitchSlider");

        const speed = speedSlider ? parseFloat(speedSlider.value) : 1.0;
        const pitch = pitchSlider ? parseFloat(pitchSlider.value) : 0;

        const assetData = {
            name: name,
            type: "audio",
            assetRef: `gallery:${category}/${name}`,
            blobUrl: asset.url,

            speed: speed,
            pitch: pitch,
        };

        if (!window.compositionEditor) {
            console.error("Composition editor not initialized");
            return;
        }

        window.compositionEditor.addAudioKeyframe(assetData);

        this.flashSuccessOnButton(true);

        if (window.compositionEditor.autoOpen === true && !window.compositionEditor.isOpen) {
            window.compositionEditor.open();
        }
    }
}

window.galleryManager = new GalleryManager();
window.galleryManager.init();

function downloadPreviewAsset() {
    window.galleryManager.downloadAsset();
}
