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

class GameImporter {
    constructor() {
        this.importedAssets = {
            images: {},
            audio: {},
            data: {},
        };
        this.signature = "TCOAAL";
        this.hash = atob(
            "VGhlIENvZmZpbiBvZiBBbmR5IGFuZCBMZXlsZXkvd3d3L0NvcHlyaWdodHMgLSBDb2ZmaW4gb2YgQW5keSBhbmQgTGV5bGV5LnR4dA==",
        );
        this.fileCounter = 0;
        this.totalFiles = 0;
        this.filenameMap = filenamesMapped;
        this.customMenuRightPortraitFile = "ashley-teen_19.png";
        this.customMenuLeftPortraitFile = "andrew-teen_19.png";
        this.dialogueFileFound = false;
    }

    async importGame(files) {
        this.fileCounter = 0;

        const filesByPath = {};
        const relevantFiles = [];

        const folders = [
            { path: "www/data", type: "json", category: "Maps", assetType: "data" },
            {
                path: "www/languages",
                type: "txt",
                category: "Maps",
                assetType: "data",
                specificFile: "dialogue.txt",
                recursive: true,
            },
            { path: "www/audio/bgm", type: "ogg", category: "Background songs", assetType: "audio" },
            { path: "www/audio/bgs", type: "ogg", category: "Background sounds", assetType: "audio" },
            { path: "www/audio/me", type: "ogg", category: "Event sounds", assetType: "audio" },
            { path: "www/audio/se", type: "ogg", category: "Sound effects", assetType: "audio" },
            { path: "www/img/faces", type: "png", category: "Portraits", assetType: "images" },
            { path: "www/img/characters", type: "png", category: "Game sprites", assetType: "images" },
            { path: "www/img/parallaxes", type: "png", category: "Backgrounds", assetType: "images" },
            { path: "www/img/pictures", type: "png", category: "Pictures", assetType: "images" },
            { path: "www/img/system", type: "png", category: "System sprites", assetType: "images" },
            { path: "www/img/tilesets", type: "png", category: "System sprites", assetType: "images" },
            { path: "www/img/titles1", type: "png", category: "Pictures", assetType: "images" },
            { path: "www/icon", type: "png", category: "Pictures", assetType: "images" },
        ];

        let validFolders = [];
        for (const folder of folders) {
            validFolders.push(folder.path);
        }

        let gameFolder = false;
        for (const file of files) {
            const path = file.webkitRelativePath || file.name;
            filesByPath[path] = file;

            gameFolder ||= path === this.hash;

            if (path.includes("www/languages") && path.endsWith("dialogue.txt")) {
                this.dialogueFileFound = true;
            }

            for (const validPath of validFolders) {
                if (path.includes(validPath)) {
                    relevantFiles.push(file);
                    break;
                }
            }
        }
        if (!gameFolder) {
            alert("Invalid game folder");
            return false;
        }

        this.totalFiles = relevantFiles.length;

        this.showProgress(true);

        for (const folder of folders) {
            await this.processFolder(filesByPath, folder);
        }

        await this.saveImportedAssets();

        this.parseDialogueFile();

        await this.extractUIAssets();

        if (window.isForcedImport) {
            return true;
        }

        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get("mode");
        const useParam = urlParams.get("use");
        this.showProgress(false);

        if (mode === "gallery") {
            document.getElementById("gallerySection").style.display = "block";
            document.getElementById("download-all-button").style.display = "block";

            const importBtn = document.getElementById("galleryModeImportBtn");
            if (importBtn) {
                importBtn.textContent = "Import another game ⊞";
            }

            if (typeof updateGalleryCategories === "function") {
                updateGalleryCategories();
            }
        } else if (mode === "viewer" && useParam) {
            //console.log("Skipping gallery open in viewer mode with shared link");
        } else {
            if (typeof openGallery === "function") {
                openGallery();
            }
        }
        return true;
    }

