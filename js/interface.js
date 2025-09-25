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

const Color = {
    get GREEN() {
        return getComputedStyle(document.documentElement).getPropertyValue("--green").trim();
    },
    get PURPLE() {
        return getComputedStyle(document.documentElement).getPropertyValue("--purple").trim();
    },
    get BLUE() {
        return getComputedStyle(document.documentElement).getPropertyValue("--blue").trim();
    },
    get GREY_BLUE() {
        return getComputedStyle(document.documentElement).getPropertyValue("--grey-blue").trim();
    },
    get YELLOW() {
        return getComputedStyle(document.documentElement).getPropertyValue("--yellow").trim();
    },
    get GREY() {
        return getComputedStyle(document.documentElement).getPropertyValue("--grey").trim();
    },
    get DEFAULT() {
        return getComputedStyle(document.documentElement).getPropertyValue("--default").trim();
    },
    get RED() {
        return getComputedStyle(document.documentElement).getPropertyValue("--red").trim();
    },
    get BLACK() {
        return getComputedStyle(document.documentElement).getPropertyValue("--black").trim();
    },
    get WHITE() {
        return getComputedStyle(document.documentElement).getPropertyValue("--white").trim();
    },
};

function openEditor() {
    if (typeof dialogFramework !== "undefined") {
        dialogFramework.stopBackgroundMusic();
    }

    document.getElementById("editorOverlay").classList.add("active");
    const blocker = document.getElementById("interactionBlocker");
    if (blocker) {
        blocker.classList.add("active");
    }
    document.getElementById("editorHeaderZoneLeft").style.justifyContent = "center";

    if (typeof dialogFramework !== "undefined" && dialogFramework.scenes.length > 0) {
        const extractedData = {
            config: {
                showControls: dialogFramework.config ? dialogFramework.config.showControls : false,
                showDebug: dialogFramework.config ? dialogFramework.config.showDebug : false,
                backgroundMusic: dialogFramework.config ? dialogFramework.config.backgroundMusic : null,
                backgroundMusicVolume: dialogFramework.config ? dialogFramework.config.backgroundMusicVolume : 0.5,
            },
            characters: dialogFramework.characters || {},
            glitchConfig: dialogFramework.glitchConfig || {
                scrambledColor: Color.BLACK,
                realColor: Color.DEFAULT,
                changeSpeed: 50,
                realProbability: 5,
                autoStart: true,
                charsAllowed: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
            },
            scenes: dialogFramework.scenes || [],
        };
        loadProjectData(extractedData);
        window.lastProjectData = extractedData;
    } else if (window.lastProjectData) {
        loadProjectData(window.lastProjectData);
    }

    const importBtn = document.getElementById("import-game-assets-button");

    if (window.gameImporterAssets && Object.keys(window.gameImporterAssets.images || {}).length > 0) {
        importBtn.textContent = "Gallery";
        importBtn.classList.add("gallery-button");
        importBtn.classList.remove("game-import");
    } else {
        window.memoryManager?.getStorageState().then((state) => {
            if (state === "partial" || state === "complete" || state === "base") {
                importBtn.textContent = "Gallery";
                importBtn.classList.add("gallery-button");
                importBtn.classList.remove("game-import");
            } else {
                importBtn.textContent = "Import assets";
            }
        });
    }

    updateStickyPositions();
}

function closeEditor(ask_confirm = false) {
    if (ask_confirm && !confirm("Modifications not applied will be lost. Are you sure?")) {
        return;
    }
    document.getElementById("editorOverlay").classList.remove("active");

    const blocker = document.getElementById("interactionBlocker");
    if (blocker) {
        blocker.classList.remove("active");
    }

    if (typeof dialogFramework !== "undefined") {
        dialogFramework.reset();
    }
}

async function runSequence() {
    window.lastProjectData = JSON.parse(JSON.stringify(projectData));

    dialogFramework.reset();
    dialogFramework.scenes = [];

    dialogFramework.setConfig(projectData.config);
    dialogFramework.setCharacters(projectData.characters);
    dialogFramework.setGlitchConfig(projectData.glitchConfig);

    projectData.scenes.forEach((scene, index) => {
        const sceneWithBlobUrls = { ...scene };

        ["image", "bustLeft", "bustRight"].forEach((field) => {
            const fieldValue = scene[field];
            if (!fieldValue) return;

            if (fieldValue.startsWith("http")) {
                return;
            }

            if (fieldValue.startsWith("gallery:")) {
                const match = fieldValue.match(/^gallery:([^/]+)\/(.+)$/);
                if (match && window.gameImporterAssets) {
                    const [, category, name] = match;
                    const asset = window.gameImporterAssets.images[category]?.[name];
                    if (asset) {
                        sceneWithBlobUrls[field + "BlobUrl"] = asset.croppedUrl || asset.url;
                    }
                }
                return;
            }

            // Handle local files
            const key = `${index}-${field}`;
            const file = imageMap.get(key);
            if (file) {
                // Check if it's an object with blob property or a File directly
                const blob = file.blob || file;
                sceneWithBlobUrls[field + "BlobUrl"] = URL.createObjectURL(blob);
            }
        });

        const soundValue = scene.sound;
        if (soundValue && !soundValue.startsWith("http")) {
            // Handle gallery references for sounds
            if (soundValue.startsWith("gallery:")) {
                const match = soundValue.match(/^gallery:([^/]+)\/(.+)$/);
                if (match && window.gameImporterAssets) {
                    const [, category, name] = match;
                    const asset = window.gameImporterAssets.audio[category]?.[name];
                    if (asset) {
                        sceneWithBlobUrls.soundBlobUrl = asset.url;
                    }
                }
            } else {
                // Handle local files
                const soundFile = soundMap.get(index);
                if (soundFile) {
                    const blob = soundFile.blob || soundFile;
                    sceneWithBlobUrls.soundBlobUrl = URL.createObjectURL(blob);
                }
            }
        }

        dialogFramework.addScene(sceneWithBlobUrls);
    });

    showLoadingIndicator("Preloading assets...");
    //console.log("Preloading assets for smooth playback...");
    await dialogFramework.preloadAssets();
    hideLoadingIndicator();

    closeEditor();

    updateMobileControlsDebugVisibility();
    updateMobileButtonStates();
    updateMobileDebugInfo();
}

