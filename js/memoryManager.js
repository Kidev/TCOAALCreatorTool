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

class MemoryManager {
    constructor() {
        this.db = null;
        this.dbName = "TCOAALAssets";
        this.dbVersion = 3;
        this.DATA_VERSION = "1.2.1";
        this.isReady = false;
        this.initPromise = this.initDB();
        this.haveDataStored = false;
        this.versionMismatch = false;
    }

    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error("Error opening IndexedDB:", request.error);
                reject(request.error);
            };

            request.onsuccess = async () => {
                this.db = request.result;
                this.isReady = true;

                await this.checkDataVersion();

                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Assets store: stores individual asset data
                if (!db.objectStoreNames.contains("assets")) {
                    const assetStore = db.createObjectStore("assets", { keyPath: "id" });
                    assetStore.createIndex("originalPath", "originalPath", { unique: false });
                    assetStore.createIndex("category", "category", { unique: false });
                    assetStore.createIndex("type", "type", { unique: false });
                }

                // Metadata store: stores session info and completion state
                if (!db.objectStoreNames.contains("metadata")) {
                    const metaStore = db.createObjectStore("metadata", { keyPath: "key" });
                }

                // Local files store: stores user-uploaded local files
                if (!db.objectStoreNames.contains("localFiles")) {
                    const localFilesStore = db.createObjectStore("localFiles", { keyPath: "filename" });
                    localFilesStore.createIndex("type", "type", { unique: false });
                }

                // UI assets store: stores extracted UI elements (buttons, arrows, etc.)
                if (!db.objectStoreNames.contains("uiAssets")) {
                    const uiAssetsStore = db.createObjectStore("uiAssets", { keyPath: "name" });
                }
            };
        });
    }

    async checkDataVersion() {
        try {
            const storedVersion = await this.loadMetadata("dataVersion");

            const needsMigration = storedVersion && storedVersion !== this.DATA_VERSION;

            let isLegacyInstallation = false;
            if (!storedVersion) {
                const assetCount = await this.getAssetCount();
                if (assetCount > 0) {
                    console.warn(`Legacy installation detected: ${assetCount} assets found with no data version`);
                    isLegacyInstallation = true;
                }
            }

            if (needsMigration || isLegacyInstallation) {
                if (needsMigration) {
                    console.warn(`Data version mismatch: stored ${storedVersion}, current ${this.DATA_VERSION}`);
                }

                this.versionMismatch = true;

                const compositions = await this.getAllCompositions();
                const uiAssets = await this.getAllUIAssets();

                await this.clearAssets();
                await this.clearLocalFiles();

                /*if (compositions && compositions.length > 0) {
                    for (const comp of compositions) {
                    }
                }*/

                await this.saveMetadata("dataVersion", this.DATA_VERSION);

                const reason = isLegacyInstallation ? "Legacy data structure detected" : "Data version mismatch";
                //console.log(`${reason}. Data migration complete. Game assets need to be re-imported.`);
            } else if (!storedVersion) {
                await this.saveMetadata("dataVersion", this.DATA_VERSION);
            }
        } catch (error) {
            console.error("Error checking data version:", error);
        }
    }

    async getAssetCount() {
        await this.ensureReady();
        const transaction = this.db.transaction(["assets"], "readonly");
        const store = transaction.objectStore("assets");

        return new Promise((resolve, reject) => {
            const request = store.count();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async clearAssets() {
        await this.ensureReady();
        const transaction = this.db.transaction(["assets"], "readwrite");
        const store = transaction.objectStore("assets");

        return new Promise((resolve, reject) => {
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async clearLocalFiles() {
        await this.ensureReady();
        const transaction = this.db.transaction(["localFiles"], "readwrite");
        const store = transaction.objectStore("localFiles");

        return new Promise((resolve, reject) => {
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getAllCompositions() {
        try {
            const comps = await this.loadMetadata("compositions");
            return comps || [];
        } catch (error) {
            return [];
        }
    }

    async getAllUIAssets() {
        await this.ensureReady();
        const transaction = this.db.transaction(["uiAssets"], "readonly");
        const store = transaction.objectStore("uiAssets");

        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }

    async ensureReady() {
        if (!this.isReady) {
            await this.initPromise;
        }
    }

    generateAssetId(originalPath, name) {
        return `${originalPath}::${name}`;
    }

    async savePartialAsset(assetData, originalPath, category, type) {
        await this.ensureReady();

        const transaction = this.db.transaction(["assets"], "readwrite");
        const store = transaction.objectStore("assets");

        const assetRecord = {
            id: this.generateAssetId(originalPath, assetData.name),
            name: assetData.name,
            originalName: assetData.originalName,
            originalPath: originalPath,
            baseFileName: assetData.baseFileName,
            category: category,
            type: type,
            blob: assetData.blob,
            isSprite: assetData.isSprite || false,
            cropped: false,
            timestamp: Date.now(),
            variants: assetData.variants,
            isComposition: assetData.isComposition || false,
            compositionId: assetData.compositionId || null,
            compositionDescriptor: assetData.compositionDescriptor || null,
        };

        return new Promise((resolve, reject) => {
            const request = store.put(assetRecord);
            request.onsuccess = () => resolve(assetRecord);
            request.onerror = () => reject(request.error);
        });
    }

    async saveCompleteAsset(assetId, croppedBlob) {
        await this.ensureReady();

        const transaction = this.db.transaction(["assets"], "readwrite");
        const store = transaction.objectStore("assets");

        return new Promise((resolve, reject) => {
            const getRequest = store.get(assetId);
            getRequest.onsuccess = () => {
                const assetRecord = getRequest.result;
                if (assetRecord) {
                    assetRecord.croppedBlob = croppedBlob;
                    assetRecord.cropped = true;
                    assetRecord.timestamp = Date.now();

                    const putRequest = store.put(assetRecord);
                    putRequest.onsuccess = () => resolve(assetRecord);
                    putRequest.onerror = () => reject(putRequest.error);
                } else {
                    reject(new Error(`Asset ${assetId} not found`));
                }
            };
            getRequest.onerror = () => reject(getRequest.error);
        });
    }

    async loadSavedAssets() {
        await this.ensureReady();

        const transaction = this.db.transaction(["assets"], "readonly");
        const store = transaction.objectStore("assets");

        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => {
                const assets = request.result;

                assets.sort((a, b) => {
                    const typeDiff = assetTypeOrder[a.type] - assetTypeOrder[b.type];
                    if (typeDiff !== 0) return typeDiff;

                    const catA = assetCategoryOrder[a.category] ?? Number.MAX_SAFE_INTEGER;
                    const catB = assetCategoryOrder[b.category] ?? Number.MAX_SAFE_INTEGER;
                    return catA - catB;
                });

                const organized = {
                    images: {},
                    audio: {},
                };

                assets.forEach((asset) => {
                    if (!organized[asset.type][asset.category]) {
                        organized[asset.type][asset.category] = {};
                    }

                    const assetData = {
                        url: URL.createObjectURL(asset.blob),
                        blob: asset.blob,
                        name: asset.name,
                        originalName: asset.originalName,
                        baseFileName: asset.baseFileName,
                        isSprite: asset.isSprite,
                        cropped: asset.cropped,
                        originalPath: asset.originalPath,
                        variants: asset.variants,
                        isComposition: asset.isComposition || false,
                        compositionId: asset.compositionId || null,
                        compositionDescriptor: asset.compositionDescriptor || null,
                        compositionSource: asset.compositionSource || "user",
                    };

                    if (asset.croppedBlob) {
                        assetData.croppedUrl = URL.createObjectURL(asset.croppedBlob);
                        assetData.croppedBlob = asset.croppedBlob;
                        assetData.cropped = true;
                    }

                    organized[asset.type][asset.category][asset.name] = assetData;
                });

                resolve(organized);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async getStorageState() {
        await this.ensureReady();

        const transaction = this.db.transaction(["assets"], "readonly");
        const store = transaction.objectStore("assets");

        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => {
                const assets = request.result;

                if (assets.length === 0) {
                    resolve("none");
                    return;
                }

                const totalCroppedExpected = numberOfPictures + numberOfBackgrounds;

                const hasBase = assets.length >= Object.keys(filenamesMapped).length - numberOfData;
                const croppedCount = assets.filter((a) => a.cropped === true).length;
                const hasFull = croppedCount >= totalCroppedExpected;
                const hasPartial = croppedCount < totalCroppedExpected;

                this.haveDataStored = hasBase || hasPartial || hasFull;

                //console.log(`totalExpected=${totalCroppedExpected}`);
                //console.log(`hasBase=${hasBase}`);
                //console.log(`croppedCount=${croppedCount}`);
                //console.log(`hasFull=${hasFull}`);
                //console.log(`hasPartial=${hasPartial}`);
                //console.log(`assets.length=${assets.length}`);
                //console.log(`filenamesMapped.length=${Object.keys(filenamesMapped).length - numberOfData}`);

                if (hasFull) {
                    resolve("complete");
                } else if (hasPartial) {
                    resolve("partial");
                } else if (hasBase) {
                    resolve("base");
                } else {
                    resolve("none");
                }
            };
            request.onerror = () => reject(request.error);
        });
    }

    async getAssetByPath(originalPath) {
        await this.ensureReady();

        const transaction = this.db.transaction(["assets"], "readonly");
        const store = transaction.objectStore("assets");
        const index = store.index("originalPath");

        return new Promise((resolve, reject) => {
            const request = index.getAll(originalPath);
            request.onsuccess = () => {
                const assets = request.result;
                resolve(assets.length > 0 ? assets[0] : null);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async getAssetsNeedingCrop() {
        await this.ensureReady();

        const transaction = this.db.transaction(["assets"], "readonly");
        const store = transaction.objectStore("assets");

        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => {
                const assets = request.result;
                const needsCropping = assets.filter(
                    (asset) =>
                        asset.cropped === false &&
                        asset.type === "images" &&
                        asset.category !== "Portraits" &&
                        !asset.isSprite,
                );
                resolve(needsCropping);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async updateAssetState(assetId, newState) {
        await this.ensureReady();

        const transaction = this.db.transaction(["assets"], "readwrite");
        const store = transaction.objectStore("assets");

        return new Promise((resolve, reject) => {
            const getRequest = store.get(assetId);
            getRequest.onsuccess = () => {
                const assetRecord = getRequest.result;
                if (assetRecord) {
                    assetRecord.state = newState;
                    assetRecord.timestamp = Date.now();

                    const putRequest = store.put(assetRecord);
                    putRequest.onsuccess = () => resolve(assetRecord);
                    putRequest.onerror = () => reject(putRequest.error);
                } else {
                    reject(new Error(`Asset ${assetId} not found`));
                }
            };
            getRequest.onerror = () => reject(getRequest.error);
        });
    }

    async clearAllData() {
        await this.ensureReady();

        if (this.db) {
            this.db.close();
            this.db = null;
            this.isReady = false;
        }

        return new Promise((resolve, reject) => {
            const request = indexedDB.deleteDatabase(this.dbName);

            request.onsuccess = () => {
                location.replace(location.pathname + "?reload=" + Date.now());
                resolve();
            };

            request.onerror = () => reject(request.error);
            request.onblocked = () => reject(new Error("Database deletion blocked"));
        });
    }

    async saveMetadata(key, data) {
        await this.ensureReady();

        const transaction = this.db.transaction(["metadata"], "readwrite");
        const store = transaction.objectStore("metadata");

        return new Promise((resolve, reject) => {
            const request = store.put({ key, data, timestamp: Date.now() });
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async loadMetadata(key) {
        await this.ensureReady();

        const transaction = this.db.transaction(["metadata"], "readonly");
        const store = transaction.objectStore("metadata");

        return new Promise((resolve, reject) => {
            const request = store.get(key);
            request.onsuccess = () => {
                const result = request.result;
                resolve(result ? result.data : null);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async getDatabaseSize() {
        await this.ensureReady();

        const transaction = this.db.transaction(["assets"], "readonly");
        const store = transaction.objectStore("assets");

        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => {
                const assets = request.result;
                let totalSize = 0;

                assets.forEach((asset) => {
                    if (asset.blob) totalSize += asset.blob.size;
                    if (asset.croppedBlob) totalSize += asset.croppedBlob.size;
                });

                resolve(totalSize);
            };
            request.onerror = () => reject(request.error);
        });
    }

    formatSize(bytes) {
        const sizes = ["B", "KB", "MB", "GB"];
        if (bytes === 0) return "0 B";

        const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
    }

    async saveLocalFile(filename, blob, type) {
        await this.ensureReady();

        const transaction = this.db.transaction(["localFiles"], "readwrite");
        const store = transaction.objectStore("localFiles");

        const fileRecord = {
            filename: filename,
            blob: blob,
            type: type, // "image" or "audio"
            timestamp: Date.now(),
        };

        return new Promise((resolve, reject) => {
            const request = store.put(fileRecord);
            request.onsuccess = () => resolve(fileRecord);
            request.onerror = () => reject(request.error);
        });
    }

    async getLocalFile(filename) {
        await this.ensureReady();

        const transaction = this.db.transaction(["localFiles"], "readonly");
        const store = transaction.objectStore("localFiles");

        return new Promise((resolve, reject) => {
            const request = store.get(filename);
            request.onsuccess = () => {
                const result = request.result;
                resolve(result || null);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async getAllLocalFiles() {
        await this.ensureReady();

        const transaction = this.db.transaction(["localFiles"], "readonly");
        const store = transaction.objectStore("localFiles");

        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async saveUIAsset(name, blob, cssVarName = null, isAnimated = false, animationSpeed = null) {
        await this.ensureReady();

        const transaction = this.db.transaction(["uiAssets"], "readwrite");
        const store = transaction.objectStore("uiAssets");

        const assetRecord = {
            name: name,
            blob: blob,
            cssVarName: cssVarName,
            isAnimated: isAnimated,
            animationSpeed: animationSpeed,
            timestamp: Date.now(),
        };

        return new Promise((resolve, reject) => {
            const request = store.put(assetRecord);
            request.onsuccess = () => resolve(assetRecord);
            request.onerror = () => reject(request.error);
        });
    }

    async getUIAsset(name) {
        await this.ensureReady();

        const transaction = this.db.transaction(["uiAssets"], "readonly");
        const store = transaction.objectStore("uiAssets");

        return new Promise((resolve, reject) => {
            const request = store.get(name);
            request.onsuccess = () => {
                const result = request.result;
                resolve(result || null);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async getAllUIAssets() {
        await this.ensureReady();

        const transaction = this.db.transaction(["uiAssets"], "readonly");
        const store = transaction.objectStore("uiAssets");

        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    generateFavouriteKey(type, category, name) {
        return `${type}:${category}:${name}`;
    }

    async getFavourites() {
        const data = await this.loadMetadata("favourites");
        return new Set(data || []);
    }

    async saveFavourites(favouritesSet) {
        await this.saveMetadata("favourites", Array.from(favouritesSet));
    }

    async isFavourite(type, category, name) {
        const favourites = await this.getFavourites();
        return favourites.has(this.generateFavouriteKey(type, category, name));
    }

    async toggleFavourite(type, category, name) {
        const key = this.generateFavouriteKey(type, category, name);
        const favourites = await this.getFavourites();

        if (favourites.has(key)) {
            favourites.delete(key);
        } else {
            favourites.add(key);
        }

        await this.saveFavourites(favourites);
        return favourites.has(key);
    }

    async setFavourite(type, category, name, isFavourite) {
        const key = this.generateFavouriteKey(type, category, name);
        const favourites = await this.getFavourites();

        if (isFavourite) {
            favourites.add(key);
        } else {
            favourites.delete(key);
        }

        await this.saveFavourites(favourites);
    }
}

if (!window.memoryManager) {
    window.memoryManager = new MemoryManager();
}