    async processFolder(filesByPath, folderInfo) {
        let folderFiles;

        if (folderInfo.recursive) {
            folderFiles = Object.keys(filesByPath).filter((path) => {
                return path.includes(folderInfo.path + "/");
            });

            if (folderInfo.specificFile === "dialogue.txt") {
                const dialogueFiles = folderFiles.filter((f) => f.includes("dialogue.txt"));
            }
        } else {
            folderFiles = Object.keys(filesByPath).filter((path) => path.includes(folderInfo.path + "/"));
        }

        for (const filePath of folderFiles) {
            const file = filesByPath[filePath];
            const fileName = filePath.split("/").pop();

            if (!fileName || fileName.startsWith(".")) continue;

            if (folderInfo.specificFile && fileName !== folderInfo.specificFile) continue;

            try {
                const arrayBuffer = await file.arrayBuffer();

                let originalPath;
                let basePathNoExtension = folderInfo.path.replace("www/", "") + "/" + fileName;
                if (folderInfo.type === "txt") {
                    originalPath = folderInfo.path.replace("www/", "") + "/" + fileName;
                } else {
                    originalPath = basePathNoExtension + "." + folderInfo.type;
                }

                const decrypted = await this.decryptFile(
                    new Uint8Array(arrayBuffer),
                    folderInfo.path.replace("www/", "") + "/" + fileName,
                );

                if (decrypted) {
                    const blob = new Blob([decrypted], {
                        type: this.getMimeType(folderInfo.type),
                    });
                    const url = URL.createObjectURL(blob);

                    const baseFileName = fileName.replace(/\.[^/.]+$/, "");
                    const mappedName = this.filenameMap[baseFileName] || baseFileName;
                    const assetName = mappedName + "." + folderInfo.type;

                    if (folderInfo.type === "png") {
                        if (!this.importedAssets.images[folderInfo.category]) {
                            this.importedAssets.images[folderInfo.category] = {};
                        }

                        const isSprite =
                            folderInfo.category === "Game sprites" ||
                            folderInfo.category === "System sprites" ||
                            (folderInfo.category === "Misc" && folderInfo.path === "www/img/tilesets");

                        let assetVariants = null;

                        if (assetName in spritesSheetsVariants) {
                            assetVariants = spritesSheetsVariants[assetName].sizes;
                        }

                        const assetData = {
                            url: url,
                            blob: blob,
                            name: assetName,
                            originalName: fileName,
                            baseFileName: folderInfo.path === "www/icon" ? basePathNoExtension : originalPath,
                            isSprite: isSprite,
                            variants: assetVariants,
                            cropped: false,
                            cropping: false,
                            croppedUrl: undefined,
                            croppedBlob: undefined,
                        };

                        this.importedAssets.images[folderInfo.category][assetName] = assetData;

                        if (window.memoryManager) {
                            try {
                                await window.memoryManager.savePartialAsset(
                                    assetData,
                                    assetData.baseFileName,
                                    folderInfo.category,
                                    "images",
                                );
                            } catch (error) {
                                console.warn("Failed to save image to memory:", assetName, error);
                            }
                        }
                    } else if (folderInfo.type === "ogg") {
                        if (!this.importedAssets.audio[folderInfo.category]) {
                            this.importedAssets.audio[folderInfo.category] = {};
                        }

                        const assetData = {
                            url: url,
                            blob: blob,
                            name: assetName,
                            originalName: fileName,
                            baseFileName: originalPath,
                        };

                        this.importedAssets.audio[folderInfo.category][assetName] = assetData;

                        if (window.memoryManager) {
                            try {
                                await window.memoryManager.savePartialAsset(
                                    assetData,
                                    originalPath,
                                    folderInfo.category,
                                    "audio",
                                );
                            } catch (error) {
                                console.warn("Failed to save audio to memory:", assetName, error);
                            }
                        }
                    } else if (folderInfo.type === "json") {
                        if (fileName.includes("Credits") || baseFileName.includes("Credits")) {
                            continue;
                        }

                        let targetCategory = folderInfo.category;
                        if (fileName.startsWith("9c7050ae76645487") || baseFileName.includes("labels")) {
                            targetCategory = "Labels";
                        }

                        if (!this.importedAssets.data[targetCategory]) {
                            this.importedAssets.data[targetCategory] = {};
                        }

                        let jsonText = new TextDecoder("utf-8").decode(decrypted);
                        let formattedJson = jsonText;
                        let isValid = true;

                        if (
                            fileName.startsWith("9c7050ae76645487") ||
                            mappedName.includes("labels") ||
                            assetName.includes("labels")
                        ) {
                            const langdataPrefix = "LANGDATA";
                            if (jsonText.startsWith(langdataPrefix)) {
                                jsonText = jsonText.substring(langdataPrefix.length);
                                //console.log(`Stripped LANGDATA prefix from ${assetName}`);
                            }
                        }

                        try {
                            const parsed = JSON.parse(jsonText);
                            formattedJson = JSON.stringify(parsed, null, 2);
                        } catch (error) {
                            console.warn(`Invalid JSON in ${fileName}:`, error);
                            isValid = false;
                        }

                        const formattedBlob = new Blob([formattedJson], {
                            type: "application/json",
                        });
                        const formattedUrl = URL.createObjectURL(formattedBlob);

                        const assetData = {
                            url: formattedUrl,
                            blob: formattedBlob,
                            name: assetName,
                            originalName: fileName,
                            baseFileName: originalPath,
                            jsonText: formattedJson,
                            isValid: isValid,
                        };

                        this.importedAssets.data[targetCategory][assetName] = assetData;

                        if (window.memoryManager) {
                            try {
                                await window.memoryManager.savePartialAsset(
                                    assetData,
                                    originalPath,
                                    targetCategory,
                                    "data",
                                );
                            } catch (error) {
                                console.warn("Failed to save data to memory:", assetName, error);
                            }
                        }
                    } else if (folderInfo.type === "txt") {
                        if (!this.importedAssets.data[folderInfo.category]) {
                            this.importedAssets.data[folderInfo.category] = {};
                        }

                        let txtText = new TextDecoder("utf-8").decode(decrypted);

                        const txtBlob = new Blob([txtText], {
                            type: "text/plain",
                        });
                        const txtUrl = URL.createObjectURL(txtBlob);

                        let displayName = fileName;

                        const assetData = {
                            url: txtUrl,
                            blob: txtBlob,
                            name: displayName,
                            originalName: fileName,
                            baseFileName: originalPath,
                            txtText: txtText,
                        };

                        this.importedAssets.data[folderInfo.category][displayName] = assetData;

                        if (fileName === "dialogue.txt") {
                            /*console.log("Successfully imported dialogue.txt:", {
                                category: folderInfo.category,
                                assetName: displayName,
                                originalName: fileName,
                                textLength: txtText.length,
                                firstLines: txtText.split("\n").slice(0, 5),
                            });*/
                            const text = document.getElementById("importProgressText");
                            if (text) {
                                text.textContent = "Found dialogue.txt";
                            }
                            this.dialogueFileFound = true;
                        }

                        if (window.memoryManager) {
                            try {
                                await window.memoryManager.savePartialAsset(
                                    assetData,
                                    originalPath,
                                    folderInfo.category,
                                    "data",
                                );
                            } catch (error) {
                                console.warn("Failed to save data to memory:", assetName, error);
                            }
                        }
                    }
                }

                this.fileCounter++;
                this.updateProgress();
            } catch (error) {
                console.error(`Error processing ${fileName}:`, error);
            }
        }
    }