function downloadSequence() {
    generateCode();
    const code = document.getElementById("outputCode").value;

    const blob = new Blob([code], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "sequence.js";
    a.click();

    URL.revokeObjectURL(url);
}

function saveSequence() {
    try {
        generateCode();
        const code = document.getElementById("outputCode").value;

        localStorage.setItem("tcoaal_saved_sequence", code);
        localStorage.setItem("tcoaal_saved_sequence_timestamp", Date.now().toString());

        const clearBtn = document.getElementById("clearSavedBtn");
        if (clearBtn) {
            clearBtn.style.display = "inline-block";
        }

        alert("Sequence saved successfully!");
    } catch (error) {
        console.error("Error saving sequence:", error);
        alert("Error saving sequence: " + error.message);
    }
}

function loadSavedSequence() {
    try {
        const savedCode = localStorage.getItem("tcoaal_saved_sequence");

        if (!savedCode) {
            return false;
        }

        if (!savedCode.includes("function setupScene()")) {
            console.warn("Invalid saved sequence found, ignoring");
            return false;
        }

        try {
            const setupFunc = new Function(savedCode + "\nreturn setupScene;")();
            if (typeof setupFunc === "function") {
                setupFunc();
            }
        } catch (execError) {
            console.error("Error executing saved sequence:", execError);
            return false;
        }

        const parsedData = parseSequenceFile(savedCode);

        if (!parsedData) {
            console.warn("Failed to parse saved sequence");
            return false;
        }

        loadProjectData(parsedData);

        setTimeout(() => {
            updateScenesList();
        }, 100);

        //console.log("Loaded saved sequence from localStorage");
        return true;

    } catch (error) {
        console.error("Error loading saved sequence:", error);
        return false;
    }
}

function clearSavedSequence() {
    if (confirm("This will delete your saved sequence. Continue?")) {
        localStorage.removeItem("tcoaal_saved_sequence");
        localStorage.removeItem("tcoaal_saved_sequence_timestamp");
        alert("Saved sequence cleared!");
        window.location.reload();
    }
}

function importSequence() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".js,application/javascript,text/javascript";

    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();

            if (!text.includes("function setupScene()")) {
                alert("Invalid sequence file: Must contain 'function setupScene()'");
                return;
            }

            const hasGalleryRefs = text.includes("gallery:");
            const hasGameAssets = window.gameImporterAssets &&
                                  (Object.keys(window.gameImporterAssets.images || {}).length > 0 ||
                                   Object.keys(window.gameImporterAssets.audio || {}).length > 0);

            if (hasGalleryRefs && !hasGameAssets) {
                alert(
                    "This sequence file uses gallery assets, but no game has been imported yet.\n\n" +
                    "Please click 'Import assets' button first, then try importing this sequence file again."
                );
                return;
            }

            const parsedData = parseSequenceFile(text);

            if (!parsedData) {
                alert("Failed to parse sequence file");
                return;
            }

            if (projectData.scenes.length > 0 || Object.keys(projectData.characters).length > 0) {
                if (!confirm("This will replace your current project. Continue?")) {
                    return;
                }
            }

            imageMap.clear();
            soundMap.clear();
            expandedScenes.clear();
            if (currentlyPlayingAudio) {
                currentlyPlayingAudio.pause();
                currentlyPlayingAudio = null;
            }

            loadProjectData(parsedData);

            setTimeout(() => {
                updateScenesList();
            }, 100);

            alert("Sequence imported successfully!");

        } catch (error) {
            console.error("Error importing sequence:", error);
            alert("Error importing sequence file: " + error.message);
        }
    };

    input.click();
}

