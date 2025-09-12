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

    updateStickyPositions();
}

function closeEditor() {
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
            const key = `${index}-${field}`;
            const file = imageMap.get(key);
            if (file && scene[field] && !scene[field].startsWith("http")) {
                sceneWithBlobUrls[field + "BlobUrl"] = URL.createObjectURL(file);
            }
        });

        const soundFile = soundMap.get(index);
        if (soundFile && scene.sound && !scene.sound.startsWith("http")) {
            sceneWithBlobUrls.soundBlobUrl = URL.createObjectURL(soundFile);
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

document.addEventListener("DOMContentLoaded", async function () {
    createLoadingIndicator();

    if (typeof createMobileControls === "function") {
        createMobileControls();
    }

    if (typeof enhanceGameActions === "function") {
        enhanceGameActions();
    }

    if (typeof setupScene === "function") {
        setupScene();

        if (
            typeof dialogFramework !== "undefined" &&
            dialogFramework &&
            typeof dialogFramework.preloadAssets === "function"
        ) {
            showLoadingIndicator("Preloading assets");
            await dialogFramework.preloadAssets();
            hideLoadingIndicator();

            if (typeof dialogFramework.updateDebugInfo === "function") {
                dialogFramework.updateDebugInfo();
            }
        }
    } else if (typeof setupScenes === "function") {
        setupScenes();

        if (
            typeof dialogFramework !== "undefined" &&
            dialogFramework &&
            typeof dialogFramework.preloadAssets === "function"
        ) {
            showLoadingIndicator("Preloading assets");
            await dialogFramework.preloadAssets();
            hideLoadingIndicator();

            if (typeof dialogFramework.updateDebugInfo === "function") {
                dialogFramework.updateDebugInfo();
            }
        }
    } else {
        if (
            typeof dialogFramework !== "undefined" &&
            dialogFramework &&
            typeof dialogFramework.updateDebugInfo === "function"
        ) {
            dialogFramework.updateDebugInfo();
        }
    }

    if (typeof updateMobileControlsDebugVisibility === "function") updateMobileControlsDebugVisibility();
    if (typeof updateMobileButtonStates === "function") updateMobileButtonStates();
    if (typeof updateMobileDebugInfo === "function") updateMobileDebugInfo();
});

function createLoadingIndicator() {
    if (!document.getElementById("loadingIndicator")) {
        const loadingDiv = document.createElement("div");
        loadingDiv.id = "loadingIndicator";
        loadingDiv.className = "loading-indicator";
        loadingDiv.innerHTML = `
        <div class="loading-spinner"></div>
        <span id="loadingText">Preloading assets</span>
        `;
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
    </div>
    `;

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
        sceneCounter.textContent = "Endscreen";
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
    <div class="editor-header" id="editorHeader">
    <div class="editor-zone left">
    <div class="header-buttons">
    </div>
    </div>
    <div class="editor-zone center">
    <div class="editor-header-content">
    <a href="https://github.com/Kidev/TCOAALCreatorTool" title="See on GitHub" target="_blank">
    <img alt="Dialog Creator" class="editor-title-image" src="img/tcoaal-title.webp">
    </a>
    </div>
    </div>
    <div class="editor-zone right">
    <div class="header-buttons">
    </div>
    </div>
    </div>
    <div class="editor-container">
    <div id="galleryInitialPrompt" style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
    <button class="tcoaal-button" onclick="handleGalleryOnlyImport()" style="width:30vmax;padding:1vmax;font-size: 2vmax;position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);">
    Select your game folder
    </button>
    <div class="dialog-container active" style="margin: 0; position: fixed; transform: translateX(-50%); margin: 0 auto;">
    <div class="dialog-content">
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
    <h2>Importing Game Assets</h2>
    <div class="import-progress-bar">
    <div id="importProgressFill" class="import-progress-fill"></div>
    </div>
    <div id="importProgressText" class="import-progress-text">Processing...</div>
    </div>
    </div>
    <div id="buy-game-popup" class="iframe-wrapper">
    <iframe src="https://store.steampowered.com/widget/2378900/" frameborder="0" width="646" height="190"></iframe>
    </div>
    `;

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

    if (!window.updateGalleryCategories) {
        const editorScript = document.createElement("script");
        editorScript.src = "js/editor.js";
        document.head.appendChild(editorScript);
    }

    initGalleryScrollHandler();
    updateStickyPositions();
}

function initGalleryScrollHandler() {
    const editorOverlay = document.getElementById("editorOverlay");
    if (editorOverlay && editorOverlay.classList.contains("gallery-only-mode")) {
        editorOverlay.addEventListener("scroll", function () {
            if (editorOverlay.scrollTop > 20) {
                editorOverlay.classList.add("scrolled");
            } else {
                editorOverlay.classList.remove("scrolled");
            }
        });
    }
}

function handleGalleryOnlyImport() {
    const folderInput = document.getElementById("folderInput");
    folderInput.onchange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const editorOverlay = document.getElementById("editorOverlay");
            if (editorOverlay) {
                editorOverlay.classList.add("importing");
                editorOverlay.classList.remove("initial");
            }
            document.getElementById("buy-game-popup").style.display = "none";
            document.getElementById("buy-game-popup").style.zindex = "-1";

            if (!window.gameImporter) {
                window.gameImporter = new GameImporter();
            }

            await gameImporter.importGame(files);

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

function switchToEditorMode() {
    window.location.href = window.location.pathname;
}

function updateStickyPositions() {
    const header = document.getElementById("editorHeader");
    if (header) {
        const headerHeight = header.offsetHeight;
        document.documentElement.style.setProperty("--header-height", headerHeight + "px");
    }
}

document.addEventListener("DOMContentLoaded", async function () {
    createLoadingIndicator();

    updateStickyPositions();
    window.addEventListener("resize", updateStickyPositions);

    const urlParams = new URLSearchParams(window.location.search);
    let mode = urlParams.get("mode");

    // TODO AUTO GALLERY: CHANGE TO NOT MAKE GALLERY THE DEFAULT AGAIN
    if (mode === null || mode === undefined) {
        mode = "gallery";
    }

    if (mode === "gallery") {
        setupGalleryOnlyMode();
    } else if (mode === "editor") {
        createMobileControls();
        enhanceGameActions();

        if (typeof setupScene === "function") {
            setupScene();
            await dialogFramework.preloadAssets();
            dialogFramework.updateDebugInfo();
        } else if (typeof setupScenes === "function") {
            setupScenes();
            await dialogFramework.preloadAssets();
            dialogFramework.updateDebugInfo();
        }

        setTimeout(() => {
            openEditor();
        }, 100);
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
        } else if (typeof setupScenes === "function") {
            setupScenes();

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