    decryptFile(rawBytes, idFilePath) {
        const signatureBytes = new TextEncoder().encode(this.signature);

        const hasSignature = signatureBytes.every((byte, i) => rawBytes[i] === byte);

        if (!hasSignature) {
            return rawBytes;
        }

        const encryptedData = rawBytes.slice(signatureBytes.length + 1);
        let encryptOffset = rawBytes[signatureBytes.length];

        if (encryptOffset === 0) {
            encryptOffset = encryptedData.length;
        }

        const mask = (this.getMask(idFilePath) + 1) % 256;
        const decryptedData = new Uint8Array(encryptedData);

        let currentMask = mask;
        for (let i = 0; i < encryptOffset; i++) {
            const originalByte = encryptedData[i];
            decryptedData[i] = originalByte ^ currentMask;
            currentMask = ((currentMask << 1) ^ originalByte) & 255;
        }

        return decryptedData;
    }

    getMask(filename) {
        let mask = 0;
        const upperFilename = filename.split("/").pop().toUpperCase();

        for (let i = 0; i < upperFilename.length; i++) {
            mask = (mask << 1) ^ upperFilename.charCodeAt(i);
        }

        return mask;
    }

    getMimeType(extension) {
        switch (extension) {
            case "png":
                return "image/png";
            case "ogg":
                return "audio/ogg";
            case "json":
                return "application/json";
            default:
                return "application/octet-stream";
        }
    }