function parseSequenceFile(code) {
    try {
        const mockFramework = {
            config: null,
            characters: null,
            glitchConfig: null,
            scenes: [],

            setConfig(config) {
                this.config = config;
                return this;
            },

            setCharacters(characters) {
                this.characters = characters;
                return this;
            },

            setGlitchConfig(config) {
                this.glitchConfig = config;
                return this;
            },

            addScene(scene) {
                this.scenes.push(scene);
                return this;
            }
        };

        const safeContext = {
            dialogFramework: mockFramework,
            Color: window.Color || {}
        };

        const wrappedCode = `
            (function() {
                ${code}
                setupScene();
            })();
        `;

        const func = new Function('dialogFramework', 'Color', wrappedCode);
        func(mockFramework, safeContext.Color);

        const parsedData = {
            config: mockFramework.config || {
                showControls: true,
                showDebug: true,
                backgroundMusic: null
            },
            characters: {},
            glitchConfig: mockFramework.glitchConfig || {
                scrambledColor: Color.BLACK,
                realColor: Color.DEFAULT,
                changeSpeed: 50,
                realProbability: 5,
                autoStart: true,
                charsAllowed: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
            },
            scenes: []
        };

        if (mockFramework.characters) {
            Object.entries(mockFramework.characters).forEach(([name, data]) => {
                parsedData.characters[name] = {
                    color: data.color,
                    aliases: data.aliases || []
                };
            });
        }

        mockFramework.scenes.forEach(scene => {
            const editorScene = {
                image: scene.image === undefined ? null : scene.image,
                speaker: scene.speaker || "",
                line1: scene.line1 || "",
                line2: scene.line2 || "",
                dialogFadeInTime: scene.dialogFadeInTime !== undefined ? scene.dialogFadeInTime : 200,
                dialogFadeOutTime: scene.dialogFadeOutTime !== undefined ? scene.dialogFadeOutTime : 200,
                imageFadeInTime: scene.imageFadeInTime !== undefined ? scene.imageFadeInTime : 200,
                imageFadeOutTime: scene.imageFadeOutTime !== undefined ? scene.imageFadeOutTime : 200,
                dialogDelayIn: scene.dialogDelayIn !== undefined ? scene.dialogDelayIn : 500,
                dialogDelayOut: scene.dialogDelayOut !== undefined ? scene.dialogDelayOut : 0,
                imageDelayIn: scene.imageDelayIn !== undefined ? scene.imageDelayIn : 0,
                imageDelayOut: scene.imageDelayOut !== undefined ? scene.imageDelayOut : 0,
                sound: scene.sound === undefined ? null : scene.sound,
                soundVolume: scene.soundVolume !== undefined ? scene.soundVolume : 1.0,
                soundDelay: scene.soundDelay !== undefined ? scene.soundDelay : 0,
                censorSpeaker: scene.censorSpeaker || false,
                demonSpeaker: scene.demonSpeaker || false,
                bustLeft: scene.bustLeft === undefined ? null : scene.bustLeft,
                bustRight: scene.bustRight === undefined ? null : scene.bustRight,
                bustFade: scene.bustFade !== undefined ? scene.bustFade : 0,
                shake: scene.shake || false,
                shakeDelay: scene.shakeDelay !== undefined ? scene.shakeDelay : 0,
                shakeIntensity: scene.shakeIntensity !== undefined ? scene.shakeIntensity : 1,
                shakeDuration: scene.shakeDuration !== undefined ? scene.shakeDuration : 500
            };

            parsedData.scenes.push(editorScene);
        });

        return parsedData;

    } catch (error) {
        console.error("Error parsing sequence file:", error);
        return null;
    }
}

function createLoadingIndicator() {
    if (!document.getElementById("loadingIndicator")) {
        const loadingDiv = document.createElement("div");
        loadingDiv.id = "loadingIndicator";
        loadingDiv.className = "loading-indicator";
        loadingDiv.innerHTML = `
            <div class="loading-spinner"></div>
            <span id="loadingText">Preloading assets</span>`;
        document.body.appendChild(loadingDiv);
    }
}

function showLoadingIndicator(text = "Loading...") {
    const indicator = document.getElementById("loadingIndicator");
    const textElement = document.getElementById("loadingText");
    if (indicator && textElement) {
        textElement.textContent = text;
        indicator.classList.add("active");
    }
}

function hideLoadingIndicator() {
    const indicator = document.getElementById("loadingIndicator");
    if (indicator) {
        indicator.classList.remove("active");
    }
}

function createMobileControls() {
    if (window.innerWidth > 768 && window.innerHeight > 600) {
        return;
    }

    const existing = document.getElementById("mobileControls");
    if (existing) {
        existing.remove();
    }

    const mobileControls = document.createElement("div");
    mobileControls.id = "mobileControls";
    mobileControls.className = "mobile-controls-container";

    mobileControls.innerHTML = `
    <div class="mobile-controls-wrapper">
        <div class="mobile-controls-ribbon" id="mobileRibbon">
            <div class="mobile-controls-content" onclick="event.stopPropagation()">
                <div class="mobile-controls-grid">
                    <button onclick="event.stopPropagation(); openEditor()" class="mobile-editor-btn">Editor</button>
                </div>
                <div class="mobile-nav-controls">
                    <button onclick="event.stopPropagation(); dialogFramework.previous()" id="mobilePrevButton">⬅</button>
                    <button onclick="event.stopPropagation(); dialogFramework.next()" id="mobileNextButton">➡</button>
                    <button onclick="event.stopPropagation(); dialogFramework.reset()" id="mobileResetButton">⟲</button>
                </div>
                <div class="mobile-debug-info" id="mobileDebugInfo">
                    <div class="mobile-scene-counter" id="mobileSceneCounter">Scene: 0 / 0</div>
                    <a href="https://github.com/Kidev/TCOAALCreatorTool" target="_blank" rel="noopener" class="mobile-github-link" onclick="event.stopPropagation()">
                        <svg class="github-icon" viewBox="0 0 24 24">
                            <path d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z"/>
                        </svg>
                        <span>View on GitHub</span>
                    </a>
                </div>
            </div>
            <button class="mobile-controls-tab" id="controls-tab-menu-drop" onclick="event.stopPropagation(); toggleMobileControls()">Controls</button>
        </div>
    </div>`;

    document.body.appendChild(mobileControls);

    updateMobileControlsDebugVisibility();
    updateMobileButtonStates();
}

