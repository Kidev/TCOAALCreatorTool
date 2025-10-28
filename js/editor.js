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

let projectData = {
    config: {
        showControls: true,
        showDebug: true,
        showDialogArrow: true,
        backgroundMusic: null,
    },
    characters: {},
    glitchConfig: {
        scrambledColor: Color.BLACK,
        realColor: Color.DEFAULT,
        changeSpeed: 50,
        realProbability: 5,
        autoStart: true,
        charsAllowed: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
    },
    scenes: [],
    compositions: [], // Shareable composition descriptors
};

let imageMap = new Map();
let soundMap = new Map();
let backgroundMusicMap = new Map();
let expandedScenes = new Set();
let currentlyPlayingAudio = null;
let backgroundMusicFile = null;
let backgroundMusicBlobUrl = null;
let previewBackgroundMusic = null;

if (!document.getElementById("outputCode")) {
    const hiddenTextarea = document.createElement("textarea");
    hiddenTextarea.id = "outputCode";
    hiddenTextarea.style.display = "none";
    document.body.appendChild(hiddenTextarea);
}

async function loadLocalFilesForScenes() {
    if (!window.memoryManager) return;

    const imageFields = ["image", "bustLeft", "bustRight"];

    for (let sceneIndex = 0; sceneIndex < projectData.scenes.length; sceneIndex++) {
        const scene = projectData.scenes[sceneIndex];

        for (const field of imageFields) {
            const path = scene[field];
            if (!path) continue;

            // Skip if it's a URL or gallery reference (those are handled elsewhere)
            if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("gallery:")) {
                continue;
            }

            let loaded = false;

            const filename = path.split("/").pop();

            try {
                const localFile = await window.memoryManager.getLocalFile(filename);
                if (localFile && localFile.blob) {
                    imageMap.set(`${sceneIndex}-${field}`, localFile.blob);
                    loaded = true;
                }
            } catch (error) {}

            if (!loaded) {
                try {
                    const fetchPath = `img/${filename}`;
                    const response = await fetch(fetchPath);
                    if (response.ok) {
                        const blob = await response.blob();
                        const file = new File([blob], filename, { type: blob.type });
                        imageMap.set(`${sceneIndex}-${field}`, file);
                        // Save to IndexedDB for future use
                        await window.memoryManager.saveLocalFile(filename, file, "image");
                        loaded = true;
                    }
                } catch (error) {}
            }

            // If still not loaded, disable the parameter
            if (!loaded) {
                projectData.scenes[sceneIndex][field] = null;
            }
        }

        const soundPath = scene.sound;
        if (soundPath) {
            // Skip if it's a URL or gallery reference
            if (
                soundPath.startsWith("http://") ||
                soundPath.startsWith("https://") ||
                soundPath.startsWith("gallery:")
            ) {
                continue;
            }

            let loaded = false;

            const filename = soundPath.split("/").pop();

            try {
                const localFile = await window.memoryManager.getLocalFile(filename);
                if (localFile && localFile.blob) {
                    soundMap.set(sceneIndex, localFile.blob);
                    loaded = true;
                }
            } catch (error) {}

            if (!loaded) {
                try {
                    const fetchPath = `sounds/${filename}`;
                    const response = await fetch(fetchPath);
                    if (response.ok) {
                        const blob = await response.blob();
                        const file = new File([blob], filename, { type: blob.type });
                        soundMap.set(sceneIndex, file);
                        await window.memoryManager.saveLocalFile(filename, file, "audio");
                        loaded = true;
                    }
                } catch (error) {}
            }

            if (!loaded) {
                projectData.scenes[sceneIndex].sound = null;
            }
        }

        const bgMusicPath = scene.backgroundMusic;
        if (bgMusicPath) {
            if (
                bgMusicPath.startsWith("http://") ||
                bgMusicPath.startsWith("https://") ||
                bgMusicPath.startsWith("gallery:")
            ) {
                continue;
            }

            let loaded = false;

            const filename = bgMusicPath.split("/").pop();

            try {
                const localFile = await window.memoryManager.getLocalFile(filename);
                if (localFile && localFile.blob) {
                    backgroundMusicMap.set(sceneIndex, localFile.blob);
                    loaded = true;
                }
            } catch (error) {}

            if (!loaded) {
                try {
                    const fetchPath = `sounds/${filename}`;
                    const response = await fetch(fetchPath);
                    if (response.ok) {
                        const blob = await response.blob();
                        const file = new File([blob], filename, { type: blob.type });
                        backgroundMusicMap.set(sceneIndex, file);
                        // Save to IndexedDB for future use
                        await window.memoryManager.saveLocalFile(filename, file, "audio");
                        loaded = true;
                    }
                } catch (error) {}
            }

            // If still not loaded, disable the parameter
            if (!loaded) {
                projectData.scenes[sceneIndex].backgroundMusic = null;
            }
        }
    }
}

async function loadProjectData(data) {
    projectData = JSON.parse(JSON.stringify(data));

    document.getElementById("configShowControls").checked = projectData.config.showControls;
    document.getElementById("configShowDebug").checked = projectData.config.showDebug;
    document.getElementById("configShowDialogArrow").checked =
        projectData.config.showDialogArrow !== undefined ? projectData.config.showDialogArrow : true;

    const hasBackgroundMusic =
        projectData.config.backgroundMusic !== null && projectData.config.backgroundMusic !== undefined;
    document.getElementById("backgroundMusicEnabled").checked = hasBackgroundMusic;

    if (hasBackgroundMusic) {
        document.getElementById("backgroundMusicFile").disabled = false;
        document.getElementById("backgroundMusicUrl").disabled = false;
        document.getElementById("backgroundMusicVolumeGroup").style.display = "grid";

        const fileInput = document.getElementById("backgroundMusicFile");
        if (fileInput) {
            const button = fileInput.nextElementSibling;
            if (button && button.classList.contains("file-select-button")) {
                if (
                    projectData.config.backgroundMusic.startsWith("http://") ||
                    projectData.config.backgroundMusic.startsWith("https://")
                ) {
                    document.getElementById("backgroundMusicUrl").value = projectData.config.backgroundMusic;
                    button.querySelector(".filename").textContent = "Select file";
                    button.classList.remove("has-file");
                } else {
                    button.querySelector(".filename").textContent = projectData.config.backgroundMusic;
                    button.title = projectData.config.backgroundMusic;
                    button.classList.add("has-file");
                    button.innerHTML = `
                    <span class="filename">${projectData.config.backgroundMusic}</span>
                    <button class="file-clear-button" onclick="event.stopPropagation(); clearBackgroundMusic()">×</button>
                `;
                }
            }
        }

        document.getElementById("bg-music-button").style.display = "flex";

        if (projectData.config.backgroundMusicVolume !== undefined) {
            document.getElementById("backgroundMusicVolume").value = projectData.config.backgroundMusicVolume;
        }
    }

    document.getElementById("glitchScrambledColor").value = projectData.glitchConfig.scrambledColor;
    document.getElementById("glitchRealColor").value = projectData.glitchConfig.realColor;
    document.getElementById("glitchChangeSpeed").value = projectData.glitchConfig.changeSpeed;
    document.getElementById("glitchRealProbability").value = projectData.glitchConfig.realProbability;
    document.getElementById("glitchAutoStart").checked = projectData.glitchConfig.autoStart;
    document.getElementById("glitchCharsAllowed").value = projectData.glitchConfig.charsAllowed;
    document.getElementById("newCharacterColor").value = Color.DEFAULT;

    dialogFramework.setGlitchConfig(projectData.glitchConfig);

    updateCharactersList();

    const hasGalleryRefs = projectData.scenes.some(
        (scene) =>
            (scene.image && scene.image.startsWith("gallery:")) ||
            (scene.bustLeft && scene.bustLeft.startsWith("gallery:")) ||
            (scene.bustRight && scene.bustRight.startsWith("gallery:")) ||
            (scene.sound && scene.sound.startsWith("gallery:")) ||
            (scene.backgroundMusic && scene.backgroundMusic.startsWith("gallery:")),
    );

    if (hasGalleryRefs && !window.gameImporterAssets && window.memoryManager) {
        try {
            const storageState = await window.memoryManager.getStorageState();
            if (storageState !== "none") {
                const savedAssets = await window.memoryManager.loadSavedAssets();
                window.gameImporterAssets = savedAssets;

                if (window.pendingCompositions && window.pendingCompositions.length > 0) {
                    //console.log(`Processing ${window.pendingCompositions.length} pending compositions after loading assets...`,);
                    const pending = window.pendingCompositions;
                    window.pendingCompositions = []; // Clear queue to avoid recursion
                    if (typeof reconstructCompositionsToGallery === "function") {
                        await reconstructCompositionsToGallery(pending);
                    }
                }
            }
        } catch (error) {
            //console.warn("Failed to load gallery assets for project:", error);
        }
    }

    await loadLocalFilesForScenes();

    updateScenesList();
}

function toggleSection(button) {
    button.classList.toggle("active");
    const content = button.nextElementSibling;
    if (content.style.display === "block") {
        content.style.display = "none";
    } else {
        content.style.display = "block";
    }
}

function addCharacter() {
    const name = document.getElementById("newCharacterName").value.trim();
    const color = document.getElementById("newCharacterColor").value;

    if (!name) {
        alert("Please enter a character name");
        return;
    }

    if (projectData.characters[name]) {
        alert("Character already exists");
        return;
    }

    projectData.characters[name] = { color };
    document.getElementById("newCharacterName").value = "";

    // Update dialogFramework with the new character data
    if (typeof dialogFramework !== "undefined") {
        dialogFramework.setCharacters(projectData.characters);
    }

    updateCharactersList();
    updateAllSpeakerDropdowns();
}

function updateCharactersList() {
    const container = document.getElementById("charactersList");
    container.innerHTML = "";

    Object.entries(projectData.characters).forEach(([name, data]) => {
        const aliases = data.aliases || [];
        const aliasesDisplay = aliases.length > 0 ? aliases.join(", ") : "Click to add aliases";

        const item = document.createElement("div");
        item.className = "character-item";
        item.innerHTML = `
        <div class="character-header">
        <div>
        <span class="character-name">${name}</span>
        <span class="character-aliases" id="aliases-display-${name}"
              onclick="startEditingAliases('${name}')"
              style="cursor: pointer;"
              title="Click to edit aliases">(${aliasesDisplay})</span>
        <span class="character-aliases-edit" id="aliases-edit-${name}" style="display: none;">
            <input type="text"
                    id="aliases-input-${name}"
                    value="${aliases.join(", ")}"
                    placeholder="alias1, alias2, ..."
                    style="width: 30vw; padding: 2px 4px; font-size: 0.9em; font-family: inherit;"
                    onkeydown="if(event.key === 'Enter') saveAliases('${name}')">
            <button onclick="saveAliases('${name}')"
                    style="padding: 2px 8px; margin-left: 4px; font-size: 0.9em;">✓</button>
            <button onclick="cancelEditingAliases('${name}')"
                    style="padding: 2px 8px; margin-left: 2px; font-size: 0.9em;">✕</button>
        </span>
        </div>
        <div class="header-action-buttons">
            <label for="inputCharacterColor${name}" style="display:none;"></label>
            <input id="inputCharacterColor${name}" type="color" value="${data.color}" onchange="updateCharacterColor('${name}', this.value)">
            <button class="danger" onclick="deleteCharacter('${name}')">✕</button>
        </div>
        </div>
        `;
        container.appendChild(item);

        projectData.characters[name].color = data.color;
        projectData.characters[name].aliases = aliases;
    });
}

function startEditingAliases(characterName) {
    document.getElementById(`aliases-display-${characterName}`).style.display = "none";
    document.getElementById(`aliases-edit-${characterName}`).style.display = "inline";
    document.getElementById(`aliases-input-${characterName}`).focus();
    document.getElementById(`aliases-input-${characterName}`).select();
}

function saveAliases(characterName) {
    const input = document.getElementById(`aliases-input-${characterName}`);
    const newAliases = input.value
        .split(",")
        .map((alias) => alias.trim())
        .filter((alias) => alias.length > 0);

    updateCharacterAliases(characterName, newAliases);

    // Update dialogFramework with the updated character data
    if (typeof dialogFramework !== "undefined") {
        dialogFramework.setCharacters(projectData.characters);
    }

    updateCharactersList();
    updateAllSpeakerDropdowns();
}

function cancelEditingAliases(characterName) {
    document.getElementById(`aliases-display-${characterName}`).style.display = "inline";
    document.getElementById(`aliases-edit-${characterName}`).style.display = "none";
}

function editCharacterAliases(characterName) {
    // Kept for backward compatibility, now just calls startEditingAliases
    startEditingAliases(characterName);
}