    showProgress(show) {
        const modal = document.getElementById("importProgressModal");
        const editorOverlay = document.getElementById("editorOverlay");

        if (modal) {
            modal.style.display = show ? "flex" : "none";

            if (show) {
                const dialogContainer = document.querySelector(".dialog-container");
                const gallerySection = document.getElementById("gallerySection");
                const galleryInitialPrompt = document.getElementById("galleryInitialPrompt");

                if (dialogContainer) {
                    dialogContainer.style.display = "none";
                }
                if (gallerySection) {
                    gallerySection.style.display = "none";
                }
                if (galleryInitialPrompt) {
                    galleryInitialPrompt.style.display = "none";
                }
            }

            if (editorOverlay && editorOverlay.classList.contains("gallery-only-mode")) {
                if (show) {
                    editorOverlay.classList.add("importing");
                } else {
                    // setTimeout(() => {
                    //    editorOverlay.classList.remove("importing");
                    //}, 100);
                }
            }
        }
    }

    updateProgress() {
        const percentage = Math.round((this.fileCounter / this.totalFiles) * 100);
        const fill = document.getElementById("importProgressFill");
        const text = document.getElementById("importProgressText");

        if (fill) fill.style.width = percentage + "%";
        if (text) {
            const baseText = `Processing game assets... ${percentage}%`;
            if (this.dialogueFileFound) {
                text.innerHTML = `${baseText}<br><small style="font-size: 0.85em;">Found dialogue.txt</small>`;
            } else {
                text.textContent = baseText;
            }
        }
    }