function toggleMobileControls() {
    const ribbon = document.getElementById("mobileRibbon");
    if (ribbon) {
        ribbon.classList.toggle("expanded");
    }
    event.stopPropagation();
}

function updateMobileButtonStates() {
    const prevButton = document.getElementById("mobilePrevButton");
    const nextButton = document.getElementById("mobileNextButton");
    const resetButton = document.getElementById("mobileResetButton");

    if (!prevButton || !nextButton || !resetButton) return;

    if (typeof dialogFramework === "undefined") return;

    prevButton.disabled = false;
    nextButton.disabled = false;
    resetButton.disabled = false;

    if (dialogFramework.currentScene < 0) {
        prevButton.disabled = true;
        resetButton.disabled = true;
    } else if (dialogFramework.currentScene === 0) {
        prevButton.disabled = true;
    }

    if (dialogFramework.currentScene >= dialogFramework.scenes.length) {
        nextButton.disabled = true;
    }
}

function updateMobileDebugInfo() {
    const sceneCounter = document.getElementById("mobileSceneCounter");
    if (!sceneCounter) return;

    if (typeof dialogFramework === "undefined") return;

    if (dialogFramework.currentScene >= dialogFramework.scenes.length) {
        sceneCounter.textContent = "End";
    } else {
        sceneCounter.textContent = `Scene: ${dialogFramework.currentScene + 1} / ${dialogFramework.scenes.length}`;
    }
}

function updateMobileControlsDebugVisibility() {
    const debugInfo = document.getElementById("mobileDebugInfo");
    if (!debugInfo) return;

    if (typeof dialogFramework === "undefined" || !dialogFramework || !dialogFramework.config) {
        debugInfo.style.display = "none";
        return;
    }

    const showDebug = dialogFramework.config && dialogFramework.config.showDebug;
    debugInfo.style.display = showDebug ? "flex" : "none";
}

function autoCollapseMobileControls() {
    const ribbon = document.getElementById("mobileRibbon");
    if (ribbon && ribbon.classList.contains("expanded")) {
        setTimeout(() => {
            ribbon.classList.remove("expanded");
        }, 300);
    }
}

