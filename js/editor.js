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
};

let imageMap = new Map();
let soundMap = new Map();
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

function loadProjectData(data) {
    projectData = JSON.parse(JSON.stringify(data));

    document.getElementById("configShowControls").checked = projectData.config.showControls;
    document.getElementById("configShowDebug").checked = projectData.config.showDebug;

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

    updateCharactersList();
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
    updateCharactersList();
}

function updateCharactersList() {
    const container = document.getElementById("charactersList");
    container.innerHTML = "";

    Object.entries(projectData.characters).forEach(([name, data]) => {
        const aliases = data.aliases || [];
        const aliasesDisplay = aliases.length > 0 ? aliases.join(", ") : "";

        const item = document.createElement("div");
        item.className = "character-item";
        item.innerHTML = `
        <div class="character-header">
        <div>
        <span class="character-name">${name}</span>
        ${aliasesDisplay ? `<span class="character-aliases">(${aliasesDisplay})</span>` : ""}
        </div>
        <div class="header-action-buttons">
            <input type="color" value="${data.color}" onchange="updateCharacterColor('${name}', this.value)">
            <button onclick="editCharacterAliases('${name}')">Set aliases</button>
            <button class="danger" onclick="deleteCharacter('${name}')">✕</button>
        </div>
        </div>
        `;
        container.appendChild(item);

        projectData.characters[name].color = data.color;
    });
}

function editCharacterAliases(characterName) {
    const character = projectData.characters[characterName];
    const aliases = (character.aliases || []).join(", ");

    const newAliases = prompt(`Enter aliases for ${characterName} (comma-separated):`, aliases);
    if (newAliases !== null) {
        character.aliases = newAliases
            .split(",")
            .map((alias) => alias.trim())
            .filter((alias) => alias.length > 0);
        updateCharactersList();
    }
}

function updateCharacterColor(name, color) {
    projectData.characters[name].color = color;
}

function deleteCharacter(name) {
    if (confirm(`Delete character "${name}"?`)) {
        delete projectData.characters[name];
        updateCharactersList();
    }
}