function updateCharacterColor(name, color) {
    projectData.characters[name].color = color;

    // Update dialogFramework with the updated character data
    if (typeof dialogFramework !== "undefined") {
        dialogFramework.setCharacters(projectData.characters);
    }

    // Update speaker dropdowns to reflect new color
    updateAllSpeakerDropdowns();
}

function updateCharacterAliases(name, aliases) {
    projectData.characters[name].aliases = aliases;
}

function deleteCharacter(name) {
    if (confirm(`Delete character "${name}"?`)) {
        delete projectData.characters[name];

        // Update dialogFramework with the updated character data
        if (typeof dialogFramework !== "undefined") {
            dialogFramework.setCharacters(projectData.characters);
        }

        updateCharactersList();
        updateAllSpeakerDropdowns();
    }
}

function createFileSelectHTML(sceneIndex, field, currentValue, isSound = false, isBackgroundMusic = false) {
    const fieldId = isSound ? "sound" : isBackgroundMusic ? "backgroundMusic" : field;
    const isUrl = currentValue && (currentValue.startsWith("http://") || currentValue.startsWith("https://"));
    const isGallery = currentValue && currentValue.startsWith("gallery:");
    const hasFile = isBackgroundMusic
        ? backgroundMusicMap.has(sceneIndex)
        : isSound
          ? soundMap.has(sceneIndex)
          : imageMap.has(`${sceneIndex}-${field}`);
    const isNull = currentValue === null;

    let selectValue = "gallery";
    if (isUrl) {
        selectValue = "url";
    } else if (isGallery) {
        selectValue = "gallery";
    } else if (currentValue && currentValue !== "") {
        selectValue = "local";
    }

    const fileId = `file-${fieldId}-${sceneIndex}`;
    const selectId = `select-${fieldId}-${sceneIndex}`;

    const selectDisplay = isNull ? "display: none;" : "";
    const containerDisplay = isNull ? "display: none;" : "";

    let html = `
        <div class="file-select-wrapper">
            <label for="${selectId}" style="display: none;"></label>
            <select id="${selectId}" class="file-type-select" style="${selectDisplay}" onchange="handleFileTypeChange(${sceneIndex}, '${field}', this.value, ${isSound}, ${isBackgroundMusic})">
                <option value="gallery" ${selectValue === "gallery" ? "selected" : ""}>Gallery</option>
                <option value="url" ${selectValue === "url" ? "selected" : ""}>URL</option>
                <option value="local" ${selectValue === "local" ? "selected" : ""}>Local</option>
            </select>
            <div id="${selectId}-container" class="file-select-with-button-container" style="${containerDisplay}">
    `;

    if (selectValue === "local") {
        const fileName = hasFile
            ? isBackgroundMusic
                ? backgroundMusicMap.get(sceneIndex).name
                : isSound
                  ? soundMap.get(sceneIndex).name
                  : imageMap.get(`${sceneIndex}-${field}`).name
            : "";
        const buttonText = fileName || "Select file";
        const tooltip = fileName ? `title="${fileName}"` : "";

        const acceptType = isBackgroundMusic || isSound ? "audio/*" : "image/*";
        const uploadHandler = isBackgroundMusic ? "BackgroundMusic" : isSound ? "Sound" : "Image";
        const uploadParams = isBackgroundMusic || isSound ? sceneIndex : `${sceneIndex}, '${field}'`;

        html += `
            <label for="${fileId}" style="display: none;"></label>
            <input type="file" id="${fileId}" accept="${acceptType}"
                   onchange="handle${uploadHandler}Upload(${uploadParams}, this)">
            <button class="file-select-button ${fileName ? "has-file" : ""}"
                    onclick="document.getElementById('${fileId}').click()"
                    ${tooltip}>
                <span class="filename">${buttonText}</span>
                ${fileName ? `<button class="file-clear-button" onclick="event.stopPropagation(); clearFile(${sceneIndex}, '${field}', ${isSound}, ${isBackgroundMusic})">☓</button>` : ""}
            </button>
        `;
    } else if (selectValue === "url") {
        const urlHandler = isBackgroundMusic ? "BackgroundMusic" : isSound ? "Sound" : "Image";
        const urlParams = isBackgroundMusic || isSound ? sceneIndex : `${sceneIndex}, '${field}'`;

        html += `
            <label for="${fileId}" style="display: none;"></label>
            <input type="text" id="${fileId}" class="url-input" placeholder="Enter URL"
                   value="${isUrl ? currentValue : ""}"
                   onchange="handle${urlHandler}Url(${urlParams}, this.value)">
        `;
    } else if (selectValue === "gallery") {
        let displayName = "Select from gallery";
        if (isGallery) {
            const match = currentValue.match(/^gallery:([^/]+)\/(.+)$/);
            if (match) {
                displayName = match[2]; // Just the filename
            }
        }
        html += `
            <label for="${fileId}" style="display: none;"></label>
            <button id="${fileId}" class="gallery-button ${isGallery ? "has-file" : ""}" onclick="openGalleryForField(${sceneIndex}, '${field}', ${isSound || isBackgroundMusic})">
                <span class="filename">${displayName}</span>
                ${isGallery ? `<button class="file-clear-button" onclick="event.stopPropagation(); clearFile(${sceneIndex}, '${field}', ${isSound}, ${isBackgroundMusic})">☓</button>` : ""}
            </button>
        `;
    }

    if (isBackgroundMusic) {
        html += `
            ${
                currentValue !== null && currentValue !== ""
                    ? `
                    <button class="play-button" id="bgmusic-button-${sceneIndex}" onclick="toggleBackgroundMusicScene(${sceneIndex})">▶ Play</button>
                    `
                    : ""
            }
        `;
    } else if (isSound) {
        html += `
            ${
                currentValue !== null && currentValue !== ""
                    ? `
                    <button class="play-button" id="sound-button-${sceneIndex}" onclick="toggleSound(${sceneIndex})">▶ Play</button>
                    `
                    : ""
            }
        `;
    }

    html += `
            </div>
        </div>
    `;

    return html;
}

function handleFileTypeChange(sceneIndex, field, type, isSound = false, isBackgroundMusic = false) {
    const fieldId = isSound ? "sound" : isBackgroundMusic ? "backgroundMusic" : field;
    const selectId = `select-${fieldId}-${sceneIndex}`;
    const container = document.getElementById(`${selectId}-container`);
    const fileId = `file-${fieldId}-${sceneIndex}`;

    if (type === "local") {
        const hasFile = isBackgroundMusic
            ? backgroundMusicMap.has(sceneIndex)
            : isSound
              ? soundMap.has(sceneIndex)
              : imageMap.has(`${sceneIndex}-${field}`);
        const fileName = hasFile
            ? isBackgroundMusic
                ? backgroundMusicMap.get(sceneIndex).name
                : isSound
                  ? soundMap.get(sceneIndex).name
                  : imageMap.get(`${sceneIndex}-${field}`).name
            : "";
        const buttonText = fileName || "Select file";
        const tooltip = fileName ? `title="${fileName}"` : "";

        const acceptType = isBackgroundMusic || isSound ? "audio/*" : "image/*";
        const uploadHandler = isBackgroundMusic ? "BackgroundMusic" : isSound ? "Sound" : "Image";
        const uploadParams = isBackgroundMusic || isSound ? sceneIndex : `${sceneIndex}, '${field}'`;

        container.innerHTML = `
            <input type="file" id="${fileId}" accept="${acceptType}"
                   onchange="handle${uploadHandler}Upload(${uploadParams}, this)">
            <button class="file-select-button ${fileName ? "has-file" : ""}"
                    onclick="document.getElementById('${fileId}').click()"
                    ${tooltip}>
                <span class="filename">${buttonText}</span>
                ${fileName ? `<button class="file-clear-button" onclick="event.stopPropagation(); clearFile(${sceneIndex}, '${field}', ${isSound}, ${isBackgroundMusic})">×</button>` : ""}
            </button>
        `;
    } else if (type === "url") {
        const urlHandler = isBackgroundMusic ? "BackgroundMusic" : isSound ? "Sound" : "Image";
        const urlParams = isBackgroundMusic || isSound ? sceneIndex : `${sceneIndex}, '${field}'`;

        container.innerHTML = `
            <input type="text" class="url-input" placeholder="Enter URL"
                   onchange="handle${urlHandler}Url(${urlParams}, this.value)">
        `;
    } else if (type === "gallery") {
        container.innerHTML = `
            <button class="gallery-button" onclick="openGalleryForField(${sceneIndex}, '${field}', ${isSound || isBackgroundMusic})">Select from gallery</button>
        `;
    }
}

function openGalleryForField(sceneIndex, field, isSound) {
    let currentAssetRef = null;
    const currentValue = projectData.scenes[sceneIndex][field];
    if (currentValue && currentValue.startsWith("gallery:")) {
        currentAssetRef = currentValue;
    }

    galleryContext = {
        mode: "select",
        sceneIndex: sceneIndex,
        field: field,
        isSound: isSound,
        assetType: isSound ? "audio" : "images",
        currentAssetRef: currentAssetRef,
    };

    openGallery();
}

function useGalleryAsset(name, category) {
    if (!galleryContext || galleryContext.mode !== "select") {
        //console.warn('useGalleryAsset called without selection context');
        return;
    }

    const { sceneIndex, field, isSound } = galleryContext;

    // Create portable reference: gallery:category/filename
    const galleryRef = `gallery:${category}/${name}`;

    projectData.scenes[sceneIndex][field] = galleryRef;

    const assets =
        currentGalleryTab === "images"
            ? window.gameImporterAssets.images[category]
            : window.gameImporterAssets.audio[category];
    const asset = assets[name];

    if (asset) {
        if (isSound) {
            soundMap.set(sceneIndex, { name: name, blob: asset.blob, galleryRef: galleryRef });
        } else {
            imageMap.set(`${sceneIndex}-${field}`, { name: name, blob: asset.blob, galleryRef: galleryRef });
        }
    }

    updateScenesList();
    closeGallery();
}

function clearFile(sceneIndex, field, isSound = false, isBackgroundMusic = false) {
    if (isBackgroundMusic) {
        backgroundMusicMap.delete(sceneIndex);
        projectData.scenes[sceneIndex].backgroundMusic = "";
    } else if (isSound) {
        soundMap.delete(sceneIndex);
        projectData.scenes[sceneIndex].sound = "";
    } else {
        imageMap.delete(`${sceneIndex}-${field}`);
        projectData.scenes[sceneIndex][field] = "";
    }
    updateScenesList();
}

function addScene() {
    const scene = {
        image: null,
        speaker: "",
        line1: "",
        line2: "",
        dialogFadeInTime: 200,
        dialogFadeOutTime: 200,
        imageFadeInTime: 200,
        imageFadeOutTime: 200,
        dialogDelayIn: 500,
        dialogDelayOut: 0,
        imageDelayIn: 0,
        imageDelayOut: 0,
        sound: null,
        soundVolume: 1.0,
        soundDelay: 0,
        backgroundMusic: null,
        backgroundMusicVolume: 1.0,
        censorSpeaker: false,
        demonSpeaker: false,
        bustLeft: null,
        bustRight: null,
        bustFade: 0,
        shake: false,
        shakeDelay: 0,
        shakeIntensity: 1,
        shakeDuration: 500,
    };

    projectData.scenes.push(scene);
    const newIndex = projectData.scenes.length - 1;

    const previouslyExpanded = Array.from(expandedScenes);
    expandedScenes.clear();

    previouslyExpanded.forEach((prevIndex) => {
        const previewSpeaker = document.getElementById(`previewSpeaker-${prevIndex}`);
        if (previewSpeaker && previewSpeaker._glitchEffect) {
            previewSpeaker._glitchEffect.stop();
            delete previewSpeaker._glitchEffect;
        }
        const previewLine1 = document.getElementById(`previewLine1-${prevIndex}`);
        if (previewLine1 && previewLine1._glitchEffect) {
            previewLine1._glitchEffect.stop();
            delete previewLine1._glitchEffect;
        }
        const previewLine2 = document.getElementById(`previewLine2-${prevIndex}`);
        if (previewLine2 && previewLine2._glitchEffect) {
            previewLine2._glitchEffect.stop();
            delete previewLine2._glitchEffect;
        }
    });

    expandedScenes.add(newIndex);
    updateScenesList();
}

function handleImageUrl(sceneIndex, field, url) {
    if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
        projectData.scenes[sceneIndex][field] = url;
        imageMap.delete(`${sceneIndex}-${field}`);
        updateScenesList();
    } else if (!url) {
        projectData.scenes[sceneIndex][field] = "";
        imageMap.delete(`${sceneIndex}-${field}`);
        updateScenesList();
    }
}