function setupGalleryOnlyMode() {
    const gameContainer = document.querySelector(".game-container");
    if (gameContainer) {
        gameContainer.style.display = "none";
    }

    const controls = document.getElementById("controlsContainer");
    if (controls) {
        controls.style.display = "none";
    }

    document.body.innerHTML = `
        <div class="editor-overlay gallery-only-mode initial active" id="editorOverlay">
            <div class="editor-header" id="editorHeader" >
                <div class="editor-zone left">
                    <div class="header-buttons">
                        <button id="scrollToTopBtn" style="display: none;" onclick="document.getElementById('editorOverlay').scrollTo({ top: 0, behavior: 'smooth' })" title="Scroll to top">⇮</button>
                    </div>
                </div>
                <div class="editor-zone center">
                    <div class="editor-header-content">
                        <a href="." title="Back to home screen">
                            <img alt="Dialog Creator" class="editor-title-image" src="img/tcoaal-title.webp">
                        </a>
                    </div>
                </div>
                <div class="editor-zone right">
                    <div class="header-buttons" style="display: flex;flex-direction: column;width:25vmin;gap:0.1vmin;font-size:1vmax;justify-content: center;align-items: center;border-radius: 4px;">
                        <button id="download-all-button" class="tcoaal-button-small tcoaal-button-small-header download-all disabled" onclick="downloadAllAssets()" title="Download all imported assets">Download All</button>
                        <div id="croppingProgressIndicator" style="display: none;">
                          <div class="bar" id="croppingProgressBar"></div>
                          <span class="label" id="croppingProgressSpan">Cropping...</span>
                        </div>
                    </div>
                </div>
                <div id="github-logo-icon">
                    <a href="https://github.com/Kidev/TCOAALCreatorTool" target="_blank" title="Star me on GitHub">
                        <img src="img/github.png" alt="Star me on GitHub"/>
                    </a>
                </div>
            </div>
            <div class="editor-container">
                <div id="galleryInitialPrompt" style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
                    <div id="menu-buttons" style="width:35vmax;height:10vmax;font-size: 2vmax;position:fixed;left:50%;top:60%;transform:translate(-50%,-60%);">
                    <button id="button-open-gallery-mode" class="tcoaal-button" title="Browse easily through the game assets and create your own scenes" onclick="handleGalleryOnlyImport()" style="width:35vmax;">
                        Assets explorer
                    </button>
                    <div style="display:flex; flex-direction: row;">
                        <button class="tcoaal-button" onclick="reopenWithMode('editor')" style="width:35vmax;margin-top:0.5vmax;" title="Create in-game like dialogs using a simple yet powerful tool">
                        Dialog editor
                        </button>
                        <button class="tcoaal-button" onclick="reopenWithMode('viewer')" style="width:35vmax;margin-top:0.5vmax;" title="Watch a dialog">
                        Dialog viewer
                        </button>
                    </div>
                    <button
                        id="clearSavedDataBtn"
                        class="clear-data-btn tcoaal-button"
                        onclick="clearSavedData()"
                        title="Clear saved assets from browser memory"
                        style="display: none;width:35vmax;margin-top:0.5vmax;"
                    >
                        Clear saved data
                    </button>
                    </div>
                    <div id="dialog-container-box" class="dialog-container active" style="margin: 0; position: fixed; transform: translateX(-50%); margin: 0 auto;">
                        <div id="dialog-content-box" class="dialog-content">
                            <div class="dialog-line speaker-line"></div>
                            <div class="dialog-line text-line" style="top:34%; font-size: 2vmax;">You need to own the game to go further.</div>
                            <div class="dialog-line text-line" style="top:54%; font-size: 2vmax;">Demons are respectable entities, not filthy thieves.</div>
                        </div>
                    </div>
                    
                </div>
                <div id="gallerySection" class="section" style="display: none; background: none;padding:0;margin:0;box-shadow:none;">
                    <div class="section-content gallery-flex" style="display: flex; background: none;padding:0;margin:0;">
                        <div class="gallery-embedded-container">
                            <div class="gallery-left-panel">
                                <div class="gallery-tabs">
                                    <button class="gallery-tab active" onclick="switchGalleryTab('images')">Images</button>
                                    <button class="gallery-tab" onclick="switchGalleryTab('audio')">Audio</button>
                                </div>
                                <div class="gallery-categories" id="galleryCategories"></div>
                                <div class="gallery-content gallery-content-embedded" id="galleryContent"></div>
                            </div>
                        </div>
                        <div class="gallery-preview-panel" id="galleryPreviewPanel">
                            <div class="preview-panel-header">
                                <h3>Preview</h3>
                                <button class="preview-download-btn" id="previewDownloadBtn" onclick="downloadPreviewAsset()">⬇ Download</button>
                            </div>
                            <div class="preview-panel-content" id="previewPanelContent">
                                <div class="preview-placeholder">Select an item to preview</div>
                            </div>
                            <div class="preview-controls" id="previewControls"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <input type="file" id="folderInput" style="display: none;" webkitdirectory directory multiple>
        <div id="importProgressModal" class="import-modal" style="display: none;">
            <div class="import-modal-content">
                <img src="https://i.imgur.com/E0E2oCJ.png" style="margin: 0 auto 1.5vmax; display: block;">
                <h2>Processing game assets</h2>
                <div class="import-progress-bar">
                    <div id="importProgressFill" class="import-progress-fill"></div>
                </div>
                <div id="importProgressText" class="import-progress-text">Processing...</div>
            </div>
        </div>
        <iframe id="popup-buy-frame" src="https://store.steampowered.com/widget/2378900/" frameborder="0" width="646" height="190"></iframe>`;

    if (!window.gameImporter) {
        const script = document.createElement("script");
        script.src = "js/gameImporter.js";
        script.onload = function () {
            if (!window.gameImporter) {
                window.gameImporter = new GameImporter();
            }
        };
        document.head.appendChild(script);
    }

    if (!window.memoryManager) {
        const memoryScript = document.createElement("script");
        memoryScript.src = "js/memoryManager.js";
        memoryScript.onload = function () {
            if (!window.memoryManager) {
                window.memoryManager = new MemoryManager();
            }
        };
        document.head.appendChild(memoryScript);
    }

    if (!window.updateGalleryCategories) {
        const editorScript = document.createElement("script");
        editorScript.src = "js/editor.js";
        document.head.appendChild(editorScript);
    }

    const iFrame = document.getElementById("popup-buy-frame");
    requestAnimationFrame(() => {
        iFrame.classList.add("show");
    });
    setTimeout(() => {
        iFrame.classList.remove("show");
    }, 10000);

    const downloadButton = document.getElementById("download-all-button");
    downloadButton.style.display = "none";

    const btn = document.getElementById("button-open-gallery-mode");
    btn.onmouseover = function () {
        btn.textContent = window.memoryManager?.haveDataStored ? "Open saved assets" : "Select your game folder...";
    };
    btn.onmouseout = function () {
        btn.textContent = "Assets explorer";
    };

    initGalleryScrollHandler();
    updateStickyPositions();
}

function updateLoadingBar(percent = -1, nameFile = undefined) {
    let indicator = document.getElementById("croppingProgressIndicator");
    let indicator2 = document.getElementById("croppingProgressIndicatorModal");
    let bar = document.getElementById("croppingProgressBar");
    let bar2 = document.getElementById("croppingProgressBarModal");
    let label = document.getElementById("croppingProgressSpan");
    let label2 = document.getElementById("croppingProgressSpanModal");
    let hide = percent === -1 || nameFile === undefined;

    //console.trace(`LOADING... ${percent} ${nameFile}`);

    if (indicator) indicator.style.display = hide ? "none" : "flex";
    if (indicator2) indicator2.style.display = hide ? "none" : "flex";
    if (label) label.textContent = hide ? "" : `Cropping ${nameFile}`;
    if (label2) label2.textContent = hide ? "" : `Cropping ${nameFile}`;
    if (bar) bar.style.width = hide ? "0%" : percent + "%";
    if (bar2) bar2.style.width = hide ? "0%" : percent + "%";
}

function reopenWithMode(mode) {
    const url = new URL(window.location.href);
    if (url.searchParams.get("mode") === mode) {
        window.location.href = url.toString();
        return;
    }
    url.searchParams.set("mode", mode);
    window.location.href = url.toString();
}

function initGalleryScrollHandler() {
    const editorOverlay = document.getElementById("editorOverlay");
    if (editorOverlay && editorOverlay.classList.contains("gallery-only-mode")) {
        editorOverlay.addEventListener("scroll", function () {
            if (editorOverlay.scrollTop > 20) {
                editorOverlay.classList.add("scrolled");
                const scrollBtn = document.getElementById("scrollToTopBtn");
                if (scrollBtn) scrollBtn.style.display = "inline-block";
            } else {
                editorOverlay.classList.remove("scrolled");
                const scrollBtn = document.getElementById("scrollToTopBtn");
                if (scrollBtn) scrollBtn.style.display = "none";
            }
        });
    }
}