function createFileSelectHTML(sceneIndex, field, currentValue, isSound = false) {
    const fieldId = isSound ? "sound" : field;
    const isUrl = currentValue && (currentValue.startsWith("http://") || currentValue.startsWith("https://"));
    const hasFile = isSound ? soundMap.has(sceneIndex) : imageMap.has(`${sceneIndex}-${field}`);

    let selectValue = "local";
    if (isUrl) selectValue = "url";

    const fileId = `file-${fieldId}-${sceneIndex}`;
    const selectId = `select-${fieldId}-${sceneIndex}`;

    let html = `
        <div class="file-select-wrapper">
            <select id="${selectId}" class="file-type-select" onchange="handleFileTypeChange(${sceneIndex}, '${field}', this.value, ${isSound})">
                <option value="local" ${selectValue === "local" ? "selected" : ""}>Local</option>
                <option value="url" ${selectValue === "url" ? "selected" : ""}>URL</option>
                <option value="gallery">Gallery</option>
            </select>
            <div id="${selectId}-container" style="flex: 1;">
    `;

    if (selectValue === "local") {
        const fileName = hasFile
            ? isSound
                ? soundMap.get(sceneIndex).name
                : imageMap.get(`${sceneIndex}-${field}`).name
            : "";
        const buttonText = fileName || "Select file";
        const tooltip = fileName ? `title="${fileName}"` : "";

        html += `
            <input type="file" id="${fileId}" accept="${isSound ? "audio/*" : "image/*"}"
                   onchange="handle${isSound ? "Sound" : "Image"}Upload(${sceneIndex}, ${isSound ? "" : `'${field}', `}this)">
            <button class="file-select-button ${fileName ? "has-file" : ""}" 
                    onclick="document.getElementById('${fileId}').click()"
                    ${tooltip}>
                <span class="filename">${buttonText}</span>
                ${fileName ? `<button class="file-clear-button" onclick="event.stopPropagation(); clearFile(${sceneIndex}, '${field}', ${isSound})">×</button>` : ""}
            </button>
        `;
    } else if (selectValue === "url") {
        html += `
            <input type="text" class="url-input" placeholder="Enter URL"
                   value="${isUrl ? currentValue : ""}"
                   onchange="handle${isSound ? "Sound" : "Image"}Url(${sceneIndex}, ${isSound ? "" : `'${field}', `}this.value)">
        `;
    }

    if (isSound) {
        html += `
            ${
                currentValue !== null
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

function handleFileTypeChange(sceneIndex, field, type, isSound = false) {
    const selectId = `select-${isSound ? "sound" : field}-${sceneIndex}`;
    const container = document.getElementById(`${selectId}-container`);
    const fileId = `file-${isSound ? "sound" : field}-${sceneIndex}`;

    if (type === "local") {
        const hasFile = isSound ? soundMap.has(sceneIndex) : imageMap.has(`${sceneIndex}-${field}`);
        const fileName = hasFile
            ? isSound
                ? soundMap.get(sceneIndex).name
                : imageMap.get(`${sceneIndex}-${field}`).name
            : "";
        const buttonText = fileName || "Select file";
        const tooltip = fileName ? `title="${fileName}"` : "";

        container.innerHTML = `
            <input type="file" id="${fileId}" accept="${isSound ? "audio/*" : "image/*"}"
                   onchange="handle${isSound ? "Sound" : "Image"}Upload(${sceneIndex}, ${isSound ? "" : `'${field}', `}this)">
            <button class="file-select-button ${fileName ? "has-file" : ""}" 
                    onclick="document.getElementById('${fileId}').click()"
                    ${tooltip}>
                <span class="filename">${buttonText}</span>
                ${fileName ? `<button class="file-clear-button" onclick="event.stopPropagation(); clearFile(${sceneIndex}, '${field}', ${isSound})">×</button>` : ""}
            </button>
        `;
    } else if (type === "url") {
        container.innerHTML = `
            <input type="text" class="url-input" placeholder="Enter URL"
                   onchange="handle${isSound ? "Sound" : "Image"}Url(${sceneIndex}, ${isSound ? "" : `'${field}', `}this.value)">
        `;
    } else if (type === "gallery") {
        container.innerHTML = `
            <button class="gallery-button" onclick="openGalleryForField(${sceneIndex}, '${field}', ${isSound})">Open Gallery</button>
        `;
    }
}

function openGalleryForField(sceneIndex, field, isSound) {
    window.gallerySelectionCallback = (name, category, type) => {
        const assets =
            type === "images" ? window.gameImporterAssets.images[category] : window.gameImporterAssets.audio[category];

        const asset = assets[name];
        if (asset) {
            if (isSound) {
                projectData.scenes[sceneIndex].sound = asset.url;
                soundMap.set(sceneIndex, { name: name, blob: asset.blob });
            } else {
                projectData.scenes[sceneIndex][field] = asset.url;
                imageMap.set(`${sceneIndex}-${field}`, { name: name, blob: asset.blob });
            }
            updateScenesList();
        }
    };

    openGallery();
}

function useGalleryAsset(name, category) {
    closeGallery();

    if (window.gallerySelectionCallback) {
        window.gallerySelectionCallback(name, category, currentGalleryTab);
        window.gallerySelectionCallback = null;
    }
}

function clearFile(sceneIndex, field, isSound = false) {
    if (isSound) {
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

function createSceneElement(index) {
    const scene = projectData.scenes[index];
    const nbScenes = projectData.scenes.length;
    const item = document.createElement("div");
    item.className = "scene-item";

    let speakerOptions = '<option value="">Narrator</option>';

    Object.keys(projectData.characters).forEach((charName) => {
        const char = projectData.characters[charName];
        const isSelected = scene.speaker === charName;
        speakerOptions += `<option value="${charName}" ${isSelected ? "selected" : ""}>${charName}</option>`;

        if (char.aliases && char.aliases.length > 0) {
            char.aliases.forEach((alias) => {
                const isAliasSelected = scene.speaker === alias;
                speakerOptions += `<option value="${alias}" ${isAliasSelected ? "selected" : ""}>  → ${alias}</option>`;
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
        preview1 = dialogFramework.toEntitySpeech(preview1);
        preview2 = dialogFramework.toEntitySpeech(preview2);
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

        if (scene.line1 || scene.line2 || scene.speaker) {
            previewHTML += `
        <div class="preview-text" style="background-image: url('https://i.imgur.com/cH6ms0h.png'); background-size: 100% 100%; background-repeat: no-repeat;">
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
                    <span class="scene-preview-lines">${preview1}<br/>${preview2}</span>
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
                            <input id="inputLine1${index}" type="text" value="${scene.line1 || ""}" onchange="updateSceneValue(${index}, 'line1', this.value)">
                        </div>
                        <div class="form-group">
                            <label for="inputLine2${index}">Line 2:</label>
                            <input id="inputLine2${index}" type="text" value="${scene.line2 || ""}" onchange="updateSceneValue(${index}, 'line2', this.value)">
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
                    <h4>Audio</h4>
                    <div class="form-group audio audio-form-group">
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
                </div>

                <div class="scene-group timimg-assets-group">
                    <h4>Timing</h4>
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

                <div class="scene-group effects-assets-group">
                    <h4>Effects</h4>
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
    `;

    return item;
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
        processedLine1 = dialogFramework.toEntitySpeech(processedLine1);
        processedLine2 = dialogFramework.toEntitySpeech(processedLine2);
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

    text1Element.textContent = processedLine1;
    text2Element.textContent = processedLine2;
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
        expandedScenes.add(index);
    }
    updateScenesList();
}

function updateSceneValue(index, field, value) {
    projectData.scenes[index][field] = value;

    if (["speaker", "line1", "line2", "censorSpeaker", "demonSpeaker"].includes(field)) {
        updateScenesList(index);
        setTimeout(() => updatePreviewDialog(index), 0);
    }
}

function getImageSrc(sceneIndex, field) {
    const key = `${sceneIndex}-${field}`;
    const file = imageMap.get(key);
    if (file) {
        return URL.createObjectURL(file);
    }

    const imagePath = projectData.scenes[sceneIndex][field];
    if (!imagePath) return "";

    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
        return imagePath;
    }

    return "img/" + imagePath;
}

function handleImageUpload(sceneIndex, field, input) {
    const file = input.files[0];
    if (file) {
        projectData.scenes[sceneIndex][field] = file.name;
        imageMap.set(`${sceneIndex}-${field}`, file);
        updateScenesList();
    }
}

function handleSoundUpload(sceneIndex, input) {
    const file = input.files[0];
    if (file) {
        projectData.scenes[sceneIndex].sound = file.name;
        soundMap.set(sceneIndex, file);
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

    if (file) {
        const url = URL.createObjectURL(file);
        currentlyPlayingAudio = new Audio(url);
    } else if (soundPath && (soundPath.startsWith("http://") || soundPath.startsWith("https://"))) {
        currentlyPlayingAudio = new Audio(soundPath);
    } else if (soundPath) {
        currentlyPlayingAudio = new Audio("sounds/" + soundPath);
    } else {
        return;
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
        }
    } else {
        projectData.scenes[sceneIndex][field] = "";
    }

    updateNullCheckboxVisibility(sceneIndex, field, isNull);

    updateScenesList();
}

function updateNullCheckboxVisibility(sceneIndex, field, isNull) {
    const containerId =
        field === "sound" ? `select-sound-${sceneIndex}-container` : `select-${field}-${sceneIndex}-container`;
    const container = document.getElementById(containerId);

    if (container) {
        container.style.display = isNull ? "none" : "flex";
    }

    if (field === "sound") {
        const playButton = document.getElementById(`sound-button-${sceneIndex}`);
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
            <button class="gallery-button" onclick="alert('WIP')" ${!enabled ? "disabled" : ""}>Open Gallery</button>
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
            showDebug: ${projectData.config.showDebug}`;

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
                color: '${data.color}'
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

    code += `;
}`;

    document.getElementById("outputCode").value = code;
}

if (document.getElementById("configShowControls")) {
    document.getElementById("configShowControls").addEventListener("change", updateConfig);
    document.getElementById("configShowDebug").addEventListener("change", updateConfig);
    document.getElementById("glitchScrambledColor").addEventListener("change", updateGlitchConfig);
    document.getElementById("glitchRealColor").addEventListener("change", updateGlitchConfig);
    document.getElementById("glitchChangeSpeed").addEventListener("change", updateGlitchConfig);
    document.getElementById("glitchRealProbability").addEventListener("change", updateGlitchConfig);
    document.getElementById("glitchAutoStart").addEventListener("change", updateGlitchConfig);
    document.getElementById("glitchCharsAllowed").addEventListener("change", updateGlitchConfig);
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
            backgroundMusic: null,
            backgroundMusicVolume: 0.5,
        };

        document.getElementById("configShowControls").checked = true;
        document.getElementById("configShowDebug").checked = true;
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

function handleGameImport() {
    const folderInput = document.getElementById("folderInput");
    folderInput.onchange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            await gameImporter.importGame(files);

            const importButtons = document.querySelectorAll(".game-import");
            importButtons.forEach((btn) => {
                btn.textContent = "Gallery";
                btn.onclick = () => openGallery();
                btn.classList.add("gallery-button");
                btn.classList.remove("game-import");
            });
        }
    };
    folderInput.click();
}

function openGallery() {
    const modal = document.getElementById("galleryModal");
    if (modal) {
        modal.style.display = "flex";
        switchGalleryTab("images");
    }
}

function closeGallery() {
    if (window.galleryManager) {
        window.galleryManager.clearPreview();
    }

    const modal = document.getElementById("galleryModal");
    if (modal) {
        modal.style.display = "none";
    }
}

function switchGalleryTab(tab) {
    currentGalleryTab = tab;

    if (window.galleryManager) {
        window.galleryManager.clearPreview();
    }

    document.querySelectorAll(".gallery-tab").forEach((btn) => {
        btn.classList.remove("active");
        if (btn.textContent.toLowerCase().includes(tab)) {
            btn.classList.add("active");
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

    categories.forEach((category) => {
        const btn = document.createElement("button");
        btn.className = "gallery-category-btn";
        btn.textContent = category;
        btn.onclick = () => {
            if (isImageTab) {
                galleryManager.lastImageCategory = category;
            } else {
                galleryManager.lastAudioCategory = category;
            }
            selectGalleryCategory(category);
        };
        categoriesContainer.appendChild(btn);
    });

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

    contentContainer.innerHTML = "";

    const assets =
        currentGalleryTab === "images"
            ? window.gameImporterAssets.images[currentGalleryCategory]
            : window.gameImporterAssets.audio[currentGalleryCategory];
    if (!assets) return;

    const urlParams = new URLSearchParams(window.location.search).get("mode");

    const isGalleryOnly = urlParams === "gallery" || urlParams === null || urlParams === undefined;

    const assetEntries = Object.entries(assets);
    assetEntries.sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true, sensitivity: "base" }));

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
        });
        if (document.getElementById("bustsFilterSelect") !== null) {
            document.getElementById("bustsFilterSelect").remove();
        }
        document.getElementById("galleryCategories").appendChild(filterSelect);
    } else if (document.getElementById("bustsFilterSelect") !== null) {
        document.getElementById("bustsFilterSelect").remove();
    }

    assetEntries.forEach(([name, asset]) => {
        if (currentGalleryTab === "images" && currentGalleryCategory === "Portraits" && bustFilterValue !== "All") {
            const baseName = name.toLowerCase().replace(/\.[^/.]+$/, "");
            if (!baseName.startsWith(bustFilterValue.toLowerCase() + "_")) return;
        }
        const formatName = window.galleryManager.formatAssetTitle(name, currentGalleryCategory, currentGalleryTab);
        const item = document.createElement("div");
        item.className = "gallery-item";
        item.dataset.filename = name;
        item.onclick = function () {
            window.galleryManager.previewAsset(name, currentGalleryCategory, currentGalleryTab);
        };
        if (currentGalleryTab === "images") {
            item.innerHTML = `
            <img src="${asset.url}" alt="${name}">
            <div class="gallery-item-name">${formatName}</div>
            <div class="gallery-item-actions">
            ${!isGalleryOnly ? `<button class="gallery-item-action" onclick="event.stopPropagation(); useGalleryAsset('${name}', '${currentGalleryCategory}')">Use</button>` : ""}
            </div>
            `;
        } else {
            item.innerHTML = `
            <div class="gallery-item-audio compact">
            <div class="audio-icon">🎵</div>
            <div class="gallery-item-name">${formatName}</div>
            </div>
            <div class="gallery-item-actions">
            ${!isGalleryOnly ? `<button class="gallery-item-action" onclick="event.stopPropagation(); useGalleryAsset('${name}', '${currentGalleryCategory}')">Use</button>` : ""}
            </div>
            `;
        }
        contentContainer.appendChild(item);
    });
}

function useGalleryAsset(name, category) {
    closeGallery();

    window.selectedGalleryAsset = {
        name: name,
        category: category,
        type: currentGalleryTab,
    };

    //console.log("Selected asset:", name, "from", category);
}

window.handleGameImportClick = function () {
    if (window.gameImporterAssets && Object.keys(window.gameImporterAssets.images).length > 0) {
        openGallery();
    } else {
        handleGameImport();
    }
};
