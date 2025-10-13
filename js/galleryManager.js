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
        this.globalImageViewMode = "cropped";
        this.currentlyCropping = false;
        this.cropQueue = [];
        this.isCropping = false;
        this.willReadFrequently = true;
    }

    setGlobalImageViewMode(mode) {
        this.globalImageViewMode = mode;
        const checkbox = document.getElementById("toggleCropped");
        if (checkbox) checkbox.checked = mode === "cropped";
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

        // Check if filename matches pattern: spritessheet_COLSxROWS_description.png
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
        this.clearPreview();

        document.querySelectorAll(".gallery-item").forEach((item) => {
            item.classList.remove("selected");
        });
        event.currentTarget.classList.add("selected");

        this.scrollIfRequired(event.currentTarget);

        const assets =
            type === "images" ? window.gameImporterAssets.images[category] : window.gameImporterAssets.audio[category];

        const asset = assets[name];
        if (!asset) return;

        this.currentAsset = { name, category, type, asset };
        // If this is an image (non-portrait) and not a sprite sheet, enqueue it for cropping
        // Only crop if not already cropped or currently being cropped
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
        if (!canvas || !previewContainer) return;

        if (this.selectedSprites.length === 0) {
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            canvas.style.width = "0px";
            canvas.style.height = "0px";
            previewContainer.style.display = "none";
            return;
        }

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

    previewSpriteSheet(asset, name, contentDiv, controlsDiv, spriteInfo) {
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
                    const ctx = canvas.getContext("2d");

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
                        <h4>
                            Sprite Sheet:
                            <select id="${selectId}" class="preview-control-input inline compact">
                                ${asset.variants
                                    .map(
                                        (v, idx) =>
                                            `<option value="${idx}" ${v.rows === rows && v.cols === cols ? "selected" : ""}>
                                                ${v.rows}x${v.cols}
                                            </option>`,
                                    )
                                    .join("")}
                            </select>
                        </h4>
                        <div class="sprite-grid" style="grid-template-columns: repeat(${cols}, 1fr);">
                            ${this.extractedSprites
                                .map(
                                    (sprite, i) => `
                                        <div class="sprite-cell-preview"
                                            data-index="${i}"
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
                        <h4>Sprite Sheet: ${cols}x${rows}</h4>
                        <div class="sprite-grid" style="grid-template-columns: repeat(${cols}, 1fr);">
                            ${this.extractedSprites
                                .map(
                                    (sprite, i) => `
                                        <div class="sprite-cell-preview"
                                            data-index="${i}"
                                            onclick="galleryManager.toggleSpriteSelection(${i})">
                                            <canvas id="sprite-preview-${i}" width="${cellWidth}" height="${cellHeight}"></canvas>
                                        </div>`,
                                )
                                .join("")}
                        </div>
                    </div>`;
            }

            //     setTimeout(() => {
            this.extractedSprites.forEach((sprite, i) => {
                const targetCanvas = document.getElementById(`sprite-preview-${i}`);
                if (targetCanvas) {
                    const ctx = targetCanvas.getContext("2d");
                    ctx.drawImage(sprite.canvas, 0, 0);
                }
            });
            // }, 10);

            controlsDiv.innerHTML = `
                <div class="asset-filename-title">${this.formatAssetTitle(name, "images")}<div class="asset-filename-subtitle">${asset.baseFileName}</div></div>
                <div class="preview-control-group preview-sprite-controls compact">
                    <button class="preview-control-btn" onclick="galleryManager.clearSpriteSelection()">Clear</button>
                    <button class="preview-control-btn" onclick="galleryManager.exportAsGif()">GIF</button>
                    <button class="preview-control-btn" onclick="galleryManager.exportAsPng()">PNG(s)</button>
                    <br>
                    <label class="preview-control-label inline" style="display: inline;">Speed (ms): <input type="number" id="animationSpeed" style="display: inline; width: auto;" class="preview-control-input inline compact" value="250" min="10" max="5000" step="10" oninput="galleryManager.updateAnimationSpeed()"></label>
                </div>
                <div class="preview-control-group" style="display: flex; justify-content: center;">
                    <div id="preview-canvas-location" class="animation-preview" style="display: none;">
                        <canvas id="animationCanvas" style="display: block;"></canvas>
                    </div>
                </div>`;

            this.spriteSheetData = { img, cols, rows, cellWidth, cellHeight };
        };
        img.src = asset.url;
        img.loading = "lazy";
    }

    previewImage(asset, name, contentDiv, controlsDiv) {
        let showCroppedBox = asset.croppedUrl;
        const src = this.globalImageViewMode === "cropped" && asset.croppedUrl ? asset.croppedUrl : asset.url;
        contentDiv.innerHTML = `
        <div class="preview-image-container">
          <img src="${src}" alt="${name}" class="preview-image" id="previewMainImage">
        </div>
    `;

        controlsDiv.innerHTML = `
            <div class="asset-filename-title">${this.formatAssetTitle(name, "images")}<div class="asset-filename-subtitle">${asset.baseFileName}</div></div>
            <div class="preview-control-group" ${showCroppedBox ? "" : "style='display: none;'"}>
                <label class="preview-control-label">
                    <input type="checkbox" id="toggleCropped"
                           onchange="window.galleryManager.setGlobalImageViewMode(this.checked ? 'cropped' : 'original')"
                           ${this.globalImageViewMode === "cropped" ? "checked" : ""}>
                    Cropped
                </label>
            </div>`;
    }

    previewAudio(asset, name, contentDiv, controlsDiv) {
        if (!this._audioSessionId) this._audioSessionId = 0;
        this._audioSessionId++;
        const sessionId = this._audioSessionId;

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
            <div style="display:flex;align-items:center;flex-direction:column-reverse;justify-content:flex-start;">
            <input id="volumeSlider" type="range" min="0" max="1" step="0.01" value="1"
            oninput="galleryManager.setAudioVolume(this.value)" title="100%">
            <span id="volumeValue" style="min-width:3ch; text-align:right;">100%</span>
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

        controlsDiv.innerHTML = `<div class="asset-filename-title">${this.formatAssetTitle(name, "audio")}<div class="asset-filename-subtitle">${asset.baseFileName}</div></div>`;

        const audio = new Audio(asset.url);
        this.currentAudio = audio;

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
        if (label) label.textContent = `${pct}%`;
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

        if (typeof GIF === "undefined") {
            const script = document.createElement("script");
            script.src = "js/libs/gif.js";
            script.onload = () => this.createGif(speed);
            document.head.appendChild(script);
        } else {
            this.createGif(speed);
        }
    }

    createGif(speed) {
        const firstSprite = this.extractedSprites[this.selectedSprites[0]];

        const gif = new GIF({
            workers: 2,
            quality: 10,
            width: firstSprite.canvas.width,
            height: firstSprite.canvas.height,
            workerScript: "js/libs/gif.worker.js",
        });

        this.selectedSprites.forEach((index) => {
            const sprite = this.extractedSprites[index];
            gif.addFrame(sprite.canvas, { delay: speed });
        });

        gif.on("finished", (blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `animation_${Date.now()}.gif`;
            a.click();
            URL.revokeObjectURL(url);
        });

        gif.render();
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

        first.click();
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
                    // Crop only if bounding box is smaller than original
                    if (trimW < w || trimH < h) {
                        const croppedCanvas = document.createElement("canvas");
                        croppedCanvas.width = trimW;
                        croppedCanvas.height = trimH;
                        const croppedCtx = croppedCanvas.getContext("2d");
                        // Draw cropped area
                        croppedCtx.drawImage(canvas, minX, minY, trimW, trimH, 0, 0, trimW, trimH);
                        // Convert to Blob
                        const blob = await new Promise((r) => croppedCanvas.toBlob(r, "image/png"));
                        asset.croppedBlob = blob;
                        asset.croppedUrl = URL.createObjectURL(blob);
                        asset.cropped = true;

                        // Save cropped asset to persistent memory
                        if (window.memoryManager && asset.baseFileName) {
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
                            //thumbImg.loading = "lazy";
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
}

window.galleryManager = new GalleryManager();
window.galleryManager.init();

function downloadPreviewAsset() {
    window.galleryManager.downloadAsset();
}