async function handleGalleryOnlyImport() {
    if (window.memoryManager) {
        try {
            const storageState = await window.memoryManager.getStorageState();
            if (storageState !== "none") {
                await loadGalleryFromSavedData(storageState);
                return;
            }
        } catch (error) {
            console.warn("Failed to check saved data, falling back to folder selection:", error);
        }
    }

    const folderInput = document.getElementById("folderInput");
    folderInput.onchange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            if (!window.gameImporter) {
                window.gameImporter = new GameImporter();
            }

            if (!(await gameImporter.importGame(files))) {
                return;
            }

            const editorOverlay = document.getElementById("editorOverlay");
            if (editorOverlay) {
                editorOverlay.classList.add("importing");
                editorOverlay.classList.remove("initial");
            }
            document.getElementById("popup-buy-frame").style.display = "none";
            document.getElementById("popup-buy-frame").style.zindex = "-1";

            document.getElementById("github-logo-icon").style.display = "none";
            document.getElementById("github-logo-icon").style.zindex = "-1";

            setTimeout(() => {
                const initialPrompt = document.getElementById("galleryInitialPrompt");
                if (initialPrompt) {
                    initialPrompt.style.display = "none";
                }
                document.getElementById("gallerySection").style.display = "block";

                if (editorOverlay) {
                    editorOverlay.classList.remove("importing");
                    editorOverlay.classList.add("gallery-loaded");
                }

                if (typeof updateGalleryCategories === "function") {
                    updateGalleryCategories();
                } else {
                    const script = document.createElement("script");
                    script.src = "js/editor.js";
                    script.onload = function () {
                        updateGalleryCategories();
                    };
                    document.body.appendChild(script);
                }
            }, 300);
        }
    };
    folderInput.click();
}

async function downloadAllAssets() {
    const buttonDownload = document.getElementById("download-all-button");
    if (buttonDownload?.classList?.contains("disabled")) {
        return;
    }

    if (!window.gameImporterAssets) {
        alert("No imported assets to download.");
        return;
    }

    if (typeof JSZip === "undefined") {
        const script = document.createElement("script");
        script.src = "js/libs/jszip.min.js";
        script.onload = () => this.downloadAllAssets();
        document.head.appendChild(script);
        return;
    }

    const zip = new JSZip();
    const imgFolder = zip.folder("images");
    const audioFolder = zip.folder("audio");

    function addImageCategory(categoryName, folder) {
        const assets = window.gameImporterAssets.images[categoryName] || {};
        const catFolder = folder.folder(categoryName.toLowerCase());
        for (const [fileName, asset] of Object.entries(assets)) {
            catFolder.file(fileName, asset.blob);
            if (asset.croppedBlob) {
                const croppedFolder = catFolder.folder("cropped");
                croppedFolder.file(fileName, asset.croppedBlob);
            }
        }
    }

    ["Portraits", "Game sprites", "Backgrounds", "Pictures", "System sprites", "Misc"].forEach((cat) => {
        addImageCategory(cat, imgFolder);
    });

    function addAudioCategory(categoryName, folder) {
        const assets = window.gameImporterAssets.audio[categoryName] || {};
        const catFolder = folder.folder(categoryName.toLowerCase());
        for (const [fileName, asset] of Object.entries(assets)) {
            catFolder.file(fileName, asset.blob);
        }
    }
    ["Background songs", "Background sounds", "Event sounds", "Sound effects"].forEach((cat) => {
        addAudioCategory(cat, audioFolder);
    });

    if (buttonDownload) {
        buttonDownload.classList.add("disabled");
        buttonDownload.textContent = "Generating archive...";
    }
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "TCOAAL-assets.zip";
    a.click();
    URL.revokeObjectURL(url);
    if (buttonDownload) {
        buttonDownload.classList.remove("disabled");
        buttonDownload.textContent = "Download All";
    }
}

function updateStickyPositions() {
    const header = document.getElementById("editorHeader");
    const dialogBox = document.getElementById("dialog-content-box");
    const iFrame = document.getElementById("popup-buy-frame");
    if (header) {
        const headerHeight = header.offsetHeight;
        document.documentElement.style.setProperty("--header-height", headerHeight + "px");
    }
    if (dialogBox) {
        const NATIVE_W = 646;
        const NATIVE_H = 190;
        const RATIO_BOX = 0.5;
        const rect = dialogBox.getBoundingClientRect();

        const sx = (rect.width * RATIO_BOX) / NATIVE_W;
        const sy = (rect.height * RATIO_BOX) / NATIVE_H;

        const s = Math.min(1, sx, sy);

        iFrame.style.transform = `scale(${s})`;
    }
}

