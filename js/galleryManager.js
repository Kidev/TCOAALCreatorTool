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
        this.lastDataCategory = "Data";
        this.audioContext = null;
        this.isLooping = false;
        this.spriteSheetData = null;
        this.extractedSprites = [];
        this.globalImageViewMode = "cropped";
        this.currentlyCropping = false;
        this.cropQueue = [];
        this.isCropping = false;
        this.willReadFrequently = true;
        this.favouriteStarUrl = null;
        this.currentSpriteExtractionId = 0;
    }

    async extractFavouriteStar() {
        if (this.favouriteStarUrl) return this.favouriteStarUrl;

        const spriteSheetName = "spritessheet_12x8_characters_7.png";
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

    improveSubtitle(baseFileName) {
        if (!baseFileName) return { subtitle: baseFileName, original: baseFileName };

        for (const [hash, friendlyName] of Object.entries(hashToFilename)) {
            if (baseFileName.includes(hash)) {
                const improved = baseFileName.replace(hash, friendlyName);
                return {
                    subtitle: improved,
                    original: baseFileName,
                };
            }
        }

        return {
            subtitle: baseFileName,
            original: baseFileName,
        };
    }

    getSearchableTerms(baseFileName) {
        if (!baseFileName) return "";

        const terms = [];

        for (const [hash, friendlyName] of Object.entries(hashToFilename)) {
            if (baseFileName.includes(hash)) {
                terms.push(friendlyName);

                terms.push(hash);

                const hashWithoutSuffix = hash.replace(/\[.*?\]$/, "");
                if (hashWithoutSuffix !== hash) {
                    terms.push(hashWithoutSuffix);
                }

                break;
            }
        }

        for (const [hash, displayName] of Object.entries(hashToName)) {
            if (baseFileName.includes(hash)) {
                terms.push(displayName);
                break;
            }
        }

        return terms.join(" ");
    }

    getFriendlyName(name, baseFileName) {
        if (!baseFileName) return name;

        for (const [hash, displayName] of Object.entries(hashToName)) {
            if (baseFileName.includes(hash)) {
                const ext = name.includes(".") ? name.substring(name.lastIndexOf(".")) : "";

                return displayName + ext;
            }
        }

        return name;
    }

    getHashToNameValue(baseFileName) {
        if (!baseFileName || typeof hashToName === "undefined") return null;

        for (const [hash, displayName] of Object.entries(hashToName)) {
            if (baseFileName.includes(hash)) {
                return displayName;
            }
        }
        return null;
    }

    isGround(baseFileName) {
        const hashName = this.getHashToNameValue(baseFileName);
        return hashName && hashName.startsWith("ground_");
    }

    isParallaxe(baseFileName) {
        const hashName = this.getHashToNameValue(baseFileName);
        return hashName && hashName.startsWith("parallax_");
    }

    isPureBackground(baseFileName) {
        const hashName = this.getHashToNameValue(baseFileName);
        if (!hashName) return true;
        return !hashName.startsWith("ground_") && !hashName.startsWith("parallax_");
    }

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
            type === "images"
                ? window.gameImporterAssets.images[category]
                : type === "data"
                  ? window.gameImporterAssets.data[category]
                  : window.gameImporterAssets.audio[category];

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
                this.previewSpriteSheet(asset, name, category, contentDiv, controlsDiv, spriteInfo);
            } else {
                this.previewImage(asset, name, contentDiv, controlsDiv);
            }
        } else if (type === "data") {
            this.previewData(asset, name, contentDiv, controlsDiv);
        } else {
            this.previewAudio(asset, name, contentDiv, controlsDiv);
        }
    }

    previewPairedBackgrounds(
        groundName,
        parallaxeName,
        category,
        groundAsset = null,
        parallaxeAsset = null,
        pairedNumber = null,
    ) {
        //console.log("previewPairedBackgrounds called:", { groundName, parallaxeName, category, groundAsset, parallaxeAsset, pairedNumber });

        if (!groundAsset || !parallaxeAsset) {
            const assets = window.gameImporterAssets?.images?.[category];
            if (assets) {
                groundAsset = assets[groundName];
                parallaxeAsset = assets[parallaxeName];
            }
        }

        if (!groundAsset || !parallaxeAsset) {
            console.error("Could not find paired background assets", { groundAsset, parallaxeAsset });
            alert(
                "Could not find paired background assets. Ground: " + !!groundAsset + ", Parallax: " + !!parallaxeAsset,
            );
            return;
        }

        //console.log("Assets found, creating preview");

        this.currentAsset = {
            name: groundName,
            category: category,
            type: "images",
            asset: groundAsset,
            isPaired: true,
            pairedName: parallaxeName,
            pairedAsset: parallaxeAsset,
        };

        const downloadBtn = document.getElementById("previewDownloadBtn");
        downloadBtn.classList.add("active");

        const contentDiv = document.getElementById("previewPanelContent");
        const controlsDiv = document.getElementById("previewControls");

        const title = pairedNumber ? `Ground & Parallax #${pairedNumber}` : "Ground & Parallax";

        const groundImproved = this.improveSubtitle(groundAsset.baseFileName);
        const parallaxeImproved = this.improveSubtitle(parallaxeAsset.baseFileName);
        const subtitle = `${groundImproved.subtitle}</br>${parallaxeImproved.subtitle}`;
        const subtitleOriginal = `Ground: ${groundImproved.original}\nParallax: ${parallaxeImproved.original}`;

        contentDiv.innerHTML = `
        <div class="preview-image-container">
            <img src="${groundAsset.url}" alt="${groundName}" class="preview-image" id="previewMainImage">
            <img src="${parallaxeAsset.url}" alt="${parallaxeName}" class="preview-image" style="position: absolute;">
        </div>`;

        controlsDiv.style.display = "block";
        controlsDiv.innerHTML = `
            <div class="asset-image-preview-title-line"><div class="asset-filename-title">${title}<div class="asset-filename-subtitle" title="${subtitleOriginal}">${subtitle}</div></div>
            </div>
                                        <div class="preview-control-group-add-editor">
                <div class="split-button" id="imageOpenEditorChoiceButton">
                    <button class="btn main"></button>
                    <button class="btn arrow">▼</button>
                    <div class="menu"></div>
                </div>
            </div>
        `;

        this.updateCropButtonInPreviewTitle(false);

        if (window.compositionEditor.autoOpenButtonManager) {
            window.compositionEditor.autoOpenButtonManager.attachTo(
                document.getElementById("imageOpenEditorChoiceButton"),
                this,
                this.addPairedBackgroundsToCompositionEditor,
            );
        }
    }

    async addPairedBackgroundsToCompositionEditor() {
        if (!this.currentAsset || !this.currentAsset.isPaired) {
            alert("No paired backgrounds selected");
            return;
        }

        if (!window.compositionEditor) {
            console.error("Composition editor not initialized");
            return;
        }

        const groundAsset = this.currentAsset.asset;
        const parallaxeAsset = this.currentAsset.pairedAsset;
        const groundName = this.currentAsset.name;
        const parallaxeName = this.currentAsset.pairedName;
        const category = this.currentAsset.category;

        const groundData = {
            name: groundName,
            type: "background",
            assetRef: `gallery:${category}/${groundName}`,
            blobUrl: groundAsset.url,
            x: 0,
            y: 0,
            isGroundLayer: true,
        };
        window.compositionEditor.addLayer(groundData);

        const parallaxeData = {
            name: parallaxeName,
            type: "background",
            assetRef: `gallery:${category}/${parallaxeName}`,
            blobUrl: parallaxeAsset.url,
            x: 0,
            y: 0,
            isParallaxLayer: true,
        };
        window.compositionEditor.addLayer(parallaxeData);

        this.flashSuccessOnButton();

        if (window.compositionEditor.autoOpen === true && !window.compositionEditor.isOpen) {
            window.compositionEditor.open();
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
        return new Promise(async (resolve, reject) => {
            const img = new Image();

            // Extract sprites (no caching)
            img.onload = async () => {
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

                        const spriteIndex = row * cols + col;
                        extractedSprites.push({
                            canvas: canvas,
                            index: spriteIndex,
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

    async previewSpriteSheet(asset, name, category, contentDiv, controlsDiv, spriteInfo) {
        this.updateCropButtonInPreviewTitle(false);

        // Generate unique ID for this extraction to handle race conditions
        const extractionId = ++this.currentSpriteExtractionId;

        const img = new Image();
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = asset.url;
        });

        // Check if this extraction is still current
        if (extractionId !== this.currentSpriteExtractionId) {
            return; // User switched to another sprite sheet, abort
        }

        // Check if user navigated away from this asset
        if (!this.currentAsset || this.currentAsset.name !== name || this.currentAsset.category !== category) {
            return; // User navigated to different asset/category, abort
        }

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

        const titleBar = document.querySelector(".preview-title-bar");
        if (titleBar) {
            const cropBoxContainer = titleBar.querySelector("#previewCropBoxContainer");
            if (asset.variants !== null && asset.variants.length > 0) {
                const selectId = `variantSelect-${Math.random().toString(36).slice(2)}`;
                titleBar.innerHTML = `Preview<span id="previewCropBoxContainer">${cropBoxContainer ? cropBoxContainer.innerHTML : ""}</span>
                    <span style="display: flex; flex-direction: row; align-items: center; gap: 0.5vmax; margin-left: 1vmax;">
                        <span class="sprite-sheet-preview-info-title" style="margin: 0;">Sprite Sheet:</span>
                        <select id="${selectId}" class="preview-control-input inline compact" style="margin: 0;">
                            ${asset.variants
                                .map(
                                    (v, idx) =>
                                        `<option value="${idx}" ${v.rows === rows && v.cols === cols ? "selected" : ""}>
                                            ${v.rows}x${v.cols}
                                        </option>`,
                                )
                                .join("")}
                        </select>
                    </span>`;
            } else {
                titleBar.innerHTML = `Preview<span id="previewCropBoxContainer">${cropBoxContainer ? cropBoxContainer.innerHTML : ""}</span>
                    <span class="sprite-sheet-preview-info-title" style="margin: 0; margin-left: 1vmax;">Sprite Sheet: ${cols}x${rows}</span>`;
            }
        }

        contentDiv.innerHTML = `
            <div class="sprite-sheet-preview">
                <div style="display: flex; justify-content: center; align-items: center; padding: 60px;">
                    <div class="spinner" style="border: 4px solid rgba(255, 255, 255, 0.3); border-top: 4px solid #fff; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite;"></div>
                </div>
            </div>`;
        controlsDiv.innerHTML = "";

        if (asset.variants !== null && asset.variants.length > 0) {
            const select = titleBar ? titleBar.querySelector("select") : null;
            if (select) {
                select.addEventListener("change", (e) => {
                    const idx = parseInt(e.target.value, 10);
                    const variant = asset.variants[idx];
                    this.previewAsset(name, "System sprites", "images", variant);
                });
            }
        }

        // Extract sprites (no caching)
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
                        data[i] = 0;
                        data[i + 1] = 0;
                        data[i + 2] = 0;
                    }
                }
                ctx.putImageData(imageData, 0, 0);

                const spriteIndex = row * cols + col;
                this.extractedSprites.push({
                    canvas: canvas,
                    index: spriteIndex,
                    row: row,
                    col: col,
                });

                // Yield every 10 sprites
                if (this.extractedSprites.length % 10 === 0) {
                    await new Promise((resolve) => setTimeout(resolve, 0));
                    // Check if this extraction is still current after yielding
                    if (extractionId !== this.currentSpriteExtractionId) {
                        return; // User switched to another sprite sheet, abort
                    }
                    // Check if user navigated away
                    if (
                        !this.currentAsset ||
                        this.currentAsset.name !== name ||
                        this.currentAsset.category !== category
                    ) {
                        return; // User navigated away, abort
                    }
                }
            }
        }

        // Final check before updating UI
        if (extractionId !== this.currentSpriteExtractionId) {
            return; // User switched to another sprite sheet, abort
        }
        // Check if user navigated away
        if (!this.currentAsset || this.currentAsset.name !== name || this.currentAsset.category !== category) {
            return; // User navigated away, abort
        }

        contentDiv.innerHTML = `
            <div class="sprite-sheet-preview">
                <div class="sprite-grid" style="grid-template-columns: repeat(${cols}, 1fr);">
                    ${this.extractedSprites
                        .map(
                            (sprite, i) => `
                                <div class="sprite-cell-preview"
                                    data-index="${i}"
                                    title="${asset.name} #${i}"
                                    onclick="galleryManager.toggleSpriteSelection(${i}, event)">
                                    <canvas id="sprite-preview-${i}" width="${cellWidth}" height="${cellHeight}"></canvas>
                                </div>`,
                        )
                        .join("")}
                </div>
            </div>`;

        this.extractedSprites.forEach((sprite, i) => {
            const targetCanvas = document.getElementById(`sprite-preview-${i}`);
            if (targetCanvas) {
                const ctx = targetCanvas.getContext("2d", { willReadFrequently: this.willReadFrequently });
                ctx.drawImage(sprite.canvas, 0, 0);
            }
        });

        let titleWithoutSize, subtitle, subtitleOriginal;
        if (asset.externalUrl) {
            let titleName = this.formatAssetTitle(name, "images").split(" ");
            titleName.pop();
            titleWithoutSize = titleName.join(" ");
            subtitle = asset.externalUrl;
            subtitleOriginal = asset.externalUrl;
        } else {
            const friendlyName = this.getFriendlyName(name, asset.baseFileName);
            let titleName = this.formatAssetTitle(friendlyName, "images").split(" ");
            titleName.pop();
            titleWithoutSize = titleName.join(" ");
            const improved = this.improveSubtitle(asset.baseFileName);
            subtitle = improved.subtitle;
            subtitleOriginal = improved.original;
        }

        controlsDiv.style.display = "block";
        controlsDiv.innerHTML = `
                <div class="asset-image-preview-title-line"><div class="asset-filename-title">${titleWithoutSize}<div class="asset-filename-subtitle" title="${subtitleOriginal}">${subtitle}</div></div>
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
    }

    previewImage(asset, name, contentDiv, controlsDiv) {
        let showCroppedBox = asset.croppedUrl;
        const src = this.globalImageViewMode === "cropped" && asset.croppedUrl ? asset.croppedUrl : asset.url;
        contentDiv.innerHTML = `
        <div class="preview-image-container">
            <img src="${src}" alt="${name}" class="preview-image" id="previewMainImage">
        </div>`;

        const friendlyName = this.getFriendlyName(name, asset.baseFileName);
        const title = this.formatAssetTitle(friendlyName, "images");
        let subtitle, subtitleOriginal;
        if (asset.externalUrl) {
            subtitle = asset.externalUrl;
            subtitleOriginal = asset.externalUrl;
        } else {
            const improved = this.improveSubtitle(asset.baseFileName);
            subtitle = improved.subtitle;
            subtitleOriginal = improved.original;
        }

        controlsDiv.style.display = "block";
        controlsDiv.innerHTML = `
            <div class="asset-image-preview-title-line"><div class="asset-filename-title">${title}<div class="asset-filename-subtitle" title="${subtitleOriginal}">${subtitle}</div></div>
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
            <canvas id="audioWaveformCanvas" width="800" height="60" style="width: 100%; height: 50px; cursor: pointer; background: rgba(0,0,0,0.3); border-radius: 4px;"></canvas>
            <div class="audio-player-time">
            <span id="audioCurrentTime">0:00</span>
            <span id="audioDuration">0:00</span>
            </div>
            </div>
            </div>`;

        const curTimeEl = document.getElementById("audioCurrentTime");
        const durEl = document.getElementById("audioDuration");
        if (curTimeEl) curTimeEl.textContent = "0:00";
        if (durEl) durEl.textContent = "0:00";

        const waveformCanvas = document.getElementById("audioWaveformCanvas");
        this.currentWaveformCanvas = waveformCanvas;

        let isDragging = false;
        const handleSeek = (e) => {
            if (!this.currentAudio) return;
            const rect = waveformCanvas.getBoundingClientRect();
            const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            this.currentAudio.currentTime = percent * this.currentAudio.duration;
        };

        waveformCanvas.addEventListener("mousedown", (e) => {
            isDragging = true;
            handleSeek(e);
        });

        waveformCanvas.addEventListener("mousemove", (e) => {
            if (isDragging) {
                handleSeek(e);
            }
        });

        waveformCanvas.addEventListener("mouseup", () => {
            isDragging = false;
        });

        waveformCanvas.addEventListener("mouseleave", () => {
            isDragging = false;
        });

        const friendlyName = this.getFriendlyName(name, asset.baseFileName);
        const title = this.formatAssetTitle(friendlyName, "audio");
        let subtitle, subtitleOriginal;
        if (asset.externalUrl) {
            subtitle = asset.externalUrl;
            subtitleOriginal = asset.externalUrl;
        } else {
            const improved = this.improveSubtitle(asset.baseFileName);
            subtitle = improved.subtitle;
            subtitleOriginal = improved.original;
        }

        controlsDiv.style.display = "block";
        controlsDiv.innerHTML = `
            <div class="asset-filename-title">${title}<div class="asset-filename-subtitle" title="${subtitleOriginal}">${subtitle}</div></div>
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
            this.generateWaveform(asset.url, waveformCanvas);
        };
        this._onTimeUpdate = () => {
            if (sessionId !== this._audioSessionId) return;
            const pct = audio.duration && isFinite(audio.duration) ? (audio.currentTime / audio.duration) * 100 : 0;
            if (curTimeEl) curTimeEl.textContent = this.formatTime(audio.currentTime);
            this.updateWaveformProgress(waveformCanvas, pct);
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

    renderInteractiveJson(data, depth = 0, startCollapsed = false) {
        const maxDepth = 20;
        const largeArrayThreshold = 50;

        if (depth > maxDepth) {
            return '<span class="json-ellipsis">...</span>';
        }

        const bgIndex = depth % 3;
        const indent = "  ".repeat(depth);
        const shouldCollapse = startCollapsed && depth > 0;

        if (data === null) {
            return '<span class="json-null">null</span>';
        }
        if (typeof data === "boolean") {
            return `<span class="json-boolean">${data}</span>`;
        }
        if (typeof data === "number") {
            return `<span class="json-number">${data}</span>`;
        }
        if (typeof data === "string") {
            return `<span class="json-string">"${this.escapeHtml(data)}"</span>`;
        }

        if (Array.isArray(data)) {
            if (data.length === 0) {
                return '<span class="json-bracket">[]</span>';
            }

            const isLargeNumericArray =
                data.length > largeArrayThreshold &&
                data.every((item) => typeof item === "number" || typeof item === "string");

            const collapseId = "collapse-" + Math.random().toString(36).substr(2, 9);
            const arrayClass = isLargeNumericArray ? "json-array-large" : "json-array";

            const initiallyCollapsed = shouldCollapse || isLargeNumericArray;
            const btnIcon = initiallyCollapsed ? "▶" : "▼";
            const contentDisplay = initiallyCollapsed ? 'style="display:none;"' : "";

            let html = `<span class="json-collapsible ${arrayClass}" data-depth="${depth}" data-bg="${bgIndex}">`;
            html += `<span class="json-collapse-btn" onclick="galleryManager.toggleJsonCollapse('${collapseId}')">${btnIcon}</span>`;
            html += `<span class="json-bracket">[</span>`;

            if (isLargeNumericArray) {
                html += `<span class="json-array-collapsed" id="${collapseId}-collapsed" onclick="galleryManager.toggleJsonCollapse('${collapseId}')" ${initiallyCollapsed ? "" : 'style="display:none;"'}>${data.length} items...</span>`;
                html += `<span class="json-array-expanded" id="${collapseId}" ${contentDisplay}>`;
            } else {
                html += `<span class="json-content" id="${collapseId}" ${contentDisplay}>`;
            }

            data.forEach((item, index) => {
                html += "\n" + indent + "  ";
                html += this.renderInteractiveJson(item, depth + 1, startCollapsed);
                if (index < data.length - 1) html += '<span class="json-comma">,</span>';
            });

            html += "\n" + indent + "</span>";
            html += `<span class="json-bracket">]</span>`;
            html += "</span>";

            return html;
        }

        if (typeof data === "object") {
            const entries = Object.entries(data);
            if (entries.length === 0) {
                return '<span class="json-bracket">{}</span>';
            }

            const collapseId = "collapse-" + Math.random().toString(36).substr(2, 9);
            const btnIcon = shouldCollapse ? "▶" : "▼";
            const contentDisplay = shouldCollapse ? 'style="display:none;"' : "";

            let html = `<span class="json-collapsible json-object" data-depth="${depth}" data-bg="${bgIndex}">`;
            html += `<span class="json-collapse-btn" onclick="galleryManager.toggleJsonCollapse('${collapseId}')">${btnIcon}</span>`;
            html += `<span class="json-bracket">{</span>`;
            html += `<span class="json-content" id="${collapseId}" ${contentDisplay}>`;

            entries.forEach(([key, value], index) => {
                html += "\n" + indent + "  ";
                html += `<span class="json-key">"${this.escapeHtml(key)}"</span>: `;
                html += this.renderInteractiveJson(value, depth + 1, startCollapsed);
                if (index < entries.length - 1) html += '<span class="json-comma">,</span>';
            });

            html += "\n" + indent + "</span>";
            html += `<span class="json-bracket">}</span>`;
            html += "</span>";

            return html;
        }

        return String(data);
    }

    toggleJsonCollapse(collapseId) {
        const content = document.getElementById(collapseId);
        const collapsed = document.getElementById(collapseId + "-collapsed");
        const btn = content?.parentElement.querySelector(".json-collapse-btn");

        if (!content) return;

        const isHidden = content.style.display === "none";
        content.style.display = isHidden ? "" : "none";
        if (btn) btn.textContent = isHidden ? "▼" : "▶";
        if (collapsed) collapsed.style.display = isHidden ? "none" : "";
    }

    toggleLineMarker(lineNum) {
        const lineElem = document.querySelector(`.json-line-num[data-line="${lineNum}"]`);
        if (!lineElem) return;

        if (lineElem.classList.contains("marked")) {
            lineElem.classList.remove("marked");
        } else {
            lineElem.classList.add("marked");
        }
    }

    async previewData(asset, name, contentDiv, controlsDiv) {
        this.updateCropButtonInPreviewTitle(false);

        const isTxtFile = name.endsWith(".txt");

        contentDiv.innerHTML = `
            <div class="json-preview-container">
                <div class="json-preview-loading">
                    <div class="loading-spinner"></div>
                    <div>Loading ${isTxtFile ? "text" : "JSON"}...</div>
                </div>
            </div>
        `;

        const category = this.currentAsset?.category || "Data";

        const friendlyName = this.getFriendlyName(name, asset.baseFileName);
        const title = this.formatAssetTitle(friendlyName, category, "data");
        const improved = this.improveSubtitle(asset.baseFileName);
        const subtitle = improved.subtitle;
        const subtitleOriginal = improved.original;
        const isMaps = category === "Maps";

        if (isMaps) {
            controlsDiv.innerHTML = "";
            controlsDiv.style.display = "none";
        } else {
            controlsDiv.style.display = "block";
            controlsDiv.innerHTML = `
                <div class="asset-filename-title">${title}<div class="asset-filename-subtitle" title="${subtitleOriginal}">${subtitle}</div></div>
                <div class="preview-control-group-add-editor">
                    <div class="split-button disabled" id="dataOpenEditorChoiceButton">
                        <button class="btn main" disabled></button>
                        <button class="btn arrow" disabled>▼</button>
                        <div class="menu"></div>
                    </div>
                </div>`;
        }

        await new Promise((resolve) => setTimeout(resolve, 0));

        try {
            if (isTxtFile && asset.txtText) {
                const toolbarInfo = isMaps
                    ? `<span class="json-info"><strong>${title}</strong><br/><span style="font-size: 0.85em; opacity: 0.8;" title="${subtitleOriginal}">${subtitle}</span></span>`
                    : `<span class="json-info">Text File</span>`;

                contentDiv.innerHTML = `
                        <div class="json-preview-toolbar">
                            ${toolbarInfo}
                            <div class="json-toolbar-buttons">
                                <input type="text"
                                       id="txtSearchInput"
                                       placeholder="Search..."
                                       class="txt-search-input"
                                       oninput="galleryManager.searchTxtContent(this.value)"
                                       style="margin-right: 8px; padding: 4px 8px; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-color); color: var(--txt-color); font-size: 0.9em;">
                                <button class="json-tool-btn" onclick="galleryManager.prevTxtMatch()" title="Previous match" style="display: none;" id="txtPrevBtn">↑</button>
                                <button class="json-tool-btn" onclick="galleryManager.nextTxtMatch()" title="Next match" style="display: none;" id="txtNextBtn">↓</button>
                                <span id="txtMatchCount" style="margin: 0 8px; font-size: 0.85em; color: var(--txt-faded); display: none;"></span>
                                <button class="json-tool-btn" onclick="galleryManager.togglePreviewExpand()" title="Expand preview">⛶</button>
                            </div>
                        </div>
                    <div class="json-preview-container">

                        <div class="json-preview-content" id="txtPreviewContent">
                            <div class="txt-viewer-wrapper"></div>
                        </div>
                    </div>
                `;

                const wrapperDiv = contentDiv.querySelector(".txt-viewer-wrapper");
                this.currentTxtContent = asset.txtText;
                this.renderTxtContent(asset.txtText, wrapperDiv);
                return;
            }

            let jsonData = JSON.parse(asset.jsonText || "{}");

            if (isMaps) {
                await this.buildHashMaps();

                this.extractAudioProperties(jsonData);

                jsonData = this.replaceHashesInObject(jsonData);
            }

            const toolbarInfo = isMaps
                ? `<span class="json-info"><strong>${title}</strong><br/><span style="font-size: 0.85em; opacity: 0.8;" title="${subtitleOriginal}">${subtitle}</span></span>`
                : `<span class="json-info">${asset.isValid ? "Valid JSON" : "Invalid JSON"}</span>`;

            contentDiv.innerHTML = `
                <div class="json-preview-container">
                    <div class="json-preview-toolbar">
                        ${toolbarInfo}
                        <div class="json-toolbar-buttons">
                            <button class="json-tool-btn" onclick="galleryManager.prevJsonMatch()" title="Previous match (Shift+Enter)" id="jsonPrevBtn" style="display: none;">↑</button>
                            <button class="json-tool-btn" onclick="galleryManager.nextJsonMatch()" title="Next match (Enter)" id="jsonNextBtn" style="display: none;">↓</button>
                            <input type="text"
                                   id="jsonSearchInput"
                                   placeholder="Search..."
                                   class="json-search-input"
                                   oninput="galleryManager.searchJsonContent(this.value)"
                                   onkeydown="if(event.key==='Enter') galleryManager.nextJsonMatch()"
                                   style="padding: 0.5vmax 0.8vmax; font-family: Consolas, Monaco, 'Courier New', monospace; font-size: 0.85vmax; background: rgb(45, 45, 45); border: 1px solid rgb(62, 62, 62); border-radius: 4px; color: rgb(255, 255, 255); box-sizing: border-box; margin-right: 8px;">
                            <button class="json-tool-btn" onclick="galleryManager.togglePreviewExpand()" title="Expand preview">⛶</button>
                        </div>
                    </div>
                    <div class="json-viewer-wrapper" id="jsonViewerWrapper"></div>
                </div>
            `;

            const viewerWrapper = contentDiv.querySelector("#jsonViewerWrapper");
            const jsonViewer = document.createElement("andypf-json-viewer");

            jsonViewer.data = jsonData;
            jsonViewer.setAttribute("indent", "2");
            jsonViewer.setAttribute("expanded", "1");
            jsonViewer.setAttribute("theme", "tcoaal-dark");
            jsonViewer.setAttribute("show-data-types", "false");
            jsonViewer.setAttribute("show-toolbar", "true");
            jsonViewer.setAttribute("expand-icon-type", "square");
            jsonViewer.setAttribute("show-copy", "false");
            jsonViewer.setAttribute("show-size", "false");

            viewerWrapper.appendChild(jsonViewer);

            this.currentJsonViewer = jsonViewer;

            setTimeout(() => {
                if (jsonViewer.shadowRoot) {
                    const toolbar = jsonViewer.shadowRoot.querySelector(".toolbar");
                    if (toolbar) {
                        toolbar.style.display = "none";
                    }
                }
            }, 50);

            if (isMaps) {
                setTimeout(() => this.addAssetTooltips(jsonViewer), 500);
            }
        } catch (error) {
            console.error("Failed to render JSON:", error);
            contentDiv.innerHTML = `
                <div class="json-preview-container">
                    <div class="json-error">Error rendering JSON: ${error.message}</div>
                    <pre>${this.escapeHtml(asset.jsonText || "{}")}</pre>
                </div>
            `;
        }
    }

    escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }

    copyJsonToClipboard() {
        if (this.currentAsset && this.currentAsset.type === "data") {
            const jsonText = this.currentAsset.asset.jsonText;
            navigator.clipboard
                .writeText(jsonText)
                .then(() => {
                    //console.log("JSON copied to clipboard");
                })
                .catch((err) => {
                    //console.error("Failed to copy JSON:", err);
                });
        }
    }

    filterJsonLines() {
        const searchInput = document.getElementById("jsonSearchInput");
        if (!searchInput) return;

        const searchTerm = searchInput.value.toLowerCase();
        const codeElement = document.querySelector(".json-code-wrapper code");
        if (!codeElement) return;

        if (!searchTerm) {
            if (this.currentAsset && this.currentAsset.type === "data") {
                const jsonCode = this.currentAsset.asset.jsonText || "{}";
                const highlightedCode =
                    typeof Prism !== "undefined"
                        ? Prism.highlight(jsonCode, Prism.languages.javascript, "javascript")
                        : this.escapeHtml(jsonCode);
                codeElement.innerHTML = highlightedCode;
            }
            return;
        }

        const originalText = this.currentAsset.asset.jsonText || "{}";
        const highlightedCode =
            typeof Prism !== "undefined"
                ? Prism.highlight(originalText, Prism.languages.javascript, "javascript")
                : this.escapeHtml(originalText);

        const searchRegex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
        const highlighted = highlightedCode.replace(
            searchRegex,
            '<mark style="background-color: yellow; color: black;">$1</mark>',
        );

        codeElement.innerHTML = highlighted;
    }

    collapseAllJsonBlocks() {
        //console.log("Collapse all JSON blocks - not implemented yet");
    }

    expandAllJsonBlocks() {
        //console.log("Expand all JSON blocks - not implemented yet");
    }

    searchInJson() {
        const searchBox = document.getElementById("jsonSearchBox");
        if (searchBox) {
            searchBox.style.display = "flex";
            document.getElementById("jsonSearchInput")?.focus();
        }
    }

    closeJsonSearch() {
        const searchBox = document.getElementById("jsonSearchBox");
        if (searchBox) {
            searchBox.style.display = "none";
        }
    }

    togglePreviewExpand() {
        const previewPanel = document.getElementById("galleryPreviewPanel");
        if (!previewPanel) return;

        const isExpanded = previewPanel.classList.contains("expanded");

        const galleryMainContainer = document.querySelector(".gallery-main-container");
        const galleryEmbeddedContainer = document.querySelector(".gallery-embedded-container");
        const sectionContent = document.querySelector(".section-content.gallery-flex");

        if (isExpanded) {
            previewPanel.classList.remove("expanded");
            if (galleryMainContainer) galleryMainContainer.classList.remove("preview-expanded");
            if (galleryEmbeddedContainer) galleryEmbeddedContainer.classList.remove("preview-expanded");
            if (sectionContent) sectionContent.classList.remove("preview-expanded");

            const expandBtn = document.querySelector('.json-tool-btn[title="Collapse preview"]');
            if (expandBtn) {
                expandBtn.textContent = "⛶";
                expandBtn.title = "Expand preview";
            }
        } else {
            previewPanel.classList.add("expanded");
            if (galleryMainContainer) galleryMainContainer.classList.add("preview-expanded");
            if (galleryEmbeddedContainer) galleryEmbeddedContainer.classList.add("preview-expanded");
            if (sectionContent) sectionContent.classList.add("preview-expanded");

            const expandBtn = document.querySelector('.json-tool-btn[title="Expand preview"]');
            if (expandBtn) {
                expandBtn.textContent = "⛶";
                expandBtn.title = "Collapse preview";
            }
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

        if (type === "data" || category === "Data") {
            const mData = lower.match(/^data_(\d+)$/);
            if (mData) {
                return `Data #${mData[1]}`;
            }
        }

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

        const words = base.replace(/[_-]+/g, " ").split(" ").filter(Boolean);

        if (category === "Portraits") {
            if (words.length === 0) return "";
            const first = words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();
            const rest = words.slice(1).map((w) => w.toLowerCase());
            return [first, ...rest].join(" ");
        }

        return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
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

    toggleSpriteSelection(index, event = null) {
        if (event && event.shiftKey) {
            const previousSelection = [...this.selectedSprites];
            this.selectedSprites = [index];

            this.addSpriteToCompositionEditor(0, event);

            this.selectedSprites = previousSelection;
            return;
        }

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

    seekAudioFromWaveform(event) {
        if (!this.currentAudio) return;

        const canvas = event.currentTarget;
        const rect = canvas.getBoundingClientRect();
        const percent = (event.clientX - rect.left) / rect.width;

        this.currentAudio.currentTime = percent * this.currentAudio.duration;
    }

    async generateWaveform(audioUrl, canvas) {
        if (!canvas) return;

        try {
            const response = await fetch(audioUrl);
            const arrayBuffer = await response.arrayBuffer();

            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

            const rawData = audioBuffer.getChannelData(0);
            const samples = 800;
            const blockSize = Math.floor(rawData.length / samples);
            const filteredData = [];

            for (let i = 0; i < samples; i++) {
                const blockStart = blockSize * i;
                let sum = 0;
                for (let j = 0; j < blockSize; j++) {
                    sum += Math.abs(rawData[blockStart + j]);
                }
                filteredData.push(sum / blockSize);
            }

            const maxVal = Math.max(...filteredData);
            const normalizedData = filteredData.map((n) => n / maxVal);

            this.currentWaveformData = normalizedData;
            this.drawWaveform(canvas, normalizedData, 0);

            await audioContext.close();
        } catch (error) {
            console.error("Error generating waveform:", error);
        }
    }

    drawWaveform(canvas, data, progress = 0) {
        if (!canvas || !data) return;

        const ctx = canvas.getContext("2d");
        const width = canvas.width;
        const height = canvas.height;
        const middle = height / 2;

        ctx.clearRect(0, 0, width, height);

        const progressX = width * (progress / 100);
        const step = width / data.length;

        if (progress > 0) {
            ctx.fillStyle = Color.PURPLE;
            ctx.beginPath();
            ctx.moveTo(0, middle);

            for (let i = 0; i < data.length; i++) {
                const x = i * step;
                if (x > progressX) break;
                const amplitude = data[i] * (height * 0.4);
                ctx.lineTo(x, middle - amplitude);
            }

            for (let i = Math.floor(progressX / step); i >= 0; i--) {
                const x = i * step;
                const amplitude = data[i] * (height * 0.4);
                ctx.lineTo(x, middle + amplitude);
            }

            ctx.closePath();
            ctx.fill();
        }

        if (progress < 100) {
            ctx.fillStyle = Color.GREEN;
            ctx.beginPath();
            const startIdx = Math.floor(progressX / step);
            ctx.moveTo(progressX, middle);

            for (let i = startIdx; i < data.length; i++) {
                const x = i * step;
                const amplitude = data[i] * (height * 0.4);
                ctx.lineTo(x, middle - amplitude);
            }

            for (let i = data.length - 1; i >= startIdx; i--) {
                const x = i * step;
                const amplitude = data[i] * (height * 0.4);
                ctx.lineTo(x, middle + amplitude);
            }

            ctx.closePath();
            ctx.fill();
        }

        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, middle);

        for (let i = 0; i < data.length; i++) {
            const x = i * step;
            const amplitude = data[i] * (height * 0.4);
            ctx.lineTo(x, middle - amplitude);
        }
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, middle);
        for (let i = 0; i < data.length; i++) {
            const x = i * step;
            const amplitude = data[i] * (height * 0.4);
            ctx.lineTo(x, middle + amplitude);
        }
        ctx.stroke();

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(progressX, 0);
        ctx.lineTo(progressX, height);
        ctx.stroke();
    }

    updateWaveformProgress(canvas, progressPercent) {
        if (!canvas || !this.currentWaveformData) return;
        this.drawWaveform(canvas, this.currentWaveformData, progressPercent);
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

        this.stopAllAudio();

        this.selectedSprites = [];
        this.extractedSprites = [];
        this.spriteSheetData = null;

        const previewPanel = document.getElementById("galleryPreviewPanel");
        if (previewPanel) {
            previewPanel.classList.remove("expanded");
        }

        const galleryMainContainer = document.querySelector(".gallery-main-container");
        const galleryEmbeddedContainer = document.querySelector(".gallery-embedded-container");
        const sectionContent = document.querySelector(".section-content.gallery-flex");
        if (galleryMainContainer) galleryMainContainer.classList.remove("preview-expanded");
        if (galleryEmbeddedContainer) galleryEmbeddedContainer.classList.remove("preview-expanded");
        if (sectionContent) sectionContent.classList.remove("preview-expanded");

        document.getElementById("previewPanelContent").innerHTML =
            '<div class="preview-placeholder">Select an item to preview</div>';
        document.getElementById("previewControls").innerHTML = "";
        document.getElementById("previewDownloadBtn").classList.remove("active");
    }

    downloadAsset() {
        if (!this.currentAsset) return;

        if (this.currentAsset.isPaired) {
            const groundAsset = this.currentAsset.asset;
            const parallaxeAsset = this.currentAsset.pairedAsset;
            const groundName = this.currentAsset.name;
            const parallaxeName = this.currentAsset.pairedName;

            const a1 = document.createElement("a");
            a1.href =
                groundAsset.croppedUrl && this.globalImageViewMode === "cropped"
                    ? groundAsset.croppedUrl
                    : groundAsset.url;
            a1.download = groundName;
            a1.click();

            setTimeout(() => {
                const a2 = document.createElement("a");
                a2.href =
                    parallaxeAsset.croppedUrl && this.globalImageViewMode === "cropped"
                        ? parallaxeAsset.croppedUrl
                        : parallaxeAsset.url;
                a2.download = parallaxeName;
                a2.click();
            }, 100);
            return;
        }

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
            (el) =>
                el.style.display !== "none" &&
                !el.classList.contains("external-add-btn") &&
                !el.classList.contains("external-add-btn-audio"),
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

                        const thumbImg = document.querySelector(
                            `.gallery-item[data-filename="${name}"] img:not(.gallery-item-fav-star)`,
                        );
                        if (thumbImg) {
                            thumbImg.src = asset.croppedUrl;
                        }
                        if (
                            this.currentAsset &&
                            this.currentAsset.name === name &&
                            this.currentAsset.category === category
                        ) {
                            const contentDiv = document.getElementById("previewPanelContent");
                            const controlsDiv = document.getElementById("previewControls");
                            if (contentDiv && controlsDiv) {
                                this.previewImage(asset, name, contentDiv, controlsDiv);
                            }
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
                // Handle keyframed layers
                if (layerDesc.hasKeyframes && layerDesc.keyframes) {
                    const reconstructedKeyframes = [];

                    for (const kfDesc of layerDesc.keyframes) {
                        let kfAsset = null;
                        let kfBlobUrl = null;
                        let kfImage = null;
                        let kfImageLoaded = false;
                        let kfSpriteCanvases = null;

                        if (kfDesc.galleryRef) {
                            // Handle External assets with URL suffix: gallery:External/name:URL
                            let kfMatch = kfDesc.galleryRef.match(/^gallery:External\/([^:]+):(.+)$/);
                            let kfCategory, kfName, kfUrl;
                            if (kfMatch) {
                                kfCategory = "External";
                                kfName = kfMatch[1];
                                kfUrl = kfMatch[2];
                            } else {
                                // Regular gallery reference: gallery:category/name
                                kfMatch = kfDesc.galleryRef.match(/^gallery:([^/]+)\/(.+)$/);
                                if (kfMatch) {
                                    [, kfCategory, kfName] = kfMatch;
                                }
                            }
                            if (kfMatch) {
                                kfAsset = window.gameImporterAssets.images[kfCategory]?.[kfName];

                                // If External asset doesn't exist but URL is provided, fetch it
                                if (!kfAsset && kfUrl) {
                                    try {
                                        //console.log(
                                        //    `Fetching missing External keyframe asset for compositor: ${kfName}`,
                                        //);
                                        const response = await fetch(kfUrl);
                                        if (!response.ok) {
                                            throw new Error(`HTTP ${response.status}`);
                                        }
                                        const blob = await response.blob();
                                        const blobUrl = URL.createObjectURL(blob);

                                        if (!window.gameImporterAssets.images.External) {
                                            window.gameImporterAssets.images.External = {};
                                        }

                                        const isSprite = kfDesc.type === "sprite" && kfDesc.spriteVariant;
                                        const spriteVariant = isSprite ? kfDesc.spriteVariant : null;

                                        kfAsset = {
                                            name: kfName,
                                            url: blobUrl,
                                            blob: blob,
                                            category: "External",
                                            type: "image",
                                            originalPath: "External",
                                            cropped: false,
                                            isSprite: isSprite,
                                            variants: spriteVariant ? [spriteVariant] : null,
                                        };
                                        window.gameImporterAssets.images.External[kfName] = kfAsset;

                                        if (window.memoryManager) {
                                            try {
                                                await window.memoryManager.saveExternalAsset(
                                                    kfUrl,
                                                    kfName,
                                                    "images",
                                                    isSprite,
                                                    spriteVariant,
                                                    blob,
                                                );
                                            } catch (error) {
                                                console.error(
                                                    `Failed to save External keyframe asset: ${kfName}`,
                                                    error,
                                                );
                                            }
                                        }
                                        //console.log(
                                        //    `Successfully fetched External keyframe asset for compositor: ${kfName}`,
                                        //);
                                    } catch (error) {
                                        console.error(
                                            `Failed to fetch External keyframe asset ${kfName} from ${kfUrl}:`,
                                            error,
                                        );
                                    }
                                }

                                if (kfAsset) {
                                    kfBlobUrl = kfAsset.url;

                                    if (kfDesc.type === "sprite" && kfAsset.isSprite) {
                                        try {
                                            const extractedSprites = await this.extractSpritesFromAsset(
                                                kfAsset,
                                                kfName,
                                                kfDesc.spriteVariant,
                                            );
                                            // Extract all sprites from the sheet
                                            const allCanvases = extractedSprites.map((s) => s.canvas);

                                            if (kfDesc.spriteIndices && Array.isArray(kfDesc.spriteIndices)) {
                                                // Map the selected sprite canvases only
                                                kfSpriteCanvases = kfDesc.spriteIndices
                                                    .map((idx) => allCanvases[idx])
                                                    .filter((c) => c);
                                            } else {
                                                kfSpriteCanvases = allCanvases;
                                            }
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

                        // Preserve original sprite indices for display purposes (spriteCanvases is indexed 0,1,2...)
                        const preservedSpriteIndices = kfDesc.spriteIndices || null;

                        reconstructedKeyframes.push({
                            id: window.compositionEditor.generateId(),
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
                            spriteIndices: preservedSpriteIndices,
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

                    const layerId = window.compositionEditor.addLayer(layerData);

                    const addedLayer = window.compositionEditor.layers.find((l) => l.id === layerId);
                    if (addedLayer) {
                        addedLayer.visible = layerDesc.visible;
                    }
                } else {
                    // Handle non-keyframed layers
                    const galleryRef = layerDesc.galleryRef;
                    if (!galleryRef) continue;

                    // Handle External assets with URL suffix: gallery:External/name:URL
                    let match = galleryRef.match(/^gallery:External\/([^:]+):(.+)$/);
                    let srcCategory, srcName, srcUrl;
                    if (match) {
                        srcCategory = "External";
                        srcName = match[1];
                        srcUrl = match[2];
                    } else {
                        // Regular gallery reference: gallery:category/name
                        match = galleryRef.match(/^gallery:([^/]+)\/(.+)$/);
                        if (match) {
                            [, srcCategory, srcName] = match;
                        }
                    }

                    if (!match) continue;
                    let srcAsset = window.gameImporterAssets.images[srcCategory]?.[srcName];

                    // If External asset doesn't exist but URL is provided, fetch it
                    if (!srcAsset && srcUrl) {
                        try {
                            //console.log(`Fetching missing External asset for compositor: ${srcName}`);
                            const response = await fetch(srcUrl);
                            if (!response.ok) {
                                throw new Error(`HTTP ${response.status}`);
                            }
                            const blob = await response.blob();
                            const blobUrl = URL.createObjectURL(blob);

                            if (!window.gameImporterAssets.images.External) {
                                window.gameImporterAssets.images.External = {};
                            }

                            const isSprite = layerDesc.type === "sprite" && layerDesc.spriteVariant;
                            const spriteVariant = isSprite ? layerDesc.spriteVariant : null;

                            srcAsset = {
                                name: srcName,
                                url: blobUrl,
                                blob: blob,
                                category: "External",
                                type: "image",
                                originalPath: "External",
                                cropped: false,
                                isSprite: isSprite,
                                variants: spriteVariant ? [spriteVariant] : null,
                            };
                            window.gameImporterAssets.images.External[srcName] = srcAsset;

                            if (window.memoryManager) {
                                try {
                                    await window.memoryManager.saveExternalAsset(
                                        srcUrl,
                                        srcName,
                                        "images",
                                        isSprite,
                                        spriteVariant,
                                        blob,
                                    );
                                } catch (error) {
                                    console.error(`Failed to save External asset: ${srcName}`, error);
                                }
                            }
                            //console.log(`Successfully fetched External asset for compositor: ${srcName}`);
                        } catch (error) {
                            console.error(`Failed to fetch External asset ${srcName} from ${srcUrl}:`, error);
                        }
                    }

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
                            assetData.animationSpeed = layerDesc.animationSpeed;

                            // Extract all sprites from the sheet
                            const allCanvases = extractedSprites.map((s) => s.canvas);

                            if (layerDesc.spriteIndices && Array.isArray(layerDesc.spriteIndices)) {
                                // Map the selected sprite canvases (spriteCanvases array is indexed 0,1,2...)
                                assetData.spriteCanvases = layerDesc.spriteIndices
                                    .map((idx) => allCanvases[idx])
                                    .filter((c) => c);
                                // Preserve original sprite indices for display purposes
                                assetData.spriteIndices = layerDesc.spriteIndices;
                            } else {
                                assetData.spriteCanvases = allCanvases;
                                assetData.spriteIndices = allCanvases.map((_, i) => i);
                            }
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
            }
        } else {
            let assetType = "background";
            if (category === "Portraits") {
                assetType = "portrait";
            }

            let assetRef = `gallery:${category}/${name}`;
            if (category === "External" && asset.externalUrl) {
                assetRef = `gallery:External/${name}:${asset.externalUrl}`;
            }

            const assetData = {
                name: name,
                type: assetType,
                assetRef: assetRef,
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

    addSpriteToCompositionEditor(mode, event) {
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

        // Include URL suffix for External assets
        let assetRef = `gallery:${category}/${name}`;
        if (category === "External") {
            const asset = window.gameImporterAssets.images[category]?.[name];
            if (asset && asset.externalUrl) {
                assetRef = `gallery:External/${name}:${asset.externalUrl}`;
            }
        }

        const assetData = {
            name: name,
            type: "sprite",
            assetRef: assetRef,
            blobUrl: null,
            x: 0,
            y: 0,
            width: firstSprite.canvas.width,
            height: firstSprite.canvas.height,
            isAnimated: isAnimated,
            spriteIndices: [...this.selectedSprites],
            animationSpeed: animationSpeed,
            spriteCanvases: this.selectedSprites.map((i) => this.extractedSprites[i].canvas),
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

        if (!event || !event.shiftKey) {
            this.clearSpriteSelection();
        }
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

    renderTxtContent(txtContent, containerElement, searchTerm = "") {
        const lines = txtContent.split("\n");
        let html =
            '<div class="txt-viewer-lines" style="font-family: monospace; font-size: 0.9em; line-height: 1.6; padding: 0; margin: 0;">';

        lines.forEach((line, index) => {
            const lineNum = index + 1;
            let highlightedLine = this.highlightIniSyntax(line);

            if (searchTerm) {
                highlightedLine = this.highlightSearchTerm(highlightedLine, searchTerm);
            }

            html += `
                <div class="txt-line" style="display: flex; border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <span class="txt-line-num" style="min-width: 50px; padding: 4px 12px; text-align: right; color: var(--txt-faded); background: rgba(0,0,0,0.2); user-select: none; border-right: 1px solid rgba(255,255,255,0.1);">${lineNum}</span>
                    <span class="txt-line-content" style="padding: 4px 12px; flex: 1; white-space: pre-wrap; word-wrap: break-word;">${highlightedLine || "&nbsp;"}</span>
                </div>
            `;
        });

        html += "</div>";
        containerElement.innerHTML = html;
    }

    highlightIniSyntax(line) {
        const escaped = this.escapeHtml(line);

        if (/^\s*[#;]/.test(line) || /^\s*\/\//.test(line)) {
            return `<span style="color: var(--green); opacity: 0.7;">${escaped}</span>`;
        }

        if (/^\s*\[.*\]\s*$/.test(line)) {
            return `<span style="color: var(--purple); font-weight: bold;">${escaped}</span>`;
        }

        const kvMatch = line.match(/^(\s*)([^=:]+?)\s*([:=])\s*(.*)$/);
        if (kvMatch) {
            const indent = kvMatch[1];
            const key = kvMatch[2];
            const separator = kvMatch[3];
            const value = kvMatch[4];

            return `${this.escapeHtml(indent)}<span style="color: var(--blue);">${this.escapeHtml(key)}</span><span style="color: var(--txt-faded);">${this.escapeHtml(separator)}</span> <span style="color: var(--yellow);">${this.escapeHtml(value)}</span>`;
        }

        return escaped;
    }

    highlightSearchTerm(html, searchTerm) {
        if (!searchTerm || searchTerm.trim() === "") return html;

        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = html;

        const textContent = tempDiv.textContent || "";
        const lowerText = textContent.toLowerCase();
        const lowerSearch = searchTerm.toLowerCase();

        if (lowerText.includes(lowerSearch)) {
            const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
            const highlighted = html.replace(
                regex,
                '<mark style="background: var(--yellow); color: var(--bg-color); padding: 2px 4px; border-radius: 2px; font-weight: bold;">$1</mark>',
            );
            return highlighted;
        }

        return html;
    }

    searchTxtContent(searchTerm) {
        if (!this.currentTxtContent) return;

        const wrapperDiv = document.querySelector(".txt-viewer-wrapper");
        if (!wrapperDiv) return;

        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        this.searchTimeout = setTimeout(() => {
            this.currentTxtSearchTerm = searchTerm;
            this.currentTxtMatchIndex = 0;
            this.renderTxtContentAsync(this.currentTxtContent, wrapperDiv, searchTerm);
        }, 150);
    }

    renderTxtContentAsync(txtContent, containerElement, searchTerm = "") {
        const lines = txtContent.split("\n");
        this.txtSearchMatches = [];

        containerElement.innerHTML =
            '<div style="padding: 20px; text-align: center; color: var(--txt-faded);">Rendering...</div>';

        const chunkSize = 100;
        let currentChunk = 0;

        const renderChunk = () => {
            const start = currentChunk * chunkSize;
            const end = Math.min(start + chunkSize, lines.length);

            if (currentChunk === 0) {
                containerElement.innerHTML =
                    '<div class="txt-viewer-lines" style="font-family: monospace; font-size: 0.9em; line-height: 1.6; padding: 0; margin: 0;"></div>';
            }

            const linesContainer = containerElement.querySelector(".txt-viewer-lines");
            let html = "";

            for (let i = start; i < end; i++) {
                const lineNum = i + 1;
                let highlightedLine = this.highlightIniSyntax(lines[i]);

                if (searchTerm && lines[i].toLowerCase().includes(searchTerm.toLowerCase())) {
                    this.txtSearchMatches.push(lineNum);
                    highlightedLine = this.highlightSearchTerm(highlightedLine, searchTerm);
                }

                html += `
                    <div class="txt-line" id="txt-line-${lineNum}" style="display: flex; border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <span class="txt-line-num" style="min-width: 50px; padding: 4px 12px; text-align: right; color: var(--txt-faded); background: rgba(0,0,0,0.2); user-select: none; border-right: 1px solid rgba(255,255,255,0.1);">${lineNum}</span>
                        <span class="txt-line-content" style="padding: 4px 12px; flex: 1; white-space: pre-wrap; word-wrap: break-word;">${highlightedLine || "&nbsp;"}</span>
                    </div>
                `;
            }

            linesContainer.innerHTML += html;

            currentChunk++;

            if (end < lines.length) {
                requestAnimationFrame(renderChunk);
            } else {
                this.updateTxtSearchUI();
                if (this.txtSearchMatches.length > 0) {
                    this.scrollToTxtMatch(0);
                }
            }
        };

        renderChunk();
    }

    updateTxtSearchUI() {
        const prevBtn = document.getElementById("txtPrevBtn");
        const nextBtn = document.getElementById("txtNextBtn");
        const countSpan = document.getElementById("txtMatchCount");

        if (this.txtSearchMatches && this.txtSearchMatches.length > 0) {
            if (prevBtn) prevBtn.style.display = "inline-block";
            if (nextBtn) nextBtn.style.display = "inline-block";
            if (countSpan) {
                countSpan.style.display = "inline";
                countSpan.textContent = `${this.currentTxtMatchIndex + 1}/${this.txtSearchMatches.length}`;
            }
        } else {
            if (prevBtn) prevBtn.style.display = "none";
            if (nextBtn) nextBtn.style.display = "none";
            if (countSpan) countSpan.style.display = "none";
        }
    }

    scrollToTxtMatch(index) {
        if (!this.txtSearchMatches || this.txtSearchMatches.length === 0) return;

        this.currentTxtMatchIndex = index;
        const lineNum = this.txtSearchMatches[index];

        const lineNumbers = document.querySelectorAll(".line-number");
        let lineElement = null;

        for (const span of lineNumbers) {
            if (span.textContent.trim() === String(lineNum)) {
                lineElement = span.parentElement;
                break;
            }
        }

        if (lineElement) {
            const viewerWrapper = document.getElementById("jsonViewerWrapper");

            if (viewerWrapper) {
                const lineRect = lineElement.getBoundingClientRect();
                const wrapperRect = viewerWrapper.getBoundingClientRect();
                const scrollOffset = lineRect.top - wrapperRect.top - wrapperRect.height / 2 + lineRect.height / 2;

                viewerWrapper.scrollTop += scrollOffset;
            }

            lineElement.style.backgroundColor = "rgba(255, 255, 0, 0.1)";
            setTimeout(() => {
                lineElement.style.backgroundColor = "";
            }, 1000);
        } else {
            console.warn("Could not find line element for line number", lineNum);
        }

        this.updateTxtSearchUI();
    }

    nextTxtMatch() {
        if (!this.txtSearchMatches || this.txtSearchMatches.length === 0) return;
        const nextIndex = (this.currentTxtMatchIndex + 1) % this.txtSearchMatches.length;
        this.scrollToTxtMatch(nextIndex);
    }

    prevTxtMatch() {
        if (!this.txtSearchMatches || this.txtSearchMatches.length === 0) return;
        const prevIndex =
            this.currentTxtMatchIndex === 0 ? this.txtSearchMatches.length - 1 : this.currentTxtMatchIndex - 1;
        this.scrollToTxtMatch(prevIndex);
    }

    async buildHashMaps() {
        if (this.labelHashMap && this.assetHashMap) return;

        this.labelHashMap = {};
        this.assetHashMap = {};

        if (window.gameImporterAssets && window.gameImporterAssets.data && window.gameImporterAssets.data["Labels"]) {
            const labelsCategory = window.gameImporterAssets.data["Labels"];

            for (const labelFile in labelsCategory) {
                const labelAsset = labelsCategory[labelFile];
                if (labelAsset.jsonText) {
                    try {
                        const labelData = JSON.parse(labelAsset.jsonText);
                        for (const tableKey in labelData) {
                            const table = labelData[tableKey];
                            if (typeof table === "object") {
                                for (const hash in table) {
                                    if (hash.length === 8) {
                                        const value = table[hash];
                                        let text = "";
                                        if (Array.isArray(value)) {
                                            text = value.join("\\n");
                                        } else if (typeof value === "string") {
                                            text = value;
                                        }
                                        this.labelHashMap[hash] = text;
                                    }
                                }
                            }
                        }
                    } catch (e) {
                        console.warn("Failed to parse label file:", labelFile, e);
                    }
                }
            }
        }

        if (window.gameImporterAssets) {
            if (window.gameImporterAssets.images) {
                for (const category in window.gameImporterAssets.images) {
                    const assets = window.gameImporterAssets.images[category];
                    for (const assetName in assets) {
                        const asset = assets[assetName];

                        let hash = null;
                        if (asset.originalName) {
                            hash = this.extractHashFromFilename(asset.originalName);
                        }
                        if (!hash && asset.baseFileName) {
                            hash = this.extractHashFromPath(asset.baseFileName);
                        }
                        if (hash) {
                            this.assetHashMap[hash] = {
                                type: "image",
                                url: asset.croppedUrl || asset.url,
                                path: asset.baseFileName,
                                name: assetName,
                                category: category,
                            };
                        }
                    }
                }
            }

            if (window.gameImporterAssets.audio) {
                for (const category in window.gameImporterAssets.audio) {
                    const assets = window.gameImporterAssets.audio[category];
                    for (const assetName in assets) {
                        const asset = assets[assetName];

                        let hash = null;
                        if (asset.originalName) {
                            hash = this.extractHashFromFilename(asset.originalName);
                        }
                        if (!hash && asset.baseFileName) {
                            hash = this.extractHashFromPath(asset.baseFileName);
                        }
                        if (hash) {
                            this.assetHashMap[hash] = {
                                type: "audio",
                                url: asset.url,
                                blob: asset.blob,
                                path: asset.baseFileName,
                                name: assetName,
                                category: category,
                            };
                        }
                    }
                }
            }
        }

        const sampleHashes = Object.keys(this.assetHashMap).slice(0, 10);
    }

    extractHashFromFilename(filename) {
        if (!filename) return null;

        const match1 = filename.match(/^!?([a-f0-9]{16,})(?:\.[a-z0-9]+)?$/i);
        if (match1) return match1[1].toLowerCase();

        const match2 = filename.match(/!?([a-f0-9]{16,})/i);
        if (match2) return match2[1].toLowerCase();

        return null;
    }

    extractHashFromPath(path) {
        if (!path) return null;

        const match = path.match(/\/!?([a-f0-9]{16,})\./i);
        if (match) return match[1].toLowerCase();

        const match2 = path.match(/\/!?([a-f0-9]{16,})$/i);
        if (match2) return match2[1].toLowerCase();

        const match3 = path.match(/!?([a-f0-9]{16,})/i);
        if (match3) return match3[1].toLowerCase();

        return null;
    }

    extractAudioProperties(obj) {
        if (!this.audioPropertiesMap) {
            this.audioPropertiesMap = {};
        }

        const initialCount = Object.keys(this.audioPropertiesMap).length;

        const processNode = (node) => {
            if (Array.isArray(node)) {
                node.forEach((item) => processNode(item));
            } else if (node !== null && typeof node === "object") {
                if (node.name && typeof node.name === "string") {
                    const hashMatch = node.name.match(/!?([a-f0-9]{16,})(?:\.[a-z0-9]+)?/i);
                    if (hashMatch) {
                        const hash = hashMatch[1].toLowerCase();
                        const asset = this.assetHashMap[hash];

                        if (asset && asset.type === "audio") {
                            const properties = {};
                            if (node.volume !== undefined) properties.volume = node.volume;
                            if (node.pitch !== undefined) properties.pitch = node.pitch;
                            if (node.pan !== undefined) properties.pan = node.pan;

                            if (Object.keys(properties).length > 0) {
                                this.audioPropertiesMap[hash] = properties;
                            }
                        }
                    }
                }

                for (const key in node) {
                    processNode(node[key]);
                }
            }
        };

        processNode(obj);

        const newCount = Object.keys(this.audioPropertiesMap).length;
        if (newCount > initialCount) {
        }
    }

    replaceHashesInObject(obj, parentKey = null, parentObj = null) {
        if (typeof obj === "string") {
            return this.replaceHashesInString(obj, parentKey, parentObj);
        } else if (Array.isArray(obj)) {
            return obj.map((item) => this.replaceHashesInObject(item));
        } else if (obj !== null && typeof obj === "object") {
            const newObj = {};
            for (const key in obj) {
                newObj[key] = this.replaceHashesInObject(obj[key], key, obj);
            }
            return newObj;
        }
        return obj;
    }

    replaceHashesInString(str, parentKey = null, parentObj = null) {
        const originalStr = str;

        const replacements = [];

        str = str.replace(/\b([a-zA-Z0-9]{8})\b/g, (match, hash, offset) => {
            if (this.labelHashMap[hash]) {
                const replacement = this.labelHashMap[hash];
                replacements.push({
                    hash,
                    replacement,
                    position: offset,
                    context: originalStr.substring(
                        Math.max(0, offset - 20),
                        Math.min(originalStr.length, offset + match.length + 20),
                    ),
                });
                return replacement;
            }
            return match;
        });

        return str;
    }

    searchJsonContent(searchTerm) {
        if (!this.currentJsonViewer) return;

        const prevBtn = document.getElementById("jsonPrevBtn");
        const nextBtn = document.getElementById("jsonNextBtn");

        if (searchTerm && searchTerm.trim()) {
            if (prevBtn) prevBtn.style.display = "inline-block";
            if (nextBtn) nextBtn.style.display = "inline-block";
        } else {
            if (prevBtn) prevBtn.style.display = "none";
            if (nextBtn) nextBtn.style.display = "none";
        }

        setTimeout(() => {
            const shadowRoot = this.currentJsonViewer.shadowRoot;
            if (!shadowRoot) {
                console.warn("Shadow root not available");
                return;
            }

            const previousMatches = shadowRoot.querySelectorAll(".data-row.match");
            previousMatches.forEach((row) => {
                row.classList.remove("match", "current");
                row.style.backgroundColor = "";
            });

            if (!searchTerm || !searchTerm.trim()) {
                return;
            }

            const allRows = shadowRoot.querySelectorAll(".data-row");
            const searchLower = searchTerm.toLowerCase();

            allRows.forEach((row) => {
                const keyValueWrapper = row.querySelector(":scope > .key-value-wrapper");
                if (!keyValueWrapper) return;

                let rowOwnText = "";
                const key = keyValueWrapper.querySelector(".key");
                const value = keyValueWrapper.querySelector(".value");

                if (key) {
                    rowOwnText += key.textContent;
                }
                if (value) {
                    const valueClone = value.cloneNode(true);
                    const nestedRows = valueClone.querySelectorAll(".data-row");
                    nestedRows.forEach((nested) => nested.remove());
                    rowOwnText += valueClone.textContent;
                }

                if (rowOwnText.toLowerCase().includes(searchLower)) {
                    row.classList.add("match");
                    row.style.backgroundColor = "rgba(255, 255, 0, 0.2)";

                    this.expandJsonParentRows(row);
                }
            });

            const matches = shadowRoot.querySelectorAll(".data-row.match");
            if (matches.length > 0) {
                setTimeout(() => {
                    this.scrollToFirstJsonMatch(shadowRoot);
                }, 50);
            }
        }, 100);
    }

    expandJsonParentRows(row) {
        let currentElement = row.parentElement;

        while (currentElement) {
            if (currentElement.classList && currentElement.classList.contains("data-row")) {
                currentElement.classList.add("expanded");
            }
            currentElement = currentElement.parentElement;
        }
    }

    scrollToFirstJsonMatch(shadowRoot) {
        if (!shadowRoot) return;

        const matches = shadowRoot.querySelectorAll(".data-row.match");

        if (matches.length === 0) {
            console.warn("Could not find any match elements");
            return;
        }

        matches.forEach((match) => {
            match.classList.remove("current");
            match.style.backgroundColor = "rgba(255, 255, 0, 0.2)";
        });

        const firstMatch = matches[0];
        firstMatch.classList.add("current");
        firstMatch.style.backgroundColor = "rgba(255, 255, 0, 0.4)";

        this.expandJsonParentRows(firstMatch);

        this.scrollToJsonMatch(firstMatch);
    }

    scrollToJsonMatch(matchElement) {
        if (!matchElement) return;

        const viewerWrapper = document.getElementById("jsonViewerWrapper");
        if (viewerWrapper) {
            requestAnimationFrame(() => {
                const matchRect = matchElement.getBoundingClientRect();
                const wrapperRect = viewerWrapper.getBoundingClientRect();
                const scrollOffset = matchRect.top - wrapperRect.top - wrapperRect.height / 2 + matchRect.height / 2;

                viewerWrapper.scrollTop += scrollOffset;
            });
        }
    }

    nextJsonMatch() {
        if (!this.currentJsonViewer) {
            console.warn("No json viewer available");
            return;
        }

        const shadowRoot = this.currentJsonViewer.shadowRoot;
        if (!shadowRoot) {
            console.warn("No shadow root available");
            return;
        }

        const matches = shadowRoot.querySelectorAll(".data-row.match");

        if (matches.length === 0) {
            console.warn("No matches found");
            return;
        }

        let currentIndex = -1;
        matches.forEach((match, idx) => {
            if (match.classList.contains("current")) {
                currentIndex = idx;
            }
        });

        matches.forEach((match) => {
            match.classList.remove("current");
            match.style.backgroundColor = "rgba(255, 255, 0, 0.2)";
        });

        const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % matches.length;

        const nextMatch = matches[nextIndex];
        nextMatch.classList.add("current");
        nextMatch.style.backgroundColor = "rgba(255, 255, 0, 0.4)";

        this.expandJsonParentRows(nextMatch);

        this.scrollToJsonMatch(nextMatch);
    }

    prevJsonMatch() {
        if (!this.currentJsonViewer) {
            console.warn("No json viewer available");
            return;
        }

        const shadowRoot = this.currentJsonViewer.shadowRoot;
        if (!shadowRoot) {
            console.warn("No shadow root available");
            return;
        }

        const matches = shadowRoot.querySelectorAll(".data-row.match");

        if (matches.length === 0) {
            console.warn("No matches found");
            return;
        }

        let currentIndex = -1;
        matches.forEach((match, idx) => {
            if (match.classList.contains("current")) {
                currentIndex = idx;
            }
        });

        matches.forEach((match) => {
            match.classList.remove("current");
            match.style.backgroundColor = "rgba(255, 255, 0, 0.2)";
        });

        const prevIndex = currentIndex <= 0 ? matches.length - 1 : currentIndex - 1;

        const prevMatch = matches[prevIndex];
        prevMatch.classList.add("current");
        prevMatch.style.backgroundColor = "rgba(255, 255, 0, 0.4)";

        this.expandJsonParentRows(prevMatch);

        this.scrollToJsonMatch(prevMatch);
    }

    addAssetTooltips(jsonViewer) {
        this.stopAllAudio();

        const shadowRoot = jsonViewer.shadowRoot;
        if (!shadowRoot) {
            console.warn("JSON viewer shadow root not accessible");
            return;
        }

        if (this.jsonMutationObserver) {
            this.jsonMutationObserver.disconnect();
        }

        setTimeout(() => {
            this.processAssetMarkersInShadowDOM(shadowRoot);

            this.jsonMutationObserver = new MutationObserver((mutations) => {
                let shouldReprocess = false;

                for (const mutation of mutations) {
                    if (mutation.type === "childList") {
                        if (mutation.addedNodes.length > 0) {
                            shouldReprocess = true;
                            break;
                        }
                    }
                }

                if (shouldReprocess) {
                    clearTimeout(this.jsonProcessingTimeout);
                    this.jsonProcessingTimeout = setTimeout(() => {
                        this.processAssetMarkersInShadowDOM(shadowRoot);
                    }, 50);
                }
            });

            this.jsonMutationObserver.observe(shadowRoot, {
                childList: true,
                subtree: true,
            });
        }, 100);
    }

    processAssetMarkersInShadowDOM(root) {
        const elements = root.querySelectorAll(
            "span.string:not([data-asset-processed]), .value-data:not([data-asset-processed])",
        );
        let processedCount = 0;

        elements.forEach((element) => {
            const text = element.textContent.trim();

            element.setAttribute("data-original-text", text);

            let hashMatch = text.match(/^"?!?([a-f0-9]{16,})(?:\.[a-z0-9]+)?"?$/i);

            if (!hashMatch) {
                const specialMatches = text.match(/[a-f0-9]{16,}/gi);
                if (specialMatches && specialMatches.length > 0) {
                    const validAssets = [];
                    specialMatches.forEach((hashStr) => {
                        const hashLower = hashStr.toLowerCase();
                        const asset = this.assetHashMap[hashLower];
                        if (asset) {
                            validAssets.push({ hash: hashLower, asset: asset });
                        }
                    });

                    if (validAssets.length > 0) {
                        element.setAttribute("data-asset-processed", "true");

                        element.setAttribute("data-asset-hashes", JSON.stringify(validAssets.map((v) => v.hash)));

                        element.setAttribute("data-asset-type", validAssets[0].asset.type);

                        element.style.color = "var(--yellow)";
                        element.style.textDecoration = "underline";
                        element.style.cursor = "help";
                        element.style.fontWeight = "bold";

                        element.addEventListener("mouseenter", (e) => {
                            this.showMultipleAssetTooltip(e, validAssets);
                        });

                        element.addEventListener("mouseleave", () => {
                            this.hideAssetTooltip();
                        });

                        processedCount++;
                    }
                    return;
                }
            }

            if (hashMatch) {
                const hash = hashMatch[1].toLowerCase();
                const asset = this.assetHashMap[hash];

                if (asset) {
                    const audioProps = this.audioPropertiesMap?.[hash] || {};
                    const volume = audioProps.volume !== undefined ? audioProps.volume : null;
                    const pitch = audioProps.pitch !== undefined ? audioProps.pitch : null;
                    const pan = audioProps.pan !== undefined ? audioProps.pan : null;

                    element.setAttribute("data-asset-processed", "true");
                    element.setAttribute("data-asset-hash", hash);
                    element.setAttribute("data-asset-type", asset.type);

                    if (volume !== null) element.setAttribute("data-volume", volume);
                    if (pitch !== null) element.setAttribute("data-pitch", pitch);
                    if (pan !== null) element.setAttribute("data-pan", pan);

                    element.style.color = "var(--yellow)";
                    element.style.textDecoration = "underline";
                    element.style.cursor = asset.type === "audio" ? "pointer" : "help";
                    element.style.fontWeight = "bold";

                    element.addEventListener("mouseenter", (e) => {
                        this.showAssetTooltip(e, asset, volume, pitch, pan);
                    });

                    element.addEventListener("mouseleave", () => {
                        this.hideAssetTooltip();
                    });

                    if (asset.type === "audio") {
                        element.addEventListener("click", (e) => {
                            e.stopPropagation();
                            this.toggleAudioPlayback(asset, element, volume, pitch, pan);
                        });
                    }

                    processedCount++;
                }
            }
        });
    }

    showMultipleAssetTooltip(event, validAssets) {
        this.hideAssetTooltip();

        const tooltip = document.createElement("div");
        tooltip.id = "assetTooltip";
        tooltip.style.cssText = `
            position: fixed;
            background: var(--bg-color);
            border: 2px solid var(--border-color);
            border-radius: 8px;
            padding: 12px;
            z-index: 10000;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        `;

        let content = '<div style="display: flex; flex-direction: column; gap: 12px;">';

        validAssets.forEach(({ hash, asset }, index) => {
            if (asset.type === "image") {
                content += `
                    <div style="border-top: ${index > 0 ? "1px solid var(--border-color)" : "none"}; padding-top: ${index > 0 ? "12px" : "0"};">
                        <img src="${asset.url}" style="max-width: 360px; max-height: 200px; display: block; border-radius: 4px; margin-bottom: 8px;">
                        <div style="font-size: 0.85em; color: var(--txt-faded);">${asset.path}</div>
                    </div>
                `;
            } else if (asset.type === "audio") {
                content += `
                    <div style="border-top: ${index > 0 ? "1px solid var(--border-color)" : "none"}; padding-top: ${index > 0 ? "12px" : "0"};">
                        <div style="font-weight: bold; margin-bottom: 4px;">🔊 ${asset.name}</div>
                        <div style="font-size: 0.85em; color: var(--txt-faded);">${asset.path}</div>
                    </div>
                `;
            }
        });

        content += "</div>";
        tooltip.innerHTML = content;

        document.body.appendChild(tooltip);

        const rect = event.target.getBoundingClientRect();
        tooltip.style.left = rect.left + "px";
        tooltip.style.top = rect.bottom + 8 + "px";

        this.currentTooltip = tooltip;
    }

    showAssetTooltip(event, asset, volume = null, pitch = null, pan = null) {
        this.hideAssetTooltip();

        const tooltip = document.createElement("div");
        tooltip.id = "assetTooltip";
        tooltip.style.cssText = `
            position: fixed;
            background: var(--bg-color);
            border: 2px solid var(--border-color);
            border-radius: 8px;
            padding: 8px;
            z-index: 10000;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.5);
        `;

        if (asset.type === "image") {
            tooltip.innerHTML = `
                <img src="${asset.url}" style="max-width: 280px; max-height: 200px; display: block; border-radius: 4px;">
                <div style="margin-top: 8px; font-size: 0.85em; color: var(--txt-faded);">${asset.path}</div>
            `;
        } else if (asset.type === "audio") {
            let propertiesHtml = "";
            if (volume !== null || pitch !== null || pan !== null) {
                propertiesHtml = '<div style="margin-top: 8px; font-size: 0.85em; color: var(--txt-color);">';
                if (volume !== null) propertiesHtml += `Volume: ${volume}%<br>`;
                if (pitch !== null) propertiesHtml += `Pitch: ${pitch}%<br>`;
                if (pan !== null) propertiesHtml += `Pan: ${pan}`;
                propertiesHtml += "</div>";
            }

            tooltip.innerHTML = `
                <div style="padding: 8px;">
                    <div style="font-weight: bold; margin-bottom: 4px;">🔊 ${asset.name}</div>
                    <div style="font-size: 0.85em; color: var(--txt-faded);">${asset.path}</div>
                    ${propertiesHtml}
                    <div style="margin-top: 8px; font-size: 0.85em; color: var(--green);">Click to play/pause</div>
                </div>
            `;
        }

        document.body.appendChild(tooltip);

        const rect = event.target.getBoundingClientRect();
        tooltip.style.left = rect.left + "px";
        tooltip.style.top = rect.bottom + 8 + "px";

        this.currentTooltip = tooltip;
    }

    hideAssetTooltip() {
        if (this.currentTooltip) {
            this.currentTooltip.remove();
            this.currentTooltip = null;
        }
    }

    toggleAudioPlayback(asset, element, volume = null, pitch = null, pan = null) {
        if (this.currentAudio && this.currentAudio !== element.audioInstance) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            if (this.currentAudioElement) {
                this.currentAudioElement.style.color = "var(--yellow)";
            }
        }

        if (!element.audioInstance) {
            const audio = new Audio(asset.url);

            if (volume !== null) {
                audio.volume = Math.max(0, Math.min(1, volume / 100));
            } else {
                audio.volume = 0.5;
            }

            if (pitch !== null) {
                audio.playbackRate = Math.max(0.25, Math.min(4, pitch / 100));
            }

            element.audioInstance = audio;

            audio.addEventListener("ended", () => {
                element.style.color = "var(--yellow)";
            });
        }

        const audio = element.audioInstance;

        if (audio.paused) {
            audio.play();
            element.style.color = "var(--green)";
            this.currentAudio = audio;
            this.currentAudioElement = element;
        } else {
            audio.pause();
            audio.currentTime = 0;
            element.style.color = "var(--yellow)";
            this.currentAudio = null;
            this.currentAudioElement = null;
        }
    }

    stopAllAudio() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.currentAudio = null;
        }
        if (this.currentAudioElement) {
            this.currentAudioElement.style.color = "var(--yellow)";
            this.currentAudioElement = null;
        }
    }
}

window.galleryManager = new GalleryManager();
window.galleryManager.init();

function downloadPreviewAsset() {
    window.galleryManager.downloadAsset();
}
