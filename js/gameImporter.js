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
        };
        this.signature = "TCOAAL";
        this.hash = atob(
            "VGhlIENvZmZpbiBvZiBBbmR5IGFuZCBMZXlsZXkvd3d3L0NvcHlyaWdodHMgLSBDb2ZmaW4gb2YgQW5keSBhbmQgTGV5bGV5LnR4dA==",
        );
        this.fileCounter = 0;
        this.totalFiles = 0;
        this.filenameMap = filenamesMapped;
    }

    async importGame(files) {
        this.fileCounter = 0;

        const filesByPath = {};
        const relevantFiles = [];

        const folders = [
            //{ path: "www/data", type: "json", category: "data" },
            { path: "www/audio/bgm", type: "ogg", category: "Background songs" },
            { path: "www/audio/bgs", type: "ogg", category: "Background sounds" },
            { path: "www/audio/me", type: "ogg", category: "Event sounds" },
            { path: "www/audio/se", type: "ogg", category: "Sound effects" },
            { path: "www/img/faces", type: "png", category: "Portraits" },
            { path: "www/img/characters", type: "png", category: "Game sprites" },
            { path: "www/img/parallaxes", type: "png", category: "Backgrounds" },
            { path: "www/img/pictures", type: "png", category: "Pictures" },
            { path: "www/img/system", type: "png", category: "System sprites" },
            { path: "www/img/tilesets", type: "png", category: "Misc" },
            { path: "www/img/titles1", type: "png", category: "Misc" },
            { path: "www/icon", type: "png", category: "Misc" },
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

        this.showProgress(false);

        this.saveImportedAssets();

        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get("mode") === "gallery") {
            document.getElementById("gallerySection").style.display = "block";
            document.getElementById("download-all-button").style.display = "block";

            const importBtn = document.getElementById("galleryModeImportBtn");
            if (importBtn) {
                importBtn.textContent = "Import another game ⊞";
            }

            if (typeof updateGalleryCategories === "function") {
                updateGalleryCategories();
            }
        } else {
            if (typeof openGallery === "function") {
                openGallery();
            }
        }
        return true;
    }

    async processFolder(filesByPath, folderInfo) {
        const folderFiles = Object.keys(filesByPath).filter((path) => path.includes(folderInfo.path + "/"));

        for (const filePath of folderFiles) {
            const file = filesByPath[filePath];
            const fileName = filePath.split("/").pop();

            if (!fileName || fileName.startsWith(".")) continue;

            try {
                const arrayBuffer = await file.arrayBuffer();
                const basePathNoExtension = folderInfo.path.replace("www/", "") + "/" + fileName;
                const originalPath = basePathNoExtension + "." + folderInfo.type;
                const decrypted = await this.decryptFile(
                    new Uint8Array(arrayBuffer),
                    folderInfo.path.replace("www/", "") + "/" + fileName,
                );

                if (decrypted) {
                    const blob = new Blob([decrypted], {
                        type: this.getMimeType(folderInfo.type),
                    });
                    const url = URL.createObjectURL(blob);

                    const baseFileName = fileName.replace(/\.[^/.]+$/, ""); // Remove extension
                    const mappedName = this.filenameMap[baseFileName] || fileName;
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
                    setTimeout(() => {
                        editorOverlay.classList.remove("importing");
                    }, 100);
                }
            }
        }
    }

    updateProgress() {
        const percentage = Math.round((this.fileCounter / this.totalFiles) * 100);
        const fill = document.getElementById("importProgressFill");
        const text = document.getElementById("importProgressText");

        if (fill) fill.style.width = percentage + "%";
        if (text) text.textContent = `Processing game assets... ${percentage}%`;
    }

    saveImportedAssets() {
        window.gameImporterAssets = this.importedAssets;
    }
}

if (!window.gameImporter) {
    window.gameImporter = new GameImporter();
}