document.addEventListener("DOMContentLoaded", async function () {
    createLoadingIndicator();

    updateStickyPositions();
    window.addEventListener("resize", updateStickyPositions);

    window.imagesCroppingStarted = false;

    setTimeout(checkSavedDataOnLoad, 100);

    if (window.memoryManager && !window.gameImporterAssets) {
        try {
            const storageState = await window.memoryManager.getStorageState();
            if (storageState !== "none") {
                const savedAssets = await window.memoryManager.loadSavedAssets();
                window.gameImporterAssets = savedAssets;
                //console.log("Loaded saved game assets on page load");
            }
        } catch (error) {
            console.warn("Failed to load saved assets on page load:", error);
        }
    }

    const urlParams = new URLSearchParams(window.location.search);
    let mode = urlParams.get("mode");

    if (mode === null || mode === undefined) {
        mode = "gallery";
    }

    if (mode === "gallery") {
        setupGalleryOnlyMode();
    } else if (mode === "editor") {
        createMobileControls();
        enhanceGameActions();

        const loadedSaved = loadSavedSequence();

        if (!loadedSaved && typeof setupScene === "function") {
            setupScene();
            await dialogFramework.preloadAssets();
            dialogFramework.updateDebugInfo();
        }

        const hasSaved = localStorage.getItem("tcoaal_saved_sequence");
        const clearBtn = document.getElementById("clearSavedBtn");
        if (clearBtn && hasSaved) {
            clearBtn.style.display = "inline-block";
        }

        //setTimeout(() => {
        openEditor();
        //}, 100);
    } else {
        createMobileControls();
        enhanceGameActions();

        if (typeof setupScene === "function") {
            setupScene();

            showLoadingIndicator("Preloading assets");
            //console.log("Initializing and preloading assets...");
            await dialogFramework.preloadAssets();
            hideLoadingIndicator();
            //console.log("Ready to play!");

            dialogFramework.updateDebugInfo();
        } else {
            //console.warn("No setup function found in sequence.js. Please define setupScene()");
            dialogFramework.updateDebugInfo();
        }
    }

    if (mode !== "gallery") {
        updateMobileControlsDebugVisibility();
        updateMobileButtonStates();
        updateMobileDebugInfo();
    }
});

let lastKeyPress = 0;
const keyPressCooldown = 100;

document.addEventListener("keydown", (e) => {
    const gallery = document.getElementById("gallerySection");
    if (!gallery || gallery.style.display === "none") return;

    const activeItems = Array.from(document.querySelectorAll(".gallery-item")).filter(
        (el) => getComputedStyle(el).display !== "none",
    );
    if (!activeItems.length) return;
    const current = document.querySelector(".gallery-item.selected");
    let idx = activeItems.indexOf(current);

    const now = Date.now();
    if (now - lastKeyPress < keyPressCooldown) return;
    lastKeyPress = now;

    // LEFT / RIGHT: move in list
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        //idx = idx < 0 ? 0 : idx;
        const nextIdx =
            e.key === "ArrowRight"
                ? (idx + 1) % activeItems.length
                : (idx - 1 + activeItems.length) % activeItems.length;
        activeItems[nextIdx].click();
    }

    // ENTER: Download selected
    if (e.key === "Enter") {
        e.preventDefault();
        galleryManager.downloadAsset();
    }

    // ESC: Unselect
    if (e.key === "Escape") {
        e.preventDefault();
        galleryManager.clearSpriteSelection();
        galleryManager.clearPreview();
        galleryManager.unselectCurrent();
    }

    // TAB: switch to next group
    if (e.key === "Tab") {
        e.preventDefault();
        const btns = Array.from(document.querySelectorAll(".gallery-category-btn"));
        const activeBtn = document.querySelector(".gallery-category-btn.active");

        galleryManager.clearSpriteSelection();
        galleryManager.clearPreview();
        galleryManager.unselectCurrent();

        let bi = btns.indexOf(activeBtn);
        const nextBtn = btns[(bi + 1) % btns.length];
        if (nextBtn) nextBtn.click();
    }

    // UP / DOWN: cycle portrait category, cycle sprites
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        const cat = currentGalleryCategory;
        if (cat === "Portraits") {
            const filterSelect = document.getElementById("bustsFilterSelect");
            if (filterSelect) {
                const count = filterSelect.options.length;
                if (e.key === "ArrowDown") {
                    filterSelect.selectedIndex = (filterSelect.selectedIndex + 1) % count;
                } else {
                    filterSelect.selectedIndex = (filterSelect.selectedIndex - 1 + count) % count;
                }
                filterSelect.dispatchEvent(new Event("change"));
            }
        } else if (cat.includes("sprites")) {
            if (galleryManager.extractedSprites.length > 0) {
                const total = galleryManager.extractedSprites.length;
                let nextIndex;
                if (galleryManager.selectedSprites.length === 0) {
                    // No sprite selected: pick first or last
                    nextIndex = e.key === "ArrowDown" ? 0 : total - 1;
                } else {
                    const selected = galleryManager.selectedSprites[0];
                    nextIndex = e.key === "ArrowDown" ? (selected + 1) % total : (selected - 1 + total) % total;
                }
                galleryManager.clearSpriteSelection();
                galleryManager.toggleSpriteSelection(nextIndex);
            }
        }
    }

    // SPACE: toggle cropped view mode or play/pause sound
    if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        const current = galleryManager.currentAsset;
        if (!current) return;

        if (current.type === "images" && current.category !== "Portraits") {
            galleryManager.globalImageViewMode =
                galleryManager.globalImageViewMode === "cropped" ? "original" : "cropped";

            const contentDiv = document.getElementById("previewPanelContent");
            const controlsDiv = document.getElementById("previewControls");
            galleryManager.previewImage(current.asset, current.name, contentDiv, controlsDiv);
        } else if (current.type === "audio") {
            galleryManager.toggleAudioPlay();
        }
    }
});

