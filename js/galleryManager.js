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
        this.globalImageViewMode = "original";
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

    /**
     * Improves subtitle by replacing encrypted hashes with friendly names from hashToFilename
     * @param {string} baseFileName - The original baseFileName (e.g., "img/faces/aab510d75d377c95[BUST].png")
     * @returns {object} Object with { subtitle: improvedString, original: originalString }
     */
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

    /**
     * Extracts all searchable terms from baseFileName using hashToFilename mapping
     * @param {string} baseFileName - The original baseFileName (e.g., "img/faces/aab510d75d377c95[BUST].png")
     * @returns {string} Space-separated searchable terms (e.g., "andrew_1 aab510d75d377c95 aab510d75d377c95[BUST]")
     */
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

    /**
     * Gets the display name from hashToName mapping if available
     * @param {string} name - The current asset name (e.g., "andrew_1.png")
     * @param {string} baseFileName - The original baseFileName (e.g., "img/faces/aab510d75d377c95[BUST].png")
     * @returns {string} The display name with extension if found, otherwise the original name
     */
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

    /**
     * Gets the hashToName value for an asset
     * @param {string} baseFileName - The original baseFileName
     * @returns {string|null} The hashToName value if found, otherwise null
     */
    getHashToNameValue(baseFileName) {
        if (!baseFileName || typeof hashToName === "undefined") return null;

        for (const [hash, displayName] of Object.entries(hashToName)) {
            if (baseFileName.includes(hash)) {
                return displayName;
            }
        }
        return null;
    }

    /**
     * Checks if an asset is a ground based on hashToName
     * @param {string} baseFileName - The original baseFileName
     * @returns {boolean} True if the asset is a ground
     */
    isGround(baseFileName) {
        const hashName = this.getHashToNameValue(baseFileName);
        return hashName && hashName.startsWith("ground_");
    }

    /**
     * Checks if an asset is a parallaxe based on hashToName
     * @param {string} baseFileName - The original baseFileName
     * @returns {boolean} True if the asset is a parallax
     */
    isParallaxe(baseFileName) {
        const hashName = this.getHashToNameValue(baseFileName);
        return hashName && hashName.startsWith("parallax_");
    }

    /**
     * Checks if an asset is a pure background (not ground or parallaxe)
     * @param {string} baseFileName - The original baseFileName
     * @returns {boolean} True if the asset is a pure background
     */
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

        let headerHtml = "";
        if (asset.variants !== null && asset.variants.length > 0) {
            const selectId = `variantSelect-${Math.random().toString(36).slice(2)}`;
            headerHtml = `
                <h4 class="sprite-sheet-preview-info-title">Sprite Sheet:</h4>
                <select id="${selectId}" class="preview-control-input inline compact">
                    ${asset.variants
                        .map(
                            (v, idx) =>
                                `<option value="${idx}" ${v.rows === rows && v.cols === cols ? "selected" : ""}>
                                    ${v.rows}x${v.cols}
                                </option>`,
                        )
                        .join("")}
                </select>`;
        } else {
            headerHtml = `<h4 class="sprite-sheet-preview-info-title">Sprite Sheet: ${cols}x${rows}</h4>`;
        }

        contentDiv.innerHTML = `
            <div class="sprite-sheet-preview">
                <div style="display: flex; flex-direction: row; align-items: center;">
                    ${headerHtml}
                </div>
                <div style="display: flex; justify-content: center; align-items: center; padding: 60px;">
                    <div class="spinner" style="border: 4px solid rgba(255, 255, 255, 0.3); border-top: 4px solid #fff; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite;"></div>
                </div>
            </div>`;
        controlsDiv.innerHTML = "";

        if (asset.variants !== null && asset.variants.length > 0) {
            const select = contentDiv.querySelector("select");
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
                                        onclick="galleryManager.toggleSpriteSelection(${i}, event)">
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
                                        onclick="galleryManager.toggleSpriteSelection(${i}, event)">
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

        contentDiv.innerHTML = `
            <div class="json-preview-container">
                <div class="json-preview-loading">
                    <div class="loading-spinner"></div>
                    <div>Loading JSON...</div>
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
        } else {
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
            const jsonData = JSON.parse(asset.jsonText || "{}");

            const toolbarInfo = isMaps
                ? `<span class="json-info"><strong>${title}</strong><br/><span style="font-size: 0.85em; opacity: 0.8;" title="${subtitleOriginal}">${subtitle}</span></span>`
                : `<span class="json-info">${asset.isValid ? "Valid JSON" : "Invalid JSON"}</span>`;

            contentDiv.innerHTML = `
                <div class="json-preview-container">
                    <div class="json-preview-toolbar">
                        ${toolbarInfo}
                        <div class="json-toolbar-buttons">
                            <button class="json-tool-btn" onclick="galleryManager.togglePreviewExpand()" title="Expand preview">⛶</button>
                        </div>
                    </div>
                    <div class="json-viewer-wrapper" id="jsonViewerWrapper"></div>
                </div>
            `;

            const viewerWrapper = contentDiv.querySelector("#jsonViewerWrapper");
            const jsonViewer = document.createElement("andypf-json-viewer");

            jsonViewer.data = jsonData;
            jsonViewer.setAttribute("indent", "4");
            jsonViewer.setAttribute("expanded", "1");
            jsonViewer.setAttribute("theme", "tcoaal-dark");
            jsonViewer.setAttribute("show-data-types", "false");
            jsonViewer.setAttribute("show-toolbar", "true");
            jsonViewer.setAttribute("expand-icon-type", "arrow");
            jsonViewer.setAttribute("show-copy", "true");
            jsonViewer.setAttribute("show-size", "false");

            viewerWrapper.appendChild(jsonViewer);
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
            this.selectedSprites = [index];

            document.querySelectorAll(".sprite-cell-preview").forEach((cell) => {
                cell.classList.remove("selected");
            });
            const cell = document.querySelector(`.sprite-cell-preview[data-index="${index}"]`);
            if (cell) {
                cell.classList.add("selected");
            }

            this.addSpriteToCompositionEditor(0, event);
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
}

window.galleryManager = new GalleryManager();
window.galleryManager.init();

function downloadPreviewAsset() {
    window.galleryManager.downloadAsset();
}