    static showDialogueInfoModal() {
        const existing = document.getElementById("dialogueInfoModal");
        if (existing) existing.remove();

        const modalHTML = `
            <div id="dialogueInfoModal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 999999;">
                <div style="background: #1a1a1a; border: 2px solid; border-radius: 8px; padding: 2em; max-width: 700px; color: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
                    <h2 style="display:flex; justify-content:center; margin-top: 0;">Generate the file dialogue.txt</h2>
                    <br>
                    <p>If your game folder contains <code style="background: #333; padding: 2px 6px; border-radius: 3px;">dialogue.txt</code> in <code style="background: #333; padding: 2px 6px; border-radius: 3px;">www/languages</code>, some hashes will be replaced by their true in game text. The file is not present by default, but is easy to generate. To get it:</p>
                    <br>
                    <ul style="text-align: left; line-height: 1.6;">
                        <li><strong>Go in your game folder</strong></li>
                        <li><strong>Go in the languages tool folder</strong>: <code style="background: #333; padding: 2px 6px; border-radius: 3px;">www/languages/tool/</code></li>
                        <li><strong>Run Translator.exe</strong></li>
                        <li><strong>Enter a folder name</strong> by typing <code style="background: #333; padding: 2px 6px; border-radius: 3px;">en</code> in the <strong>Folder</strong> text box</li>
                        <li><strong>Press Generate Folder</strong></li>
                    </ul>
                    <br>
                    <p style="margin-bottom: 0;"><strong>You are done!</strong> It is now in your game files at <code style="background: #333; padding: 2px 6px; border-radius: 3px;">www/languages/tool/en/dialogue.txt</code></p>
                    <div style="display:flex; justify-content: center"><button onclick="document.getElementById('dialogueInfoModal').remove()" style="margin-top: 1vmax; padding: 0.5vmax 1.5vmax; cursor: pointer; font-weight: bold; font-size: 1.25vmax;">Got it!</button></div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML("beforeend", modalHTML);
    }

    async saveImportedAssets() {
        window.gameImporterAssets = this.importedAssets;

        if (window.pendingCompositions && window.pendingCompositions.length > 0) {
            //console.log(`Processing ${window.pendingCompositions.length} pending compositions after asset import...`);
            const pending = window.pendingCompositions;
            const pendingSource = window.pendingCompositionsSource || "user";
            window.pendingCompositions = [];
            window.pendingCompositionsSource = undefined;

            if (typeof reconstructCompositionsToGallery === "function") {
                await reconstructCompositionsToGallery(pending, pendingSource);
            }
        }
    }

    parseDialogueFile() {
        if (!this.importedAssets.data || !this.importedAssets.data["Maps"]) {
            window.dialogueHashMapping = null;
            return;
        }

        const dialogueAsset = Object.values(this.importedAssets.data["Maps"]).find(
            (asset) => asset.originalName === "dialogue.txt",
        );

        if (!dialogueAsset || !dialogueAsset.txtText) {
            window.dialogueHashMapping = null;
            return;
        }

        const hashMapping = {};
        const lines = dialogueAsset.txtText.split("\n");

        for (const line of lines) {
            const colonMatch = line.match(/#([A-Za-z0-9]+)\s*:\s*(.+)/);
            const parenMatch = line.match(/#([A-Za-z0-9]+)\s*\(([^)]+)\)/);

            let hash, text;
            if (colonMatch) {
                hash = colonMatch[1];
                text = colonMatch[2].trim();
            } else if (parenMatch) {
                hash = parenMatch[1];
                text = parenMatch[2].trim();
            }

            if (hash && text) {
                hashMapping[hash] = text;
            }
        }

        window.dialogueHashMapping = hashMapping;

        if (window.memoryManager) {
            window.memoryManager
                .saveMetadata("dialogueHashMapping", hashMapping)
                .then(() => {})
                .catch((error) => {
                    console.error("Failed to save dialogue hash mappings:", error);
                });
        }
    }

    async extractSpritesFromSheet(sheetBlob, cols, rows, spriteIndices, shouldCrop = false) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = async () => {
                const cellWidth = img.width / cols;
                const cellHeight = img.height / rows;
                const extractedSprites = [];

                for (const index of spriteIndices) {
                    const row = Math.floor(index / cols);
                    const col = index % cols;

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

                    if (shouldCrop) {
                        const blob = await this.cropCanvasAlphaChannel(canvas);
                        extractedSprites.push(blob);
                    } else {
                        const blob = await new Promise((r) => canvas.toBlob(r, "image/png"));
                        extractedSprites.push(blob);
                    }
                }

                resolve(extractedSprites);
            };
            img.onerror = () => reject(new Error("Failed to load sprite sheet"));
            img.src = URL.createObjectURL(sheetBlob);
        });
    }

    async cropCanvasAlphaChannel(canvas) {
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        const w = canvas.width;
        const h = canvas.height;
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
            const croppedCanvas = document.createElement("canvas");
            croppedCanvas.width = trimW;
            croppedCanvas.height = trimH;
            const croppedCtx = croppedCanvas.getContext("2d");
            croppedCtx.drawImage(canvas, minX, minY, trimW, trimH, 0, 0, trimW, trimH);
            return new Promise((r) => croppedCanvas.toBlob(r, "image/png"));
        }

        return new Promise((r) => canvas.toBlob(r, "image/png"));
    }

    async extractUIAssets() {
        try {
            const systemSprites = this.importedAssets.images["System sprites"];
            const menuPortraitLeft = this.importedAssets.images["Portraits"][this.customMenuLeftPortraitFile];
            const menuPortraitRight = this.importedAssets.images["Portraits"][this.customMenuRightPortraitFile];
            if (!systemSprites) {
                console.warn("System sprites not found, skipping UI asset extraction");
                return;
            }
            if (!menuPortraitLeft || !menuPortraitRight) {
                console.warn("Unable to load menu portraits");
            } else {
                await window.memoryManager.saveUIAsset(
                    "menu-portrait-left",
                    menuPortraitLeft.blob,
                    "--menu-portrait-left",
                );
                await window.memoryManager.saveUIAsset(
                    "menu-portrait-right",
                    menuPortraitRight.blob,
                    "--menu-portrait-right",
                );
            }

            //console.log("Starting UI asset extraction...");
            //console.log("Available system sprites:", Object.keys(systemSprites));

            // Extract choice buttons from System #2 (1x5 grid, sprites 0=button, 1=hover, crop alpha)
            const system2 = systemSprites["spritessheet_1x5_system_2.png"];
            if (system2) {
                //console.log("Extracting and cropping choice buttons from system_2...");
                const choiceSprites = await this.extractSpritesFromSheet(system2.blob, 1, 5, [0, 1], true);
                await window.memoryManager.saveUIAsset("choice-button", choiceSprites[0], "--choice-button");
                await window.memoryManager.saveUIAsset(
                    "choice-button-hover",
                    choiceSprites[1],
                    "--choice-button-hover",
                );
                //console.log("Choice buttons extracted and cropped");
            } else {
                console.warn("System #2 sprite sheet not found");
            }

            // Extract loading sprite from System #6 (1x1 grid, single image)
            const system6 = systemSprites["spritessheet_1x1_system_6.png"];
            if (system6) {
                //console.log("Extracting loading sprite from system_6...");
                const loadingSprites = await this.extractSpritesFromSheet(system6.blob, 1, 1, [0]);
                await window.memoryManager.saveUIAsset("site-loading", loadingSprites[0], "--site-loading");
                //console.log("Loading sprite extracted");
            } else {
                console.warn("System #6 sprite sheet not found");
            }

            // Extract and crop dialog box from System #21 (1x1 grid, single image, needs cropping)
            const system21 = systemSprites["spritessheet_1x1_system_21.png"];
            if (system21) {
                //console.log("Extracting and cropping dialog box from system_21...");
                const dialogBoxSprites = await this.extractSpritesFromSheet(system21.blob, 1, 1, [0], true);
                await window.memoryManager.saveUIAsset("dialog-box", dialogBoxSprites[0], "--dialog-box");
                //console.log("Dialog box extracted and cropped");
            } else {
                console.warn("System #21 sprite sheet not found");
            }

            // Extract dialog arrow from System #12 (16x16 grid at 8x8 variant, sprites 38, 39, 46, 47)
            // Note: The actual file is 16x16, but we want the 8x8 variant (variant index 2)
            const system12 = systemSprites["spritessheet_16x16_system_12.png"];
            if (system12) {
                //console.log("Extracting dialog arrow from system_12 (8x8 variant)...");
                // Using 8x8 grid (variant index 2)
                const arrowSprites = await this.extractSpritesFromSheet(system12.blob, 8, 8, [38, 39, 46, 47]);
                // Create animated GIF for arrow
                const arrowBlob = await this.createAnimatedGif(arrowSprites, 250);
                await window.memoryManager.saveUIAsset("dialog-arrow", arrowBlob, "--dialog-arrow", true, 250);
                //console.log("Dialog arrow extracted");
            } else {
                console.warn("System #12 sprite sheet not found");
            }

            //console.log("UI assets extraction completed successfully");
        } catch (error) {
            console.error("Failed to extract UI assets:", error);
        }
    }

    async createAnimatedGif(spriteBlobs, delay) {
        if (!spriteBlobs || spriteBlobs.length === 0) {
            throw new Error("No sprite blobs provided for GIF creation");
        }

        //console.log(`Creating animated GIF with ${spriteBlobs.length} frames, delay: ${delay}ms`);

        if (spriteBlobs.length === 1) {
            //console.log("Only one frame, returning as-is");
            return spriteBlobs[0];
        }

        try {
            //console.log("Converting sprite blobs to canvases...");
            const blobUrls = [];
            const canvases = await Promise.all(
                spriteBlobs.map((blob, index) => {
                    return new Promise((resolve, reject) => {
                        const img = new Image();
                        const blobUrl = URL.createObjectURL(blob);
                        blobUrls.push(blobUrl);

                        img.onload = () => {
                            const canvas = document.createElement("canvas");
                            canvas.width = img.width;
                            canvas.height = img.height;
                            const ctx = canvas.getContext("2d", { alpha: true });

                            ctx.clearRect(0, 0, canvas.width, canvas.height);
                            ctx.drawImage(img, 0, 0);
                            //console.log(`Frame ${index}: ${img.width}x${img.height}`);
                            resolve(canvas);
                        };
                        img.onerror = () => {
                            console.error(`Failed to load frame ${index}`);
                            reject(new Error("Failed to load sprite blob as image"));
                        };
                        img.src = blobUrl;
                    });
                }),
            );

            //console.log(`Successfully loaded ${canvases.length} frames`);

            blobUrls.forEach((url) => URL.revokeObjectURL(url));

            //console.log("Starting GIF encoding with gifenc...");
            const encoder = gifenc.GIFEncoder();
            const width = canvases[0].width;
            const height = canvases[0].height;

            const firstFrameData = canvases[0].getContext("2d").getImageData(0, 0, width, height);
            const palette = gifenc.quantize(firstFrameData.data, 256, { format: "rgba4444", oneBitAlpha: true });

            canvases.forEach((canvas, index) => {
                const ctx = canvas.getContext("2d");
                const imageData = ctx.getImageData(0, 0, width, height);
                const indexed = gifenc.applyPalette(imageData.data, palette, "rgba4444");

                encoder.writeFrame(indexed, width, height, {
                    palette,
                    delay,
                    transparent: true,
                    transparentIndex: 0,
                    first: index === 0,
                });
            });

            encoder.finish();

            const buffer = encoder.bytes();
            const gifBlob = new Blob([buffer], { type: "image/gif" });
            //console.log(`GIF encoding finished! Blob size: ${gifBlob.size} bytes`);

            return gifBlob;
        } catch (error) {
            console.error("Failed to create animated GIF, falling back to first frame:", error);
            return spriteBlobs[0];
        }
    }
}

if (!window.gameImporter) {
    window.gameImporter = new GameImporter();
}