function handleSoundUrl(sceneIndex, url) {
    if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
        projectData.scenes[sceneIndex].sound = url;
        soundMap.delete(sceneIndex);
        updateScenesList();
    } else if (!url) {
        projectData.scenes[sceneIndex].sound = "";
        soundMap.delete(sceneIndex);
        updateScenesList();
    }
}

function updateScenesList(onlyUpdateIndex = null) {
    const container = document.getElementById("scenesList");

    if (onlyUpdateIndex !== null) {
        const sceneElements = container.querySelectorAll(".scene-item");
        if (sceneElements[onlyUpdateIndex]) {
            const existingItem = sceneElements[onlyUpdateIndex];
            const newItem = createSceneElement(onlyUpdateIndex);
            existingItem.replaceWith(newItem);
            if (expandedScenes.has(onlyUpdateIndex)) {
                setTimeout(() => updatePreviewDialog(onlyUpdateIndex), 0);
            }
            return;
        }
    }

    container.innerHTML = "";
    projectData.scenes.forEach((scene, index) => {
        const item = createSceneElement(index);
        container.appendChild(item);
    });

    setTimeout(() => updateAllPreviewDialogs(), 0);
}

function escapeHtml(text) {
    if (!text) return "";
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function createSceneElement(index) {
    const scene = projectData.scenes[index];
    const nbScenes = projectData.scenes.length;
    const item = document.createElement("div");
    item.className = "scene-item";

    let speakerOptions = '<option style="color: var(--txt-color)" value="">Narrator</option>';

    Object.keys(projectData.characters).forEach((charName) => {
        const char = projectData.characters[charName];
        const isSelected = scene.speaker === charName;
        speakerOptions += `<option style="color: ${char.color}" value="${escapeHtml(charName)}" ${isSelected ? "selected" : ""}>${escapeHtml(charName)}</option>`;

        if (char.aliases && char.aliases.length > 0) {
            char.aliases.forEach((alias) => {
                if (alias.length > 0) {
                    const isAliasSelected = scene.speaker === alias;
                    speakerOptions += `<option style="color: ${char.color}" value="${escapeHtml(alias)}" ${isAliasSelected ? "selected" : ""}>  → ${escapeHtml(alias)}</option>`;
                }
            });
        }
    });

    let preview1 = scene.line1 ? scene.line1.substring(0, 150) : "";
    let preview2 = scene.line2 ? scene.line2.substring(0, 150) : "";
    const quote = scene.speaker === "" ? "" : '"';
    const isExpanded = expandedScenes.has(index);

    if (preview1.length > 0) {
        preview1 = quote + preview1;
        if (preview2.length > 0) {
            preview2 = preview2 + quote;
        } else {
            preview1 = preview1 + quote;
        }
    } else if (preview2.length > 0) {
        preview2 = quote + preview2 + quote;
    } else {
        preview1 = "(NO TEXT)";
    }

    if (scene.demonSpeaker === true) {
        preview1 = dialogFramework.toEntitySpeechPreserveTags(preview1);
        preview2 = dialogFramework.toEntitySpeechPreserveTags(preview2);
    }

    const isValidData = (data) => {
        return data !== null;
    };

    const createImagePreview = () => {
        let previewHTML = "";

        previewHTML = `<div class="visual-assets-preview">
        <div class="preview-container">`;

        if (scene.image && isValidData(scene.image)) {
            previewHTML += `<img src="${getImageSrc(index, "image")}" alt="Background" class="preview-background">`;
        } else {
            previewHTML += `<div class="preview-background"></div>`;
        }

        if (scene.bustLeft && isValidData(scene.bustLeft)) {
            previewHTML += `<img src="${getImageSrc(index, "bustLeft")}" alt="Bust Left" class="preview-bust left">`;
        }

        if (scene.bustRight && isValidData(scene.bustRight)) {
            previewHTML += `<img src="${getImageSrc(index, "bustRight")}" alt="Bust Right" class="preview-bust right">`;
        }

        if (scene.line1 || scene.line2) {
            previewHTML += `
        <div class="preview-text" style="background-image: url('img/tcoaal-dialog-box.webp'); background-size: 100% 100%; background-repeat: no-repeat;">
            <div class="preview-dialog-content" data-scene-index="${index}">
                <div class="dialog-line speaker-line preview-speaker-${index}"></div>
                <div class="dialog-line text-line preview-text1-${index}"></div>
                <div class="dialog-line text-line preview-text2-${index}"></div>
            </div>
        </div>`;
        }

        previewHTML += `</div></div>`;

        return previewHTML;
    };

    item.innerHTML = `
        <div class="scene-item-header">
            <button title="${index + 1}/${nbScenes}" class="collapsible ${isExpanded ? "active" : ""}" onclick="toggleScene(${index})">
                <div class="scene-header-main">
                    <span class="scene-speaker">${scene.speaker || "Narrator"}</span>
                    <span class="scene-preview-lines">${preview1}&nbsp;<br/>${preview2}&nbsp;</span>
                </div>
            </button>
        <div class="header-action-buttons">
            <button onclick="moveScene(${index}, -1)" style="display: ${index === 0 ? "none" : "block"}">↑</button>
            <button onclick="moveScene(${index}, 1)" style="display: ${index === projectData.scenes.length - 1 ? "none" : "block"}">↓</button>
            <button onclick="duplicateScene(${index})">Duplicate</button>
            <button class="danger" onclick="deleteScene(${index})">✕</button>
        </div>
        </div>
        <div class="collapsible-content" style="display: ${isExpanded ? "block" : "none"};">
            <div class="scene-content">
                <!-- Basic Settings -->
                <div class="config-preview-container">
                    <div class="columns-top-config scene-group">
                        <h4>Basic Settings</h4>
                        <div class="form-group">
                            <label for="selectSpeaker${index}">Speaker:</label>
                            <select id="selectSpeaker${index}" onchange="updateSceneValue(${index}, 'speaker', this.value)">${speakerOptions}</select>
                        </div>
                        <div class="form-group">
                            <label for="inputLine1${index}">Line 1:</label>
                            <input id="inputLine1${index}" type="text" value="${escapeHtml(scene.line1)}" oninput="updateSceneValue(${index}, 'line1', this.value)">
                        </div>
                        <div class="form-group">
                            <label for="inputLine2${index}">Line 2:</label>
                            <input id="inputLine2${index}" type="text" value="${escapeHtml(scene.line2)}" oninput="updateSceneValue(${index}, 'line2', this.value)">
                        </div>
                        <!--<div class="form-group">
                            <label for="checkCensorSpeaker${index}">Censor:</label>
                            <input id="checkCensorSpeaker${index}" type="checkbox" ${scene.censorSpeaker ? "checked" : ""}
                                onchange="updateSceneValue(${index}, 'censorSpeaker', this.checked)">
                        </div>-->
                        <div class="form-group">
                            <label for="checkCensorSpeaker${index}" class="input-line-effects-scenes">Effects:</label>
                            <div class="form-group effects-lists-group" id="inputLine2${index}">
                                <div class="row1" style="grid-column: 1;">
                                    <input type="checkbox" id="checkCensorSpeaker${index}"
                                           ${scene.censorSpeaker ? "checked" : ""}
                                           onchange="updateSceneValue(${index}, 'censorSpeaker', this.checked)">
                                    <label title="Apply glitch effect to the speaker name" for="checkCensorSpeaker${index}">Censor speaker name</label>
                                </div>
                                <div class="row2" style="grid-column: 1;">
                                    <input type="checkbox" id="checkDemonSpeaker${index}"
                                           ${scene.demonSpeaker ? "checked" : ""}
                                           onchange="updateSceneValue(${index}, 'demonSpeaker', this.checked)">
                                    <label title="SpEaK liKe tHe enTitY" for="checkDemonSpeaker${index}">Demon talk</label>
                                </div>
                            </div>                            
                        </div>
                    </div>
                    <div class="columns-top-config preview-column">
                        ${createImagePreview()}
                    </div>
                </div>

                <div class="scene-group visual-assets-group">
                    <h4>Visual Assets</h4>
                    <div class="form-group visuals">
                        <input type="checkbox" class="null-checkbox" id="image-checkbox-${index}"
                            ${isValidData(scene.image) ? "checked" : ""}
                            onchange="toggleNull(${index}, 'image', !this.checked)"
                            title="Uncheck to disable this parameter">
                        <label for="image-checkbox-${index}">Background image:</label>
                        ${createFileSelectHTML(index, "image", scene.image)}
                    </div>

                    <div class="form-group visuals">
                        <input type="checkbox" class="null-checkbox" id="bustLeft-checkbox-${index}"
                            ${isValidData(scene.bustLeft) ? "checked" : ""}
                            onchange="toggleNull(${index}, 'bustLeft', !this.checked)"
                            title="Uncheck to disable this parameter">
                        <label for="bustLeft-checkbox-${index}">Bust left:</label>
                        ${createFileSelectHTML(index, "bustLeft", scene.bustLeft)}
                    </div>

                    <div class="form-group visuals">
                        <input type="checkbox" class="null-checkbox" id="bustRight-checkbox-${index}"
                            ${isValidData(scene.bustRight) ? "checked" : ""}
                            onchange="toggleNull(${index}, 'bustRight', !this.checked)"
                            title="Uncheck to disable this parameter">
                        <label for="bustRight-checkbox-${index}">Bust right:</label>
                        ${createFileSelectHTML(index, "bustRight", scene.bustRight)}
                    </div>

                    <div class="form-group visuals">
                        <label for="inputBustFade${index}">Bust fade time:</label>
                        <input id="inputBustFade${index}" type="number" value="${scene.bustFade}" min="0" max="5000"
                            onchange="updateSceneValue(${index}, 'bustFade', parseInt(this.value))">
                    </div>
                </div>

                <div class="scene-group audio-assets-group">
                    <h4 class="collapsible-group-header" onclick="toggleSceneGroup(this)">Audio</h4>
                    <div class="collapsible-group-content" style="display: none;">
                    <div class="form-group audio">
                        <input type="checkbox" class="null-checkbox" id="sound-checkbox-${index}"
                            ${isValidData(scene.sound) ? "checked" : ""}
                            onchange="toggleNull(${index}, 'sound', !this.checked)"
                            title="Uncheck to disable this parameter">
                        <label for="sound-checkbox-${index}">Sound:</label>
                        <div style="display: flex; align-items: center; gap: 0.8vmax; flex: 1;">
                            ${createFileSelectHTML(index, "sound", scene.sound, true)}
                        </div>
                    </div>
                    <div class="form-group audio">
                        <label for="inputSoundVolume${index}">Sound volume:</label>
                        <input id="inputSoundVolume${index}" type="number" value="${scene.soundVolume}" min="0" max="1" step="0.1"
                            onchange="updateSceneValue(${index}, 'soundVolume', parseFloat(this.value))">
                    </div>
                    <div class="form-group audio">
                        <label for="inputSoundDelay${index}">Sound delay:</label>
                        <input id="inputSoundDelay${index}" type="number" value="${scene.soundDelay}" min="0" max="10000"
                            onchange="updateSceneValue(${index}, 'soundDelay', parseInt(this.value))">
                    </div>
                    <div class="form-group audio">
                        <input type="checkbox" class="null-checkbox" id="backgroundMusic-checkbox-${index}"
                            ${isValidData(scene.backgroundMusic) ? "checked" : ""}
                            onchange="toggleNull(${index}, 'backgroundMusic', !this.checked)"
                            title="Uncheck to disable this parameter">
                        <label for="backgroundMusic-checkbox-${index}">Background music:</label>
                        <div style="display: flex; align-items: center; gap: 0.8vmax; flex: 1;">
                            ${createFileSelectHTML(index, "backgroundMusic", scene.backgroundMusic, false, true)}
                        </div>
                    </div>
                    <div class="form-group audio">
                        <label for="inputBackgroundMusicVolume${index}">Background music volume:</label>
                        <input id="inputBackgroundMusicVolume${index}" type="number" value="${scene.backgroundMusicVolume}" min="0" max="1" step="0.1"
                            onchange="updateSceneValue(${index}, 'backgroundMusicVolume', parseFloat(this.value))">
                    </div>
                    </div>
                </div>

                <div class="scene-group timimg-assets-group">
                    <h4 class="collapsible-group-header" onclick="toggleSceneGroup(this)">Timing</h4>
                    <div class="collapsible-group-content" style="display: none;">
                    <div class="form-group">
                        <label for="inputDialogFadeIn${index}">Dialog fade in:</label>
                        <input id="inputDialogFadeIn${index}" type="number" value="${scene.dialogFadeInTime}" min="-5000" max="5000"
                            onchange="updateSceneValue(${index}, 'dialogFadeInTime', parseInt(this.value))">
                    </div>
                    <div class="form-group">
                        <label for="inputDialogFadeOut${index}">Dialog fade out:</label>
                        <input id="inputDialogFadeOut${index}" type="number" value="${scene.dialogFadeOutTime}" min="-5000" max="5000"
                            onchange="updateSceneValue(${index}, 'dialogFadeOutTime', parseInt(this.value))">
                    </div>
                    <div class="form-group">
                        <label for="inputDialogDelayIn${index}">Dialog delay in:</label>
                        <input id="inputDialogDelayIn${index}" type="number" value="${scene.dialogDelayIn}" min="0" max="10000"
                            onchange="updateSceneValue(${index}, 'dialogDelayIn', parseInt(this.value))">
                    </div>
                    <div class="form-group">
                        <label for="inputDialogDelayOut${index}">Dialog delay out:</label>
                        <input id="inputDialogDelayOut${index}" type="number" value="${scene.dialogDelayOut}" min="0" max="10000"
                            onchange="updateSceneValue(${index}, 'dialogDelayOut', parseInt(this.value))">
                    </div>
                    <div class="form-group">
                        <label for="inputImageFadeIn${index}">Image fade in:</label>
                        <input id="inputImageFadeIn${index}" type="number" value="${scene.imageFadeInTime}" min="-5000" max="5000"
                            onchange="updateSceneValue(${index}, 'imageFadeInTime', parseInt(this.value))">
                    </div>
                    <div class="form-group">
                        <label for="inputImageFadeOut${index}">Image fade out:</label>
                        <input id="inputImageFadeOut${index}" type="number" value="${scene.imageFadeOutTime}" min="-5000" max="5000"
                            onchange="updateSceneValue(${index}, 'imageFadeOutTime', parseInt(this.value))">
                    </div>
                    <div class="form-group">
                        <label for="inputImageDelayIn${index}">Image delay in:</label>
                        <input id="inputImageDelayIn${index}" type="number" value="${scene.imageDelayIn}" min="0" max="10000"
                            onchange="updateSceneValue(${index}, 'imageDelayIn', parseInt(this.value))">
                    </div>
                    <div class="form-group">
                        <label for="inputImageDelayOut${index}">Image delay out:</label>
                        <input id="inputImageDelayOut${index}" type="number" value="${scene.imageDelayOut}" min="0" max="10000"
                            onchange="updateSceneValue(${index}, 'imageDelayOut', parseInt(this.value))">
                    </div>
                    </div>
                </div>

                <div class="scene-group effects-assets-group">
                    <h4 class="collapsible-group-header" onclick="toggleSceneGroup(this)">Effects</h4>
                    <div class="collapsible-group-content" style="display: none;">
                    <div class="form-group">
                        <label for="checkShakeEffect${index}">Shake effect:</label>
                        <input id="checkShakeEffect${index}" type="checkbox" ${scene.shake ? "checked" : ""}
                            onchange="updateSceneValue(${index}, 'shake', this.checked)">
                    </div>
                    <div class="form-group">
                        <label for="inputShakeDelay${index}">Shake delay:</label>
                        <input id="inputShakeDelay${index}" type="number" value="${scene.shakeDelay}" min="0" max="10000"
                            onchange="updateSceneValue(${index}, 'shakeDelay', parseInt(this.value))">
                    </div>
                    <div class="form-group">
                        <label for="inputShakeIntensity${index}">Shake intensity:</label>
                        <input id="inputShakeIntensity${index}" type="number" value="${scene.shakeIntensity}" min="0" max="10" step="0.1"
                            onchange="updateSceneValue(${index}, 'shakeIntensity', parseFloat(this.value))">
                    </div>
                    <div class="form-group">
                        <label for="inputShakeDuration${index}">Shake duration:</label>
                        <input id="inputShakeDuration${index}" type="number" value="${scene.shakeDuration}" min="0" max="5000"
                            onchange="updateSceneValue(${index}, 'shakeDuration', parseInt(this.value))">
                    </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    return item;
}

function toggleSceneGroup(headerElement) {
    const content = headerElement.nextElementSibling;
    if (content && content.classList.contains("collapsible-group-content")) {
        const isVisible = content.style.display !== "none";
        content.style.display = isVisible ? "none" : "block";
        headerElement.classList.toggle("active", !isVisible);
    }
}

function updateAllSpeakerDropdowns() {
    projectData.scenes.forEach((scene, index) => {
        const selectElement = document.getElementById(`selectSpeaker${index}`);
        if (!selectElement) return;

        const currentValue = selectElement.value;

        let speakerOptions = '<option style="color: var(--txt-color)" value="">Narrator</option>';

        Object.keys(projectData.characters).forEach((charName) => {
            const char = projectData.characters[charName];
            const isSelected = currentValue === charName;
            speakerOptions += `<option style="color: ${char.color}" value="${charName}" ${isSelected ? "selected" : ""}>${charName}</option>`;

            if (char.aliases && char.aliases.length > 0) {
                char.aliases.forEach((alias) => {
                    if (alias.length > 0) {
                        const isAliasSelected = currentValue === alias;
                        speakerOptions += `<option style="color: ${char.color}" value="${alias}" ${isAliasSelected ? "selected" : ""}>  → ${alias}</option>`;
                    }
                });
            }
        });

        selectElement.innerHTML = speakerOptions;
    });

    updateAllPreviewDialogs();
}

function updatePreviewDialog(index) {
    const scene = projectData.scenes[index];
    const container = document.querySelector(`[data-scene-index="${index}"]`);
    if (!container) return;

    const speakerElement = container.querySelector(`.preview-speaker-${index}`);
    const text1Element = container.querySelector(`.preview-text1-${index}`);
    const text2Element = container.querySelector(`.preview-text2-${index}`);

    if (!speakerElement || !text1Element || !text2Element) return;

    if (window.previewGlitchEffects && window.previewGlitchEffects[index]) {
        window.previewGlitchEffects[index].forEach((effect) => {
            if (effect && effect.destroy) {
                effect.destroy();
            }
        });
        window.previewGlitchEffects[index] = [];
    }

    if (!window.previewGlitchEffects) {
        window.previewGlitchEffects = {};
    }
    window.previewGlitchEffects[index] = [];

    speakerElement.className = `dialog-line speaker-line preview-speaker-${index}`;
    text1Element.className = `dialog-line text-line preview-text1-${index}`;
    text2Element.className = `dialog-line text-line preview-text2-${index}`;
    speakerElement.innerHTML = "";
    text1Element.innerHTML = "";
    text2Element.innerHTML = "";

    const characterInfo = dialogFramework.getCharacterFromSpeaker(scene.speaker);
    if (scene.speaker && characterInfo) {
        speakerElement.textContent = scene.speaker;
        text1Element.classList.add(characterInfo.character.characterClassName);
        text2Element.classList.add(characterInfo.character.characterClassName);

        if (scene.censorSpeaker) {
            const glitchEffect = new GlitchTextEffect(speakerElement, dialogFramework.glitchConfig);
            window.previewGlitchEffects[index].push(glitchEffect);
        }
    }

    let processedLine1 = scene.line1 || "";
    let processedLine2 = scene.line2 || "";

    if (scene.demonSpeaker === true) {
        processedLine1 = dialogFramework.toEntitySpeechPreserveTags(processedLine1);
        processedLine2 = dialogFramework.toEntitySpeechPreserveTags(processedLine2);
    }

    if (scene.speaker && characterInfo) {
        if (processedLine1.trim() !== "" && processedLine2.trim() !== "") {
            processedLine1 = '"' + processedLine1;
            processedLine2 = processedLine2 + '"';
        } else if (processedLine1.trim() !== "" && processedLine2.trim() === "") {
            processedLine1 = '"' + processedLine1 + '"';
        } else if (processedLine1.trim() === "" && processedLine2.trim() !== "") {
            processedLine2 = '"' + processedLine2 + '"';
        }
    }

    if (processedLine1.includes("<")) {
        const parsed1 = dialogFramework.parseFormattedText(processedLine1);
        text1Element.innerHTML = parsed1.innerHTML;

        const glitchContainers1 = text1Element.querySelectorAll(".glitch-container");
        glitchContainers1.forEach((container) => {
            const tagConfig = JSON.parse(container.dataset.glitchConfig);
            const mergedConfig = { ...dialogFramework.glitchConfig, ...tagConfig };
            const glitchEffect = new GlitchTextEffect(container, mergedConfig);
            window.previewGlitchEffects[index].push(glitchEffect);
        });
    } else {
        text1Element.textContent = processedLine1;
    }

    if (processedLine2.includes("<")) {
        const parsed2 = dialogFramework.parseFormattedText(processedLine2);
        text2Element.innerHTML = parsed2.innerHTML;

        const glitchContainers2 = text2Element.querySelectorAll(".glitch-container");
        glitchContainers2.forEach((container) => {
            const tagConfig = JSON.parse(container.dataset.glitchConfig);
            const mergedConfig = { ...dialogFramework.glitchConfig, ...tagConfig };
            const glitchEffect = new GlitchTextEffect(container, mergedConfig);
            window.previewGlitchEffects[index].push(glitchEffect);
        });
    } else {
        text2Element.textContent = processedLine2;
    }

    updateSceneHeaderPreview(index);
}

function updateSceneHeaderPreview(index) {
    const scene = projectData.scenes[index];
    const sceneItems = document.querySelectorAll(".scene-item");
    const sceneItem = sceneItems[index];

    if (!sceneItem) return;

    const previewLinesElement = sceneItem.querySelector(".scene-preview-lines");
    if (!previewLinesElement) return;

    // Same logic as in createSceneElement for preview text
    let preview1 = scene.line1 ? scene.line1.substring(0, 150) : "";
    let preview2 = scene.line2 ? scene.line2.substring(0, 150) : "";
    const quote = scene.speaker === "" ? "" : '"';

    if (preview1.length > 0) {
        preview1 = quote + preview1;
        if (preview2.length > 0) {
            preview2 = preview2 + quote;
        } else {
            preview1 = preview1 + quote;
        }
    } else if (preview2.length > 0) {
        preview2 = quote + preview2 + quote;
    } else {
        preview1 = "(NO TEXT)";
    }

    if (scene.demonSpeaker === true) {
        preview1 = dialogFramework.toEntitySpeechPreserveTags(preview1);
        preview2 = dialogFramework.toEntitySpeechPreserveTags(preview2);
    }

    previewLinesElement.innerHTML = `${preview1}&nbsp;<br/>${preview2}&nbsp;`;
}

function updateAllPreviewDialogs() {
    expandedScenes.forEach((index) => {
        setTimeout(() => updatePreviewDialog(index), 0);
    });
}

function toggleScene(index) {
    if (expandedScenes.has(index)) {
        expandedScenes.delete(index);
        if (window.previewGlitchEffects && window.previewGlitchEffects[index]) {
            window.previewGlitchEffects[index].forEach((effect) => {
                if (effect && effect.destroy) {
                    effect.destroy();
                }
            });
            delete window.previewGlitchEffects[index];
        }
    } else {
        const previouslyExpanded = Array.from(expandedScenes);
        expandedScenes.clear();

        previouslyExpanded.forEach((prevIndex) => {
            if (window.previewGlitchEffects && window.previewGlitchEffects[prevIndex]) {
                window.previewGlitchEffects[prevIndex].forEach((effect) => {
                    if (effect && effect.destroy) {
                        effect.destroy();
                    }
                });
                delete window.previewGlitchEffects[prevIndex];
            }
        });

        expandedScenes.add(index);
    }
    updateScenesList();
}

function updateSceneValue(index, field, value) {
    if (["line1", "line2"].includes(field)) {
        const scene = projectData.scenes[index];

        const hadLines = !!(scene.line1 || scene.line2);

        projectData.scenes[index][field] = value;

        const hasLines = !!(scene.line1 || scene.line2);

        const needsStructureUpdate = hadLines !== hasLines;

        const container = document.querySelector(`[data-scene-index="${index}"]`);
        if (!container || needsStructureUpdate) {
            const inputId = field === "line1" ? `inputLine1${index}` : `inputLine2${index}`;
            const cursorPosition = document.getElementById(inputId)?.selectionStart || 0;

            updateScenesList(index);

            setTimeout(() => {
                const newInput = document.getElementById(inputId);
                if (newInput) {
                    newInput.focus();
                    newInput.setSelectionRange(cursorPosition, cursorPosition);
                }
            }, 0);
        } else {
            setTimeout(() => updatePreviewDialog(index), 0);
        }
    } else {
        projectData.scenes[index][field] = value;

        if (["speaker", "censorSpeaker", "demonSpeaker"].includes(field)) {
            updateScenesList(index);
            setTimeout(() => updatePreviewDialog(index), 0);
        }
    }
}

function getImageSrc(sceneIndex, field) {
    const key = `${sceneIndex}-${field}`;
    const file = imageMap.get(key);
    if (file) {
        if (file instanceof Blob) {
            return URL.createObjectURL(file);
        }
        if (file.blob) {
            return URL.createObjectURL(file.blob);
        }
    }

    const imagePath = projectData.scenes[sceneIndex][field];
    if (!imagePath) return "";

    if (imagePath.startsWith("gallery:")) {
        const match = imagePath.match(/^gallery:([^/]+)\/(.+)$/);
        if (match && window.gameImporterAssets) {
            const [, category, name] = match;
            const asset = window.gameImporterAssets.images[category]?.[name];
            if (asset) {
                return asset.croppedUrl || asset.url;
            }
        }
        return "";
    }

    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
        return imagePath;
    }

    return "img/" + imagePath;
}

async function handleImageUpload(sceneIndex, field, input) {
    const file = input.files[0];
    if (file) {
        projectData.scenes[sceneIndex][field] = file.name;
        imageMap.set(`${sceneIndex}-${field}`, file);

        if (window.memoryManager) {
            try {
                await window.memoryManager.saveLocalFile(file.name, file, "image");
            } catch (error) {
                //console.error('Failed to save local file to IndexedDB:', error);
            }
        }

        updateScenesList();
    }
}

async function handleSoundUpload(sceneIndex, input) {
    const file = input.files[0];
    if (file) {
        projectData.scenes[sceneIndex].sound = file.name;
        soundMap.set(sceneIndex, file);

        if (window.memoryManager) {
            try {
                await window.memoryManager.saveLocalFile(file.name, file, "audio");
            } catch (error) {
                //console.error('Failed to save local file to IndexedDB:', error);
            }
        }

        updateScenesList();
    }
}

async function handleBackgroundMusicUpload(sceneIndex, input) {
    const file = input.files[0];
    if (file) {
        projectData.scenes[sceneIndex].backgroundMusic = file.name;
        backgroundMusicMap.set(sceneIndex, file);

        if (window.memoryManager) {
            try {
                await window.memoryManager.saveLocalFile(file.name, file, "audio");
            } catch (error) {
                //console.error('Failed to save local file to IndexedDB:', error);
            }
        }

        updateScenesList();
    }
}

function handleBackgroundMusicUrl(sceneIndex, url) {
    if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
        projectData.scenes[sceneIndex].backgroundMusic = url;
        backgroundMusicMap.delete(sceneIndex);
        updateScenesList();
    } else if (!url) {
        projectData.scenes[sceneIndex].backgroundMusic = "";
        backgroundMusicMap.delete(sceneIndex);
        updateScenesList();
    }
}

function toggleSound(sceneIndex) {
    const button = document.getElementById(`sound-button-${sceneIndex}`);

    if (currentlyPlayingAudio && !currentlyPlayingAudio.paused) {
        currentlyPlayingAudio.pause();
        currentlyPlayingAudio = null;

        document.querySelectorAll(".play-button").forEach((btn) => {
            btn.textContent = "▶ Play";
            btn.classList.remove("stop-button");
        });
        return;
    }

    const file = soundMap.get(sceneIndex);
    const soundPath = projectData.scenes[sceneIndex].sound;

    let audioCreated = false;

    if (file) {
        if (file instanceof Blob) {
            const url = URL.createObjectURL(file);
            currentlyPlayingAudio = new Audio(url);
            audioCreated = true;
        } else if (file.blob) {
            const url = URL.createObjectURL(file.blob);
            currentlyPlayingAudio = new Audio(url);
            audioCreated = true;
        }
    }

    if (!audioCreated) {
        if (soundPath && soundPath.startsWith("gallery:")) {
            const match = soundPath.match(/^gallery:([^/]+)\/(.+)$/);
            if (match && window.gameImporterAssets) {
                const [, category, name] = match;
                const asset = window.gameImporterAssets.audio[category]?.[name];
                if (asset) {
                    currentlyPlayingAudio = new Audio(asset.url);
                } else {
                    return;
                }
            } else {
                return;
            }
        } else if (soundPath && (soundPath.startsWith("http://") || soundPath.startsWith("https://"))) {
            currentlyPlayingAudio = new Audio(soundPath);
        } else if (soundPath) {
            currentlyPlayingAudio = new Audio("sounds/" + soundPath);
        } else {
            return;
        }
    }

    currentlyPlayingAudio.volume = projectData.scenes[sceneIndex].soundVolume;

    button.textContent = "⬛ Stop";
    button.classList.add("stop-button");

    currentlyPlayingAudio.play();

    currentlyPlayingAudio.addEventListener("ended", () => {
        button.textContent = "▶ Play";
        button.classList.remove("stop-button");
        currentlyPlayingAudio = null;
    });
}

function toggleBackgroundMusicScene(sceneIndex) {
    const button = document.getElementById(`bgmusic-button-${sceneIndex}`);

    if (currentlyPlayingAudio && !currentlyPlayingAudio.paused) {
        currentlyPlayingAudio.pause();
        currentlyPlayingAudio = null;

        document.querySelectorAll(".play-button").forEach((btn) => {
            btn.textContent = "▶ Play";
            btn.classList.remove("stop-button");
        });
        return;
    }

    const file = backgroundMusicMap.get(sceneIndex);
    const bgMusicPath = projectData.scenes[sceneIndex].backgroundMusic;

    let audioCreated = false;

    if (file) {
        if (file instanceof Blob) {
            const url = URL.createObjectURL(file);
            currentlyPlayingAudio = new Audio(url);
            audioCreated = true;
        } else if (file.blob) {
            const url = URL.createObjectURL(file.blob);
            currentlyPlayingAudio = new Audio(url);
            audioCreated = true;
        }
    }

    if (!audioCreated) {
        if (bgMusicPath && bgMusicPath.startsWith("gallery:")) {
            const match = bgMusicPath.match(/^gallery:([^/]+)\/(.+)$/);
            if (match && window.gameImporterAssets) {
                const [, category, name] = match;
                const asset = window.gameImporterAssets.audio[category]?.[name];
                if (asset) {
                    currentlyPlayingAudio = new Audio(asset.url);
                } else {
                    return;
                }
            } else {
                return;
            }
        } else if (bgMusicPath && (bgMusicPath.startsWith("http://") || bgMusicPath.startsWith("https://"))) {
            currentlyPlayingAudio = new Audio(bgMusicPath);
        } else if (bgMusicPath) {
            currentlyPlayingAudio = new Audio("sounds/" + bgMusicPath);
        } else {
            return;
        }
    }

    currentlyPlayingAudio.volume = projectData.scenes[sceneIndex].backgroundMusicVolume;

    button.textContent = "⬛ Stop";
    button.classList.add("stop-button");

    currentlyPlayingAudio.play();

    currentlyPlayingAudio.addEventListener("ended", () => {
        button.textContent = "▶ Play";
        button.classList.remove("stop-button");
        currentlyPlayingAudio = null;
    });
}

function toggleNull(sceneIndex, field, isNull) {
    if (isNull) {
        projectData.scenes[sceneIndex][field] = null;

        if (field === "image" || field === "bustLeft" || field === "bustRight") {
            imageMap.delete(`${sceneIndex}-${field}`);
        } else if (field === "sound") {
            soundMap.delete(sceneIndex);
            if (currentlyPlayingAudio) {
                currentlyPlayingAudio.pause();
                currentlyPlayingAudio = null;
            }
        } else if (field === "backgroundMusic") {
            backgroundMusicMap.delete(sceneIndex);
            if (currentlyPlayingAudio) {
                currentlyPlayingAudio.pause();
                currentlyPlayingAudio = null;
            }
        }
    } else {
        projectData.scenes[sceneIndex][field] = "";
    }

    updateNullCheckboxVisibility(sceneIndex, field, isNull);

    // Only update the preview for this specific scene, not the entire list
    // This prevents collapsible groups from collapsing when toggling null checkboxes
    updatePreviewDialog(sceneIndex);
}

function updateNullCheckboxVisibility(sceneIndex, field, isNull) {
    const selectId =
        field === "sound"
            ? `select-sound-${sceneIndex}`
            : field === "backgroundMusic"
              ? `select-backgroundMusic-${sceneIndex}`
              : `select-${field}-${sceneIndex}`;
    const containerId = `${selectId}-container`;

    const selectElement = document.getElementById(selectId);
    const container = document.getElementById(containerId);

    if (selectElement) {
        selectElement.style.display = isNull ? "none" : "block";
    }

    if (container) {
        container.style.display = isNull ? "none" : "flex";
    }

    if (field === "sound") {
        const playButton = document.getElementById(`sound-button-${sceneIndex}`);
        if (playButton) {
            playButton.style.display = isNull ? "none" : "inline-block";
        }
    } else if (field === "backgroundMusic") {
        const playButton = document.getElementById(`bgmusic-button-${sceneIndex}`);
        if (playButton) {
            playButton.style.display = isNull ? "none" : "inline-block";
        }
    }
}

function moveScene(index, direction) {
    if (currentlyPlayingAudio) {
        currentlyPlayingAudio.pause();
        currentlyPlayingAudio = null;
    }

    const newIndex = index + direction;
    if (newIndex >= 0 && newIndex < projectData.scenes.length) {
        [projectData.scenes[index], projectData.scenes[newIndex]] = [
            projectData.scenes[newIndex],
            projectData.scenes[index],
        ];

        const imageFields = ["image", "bustLeft", "bustRight"];

        imageFields.forEach((field) => {
            const key1 = `${index}-${field}`;
            const key2 = `${newIndex}-${field}`;
            const temp = imageMap.get(key1);

            if (imageMap.has(key2)) {
                imageMap.set(key1, imageMap.get(key2));
            } else {
                imageMap.delete(key1);
            }

            if (temp !== undefined) {
                imageMap.set(key2, temp);
            } else {
                imageMap.delete(key2);
            }
        });

        const tempSound = soundMap.get(index);
        if (soundMap.has(newIndex)) {
            soundMap.set(index, soundMap.get(newIndex));
        } else {
            soundMap.delete(index);
        }

        if (tempSound !== undefined) {
            soundMap.set(newIndex, tempSound);
        } else {
            soundMap.delete(newIndex);
        }

        const tempBgMusic = backgroundMusicMap.get(index);
        if (backgroundMusicMap.has(newIndex)) {
            backgroundMusicMap.set(index, backgroundMusicMap.get(newIndex));
        } else {
            backgroundMusicMap.delete(index);
        }

        if (tempBgMusic !== undefined) {
            backgroundMusicMap.set(newIndex, tempBgMusic);
        } else {
            backgroundMusicMap.delete(newIndex);
        }

        const wasExpanded = expandedScenes.has(index);
        const wasNewExpanded = expandedScenes.has(newIndex);
        expandedScenes.delete(index);
        expandedScenes.delete(newIndex);
        if (wasExpanded) expandedScenes.add(newIndex);
        if (wasNewExpanded) expandedScenes.add(index);

        updateScenesList();
    }
}

function duplicateScene(index) {
    const sceneCopy = JSON.parse(JSON.stringify(projectData.scenes[index]));
    projectData.scenes.splice(index + 1, 0, sceneCopy);

    const newExpanded = new Set();
    expandedScenes.forEach((i) => {
        if (i > index) newExpanded.add(i + 1);
        else newExpanded.add(i);
    });
    expandedScenes = newExpanded;
    expandedScenes.add(index + 1);

    for (let i = projectData.scenes.length - 1; i > index + 1; i--) {
        ["image", "bustLeft", "bustRight"].forEach((key) => {
            const oldKey = `${i - 1}-${key}`;
            const newKey = `${i}-${key}`;
            if (imageMap.has(oldKey)) {
                imageMap.set(newKey, imageMap.get(oldKey));
            }
        });

        if (soundMap.has(i - 1)) {
            soundMap.set(i, soundMap.get(i - 1));
        }

        if (backgroundMusicMap.has(i - 1)) {
            backgroundMusicMap.set(i, backgroundMusicMap.get(i - 1));
        }
    }

    ["image", "bustLeft", "bustRight"].forEach((key) => {
        const sourceKey = `${index}-${key}`;
        const destKey = `${index + 1}-${key}`;
        if (imageMap.has(sourceKey)) {
            imageMap.set(destKey, imageMap.get(sourceKey));
        }
    });

    if (soundMap.has(index)) {
        soundMap.set(index + 1, soundMap.get(index));
    }

    if (backgroundMusicMap.has(index)) {
        backgroundMusicMap.set(index + 1, backgroundMusicMap.get(index));
    }

    updateScenesList();
}

function deleteScene(index) {
    if (confirm(`Delete scene ${index + 1}?`)) {
        if (currentlyPlayingAudio) {
            currentlyPlayingAudio.pause();
            currentlyPlayingAudio = null;
        }

        projectData.scenes.splice(index, 1);

        imageMap.delete(`${index}-image`);
        imageMap.delete(`${index}-bustLeft`);
        imageMap.delete(`${index}-bustRight`);
        soundMap.delete(index);
        backgroundMusicMap.delete(index);

        for (let i = index; i < projectData.scenes.length; i++) {
            ["image", "bustLeft", "bustRight"].forEach((key) => {
                const oldKey = `${i + 1}-${key}`;
                const newKey = `${i}-${key}`;
                if (imageMap.has(oldKey)) {
                    imageMap.set(newKey, imageMap.get(oldKey));
                    imageMap.delete(oldKey);
                }
            });

            if (soundMap.has(i + 1)) {
                soundMap.set(i, soundMap.get(i + 1));
                soundMap.delete(i + 1);
            }

            if (backgroundMusicMap.has(i + 1)) {
                backgroundMusicMap.set(i, backgroundMusicMap.get(i + 1));
                backgroundMusicMap.delete(i + 1);
            }
        }

        expandedScenes.delete(index);
        const newExpanded = new Set();
        expandedScenes.forEach((i) => {
            if (i > index) newExpanded.add(i - 1);
            else if (i < index) newExpanded.add(i);
        });
        expandedScenes = newExpanded;
        updateScenesList();
    }
}

function updateConfig() {
    projectData.config.showControls = document.getElementById("configShowControls").checked;
    projectData.config.showDebug = document.getElementById("configShowDebug").checked;
    projectData.config.showDialogArrow = document.getElementById("configShowDialogArrow").checked;

    if (!document.getElementById("backgroundMusicEnabled").checked) {
        projectData.config.backgroundMusic = null;
        projectData.config.backgroundMusicVolume = 0.5;
        projectData.config.backgroundMusicBlobUrl = null;
    } else if (projectData.config.backgroundMusicVolume === undefined) {
        projectData.config.backgroundMusicVolume = parseFloat(document.getElementById("backgroundMusicVolume").value);
    }
}

function updateGlitchConfig() {
    projectData.glitchConfig = {
        scrambledColor: document.getElementById("glitchScrambledColor").value,
        realColor: document.getElementById("glitchRealColor").value,
        changeSpeed: parseInt(document.getElementById("glitchChangeSpeed").value),
        realProbability: parseInt(document.getElementById("glitchRealProbability").value),
        autoStart: document.getElementById("glitchAutoStart").checked,
        charsAllowed: document.getElementById("glitchCharsAllowed").value,
    };

    dialogFramework.setGlitchConfig(projectData.glitchConfig);

    expandedScenes.forEach((sceneIndex) => {
        updatePreviewDialog(sceneIndex);
    });
}

function toggleBackgroundMusic(enabled) {
    const wrapper = document.getElementById("bgmusic-wrapper");
    const volumeGroup = document.getElementById("backgroundMusicVolumeGroup");
    const playButton = document.getElementById("bg-music-button");

    if (!enabled) {
        projectData.config.backgroundMusic = null;
        projectData.config.backgroundMusicVolume = 0.5;
        backgroundMusicFile = null;
        if (backgroundMusicBlobUrl) {
            URL.revokeObjectURL(backgroundMusicBlobUrl);
            backgroundMusicBlobUrl = null;
        }
        wrapper.style.display = "none";
        volumeGroup.style.display = "none";
        playButton.style.display = "none";

        if (previewBackgroundMusic && !previewBackgroundMusic.paused) {
            previewBackgroundMusic.pause();
            previewBackgroundMusic = null;
        }
    } else {
        wrapper.style.display = "flex";
        volumeGroup.style.display = "grid";
        if (projectData.config.backgroundMusic) {
            playButton.style.display = "inline-block";
        }
    }

    const selectElement = document.getElementById("select-bgmusic");
    if (selectElement) {
        handleBackgroundMusicTypeChange(selectElement.value);
    }
}

function updateBackgroundMusicVolume(value) {
    projectData.config.backgroundMusicVolume = parseFloat(value);
    if (previewBackgroundMusic) {
        previewBackgroundMusic.volume = parseFloat(value);
    }
}

function handleBackgroundMusicUpload(input) {
    const file = input.files[0];
    if (file) {
        backgroundMusicFile = file;
        if (backgroundMusicBlobUrl) {
            URL.revokeObjectURL(backgroundMusicBlobUrl);
        }
        backgroundMusicBlobUrl = URL.createObjectURL(file);
        projectData.config.backgroundMusic = file.name;
        projectData.config.backgroundMusicBlobUrl = backgroundMusicBlobUrl;

        const button = input.nextElementSibling;
        if (button && button.classList.contains("file-select-button")) {
            button.querySelector(".filename").textContent = file.name;
            button.title = file.name;
            button.classList.add("has-file");
            if (!button.querySelector(".file-clear-button")) {
                button.innerHTML = `
                    <span class="filename">${file.name}</span>
                    <button class="file-clear-button" onclick="event.stopPropagation(); clearBackgroundMusic()">×</button>
                `;
            }
        }

        const urlInput = document.querySelector('#select-bgmusic-container input[type="text"]');
        if (urlInput) {
            urlInput.value = "";
        }

        document.getElementById("bg-music-button").style.display = "flex";
        document.getElementById("backgroundMusicVolumeGroup").style.display = "grid";
    }
}

function handleBackgroundMusicTypeChange(type) {
    const container = document.getElementById("select-bgmusic-container");
    const enabled = document.getElementById("backgroundMusicEnabled").checked;
    const playButton = document.getElementById("bg-music-button");

    if (type === "local") {
        const hasFile = backgroundMusicFile !== null;
        const fileName = hasFile ? backgroundMusicFile.name : "";
        const buttonText = fileName || "Select file";
        const tooltip = fileName ? `title="${fileName}"` : "";

        container.innerHTML = `
            <input type="file" id="backgroundMusicFile" accept="audio/*"
                   onchange="handleBackgroundMusicUpload(this)" ${!enabled ? "disabled" : ""}>
            <button class="file-select-button ${fileName ? "has-file" : ""}" 
                    onclick="document.getElementById('backgroundMusicFile').click()"
                    id="backgroundMusicButton"
                    ${tooltip}
                    ${!enabled ? "disabled" : ""}>
                <span class="filename">${buttonText}</span>
                ${fileName ? `<button class="file-clear-button" onclick="event.stopPropagation(); clearBackgroundMusic()">×</button>` : ""}
            </button>
        `;

        container.appendChild(playButton);
        playButton.style.display = hasFile ? "inline-block" : "none";
    } else if (type === "url") {
        const currentUrl =
            projectData.config.backgroundMusic &&
            (projectData.config.backgroundMusic.startsWith("http://") ||
                projectData.config.backgroundMusic.startsWith("https://"))
                ? projectData.config.backgroundMusic
                : "";

        container.innerHTML = `
            <input type="text" class="url-input" placeholder="Enter URL"
                   value="${currentUrl}"
                   onchange="handleBackgroundMusicUrl(this.value)"
                   ${!enabled ? "disabled" : ""}>
        `;

        container.appendChild(playButton);
        playButton.style.display = currentUrl ? "inline-block" : "none";
    } else if (type === "gallery") {
        container.innerHTML = `
            <button class="gallery-button" onclick="openGalleryForField(${sceneIndex}, '${field}', ${isSound})">Select from gallery</button>
        `;
        container.appendChild(playButton);
        playButton.style.display = "none";
    }
}

function handleBackgroundMusicUrl(url) {
    if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
        backgroundMusicFile = null;
        if (backgroundMusicBlobUrl) {
            URL.revokeObjectURL(backgroundMusicBlobUrl);
            backgroundMusicBlobUrl = null;
        }
        projectData.config.backgroundMusic = url;
        projectData.config.backgroundMusicBlobUrl = null;
        document.getElementById("backgroundMusicName").textContent = url;
        document.getElementById("backgroundMusicFile").value = "";
        document.getElementById("bg-music-button").style.display = "block";
        document.getElementById("backgroundMusicVolumeGroup").style.display = "grid";
    } else if (!url) {
        backgroundMusicFile = null;
        if (backgroundMusicBlobUrl) {
            URL.revokeObjectURL(backgroundMusicBlobUrl);
            backgroundMusicBlobUrl = null;
        }
        projectData.config.backgroundMusic = null;
        projectData.config.backgroundMusicBlobUrl = null;
        document.getElementById("backgroundMusicName").textContent = "";
        document.getElementById("bg-music-button").style.display = "none";
        document.getElementById("backgroundMusicVolumeGroup").style.display = "none";
    }
}

function toggleBackgroundMusicPreview() {
    const button = document.getElementById("bg-music-button");

    if (previewBackgroundMusic && !previewBackgroundMusic.paused) {
        previewBackgroundMusic.pause();
        previewBackgroundMusic = null;
        button.textContent = "▶ Play";
        button.classList.remove("stop-button");
        return;
    }

    if (backgroundMusicBlobUrl) {
        previewBackgroundMusic = new Audio(backgroundMusicBlobUrl);
    } else if (projectData.config.backgroundMusic) {
        const musicPath = projectData.config.backgroundMusic;
        if (musicPath.startsWith("http://") || musicPath.startsWith("https://")) {
            previewBackgroundMusic = new Audio(musicPath);
        } else {
            previewBackgroundMusic = new Audio("sounds/" + musicPath);
        }
    } else {
        return;
    }

    previewBackgroundMusic.volume = projectData.config.backgroundMusicVolume || 0.5;
    button.textContent = "⬛ Stop";
    button.classList.add("stop-button");

    previewBackgroundMusic.play();

    previewBackgroundMusic.addEventListener("ended", () => {
        button.textContent = "▶ Play";
        button.classList.remove("stop-button");
        previewBackgroundMusic = null;
    });
}

function clearBackgroundMusic() {
    backgroundMusicFile = null;
    if (backgroundMusicBlobUrl) {
        URL.revokeObjectURL(backgroundMusicBlobUrl);
        backgroundMusicBlobUrl = null;
    }
    projectData.config.backgroundMusic = null;
    projectData.config.backgroundMusicBlobUrl = null;

    const fileInput = document.getElementById("backgroundMusicFile");
    if (fileInput) {
        fileInput.value = "";
        const button = fileInput.nextElementSibling;
        if (button && button.classList.contains("file-select-button")) {
            button.querySelector(".filename").textContent = "Select file";
            button.removeAttribute("title");
            button.classList.remove("has-file");
            button.innerHTML = '<span class="filename">Select file</span>';
        }
    }

    document.getElementById("bg-music-button").style.display = "none";
    document.getElementById("backgroundMusicVolumeGroup").style.display = "none";

    if (previewBackgroundMusic && !previewBackgroundMusic.paused) {
        previewBackgroundMusic.pause();
        previewBackgroundMusic = null;
    }
}

function generateCode() {
    updateConfig();
    updateGlitchConfig();

    let code = `function setupScene() {
        dialogFramework.setConfig({
            showControls: ${projectData.config.showControls},
            showDebug: ${projectData.config.showDebug},
            showDialogArrow: ${projectData.config.showDialogArrow !== undefined ? projectData.config.showDialogArrow : true}`;

    if (projectData.config.backgroundMusic) {
        code += `,
                backgroundMusic: '${projectData.config.backgroundMusic}'`;

        if (projectData.config.backgroundMusicVolume !== undefined) {
            code += `,
                    backgroundMusicVolume: ${projectData.config.backgroundMusicVolume}`;
        }
    }

    code += `
        });

        dialogFramework.setCharacters({`;

    Object.entries(projectData.characters).forEach(([name, data], index, array) => {
        code += `
            '${name}': {
                color: '${data.color}',
                aliases: [\"${data.aliases.join('\", \"')}\"]
            }${index < array.length - 1 ? "," : ""}`;
    });

    code += `
    });

    dialogFramework.setGlitchConfig({
        scrambledColor: '${projectData.glitchConfig.scrambledColor}',
        realColor: '${projectData.glitchConfig.realColor}',
        changeSpeed: ${projectData.glitchConfig.changeSpeed},
        realProbability: ${projectData.glitchConfig.realProbability},
        autoStart: ${projectData.glitchConfig.autoStart},
        charsAllowed: '${projectData.glitchConfig.charsAllowed}'
    });

    dialogFramework`;

    projectData.scenes.forEach((scene, index) => {
        code += `
        .addScene({
            image: ${scene.image === null ? "null" : `'${scene.image}'`},
            speaker: '${scene.speaker}',
            line1: "${scene.line1 ? scene.line1.replace(/"/g, '\\"') : ""}",
            line2: "${scene.line2 ? scene.line2.replace(/"/g, '\\"') : ""}",
            censorSpeaker: ${scene.censorSpeaker},
            demonSpeaker: ${scene.demonSpeaker || false},
            dialogFadeInTime: ${scene.dialogFadeInTime},
            dialogFadeOutTime: ${scene.dialogFadeOutTime},
            imageFadeInTime: ${scene.imageFadeInTime},
            imageFadeOutTime: ${scene.imageFadeOutTime},
            dialogDelayIn: ${scene.dialogDelayIn},
            dialogDelayOut: ${scene.dialogDelayOut},
            imageDelayIn: ${scene.imageDelayIn},
            imageDelayOut: ${scene.imageDelayOut}`;

        if (scene.sound !== null) {
            code += `,
            sound: '${scene.sound}',
            soundVolume: ${scene.soundVolume},
            soundDelay: ${scene.soundDelay}`;
        }

        if (scene.backgroundMusic !== null) {
            code += `,
            backgroundMusic: '${scene.backgroundMusic}',
            backgroundMusicVolume: ${scene.backgroundMusicVolume}`;
        }

        if (scene.bustLeft !== null) {
            code += `,
            bustLeft: '${scene.bustLeft}'`;
        }

        if (scene.bustRight !== null) {
            code += `,
            bustRight: '${scene.bustRight}'`;
        }

        if (scene.bustLeft !== null || scene.bustRight !== null) {
            code += `,
            bustFade: ${scene.bustFade}`;
        }

        if (scene.shake) {
            code += `,
            shake: true,
            shakeDelay: ${scene.shakeDelay},
            shakeIntensity: ${scene.shakeIntensity},
            shakeDuration: ${scene.shakeDuration}`;
        }

        code += `
        })`;
    });

    code += `;`;

    const compositionsToExport = new Map();

    if (projectData.compositions && projectData.compositions.length > 0) {
        projectData.compositions.forEach((comp) => {
            compositionsToExport.set(comp.id, comp);
        });
    }

    // Scan all scenes for gallery:Misc/* references and check if they're compositions
    if (window.gameImporterAssets && window.gameImporterAssets.images["Misc"]) {
        projectData.scenes.forEach((scene) => {
            const fieldsToCheck = [scene.image, scene.bustLeft, scene.bustRight];

            fieldsToCheck.forEach((field) => {
                if (field && typeof field === "string" && field.startsWith("gallery:Misc/")) {
                    const filename = field.replace("gallery:Misc/", "");
                    const asset = window.gameImporterAssets.images["Misc"][filename];

                    if (asset) {
                        const isCompositionByFlag = asset.isComposition && asset.compositionDescriptor;
                        const isCompositionByPath = asset.originalPath === "compositions";

                        if (isCompositionByFlag || isCompositionByPath) {
                            let descriptor = asset.compositionDescriptor;

                            if (!descriptor && asset.compositionId && projectData.compositions) {
                                descriptor = projectData.compositions.find((c) => c.id === asset.compositionId);
                            }

                            if (!descriptor && isCompositionByPath && projectData.compositions) {
                                const nameWithoutExt = filename.replace(/\.(png|gif)$/, "");
                                descriptor = projectData.compositions.find((c) => c.name === nameWithoutExt);
                            }

                            if (descriptor && !compositionsToExport.has(descriptor.id)) {
                                compositionsToExport.set(descriptor.id, descriptor);
                                //console.log(`Found composition in scene: "${descriptor.name}"`);
                            } else if (!descriptor) {
                                console.warn(`Found composition asset "${filename}" but no descriptor available`);
                            }
                        }
                    }
                }
            });
        });
    }

    // Include compositions if any were found
    if (compositionsToExport.size > 0) {
        const compositionsArray = Array.from(compositionsToExport.values());
        code += `

        dialogFramework.setCompositions(${JSON.stringify(compositionsArray, null, 8).replace(/\n/g, "\n    ")});
        `;
    }

    code += `
}`;

    document.getElementById("outputCode").value = code;
}

if (document.getElementById("configShowControls")) {
    document.getElementById("configShowControls").addEventListener("change", updateConfig);
    document.getElementById("configShowDebug").addEventListener("change", updateConfig);
    document.getElementById("configShowDialogArrow").addEventListener("change", updateConfig);
    document.getElementById("glitchScrambledColor").addEventListener("input", updateGlitchConfig);
    document.getElementById("glitchRealColor").addEventListener("input", updateGlitchConfig);
    document.getElementById("glitchChangeSpeed").addEventListener("input", updateGlitchConfig);
    document.getElementById("glitchRealProbability").addEventListener("input", updateGlitchConfig);
    document.getElementById("glitchAutoStart").addEventListener("change", updateGlitchConfig);
    document.getElementById("glitchCharsAllowed").addEventListener("input", updateGlitchConfig);
}

if (document.getElementById("charactersList")) {
    updateCharactersList();
    updateScenesList();
}

document.addEventListener("DOMContentLoaded", function () {
    const configSection = document.querySelector(".section-header.active");
    if (configSection) {
        const content = configSection.nextElementSibling;
        if (content) {
            content.style.display = "block";
        }
    }
});

function resetConfigToDefault() {
    if (confirm("Reset configuration to default values?")) {
        projectData.config = {
            showControls: true,
            showDebug: true,
            showDialogArrow: true,
            backgroundMusic: null,
            backgroundMusicVolume: 0.5,
        };

        document.getElementById("configShowControls").checked = true;
        document.getElementById("configShowDebug").checked = true;
        document.getElementById("configShowDialogArrow").checked = true;
        document.getElementById("backgroundMusicEnabled").checked = false;
        toggleBackgroundMusic(false);
    }
}

function resetGlitchToDefault() {
    if (confirm("Reset glitch settings to default values?")) {
        projectData.glitchConfig = {
            scrambledColor: Color.BLACK,
            realColor: Color.DEFAULT,
            changeSpeed: 50,
            realProbability: 5,
            autoStart: true,
            charsAllowed: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
        };

        document.getElementById("glitchScrambledColor").value = Color.BLACK;
        document.getElementById("glitchRealColor").value = Color.DEFAULT;
        document.getElementById("glitchChangeSpeed").value = 50;
        document.getElementById("glitchRealProbability").value = 5;
        document.getElementById("glitchAutoStart").checked = true;
        document.getElementById("glitchCharsAllowed").value =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    }
}

function resetCharactersToDefault() {
    if (confirm("This will delete ALL characters! Are you sure?")) {
        projectData.characters = {};
        updateCharactersList();
    }
}

function resetScenesToDefault() {
    if (confirm("This will delete ALL scenes! Are you sure?")) {
        projectData.scenes = [];
        imageMap.clear();
        soundMap.clear();
        backgroundMusicMap.clear();
        expandedScenes.clear();
        updateScenesList();

        if (currentlyPlayingAudio) {
            currentlyPlayingAudio.pause();
            currentlyPlayingAudio = null;
        }
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const editorOverlay = document.getElementById("editorOverlay");
    const editorHeader = document.getElementById("editorHeader");

    if (editorOverlay && editorHeader) {
        editorOverlay.addEventListener("scroll", function () {
            if (editorOverlay.scrollTop > 20) {
                editorHeader.classList.add("scrolled");
                editorOverlay.classList.add("scrolled");
            } else {
                editorHeader.classList.remove("scrolled");
                editorOverlay.classList.remove("scrolled");
            }
        });
    }
});

let currentGalleryTab = "images";
let currentGalleryCategory = null;
let galleryContext = null; // { mode: 'browse' | 'select', sceneIndex, field, isSound, currentAssetRef }

function handleGameImport() {
    const folderInput = document.getElementById("folderInput");
    folderInput.onchange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            if (!(await gameImporter.importGame(files))) {
                return;
            }

            const importButtons = document.querySelectorAll(".game-import");
            importButtons.forEach((btn) => {
                btn.textContent = "Gallery";
                btn.onclick = () => {
                    galleryContext = null; // Reset to browse mode
                    openGallery();
                };
                btn.classList.add("gallery-button");
                btn.classList.remove("game-import");
            });

            // Refresh scene previews to show newly imported assets
            setTimeout(() => {
                if (typeof updateScenesList === "function") {
                    updateScenesList();
                }
            }, 0);
        }
    };
    folderInput.click();
}

async function preloadSavedDataAssets() {
    if (!window.gameImporterAssets && window.memoryManager) {
        try {
            const storageState = await window.memoryManager.getStorageState();
            if (storageState !== "none") {
                const savedAssets = await window.memoryManager.loadSavedAssets();
                window.gameImporterAssets = savedAssets;

                if (window.pendingCompositions && window.pendingCompositions.length > 0) {
                    //console.log(`Processing ${window.pendingCompositions.length} pending compositions after loading assets...`,);
                    const pending = window.pendingCompositions;
                    window.pendingCompositions = []; // Clear queue to avoid recursion
                    if (typeof reconstructCompositionsToGallery === "function") {
                        await reconstructCompositionsToGallery(pending);
                    }
                }

                if (window.imagesCroppingStarted === false) {
                    cropAllImages().then(() => (window.imagesCroppingStarted = false));
                }
            }
        } catch (error) {
            //console.warn("Failed to check/load saved data for gallery:", error);
        }
    }
}

async function openGallery() {
    const modal = document.getElementById("galleryModal");
    if (!modal) return;

    await preloadSavedDataAssets();

    if (!galleryContext) {
        galleryContext = { mode: "browse" };
    }

    if (galleryContext.mode === "select" && galleryContext.assetType) {
        currentGalleryTab = galleryContext.assetType;
    }

    const useButton = document.getElementById("previewDownloadBtn");
    if (useButton) {
        if (galleryContext.mode === "select") {
            useButton.style.display = "block";
            useButton.onclick = () => {
                if (window.galleryManager && window.galleryManager.currentAsset) {
                    const { name, category } = window.galleryManager.currentAsset;
                    useGalleryAsset(name, category);
                }
            };
        } else {
            useButton.style.display = "none";
        }
    }

    modal.style.display = "flex";

    const modalContent = document.getElementById("galleryModalContent");
    const clickOutsideHandler = (e) => {
        if (e.target === modal && !modalContent.contains(e.target)) {
            closeGallery();
        }
    };

    modal.removeEventListener("click", modal._clickOutsideHandler);
    modal._clickOutsideHandler = clickOutsideHandler;
    modal.addEventListener("click", clickOutsideHandler);

    updateGalleryCategories();
}

async function handleSmartLoadingForEditor(storageState, savedAssets) {
    if (!window.galleryManager) return;

    try {
        if (storageState === "partial" || storageState === "base") {
            const assetsNeedingCrop = await window.memoryManager.getAssetsNeedingCrop();

            if (assetsNeedingCrop.length > 0) {
                for (const assetRecord of assetsNeedingCrop) {
                    const asset = {
                        blob: assetRecord.blob,
                        baseFileName: assetRecord.baseFileName,
                        name: assetRecord.name,
                        url: URL.createObjectURL(assetRecord.blob),
                    };

                    if (!savedAssets.images[assetRecord.category]) {
                        savedAssets.images[assetRecord.category] = {};
                    }
                    if (!savedAssets.images[assetRecord.category][assetRecord.name]) {
                        savedAssets.images[assetRecord.category][assetRecord.name] = asset;
                    }

                    window.galleryManager.enqueueCropImage(asset, assetRecord.name, assetRecord.category);
                }
            }
        }
    } catch (error) {
        //console.error("Error in smart loading for editor gallery:", error);
    }
}

function closeGallery() {
    if (window.galleryManager) {
        window.galleryManager.clearPreview();
    }

    const modal = document.getElementById("galleryModal");
    if (modal) {
        modal.style.display = "none";
        if (modal._clickOutsideHandler) {
            modal.removeEventListener("click", modal._clickOutsideHandler);
            modal._clickOutsideHandler = null;
        }
    }

    galleryContext = null;
}

function switchGalleryTab(tab) {
    if (galleryContext && galleryContext.mode === "select") {
        if (tab !== galleryContext.assetType) {
            return;
        }
    }

    currentGalleryTab = tab;

    if (window.galleryManager) {
        window.galleryManager.clearPreview();
    }

    document.querySelectorAll(".gallery-tab").forEach((btn) => {
        btn.classList.remove("active");
        if (btn.textContent.toLowerCase().includes(tab)) {
            btn.classList.add("active");
        }

        if (galleryContext && galleryContext.mode === "select") {
            const btnTab = btn.textContent.toLowerCase().includes("images") ? "images" : "audio";
            if (btnTab !== galleryContext.assetType) {
                btn.classList.add("disabled");
                btn.disabled = true;
            } else {
                btn.classList.remove("disabled");
                btn.disabled = false;
            }
        } else {
            btn.classList.remove("disabled");
            btn.disabled = false;
        }
    });

    updateGalleryCategories();

    if (window.galleryManager) {
        if (tab === "images" && window.galleryManager.lastImageCategory) {
            selectGalleryCategory(window.galleryManager.lastImageCategory);
        } else if (tab === "audio" && window.galleryManager.lastAudioCategory) {
            selectGalleryCategory(window.galleryManager.lastAudioCategory);
        }
    }
}

function updateGalleryCategories() {
    const categoriesContainer = document.getElementById("galleryCategories");
    if (!categoriesContainer || !window.gameImporterAssets) return;

    categoriesContainer.innerHTML = "";

    const isImageTab = currentGalleryTab === "images";
    const assets = isImageTab ? window.gameImporterAssets.images : window.gameImporterAssets.audio;
    const categories = Object.keys(assets);

    const lineDiv = document.createElement("div");
    const categoryDiv = document.createElement("div");
    const editorDiv = document.createElement("div");

    lineDiv.style.display = "flex";
    lineDiv.style.flexDirection = "row";
    lineDiv.style.justifyContent = "space-between";
    lineDiv.style.alignItems = "center";
    lineDiv.style.alignContent = "center";
    lineDiv.style.flexWrap = "nowrap";
    lineDiv.style.width = "100%";

    //categoryDiv.style.display = "flex";
    categoryDiv.style.flexDirection = "row";
    categoryDiv.style.justifyContent = "flex-start";
    categoryDiv.style.alignItems = "center";
    categoryDiv.style.alignContent = "center";
    categoryDiv.style.flexWrap = "nowrap";

    lineDiv.appendChild(categoryDiv);
    lineDiv.appendChild(editorDiv);
    categoriesContainer.appendChild(lineDiv);

    categories.forEach((category) => {
        const btn = document.createElement("button");
        btn.className = "gallery-category-btn";
        btn.textContent = category;
        btn.style.marginRight = "0.15vmax";
        btn.onclick = () => {
            if (isImageTab) {
                galleryManager.lastImageCategory = category;
            } else {
                galleryManager.lastAudioCategory = category;
            }
            selectGalleryCategory(category);
        };
        categoryDiv.appendChild(btn);
    });

    if (isImageTab) {
        const buttonEditor = document.createElement("button");
        buttonEditor.id = "composition-editor-btn";
        buttonEditor.className = "gallery-category-btn-editor";
        buttonEditor.style.fontSize = "1vmax";
        buttonEditor.style.fontWeight = "bold";
        buttonEditor.style.border = "1px solid white";
        buttonEditor.onclick = openCompositionEditor;
        buttonEditor.title = "Open composition editor to create custom elements";
        buttonEditor.textContent = "✎ Editor";
        editorDiv.appendChild(buttonEditor);
    }

    if (categories.length > 0) {
        let targetCategory;

        if (isImageTab) {
            targetCategory =
                galleryManager.lastImageCategory && assets[galleryManager.lastImageCategory]
                    ? galleryManager.lastImageCategory
                    : categories.includes("Portraits")
                      ? "Portraits"
                      : categories[0];
        } else {
            targetCategory =
                galleryManager.lastAudioCategory && assets[galleryManager.lastAudioCategory]
                    ? galleryManager.lastAudioCategory
                    : categories.includes("Background music")
                      ? "Background music"
                      : categories[0];
        }

        selectGalleryCategory(targetCategory);
    }
    if (!window.imagesCroppingStarted) {
        cropAllImages().then(() => (window.imagesCroppingStarted = false));
    }
}

function selectGalleryCategory(category) {
    currentGalleryCategory = category;

    //console.log(category);

    if (window.galleryManager) {
        if (currentGalleryTab === "images") {
            window.galleryManager.lastImageCategory = category;
        } else {
            window.galleryManager.lastAudioCategory = category;
        }
    }

    if (window.galleryManager) {
        window.galleryManager.clearPreview();
    }

    document.querySelectorAll(".gallery-category-btn").forEach((btn) => {
        btn.classList.remove("active");
        if (btn.textContent === category) {
            btn.classList.add("active");
        }
    });

    updateGalleryContent();
}

function updateGalleryContent() {
    const contentContainer = document.getElementById("galleryContent");
    if (!contentContainer || !window.gameImporterAssets || !currentGalleryCategory) return;

    const modalGallery = document.getElementById("galleryModal");
    const downloadAllButton = document.getElementById("download-all-button");

    if (!modalGallery && downloadAllButton) {
        downloadAllButton.style.display = "block";
    }

    contentContainer.innerHTML = "";

    const assets =
        currentGalleryTab === "images"
            ? window.gameImporterAssets.images[currentGalleryCategory]
            : window.gameImporterAssets.audio[currentGalleryCategory];
    if (!assets) return;

    const isSelectionMode = galleryContext && galleryContext.mode === "select";

    let currentAssetName = null;
    let currentAssetCategory = null;
    if (isSelectionMode && galleryContext.currentAssetRef) {
        const match = galleryContext.currentAssetRef.match(/^gallery:([^/]+)\/(.+)$/);
        if (match) {
            currentAssetCategory = match[1];
            currentAssetName = match[2];
        }
    }

    const assetEntries = Object.entries(assets);
    assetEntries.sort((a, b) => {
        const normalize = (name) => {
            return name.replace(
                /^spritessheet_(\d+)x(\d+)_([^.]*)\.png$/,
                (m, w, h, rest) => `spritesheet_${rest}_${w}x${h}.png`,
            );
        };

        return normalize(a[0]).localeCompare(normalize(b[0]), undefined, {
            numeric: true,
            sensitivity: "base",
        });
    });

    let bustFilterValue = "All";
    if (currentGalleryTab === "images" && currentGalleryCategory === "Portraits") {
        const filterSelect = document.createElement("select");
        filterSelect.id = "bustsFilterSelect";
        const bustCategories = [
            "All",
            "Andrew",
            "Andy",
            "Andrew-teen",
            "Ashley",
            "Leyley",
            "Ashley-teen",
            "Ashley-teen dressed like Julia",
            "Julia",
            "Julia-teen",
            "Renee",
            "Renee-past",
            "Renee-dark",
            "Lady",
            "Hag",
            "Grandpa",
            "Grandma",
            "Surgeon",
            "Cultists",
            "Surgeon-past",
            "Nina",
            "Effects",
            "Douglas-past",
            "Nurse",
        ];
        bustCategories.forEach((cat) => {
            const option = document.createElement("option");
            option.value = cat;
            option.textContent = cat.includes("-") ? cat.replace("-", " (") + ")" : cat;
            filterSelect.appendChild(option);
        });
        filterSelect.value = "All";
        filterSelect.addEventListener("change", function () {
            bustFilterValue = this.value;
            const items = contentContainer.querySelectorAll(".gallery-item");
            items.forEach((item) => {
                const nameElem = item.dataset.filename;
                if (!nameElem) return;
                const itemName = nameElem.toLowerCase();
                if (bustFilterValue === "All") {
                    item.style.display = "";
                } else {
                    const prefix = bustFilterValue.toLowerCase() + "_";
                    item.style.display = itemName.startsWith(prefix) ? "" : "none";
                }
            });
            galleryManager.selectFirstElement();
        });
        if (document.getElementById("bustsFilterSelect") !== null) {
            document.getElementById("bustsFilterSelect").remove();
        }
        document.getElementById("galleryCategories").appendChild(filterSelect);
    } else if (document.getElementById("bustsFilterSelect") !== null) {
        document.getElementById("bustsFilterSelect").remove();
    }

    assetEntries.forEach(([name, asset], index) => {
        if (currentGalleryTab === "images" && currentGalleryCategory === "Portraits" && bustFilterValue !== "All") {
            const baseName = name.toLowerCase().replace(/\.[^/.]+$/, "");
            if (!baseName.startsWith(bustFilterValue.toLowerCase() + "_")) return;
        }
        const formatName = window.galleryManager.formatAssetTitle(name, currentGalleryCategory, currentGalleryTab);
        const item = document.createElement("div");
        item.className = "gallery-item";
        item.dataset.filename = name;
        item.dataset.assetIndex = index.toString();
        item.dataset.baseFileName = asset.baseFileName;
        item.dataset.originalName = asset.originalName;
        item.dataset.formatName = formatName;
        item.onclick = function (ev) {
            document.querySelectorAll(".gallery-item").forEach((it) => {
                it.classList.remove("selected");
            });
            ev.currentTarget.classList.add("selected");
            window.galleryManager.scrollIfRequired(ev.currentTarget);
            window.galleryManager.previewAsset(name, currentGalleryCategory, currentGalleryTab);
        };
        if (currentGalleryTab === "images") {
            item.innerHTML = `
                <img src="${asset.croppedUrl || asset.url}" alt="${name}" loading="lazy">
                <div class="gallery-item-name">${formatName}</div>`;
        } else {
            item.innerHTML = `
                <div class="gallery-item-audio compact">
                <div class="audio-icon">🎵</div>
                <div class="gallery-item-name">${formatName}</div>
                </div>`;
        }
        contentContainer.appendChild(item);
    });

    if (isSelectionMode && currentAssetName && currentAssetCategory === currentGalleryCategory) {
        setTimeout(() => {
            const matchingItem = contentContainer.querySelector(`[data-filename="${currentAssetName}"]`);
            if (matchingItem) {
                matchingItem.click();
            } else {
                galleryManager.unselectCurrent();
                galleryManager.selectFirstElement();
            }
        }, 50);
    } else {
        galleryManager.unselectCurrent();
        galleryManager.selectFirstElement();
    }
}

async function cropAllImages() {
    window.imagesCroppingStarted = true;
    const imagesByCategory = window.gameImporterAssets.images;
    const downloadAllButton = document.getElementById("download-all-button");
    const updateDownloadButton = (percent, done = false) => {
        if (downloadAllButton) {
            downloadAllButton.textContent = `Download All`;
            if (!done === false) {
                downloadAllButton.textContent = `Download All`;
                downloadAllButton.classList.remove("disabled");
            }
        }
    };

    if (!imagesByCategory) return;
    const toCrop = [];
    for (const [category, assets] of Object.entries(imagesByCategory)) {
        if (category === "Portraits" || category === "Misc") continue;
        for (const [name, asset] of Object.entries(assets)) {
            if (!asset.isSprite && !asset.cropped && asset.blob && !asset.croppedBlob) {
                toCrop.push({ name, asset, category });
            }
        }
    }
    toCrop.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }));
    const total = toCrop.length;

    for (const [count, { name, asset, category }] of toCrop.entries()) {
        const pct = Math.round((count / total) * 100);
        updateLoadingBar(pct, name);
        updateDownloadButton(pct);

        if (!asset.blob || asset.croppedBlob?.size > 0 || asset.cropped === true) {
            asset.cropping = false;
            continue;
        }

        await new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const w = img.width,
                    h = img.height;
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d", { willReadFrequently: true });
                canvas.width = w;
                canvas.height = h;
                ctx.drawImage(img, 0, 0);

                const data = ctx.getImageData(0, 0, w, h).data;
                let minX = w,
                    minY = h,
                    maxX = 0,
                    maxY = 0;
                for (let y = 0; y < h; y++) {
                    for (let x = 0; x < w; x++) {
                        if (data[(y * w + x) * 4 + 3] > 0) {
                            minX = Math.min(minX, x);
                            minY = Math.min(minY, y);
                            maxX = Math.max(maxX, x);
                            maxY = Math.max(maxY, y);
                        }
                    }
                }

                if (maxX >= minX && maxY >= minY) {
                    const cropW = maxX - minX + 1;
                    const cropH = maxY - minY + 1;
                    const cropCanvas = document.createElement("canvas");
                    cropCanvas.width = cropW;
                    cropCanvas.height = cropH;
                    cropCanvas.getContext("2d").drawImage(img, minX, minY, cropW, cropH, 0, 0, cropW, cropH);
                    cropCanvas.toBlob(async (blob) => {
                        if (blob) {
                            const url = URL.createObjectURL(blob);
                            asset.croppedUrl = url;
                            asset.croppedBlob = blob;
                            asset.cropped = true;

                            // Save cropped asset to persistent memory
                            if (window.memoryManager && asset.baseFileName) {
                                try {
                                    const assetId = window.memoryManager.generateAssetId(asset.baseFileName, name);
                                    await window.memoryManager.saveCompleteAsset(assetId, blob);
                                } catch (error) {
                                    //console.warn("Failed to save cropped asset to memory:", name, error);
                                }
                            }

                            const thumbImg = document.querySelector(`.gallery-item[data-filename="${name}"] img`);
                            if (thumbImg) {
                                thumbImg.src = url;
                            }

                            window.gameImporterAssets.images[category][name] = asset;
                        }
                        resolve();
                    });
                } else {
                    resolve();
                }
            };
            img.src = asset.url;
        });
    }
    updateLoadingBar();
    updateDownloadButton(100, true);
}

window.handleGameImportClick = function () {
    if (
        window.memoryManager?.haveDataStored ||
        (window.gameImporterAssets && Object.keys(window.gameImporterAssets.images).length > 0)
    ) {
        galleryContext = null;
        openGallery();
    } else {
        handleGameImport();
    }
};