async function checkSavedDataOnLoad() {
    if (!window.memoryManager) return;

    try {
        const storageState = await window.memoryManager.getStorageState();
        const clearBtn = document.getElementById("clearSavedDataBtn");

        if (clearBtn) {
            if (storageState !== "none") {
                // Show the button and update its text with storage info
                const size = await window.memoryManager.getDatabaseSize();
                const sizeText = window.memoryManager.formatSize(size);

                let stateText = "";
                switch (storageState) {
                    case "partial":
                        stateText = "Base and some cropped assets";
                        break;
                    case "complete":
                        stateText = "Base and cropped assets";
                        break;
                    case "base":
                        stateText = "Base assets (not cropped)";
                        break;
                }

                clearBtn.textContent = `Clear saved data (${sizeText})`;
                clearBtn.title = stateText;
                clearBtn.style.display = "block";
            } else {
                clearBtn.style.display = "none";
            }
        }
    } catch (error) {
        console.warn("Failed to check saved data status:", error);
    }
}

async function clearSavedData() {
    if (!window.memoryManager) return;

    try {
        const size = await window.memoryManager.getDatabaseSize();
        const sizeText = window.memoryManager.formatSize(size);

        if (
            confirm(
                `Are you sure you want to clear all saved asset data? This will free up ${sizeText} of storage and cannot be undone.`,
            )
        ) {
            await window.memoryManager.clearAllData();

            // Hide the button
            const clearBtn = document.getElementById("clearSavedDataBtn");
            if (clearBtn) {
                clearBtn.style.display = "none";
            }
        }
    } catch (error) {
        console.error("Failed to clear saved data:", error);
        alert("Failed to clear saved data. Please try again.");
    }
}

async function loadGalleryFromSavedData(storageState) {
    try {
        const editorOverlay = document.getElementById("editorOverlay");
        if (editorOverlay) {
            editorOverlay.classList.add("importing");
            editorOverlay.classList.remove("initial");
        }

        const modal = document.getElementById("importProgressModal");
        const fill = document.getElementById("importProgressFill");
        const text = document.getElementById("importProgressText");

        if (modal) {
            modal.style.display = "flex";
            if (fill) fill.style.width = "0%";
            if (text) text.textContent = "Loading saved assets...";
        }

        const savedAssets = await window.memoryManager.loadSavedAssets();
        window.gameImporterAssets = savedAssets;

        Object.keys(savedAssets.images || {}).forEach((category) => {
            Object.keys(savedAssets.images[category] || {}).forEach((name) => {
                const asset = savedAssets.images[category][name];
                if (asset.croppedBlob && asset.croppedUrl) {
                    asset.cropped = true;
                    asset.cropping = false;
                }
            });
        });

        if (fill) fill.style.width = "50%";
        if (text) text.textContent = "Setting up gallery...";

        document.getElementById("popup-buy-frame").style.display = "none";
        document.getElementById("popup-buy-frame").style.zindex = "-1";
        document.getElementById("github-logo-icon").style.display = "none";
        document.getElementById("github-logo-icon").style.zindex = "-1";

        const initialPrompt = document.getElementById("galleryInitialPrompt");
        if (initialPrompt) {
            initialPrompt.style.display = "none";
        }

        document.getElementById("gallerySection").style.display = "block";
        document.getElementById("download-all-button").style.display = "block";

        const importBtn = document.getElementById("import-game-assets-button");
        if (importBtn) {
            importBtn.textContent = "Game assets";
        }

        if (editorOverlay) {
            editorOverlay.classList.remove("importing");
            editorOverlay.classList.add("gallery-loaded");
        }

        if (fill) fill.style.width = "75%";
        if (text) text.textContent = "Initializing gallery interface...";

        if (typeof updateGalleryCategories === "function") {
            updateGalleryCategories();
        } else {
            const script = document.createElement("script");
            script.src = "js/editor.js";
            script.onload = function () {
                updateGalleryCategories();
            };
            document.body.appendChild(script);
        }

        if (modal) {
            modal.style.display = "none";
        }

        //await handleSmartLoading(storageState, savedAssets);
    } catch (error) {
        console.error("Failed to load gallery from saved data:", error);

        const modal = document.getElementById("importProgressModal");
        if (modal) {
            modal.style.display = "none";
        }

        alert("Failed to load saved assets. Please try importing your game folder again.");
    }
}

/*
async function handleSmartLoading(storageState, savedAssets) {
    if (!window.galleryManager) return;

    try {
        if (storageState === "partial" || storageState === "base") {
            //const assetsNeedingCrop = await window.memoryManager.getAssetsNeedingCrop();
            //await window.galleryManager.enqueueBatch(assetsNeedingCrop);
        } else if (storageState === "complete") {
            updateLoadingBar();
        } else if (storageState === "none") {
            //console.log("No data stored");
            updateLoadingBar();
        }
    } catch (error) {
        console.error("Error in smart loading:", error);
    }
}*/

function enhanceGameActions() {
    const originalNext = dialogFramework.next;
    const originalPrevious = dialogFramework.previous;
    const originalReset = dialogFramework.reset;

    dialogFramework.next = function () {
        const result = originalNext.call(this);
        autoCollapseMobileControls();
        updateMobileButtonStates();
        updateMobileDebugInfo();
        return result;
    };

    dialogFramework.previous = function () {
        const result = originalPrevious.call(this);
        autoCollapseMobileControls();
        updateMobileButtonStates();
        updateMobileDebugInfo();
        return result;
    };

    dialogFramework.reset = function () {
        const result = originalReset.call(this);
        autoCollapseMobileControls();
        updateMobileButtonStates();
        updateMobileDebugInfo();
        return result;
    };
}
