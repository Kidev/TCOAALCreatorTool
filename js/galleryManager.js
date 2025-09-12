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
    }

    init() {}

    detectSpriteSheetFromName(filename) {
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

    previewAsset(name, category, type) {
        this.clearPreview();

        document.querySelectorAll(".gallery-item").forEach((item) => {
            item.classList.remove("selected");
        });
        event.currentTarget.classList.add("selected");

        const assets =
            type === "images" ? window.gameImporterAssets.images[category] : window.gameImporterAssets.audio[category];

        const asset = assets[name];
        if (!asset) return;

        this.currentAsset = { name, category, type, asset };

        const downloadBtn = document.getElementById("previewDownloadBtn");
        downloadBtn.classList.add("active");

        const contentDiv = document.getElementById("previewPanelContent");
        const controlsDiv = document.getElementById("previewControls");

        if (type === "images") {
            const spriteInfo = this.detectSpriteSheetFromName(name);
            if (spriteInfo || asset.isSprite) {
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

            contentDiv.innerHTML = `
            <div class="sprite-sheet-preview">
            <h4>Sprite Sheet: ${cols}x${rows}</h4>
            <div class="sprite-grid" style="grid-template-columns: repeat(${Math.min(cols, 8)}, 1fr);">
            ${this.extractedSprites
                .map(
                    (sprite, i) => `
                <div class="sprite-cell-preview"
                data-index="${i}"
                onclick="galleryManager.toggleSpriteSelection(${i})">
                <canvas id="sprite-preview-${i}" width="${cellWidth}" height="${cellHeight}"></canvas>
                </div>
                `,
                )
                .join("")}
                </div>
                </div>
                `;

            setTimeout(() => {
                this.extractedSprites.forEach((sprite, i) => {
                    const targetCanvas = document.getElementById(`sprite-preview-${i}`);
                    if (targetCanvas) {
                        const ctx = targetCanvas.getContext("2d");
                        ctx.drawImage(sprite.canvas, 0, 0);
                    }
                });
            }, 10);

            controlsDiv.innerHTML = `
            <div class="asset-filename-title">${this.formatAssetTitle(name)}</div>
    <div class="preview-control-group preview-sprite-controls compact">
        <button class="preview-control-btn" onclick="galleryManager.clearSpriteSelection()">Clear</button>
        <button class="preview-control-btn" onclick="galleryManager.exportAsGif()">GIF</button>
        <span class="divider">|</span>
        <label class="preview-control-label inline" style="display: inline;">Speed (ms):</label>
        <input type="number" id="animationSpeed" style="display: inline; width: auto;" class="preview-control-input inline compact" value="250" min="10" max="5000" step="10" oninput="galleryManager.updateAnimationSpeed()">
    </div>
    <div class="preview-control-group" style="display: flex; justify-content: center;">
        <div id="preview-canvas-location" class="animation-preview" style="display: none;">
            <canvas id="animationCanvas" style="display: block;"></canvas>
        </div>
    </div>
`;

            this.spriteSheetData = { img, cols, rows, cellWidth, cellHeight };
        };
        img.src = asset.url;
    }

    previewImage(asset, name, contentDiv, controlsDiv) {
        contentDiv.innerHTML = `
        <div class="preview-image-container">
        <img src="${asset.url}" alt="${name}" class="preview-image" id="previewMainImage">
        </div>
        `;

        controlsDiv.innerHTML = `
        <div class="asset-filename-title">${name}</div>
        <div class="preview-control-group">
        <!--<label class="preview-control-label">View Mode:</label>
        <select class="preview-control-select" onchange="galleryManager.changeImageMode(this.value)">
        <option value="original">Original</option>
        <option value="fit">Fit to Container</option>
        <option value="actual">Actual Size</option>
        </select>-->
        </div>
        `;
    }

    formatAssetTitle(rawName, category = null, type = null) {
        const withExt = rawName;
        const base = rawName.replace(/\.[^/.]+$/, "");
        const lower = base.toLowerCase();

        if (lower === "jesters_pity") return "Jester's Pity";

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
                return `Spritesheet ${group} #${num} (${cols}x${rows})`;
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

        if (type === "audio") {
            return toSentenceCase(base);
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
        galleryManager.animateSelectedSprites();
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
        galleryManager.animateSelectedSprites();
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

    changeImageMode(mode) {
        const img = document.getElementById("previewMainImage");
        if (!img) return;

        switch (mode) {
            case "fit":
                img.style.width = "100%";
                img.style.height = "auto";
                img.style.objectFit = "contain";
                break;
            case "actual":
                img.style.width = "auto";
                img.style.height = "auto";
                img.style.objectFit = "none";
                break;
            default:
                img.style.width = "100%";
                img.style.height = "auto";
                img.style.objectFit = "contain";
        }
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
        </div>
        `;
        const progressFill = document.getElementById("audioProgressFill");
        const curTimeEl = document.getElementById("audioCurrentTime");
        const durEl = document.getElementById("audioDuration");
        if (progressFill) progressFill.style.width = "0%";
        if (curTimeEl) curTimeEl.textContent = "0:00";
        if (durEl) durEl.textContent = "0:00";

        controlsDiv.innerHTML = `<div class="asset-filename-title">${name}</div>`;

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
        a.href = asset.url;
        a.download = name;
        a.click();
    }
}

window.galleryManager = new GalleryManager();
window.galleryManager.init();

function downloadPreviewAsset() {
    window.galleryManager.downloadAsset();
}
