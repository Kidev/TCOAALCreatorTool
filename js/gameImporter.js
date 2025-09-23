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
        this.fileCounter = 0;
        this.totalFiles = 0;
        this.filenameMap = filenamesMapped;
    }

    async importGame(files) {
        this.fileCounter = 0;

        const filesByPath = {};
        const relevantFiles = [];

        const validPaths = [
            //"www/data/",
            "www/audio/bgm/",
            "www/audio/bgs/",
            "www/audio/me/",
            "www/audio/se/",
            "www/img/characters/",
            "www/img/faces/",
            "www/img/parallaxes/",
            "www/img/pictures/",
            "www/img/system/",
            "www/img/tilesets/",
            "www/img/titles1/",
            "www/icon/",
        ];

        for (const file of files) {
            const path = file.webkitRelativePath || file.name;
            filesByPath[path] = file;

            for (const validPath of validPaths) {
                if (path.includes(validPath)) {
                    relevantFiles.push(file);
                    break;
                }
            }
        }

        this.totalFiles = relevantFiles.length;
        //console.log(`Found relevant game assets to process...`);

        this.showProgress(true);

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
                        if (mappedName === "spritessheet_16x16_system_12") {
                            this.importedAssets.images[folderInfo.category]["spritessheet_2x2_system_12.png"] = {
                                url: url,
                                blob: blob,
                                name: "spritessheet_2x2_system_12.png",
                                originalName: fileName,
                                baseFileName: originalPath,
                                isSprite: true,
                            };
                            this.importedAssets.images[folderInfo.category]["spritessheet_4x4_system_12.png"] = {
                                url: url,
                                blob: blob,
                                name: "spritessheet_4x4_system_12.png",
                                originalName: fileName,
                                baseFileName: originalPath,
                                isSprite: true,
                            };
                            this.importedAssets.images[folderInfo.category]["spritessheet_8x8_system_12.png"] = {
                                url: url,
                                blob: blob,
                                name: "spritessheet_4x4_system_12.png",
                                originalName: fileName,
                                baseFileName: originalPath,
                                isSprite: true,
                            };
                        }
                        this.importedAssets.images[folderInfo.category][assetName] = {
                            url: url,
                            blob: blob,
                            name: assetName,
                            originalName: fileName,
                            baseFileName: folderInfo.path === "www/icon" ? basePathNoExtension : originalPath,
                            isSprite:
                                folderInfo.category === "Game sprites" ||
                                folderInfo.category === "System sprites" ||
                                (folderInfo.category === "Misc" && folderInfo.path === "www/img/tilesets"),
                        };
                    } else if (folderInfo.type === "ogg") {
                        if (!this.importedAssets.audio[folderInfo.category]) {
                            this.importedAssets.audio[folderInfo.category] = {};
                        }
                        this.importedAssets.audio[folderInfo.category][assetName] = {
                            url: url,
                            blob: blob,
                            name: assetName,
                            originalName: fileName,
                            baseFileName: originalPath,
                        };
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
