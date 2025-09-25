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

class GlitchTextEffect {
    constructor(element, config = {}) {
        this.element = element;
        this.originalText = "";
        this.characters = [];
        this.interval = null;
        this.isRunning = false;
        this.isRevealed = false;

        this.config = {
            scrambledColor: config.scrambledColor || Color.BLACK,
            realColor: config.realColor || Color.DEFAULT,
            changeSpeed: config.changeSpeed || 200,
            realProbability: config.realProbability || 5,
            autoStart: config.autoStart !== undefined ? config.autoStart : true,
            charsAllowed:
                config.charsAllowed !== undefined
                    ? config.charsAllowed
                    : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()[]{}|\\:\";'<>?,./`~",
        };

        if (this.element && this.element.textContent) {
            this.setText(this.element.textContent);
            if (this.config.autoStart) {
                this.start();
            }
        }
    }

    setText(text) {
        this.originalText = text;
        this.setupCharacters();
    }

    setupCharacters() {
        if (!this.element) return;

        this.element.innerHTML = "";
        this.characters = [];

        for (let i = 0; i < this.originalText.length; i++) {
            const char = this.originalText[i];
            const span = document.createElement("span");
            span.className = "glitch-char";
            span.textContent = char === " " ? "\u00A0" : char;
            span.dataset.correct = char;
            span.style.display = "inline-block";
            span.style.fontFamily = "monospace";
            span.style.width = "1ch";
            span.style.textAlign = "center";

            span.style.setProperty("--correct-color", this.config.realColor);
            span.style.setProperty("--incorrect-color", this.config.scrambledColor);
            span.style.setProperty("--text-color", this.config.scrambledColor);

            this.element.appendChild(span);
            this.characters.push({
                element: span,
                originalChar: char,
                lastUpdateTime: 0,
                updateInterval: this.config.changeSpeed + Math.random() * 100,
            });
        }
    }

    getRandomChar(excludeChar) {
        const availableChars = this.config.charsAllowed.split("").filter((c) => c !== excludeChar);
        if (availableChars.length === 0) return excludeChar;
        return availableChars[Math.floor(Math.random() * availableChars.length)];
    }

    shouldShowReal() {
        return Math.random() * 100 < this.config.realProbability;
    }

    updateCharacter(charObj, currentTime) {
        if (charObj.originalChar === " ") {
            return;
        }

        if (currentTime - charObj.lastUpdateTime < charObj.updateInterval) {
            return;
        }

        charObj.lastUpdateTime = currentTime;

        if (this.isRevealed) {
            charObj.element.textContent = charObj.originalChar;
            charObj.element.style.setProperty("--text-color", this.config.realColor);
        } else {
            let newChar;

            if (this.shouldShowReal()) {
                newChar = charObj.originalChar;
            } else {
                newChar = this.getRandomChar(charObj.originalChar);
            }

            charObj.element.textContent = newChar;

            if (newChar === charObj.originalChar) {
                charObj.element.style.setProperty("--text-color", this.config.realColor);
            } else {
                charObj.element.style.setProperty("--text-color", this.config.scrambledColor);
            }
        }
    }

    start() {
        if (this.isRunning) {
            this.stop();
        }

        this.isRunning = true;
        this.isRevealed = false;

        this.interval = setInterval(() => {
            if (this.isRunning) {
                const currentTime = Date.now();
                this.characters.forEach((charObj) => {
                    this.updateCharacter(charObj, currentTime);
                });
            }
        }, 50);
    }

    stop() {
        this.isRunning = false;
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    reveal() {
        this.isRevealed = true;
        this.characters.forEach((charObj) => {
            if (charObj.originalChar !== " ") {
                charObj.element.textContent = charObj.originalChar;
                charObj.element.style.setProperty("--text-color", this.config.realColor);
            }
        });
    }

    destroy() {
        this.stop();
        this.characters = [];
        if (this.element) {
            this.element.innerHTML = "";
        }
    }
}

class DialogFramework {
    constructor() {
        this.scenes = [];
        this.currentScene = -1;
        this.isTyping = false;
        this.typeSpeed = 20;
        this.currentText = "";
        this.typingTimeout = null;
        this.currentBackgroundImage = null;
        this.currentBustLeft = null;
        this.currentBustRight = null;
        this.loadedSounds = new Map();
        this.glitchEffects = [];
        this.speakerGlitch = null;
        this.characters = {};
        this.glitchConfig = {};
        this.config = {};
        this.clickToStartShown = false;
        this.backgroundMusicAudio = null;
        this.sceneVersion = 0;

        this.initializeEventListeners();
        this.initializeAudio();
        this.updateDebugInfo();

        // Check initial screen size after DOM is ready and dialogFramework is initialized
        this.deferredInit = () => {
            this.checkScreenSize();
        };

        this.entityDictionnary = new Map();
        atob(
            "1408YU0saG9XLG90SGVyLG9uLFJvb00sV291TGQsa05vdyx1U2VMZXNzLGVOZCx3b1JrLFJlZCx2ZSxhQkxlLFRydVN0LG9XZSxwQXksY2" +
                "9tcExldGVkLHRXbyxHb09kYlllLHVudGFpblRlZCxUYVIsU291TCxHcmlNZSxSZWFMbSx2aVNpb04sZEVhTCxoVW1BbixiUm90SGVyLHN1T" +
                "U1vbix0YUxpc21Bbixjb25UYWluZVIsY09yckVjdCx0ckFuc2FjVGlvbixFblRlUixMZWFWZSxzdW1Nb25pbmcsYUNjRXB0LG9mRmVyLHdh" +
                "aVRlZCx3YWlUaW5nLEV4cGVjVGluZyxyZVR1cm4sY2lyQ0xlLGVhU3ksZm9MTG93LHNFRSxhR0FpbixVblRpTCxjZVJ0YWlOLFJlc1RMZXN" +
                "zLFdhbkRlcixDYUxMLGVYcGVDdCxXYW5EZVJpbkcsUGFzVCxWaVNpT25zLEZ1VHVSZSxzVGFyUyxhTGlnTixoQXRjaCxpTnRvLEJvdEgsaW" +
                "5UZVJSdVB0aW5nLHVTaW5HLE1lRXRpbkcsY29pTmNpZEVudGFsLHNIYUxMLHNPb24sVGFzVHksaW5Db01wTGV0ZSxBZ1JlZWQsRmFMc2UsY" +
                "VBQb2luVCxvTmUsZm9SLGhhVmUseWVULEJlLHRPLG1ZLGluLG9GLGlTLG5vVCx3aVRoLHlvVSxpVCxoRSxtRSxXZSx1UyxoaU0saGVSLHRI" +
                "ZSx0SGlzLHRIZXksdEhlbSx0SGF0LHRIZXJlLHRIZW4sd0hhdCx3SHksd0hlbix3SGVyZSx3SGljaCxob01lLHRpTWUsb05jZSxoZVJlLG5" +
                "PdyxuTyxkTyxnTyxzTw==",
        )
            .split(",")
            .forEach((word) => {
                const lowercase = word.toLowerCase();
                this.entityDictionnary.set(lowercase, word);
            });
    }

    async initializeAudio() {
        try {
            const testAudio = new Audio();
        } catch (error) {
            //console.warn("Audio not supported:", error);
        }
    }

    toEntitySpeech(lowercaseText) {
        return lowercaseText.replace(/[a-zA-Z]+/g, (word) => {
            const lowercase = word.toLowerCase();

            if (this.entityDictionnary.has(lowercase)) {
                return this.entityDictionnary.get(lowercase);
            }

            if (word.length >= 4) {
                return word
                    .split("")
                    .map((char, i) => (i % 2 === 1 ? char.toUpperCase() : char.toLowerCase()))
                    .join("");
            }

            if (word.length === 2) return word[0].toLowerCase() + word[1].toUpperCase();
            if (word.length === 3) return word[0].toLowerCase() + word[1].toUpperCase() + word[2].toLowerCase();

            return word;
        });
    }

    generateCharacterCSS() {
        const existingStyle = document.getElementById("dynamic-character-styles");
        if (existingStyle) {
            existingStyle.remove();
        }

        const styleElement = document.createElement("style");
        styleElement.id = "dynamic-character-styles";
        styleElement.type = "text/css";

        let cssRules = "";

        Object.keys(this.characters).forEach((characterName) => {
            const character = this.characters[characterName];
            if (character.color && character.characterClassName) {
                cssRules += `.${character.characterClassName} {\n    color: ${character.color} !important;\n}\n\n`;
            }
        });

        styleElement.textContent = cssRules;

        document.head.appendChild(styleElement);
    }

    async preloadAssets() {
        const startTime = performance.now();
        //console.log("Starting asset preloading...");
        const preloadPromises = [];
        const preloadedImages = new Set();
        const preloadedSounds = new Set();

        this.scenes.forEach((scene, index) => {
            if (scene.image && this.isRemoteUrl(scene.image) && !preloadedImages.has(scene.image)) {
                preloadedImages.add(scene.image);
                preloadPromises.push(this.preloadImage(scene.image, `Scene ${index + 1} background`));
            }

            if (scene.bustLeft && this.isRemoteUrl(scene.bustLeft) && !preloadedImages.has(scene.bustLeft)) {
                preloadedImages.add(scene.bustLeft);
                preloadPromises.push(this.preloadImage(scene.bustLeft, `Scene ${index + 1} bust left`));
            }

            if (scene.bustRight && this.isRemoteUrl(scene.bustRight) && !preloadedImages.has(scene.bustRight)) {
                preloadedImages.add(scene.bustRight);
                preloadPromises.push(this.preloadImage(scene.bustRight, `Scene ${index + 1} bust right`));
            }

            if (scene.sound && this.isRemoteUrl(scene.sound) && !preloadedSounds.has(scene.sound)) {
                preloadedSounds.add(scene.sound);
                preloadPromises.push(this.preloadSound(scene.sound, `Scene ${index + 1} sound`));
            }
        });

        if (preloadPromises.length > 0) {
            //console.log(`Preloading ${preloadPromises.length} remote assets...`);
            try {
                await Promise.allSettled(preloadPromises);
                const endTime = performance.now();
                const duration = ((endTime - startTime) / 1000).toFixed(2);
                //console.log(`Assets preloaded in ${duration} seconds`);
            } catch (error) {
                //console.warn("Some assets failed to preload:", error);
            }
        } else {
            const endTime = performance.now();
            const duration = ((endTime - startTime) / 1000).toFixed(2);
            //console.log(`No remote assets to preload (completed in ${duration} seconds)`);
        }
    }

    async playBackgroundMusic() {
        if (!this.config.backgroundMusic) return;

        try {
            // Stop any existing background music
            this.stopBackgroundMusic();

            let audioSrc;

            // Check if we have a blob URL from the editor
            if (this.config.backgroundMusicBlobUrl) {
                audioSrc = this.config.backgroundMusicBlobUrl;
            } else if (
                this.config.backgroundMusic.startsWith("http://") ||
                this.config.backgroundMusic.startsWith("https://")
            ) {
                audioSrc = this.config.backgroundMusic;
            } else {
                audioSrc = "sounds/" + this.config.backgroundMusic;
            }

            this.backgroundMusicAudio = new Audio(audioSrc);
            this.backgroundMusicAudio.loop = true;
            this.backgroundMusicAudio.volume = this.config.backgroundMusicVolume || 0.5;

            const playPromise = this.backgroundMusicAudio.play();
            if (playPromise !== undefined) {
                playPromise.catch((error) => {
                    //console.warn(`Failed to play background music: ${this.config.backgroundMusic}`, error);
                });
            }
        } catch (error) {
            //console.warn(`Error playing background music: ${this.config.backgroundMusic}`, error);
        }
    }

    stopBackgroundMusic() {
        if (this.backgroundMusicAudio) {
            this.backgroundMusicAudio.pause();
            this.backgroundMusicAudio.currentTime = 0;
            this.backgroundMusicAudio = null;
        }
    }

    isRemoteUrl(url) {
        return url && (url.startsWith("http://") || url.startsWith("https://"));
    }

    async preloadImage(url, description = "") {
        return new Promise((resolve, reject) => {
            const img = new Image();

            const onLoad = () => {
                //console.log(`Preloaded image: ${description || url}`);
                img.removeEventListener("load", onLoad);
                img.removeEventListener("error", onError);
                resolve(img);
            };

            const onError = (error) => {
                //console.warn(`Failed to preload image: ${description || url}`, error);
                img.removeEventListener("load", onLoad);
                img.removeEventListener("error", onError);
                resolve(null);
            };

            img.addEventListener("load", onLoad);
            img.addEventListener("error", onError);

            setTimeout(() => {
                if (!img.complete) {
                    //console.warn(`Timeout preloading image: ${description || url}`);
                    img.removeEventListener("load", onLoad);
                    img.removeEventListener("error", onError);
                    resolve(null);
                }
            }, 10000);

            img.src = url;
        });
    }

    async preloadSound(url, description = "") {
        return new Promise((resolve, reject) => {
            const audio = new Audio();

            const onCanPlay = () => {
                //console.log(`Preloaded sound: ${description || url}`);
                audio.removeEventListener("canplaythrough", onCanPlay);
                audio.removeEventListener("error", onError);
                this.loadedSounds.set(url, audio);
                resolve(audio);
            };

            const onError = (error) => {
                //console.warn(`Failed to preload sound: ${description || url}`, error);
                audio.removeEventListener("canplaythrough", onCanPlay);
                audio.removeEventListener("error", onError);
                resolve(null);
            };

            audio.addEventListener("canplaythrough", onCanPlay);
            audio.addEventListener("error", onError);

            setTimeout(() => {
                if (audio.readyState < 4) {
                    //console.warn(`Timeout preloading sound: ${description || url}`);
                    audio.removeEventListener("canplaythrough", onCanPlay);
                    audio.removeEventListener("error", onError);
                    resolve(null);
                }
            }, 10000);

            audio.src = url;
            audio.load();
        });
    }

    async loadSound(soundPath, soundBlobUrl = null) {
        // If we have a blob URL, use it directly
        if (soundBlobUrl) {
            const key = soundPath + "_blob";
            if (this.loadedSounds.has(key)) {
                return this.loadedSounds.get(key);
            }

            try {
                const audio = new Audio(soundBlobUrl);

                return new Promise((resolve, reject) => {
                    const onCanPlay = () => {
                        audio.removeEventListener("canplaythrough", onCanPlay);
                        audio.removeEventListener("error", onError);
                        this.loadedSounds.set(key, audio);
                        resolve(audio);
                    };

                    const onError = (error) => {
                        audio.removeEventListener("canplaythrough", onCanPlay);
                        audio.removeEventListener("error", onError);
                        //console.warn(`Failed to load sound blob: ${soundPath}`, error);
                        resolve(null);
                    };

                    audio.addEventListener("canplaythrough", onCanPlay);
                    audio.addEventListener("error", onError);

                    audio.load();
                });
            } catch (error) {
                //console.warn(`Failed to create audio from blob for: ${soundPath}`, error);
                return null;
            }
        }

        if (this.loadedSounds.has(soundPath)) {
            return this.loadedSounds.get(soundPath);
        }

        try {
            const audioSrc =
                soundPath.startsWith("http://") || soundPath.startsWith("https://") ? soundPath : "sounds/" + soundPath;

            const audio = new Audio(audioSrc);

            return new Promise((resolve, reject) => {
                const onCanPlay = () => {
                    audio.removeEventListener("canplaythrough", onCanPlay);
                    audio.removeEventListener("error", onError);
                    this.loadedSounds.set(soundPath, audio);
                    resolve(audio);
                };

                const onError = (error) => {
                    audio.removeEventListener("canplaythrough", onCanPlay);
                    audio.removeEventListener("error", onError);
                    //console.warn(`Failed to load sound: ${soundPath}`, error);
                    resolve(null);
                };

                audio.addEventListener("canplaythrough", onCanPlay);
                audio.addEventListener("error", onError);

                setTimeout(() => {
                    if (!this.loadedSounds.has(soundPath)) {
                        audio.removeEventListener("canplaythrough", onCanPlay);
                        audio.removeEventListener("error", onError);
                        //console.warn(`Timeout loading sound: ${soundPath}`);
                        resolve(null);
                    }
                }, 5000);
            });
        } catch (error) {
            //console.warn(`Failed to create audio for: ${soundPath}`, error);
            return null;
        }
    }

    async playSound(soundPath, volume = 1.0, soundBlobUrl = null) {
        if (!soundPath) return;

        try {
            let audio = await this.loadSound(soundPath, soundBlobUrl);

            if (!audio) {
                //console.warn(`Could not load sound: ${soundPath}`);
                return;
            }

            const audioClone = audio.cloneNode();
            audioClone.volume = Math.max(0, Math.min(1, volume));

            const playPromise = audioClone.play();

            if (playPromise !== undefined) {
                playPromise.catch((error) => {
                    //console.warn(`Failed to play sound: ${soundPath}`, error);
                });
            }
        } catch (error) {
            //console.warn(`Error playing sound: ${soundPath}`, error);
        }
    }

    setCharacters(charactersInput) {
        this.characters = charactersInput;

        this.aliasToCharacter = {};

        for (const key in this.characters) {
            this.characters[key].uuid = `character-${crypto.randomUUID()}`;
            this.characters[key].characterClassName = `speaker-line-${this.characters[key].uuid}`;

            if (this.characters[key].aliases && Array.isArray(this.characters[key].aliases)) {
                this.characters[key].aliases.forEach((alias) => {
                    this.aliasToCharacter[alias] = key;
                });
            }
        }

        this.generateCharacterCSS();
    }

    getCharacterFromSpeaker(speaker) {
        // Check if it's a direct character name
        if (this.characters[speaker]) {
            return { name: speaker, character: this.characters[speaker] };
        }

        // Check if it's an alias
        if (this.aliasToCharacter[speaker]) {
            const characterName = this.aliasToCharacter[speaker];
            return { name: characterName, character: this.characters[characterName] };
        }

        return null;
    }

    setGlitchConfig(config) {
        this.glitchConfig = config;
    }

    setConfig(config) {
        this.config = config;
        this.updateConfig();
    }

    updateConfig() {
        const controls = document.getElementById("controlsContainer");
        const debugArea = document.getElementById("debugArea");

        if (controls) {
            controls.classList.toggle("hidden", !this.config.showControls);
        }

        if (debugArea) {
            debugArea.classList.toggle("hidden", !this.config.showDebug);
            debugArea.style.pointerEvents = this.config.showDebug ? "auto" : "none";
        }

        updateMobileControlsDebugVisibility();
    }

    addScene(options) {
        const scene = {
            image: options.image !== undefined ? options.image : null,
            speaker: options.speaker || "",
            line1: options.line1 !== undefined ? options.line1 : "",
            line2: options.line2 !== undefined ? options.line2 : "",

            dialogFadeInTime: options.dialogFadeInTime !== undefined ? options.dialogFadeInTime : 200,
            dialogFadeOutTime: options.dialogFadeOutTime !== undefined ? options.dialogFadeOutTime : 200,
            imageFadeInTime: options.imageFadeInTime !== undefined ? options.imageFadeInTime : 200,
            imageFadeOutTime: options.imageFadeOutTime !== undefined ? options.imageFadeOutTime : 200,

            dialogDelayIn: options.dialogDelayIn !== undefined ? options.dialogDelayIn : 500,
            dialogDelayOut: options.dialogDelayOut !== undefined ? options.dialogDelayOut : 0,
            imageDelayIn: options.imageDelayIn !== undefined ? options.imageDelayIn : 0,
            imageDelayOut: options.imageDelayOut !== undefined ? options.imageDelayOut : 0,

            sound: options.sound || null,
            soundVolume: options.soundVolume || 1.0,
            soundDelay: options.soundDelay || 0,
            soundBlobUrl: options.soundBlobUrl || null,
            censorSpeaker: options.censorSpeaker !== undefined ? options.censorSpeaker : false,

            bustLeft: options.bustLeft !== undefined ? options.bustLeft : null,
            bustRight: options.bustRight !== undefined ? options.bustRight : null,
            bustFade: options.bustFade !== undefined ? options.bustFade : 0,

            imageBlobUrl: options.imageBlobUrl || null,
            bustLeftBlobUrl: options.bustLeftBlobUrl || null,
            bustRightBlobUrl: options.bustRightBlobUrl || null,

            shake: options.shake !== undefined ? options.shake : false,
            shakeDelay: options.shakeDelay !== undefined ? options.shakeDelay : 0,
            shakeIntensity: options.shakeIntensity !== undefined ? options.shakeIntensity : 1,
            shakeDuration: options.shakeDuration !== undefined ? options.shakeDuration : 500,
        };

        this.scenes.push(scene);
        this.updateDebugInfo();
        return this;
    }

    initializeEventListeners() {
        document.addEventListener("keydown", (e) => {
            if (document.getElementById("editorOverlay").classList.contains("active")) {
                return;
            }

            if (e.code === "Space" || e.code === "ArrowRight") {
                e.preventDefault();
                if (this.isTyping) {
                    this.skipText();
                } else {
                    this.next();
                }
            } else if (e.code === "ArrowLeft") {
                e.preventDefault();
                this.previous();
            } else if (e.code === "Tab") {
                e.preventDefault();
                if (window.innerWidth <= 768 || window.innerHeight <= 600) {
                    if (typeof window.toggleMobileControls === "function") {
                        window.toggleMobileControls();
                    }
                } else {
                    this.toggleControls();
                    this.toggleDebugInfo();
                }
            }
        });

        document.addEventListener("click", (e) => {
            if (document.getElementById("editorOverlay").classList.contains("active")) {
                return;
            }

            if (
                !e.target.closest(".controls") &&
                !e.target.closest(".editor-overlay") &&
                !e.target.closest(".controls-toggle")
            ) {
                if (this.isTyping) {
                    this.skipText();
                } else {
                    this.next();
                }
            }
        });

        // Add resize handler with debouncing
        let resizeTimeout;
        window.addEventListener("resize", () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.checkScreenSize();
            }, 250);
        });

        // Initial screen size check
        this.checkScreenSize();
    }

    toggleControls() {
        const controls = document.getElementById("controlsContainer");
        controls.classList.toggle("hidden");
    }

    toggleDebugInfo() {
        const debugArea = document.getElementById("debugArea");
        debugArea.classList.toggle("hidden");
    }

    updateButtonStates() {
        const prevButton = document.querySelector('button[onclick="dialogFramework.previous()"]');
        const nextButton = document.querySelector('button[onclick="dialogFramework.next()"]');
        const resetButton = document.querySelector('button[onclick="dialogFramework.reset()"]');

        if (prevButton && nextButton && resetButton) {
            prevButton.disabled = false;
            nextButton.disabled = false;
            resetButton.disabled = false;

            if (this.currentScene < 0) {
                prevButton.disabled = true;
                resetButton.disabled = true;
            } else if (this.currentScene === 0) {
                prevButton.disabled = true;
            }

            if (this.currentScene >= this.scenes.length) {
                nextButton.disabled = true;
            }
        }
        if (typeof updateMobileButtonStates === "function") {
            updateMobileButtonStates();
        }
    }

    updateStartMessage() {
        let startMessage = document.getElementById("startMessage");

        if (!startMessage) {
            startMessage = document.createElement("div");
            startMessage.id = "startMessage";
            startMessage.className = "start-message";
            startMessage.textContent = "Click to start the animation";
            document.body.appendChild(startMessage);
        }

        if (this.currentScene === -1 && this.clickToStartShown === false) {
            startMessage.classList.add("active");
        } else {
            startMessage.classList.remove("active");
        }
    }

    start() {
        this.currentScene = 0;
        this.showScene(0);
        this.updateDebugInfo();
    }

    async showScene(index, force = false) {
        if (index >= this.scenes.length) {
            this.hideDialog();
            return;
        }

        this.sceneVersion++;
        const currentVersion = this.sceneVersion;

        const scene = this.scenes[index];
        const previousScene = index > 0 ? this.scenes[index - 1] : null;

        if (scene.sound) {
            if (scene.soundDelay > 0) {
                setTimeout(() => {
                    if (this.sceneVersion !== currentVersion) return;
                    this.playSound(scene.sound, scene.soundVolume, scene.soundBlobUrl);
                }, scene.soundDelay);
            } else {
                this.playSound(scene.sound, scene.soundVolume, scene.soundBlobUrl);
            }
        }

        if (scene.shake) {
            if (scene.shakeDelay > 0) {
                setTimeout(() => {
                    if (this.sceneVersion !== currentVersion) return;
                    this.triggerShake(scene.shakeIntensity, scene.shakeDuration);
                }, scene.shakeDelay);
            } else {
                this.triggerShake(scene.shakeIntensity, scene.shakeDuration);
            }
        }

        this.handleBustTransitions(scene, previousScene);

        // IMAGE TIMELINE
        if (previousScene) {
            // Check for crossfade condition (both fade times are negative)
            const shouldCrossfade = previousScene.imageFadeOutTime < 0 && scene.imageFadeInTime < 0;

            if (shouldCrossfade && scene.image !== null && previousScene.image !== null) {
                // Calculate when to start crossfade
                let crossfadeDelay = (previousScene.imageDelayOut || 0) + (scene.imageDelayIn || 0);

                // Use absolute values of negative fade times
                const fadeOutDuration = Math.abs(previousScene.imageFadeOutTime);
                const fadeInDuration = Math.abs(scene.imageFadeInTime);

                setTimeout(() => {
                    if (this.sceneVersion !== currentVersion) return;
                    this.crossfadeImages(previousScene.image, scene.image, fadeOutDuration, fadeInDuration);
                }, crossfadeDelay);
            } else {
                // Normal fade timeline
                let imageOutDelay = previousScene.imageDelayOut || 0;
                let imageFadeOutTime = previousScene.imageFadeOutTime || 0;

                // First, handle the fade out of previous image
                setTimeout(() => {
                    if (this.sceneVersion !== currentVersion) return;
                    if (
                        previousScene.image !== null &&
                        !(imageFadeOutTime === 0 && scene.imageFadeInTime === 0 && scene.image === previousScene.image)
                    ) {
                        this.hideAllImages(imageFadeOutTime);
                    }
                }, imageOutDelay);

                // Then, handle the fade in of new image
                let totalImageDelay = imageOutDelay + imageFadeOutTime + (scene.imageDelayIn || 0);

                setTimeout(() => {
                    if (this.sceneVersion !== currentVersion) return;
                    if (scene.image !== null) {
                        // Check if instant transition
                        if (
                            imageFadeOutTime === 0 &&
                            scene.imageFadeInTime === 0 &&
                            scene.image === previousScene.image
                        ) {
                            // Same image with instant transition
                            if (force === true && scene.image !== null && scene.image !== "") {
                                this.showImageInstant(scene.image, scene.imageBlobUrl);
                            }
                        } else if (imageFadeOutTime === 0 && scene.imageFadeInTime === 0) {
                            this.showImageInstant(scene.image, scene.imageBlobUrl);
                        } else {
                            this.showImage(scene.image, scene.imageFadeInTime, 0, scene.imageBlobUrl); // fadeOutTime handled above
                        }
                    } else {
                        // When scene.image is null, ensure any remaining images are hidden
                        this.currentBackgroundImage = null;
                        // Make sure all images are properly faded out
                        const remainingImages = document.querySelectorAll(".background-image.active");
                        if (remainingImages.length > 0) {
                            // If there are still active images, hide them now (they should already be fading)
                            this.hideAllImages(0);
                        }
                    }
                }, totalImageDelay);
            }
        } else {
            // Scene 0: just use current scene's delays
            setTimeout(() => {
                if (this.sceneVersion !== currentVersion) return;
                if (scene.image !== null) {
                    this.showImage(scene.image, scene.imageFadeInTime, 0, scene.imageBlobUrl);
                } else {
                    this.hideAllImages(0);
                    this.currentBackgroundImage = null;
                }
            }, scene.imageDelayIn || 0);
        }

        // DIALOG TIMELINE
        if (previousScene) {
            // Scene > 0: wait for previous scene's out delays/fades first
            let dialogOutDelay = previousScene.dialogDelayOut || 0;
            let dialogFadeOutTime = previousScene.dialogFadeOutTime || 0;

            // First, handle the fade out of previous dialog
            setTimeout(() => {
                if (this.sceneVersion !== currentVersion) return;
                if (dialogFadeOutTime > 0) {
                    this.fadeOutDialog(dialogFadeOutTime);
                } else {
                    this.hideDialog();
                }
            }, dialogOutDelay);

            // Then, handle the fade in of new dialog
            let totalDialogDelay = dialogOutDelay + dialogFadeOutTime + (scene.dialogDelayIn || 0);

            setTimeout(() => {
                if (this.sceneVersion !== currentVersion) return;
                if (
                    (scene.line1 !== null && scene.line1.trim() !== "") ||
                    (scene.line2 !== null && scene.line2.trim() !== "")
                ) {
                    // Check if instant transition
                    if (dialogFadeOutTime === 0 && scene.dialogFadeInTime === 0) {
                        this.showDialogInstant(scene.speaker, scene.line1, scene.line2, scene.censorSpeaker);
                    } else {
                        this.showDialog(scene.speaker, scene.line1, scene.line2, false, scene.censorSpeaker);
                        if (scene.dialogFadeInTime > 0) {
                            this.fadeInDialog(scene.dialogFadeInTime);
                        } else {
                            const dialogContainer = document.getElementById("dialogContainer");
                            dialogContainer.classList.add("active");
                        }
                    }
                }
            }, totalDialogDelay);
        } else {
            // Scene 0: just use current scene's delays
            setTimeout(() => {
                if (this.sceneVersion !== currentVersion) return;
                if (
                    (scene.line1 !== null && scene.line1.trim() !== "") ||
                    (scene.line2 !== null && scene.line2.trim() !== "")
                ) {
                    this.showDialog(scene.speaker, scene.line1, scene.line2, false, scene.censorSpeaker);
                    if (scene.dialogFadeInTime > 0) {
                        this.fadeInDialog(scene.dialogFadeInTime);
                    } else {
                        const dialogContainer = document.getElementById("dialogContainer");
                        dialogContainer.classList.add("active");
                    }
                } else {
                    this.hideDialog();
                }
            }, scene.dialogDelayIn || 0);
        }

        this.updateDebugInfo();
    }

    triggerShake(intensity = 1, duration = 500) {
        const gameContainer = document.querySelector(".game-container");

        const styleId = "shake-style-" + Date.now();
        const style = document.createElement("style");
        style.id = styleId;

        const baseShake = 10 * intensity;
        const halfShake = 5 * intensity;
        const smallShake = 2 * intensity;

        style.textContent = `
        @keyframes shake-${styleId} {
            0%, 100% { transform: translate(0, 0); }
            10% { transform: translate(-${baseShake}px, -${halfShake}px); }
            20% { transform: translate(${baseShake}px, -${halfShake}px); }
            30% { transform: translate(-${baseShake}px, ${halfShake}px); }
            40% { transform: translate(${baseShake}px, ${halfShake}px); }
            50% { transform: translate(-${halfShake}px, -${baseShake}px); }
            60% { transform: translate(${halfShake}px, -${baseShake}px); }
            70% { transform: translate(-${halfShake}px, ${baseShake}px); }
            80% { transform: translate(${halfShake}px, ${baseShake}px); }
            90% { transform: translate(-${smallShake}px, -${smallShake}px); }
        }

        .game-container.shake-${styleId} {
            animation: shake-${styleId} ${duration}ms ease-in-out;
        }
        `;

        document.head.appendChild(style);
        gameContainer.classList.add(`shake-${styleId}`);

        setTimeout(() => {
            gameContainer.classList.remove(`shake-${styleId}`);
            style.remove();
        }, duration);
    }

    handleBustTransitions(scene, previousScene) {
        if (previousScene && previousScene.bustLeft !== scene.bustLeft) {
            if (previousScene.bustLeft) {
                this.hideBust("left", previousScene.bustFade || 200);
            }
            if (scene.bustLeft) {
                setTimeout(
                    () => {
                        this.showBust("left", scene.bustLeft, scene.bustFade || 200, scene.bustLeftBlobUrl);
                    },
                    previousScene && previousScene.bustLeft ? previousScene.bustFade || 200 : 0,
                );
            }
        } else if (!previousScene && scene.bustLeft) {
            this.showBust("left", scene.bustLeft, scene.bustFade || 200, scene.bustLeftBlobUrl);
        }

        if (previousScene && previousScene.bustRight !== scene.bustRight) {
            if (previousScene.bustRight) {
                this.hideBust("right", previousScene.bustFade || 200);
            }
            if (scene.bustRight) {
                setTimeout(
                    () => {
                        this.showBust("right", scene.bustRight, scene.bustFade || 200, scene.bustRightBlobUrl);
                    },
                    previousScene && previousScene.bustRight ? previousScene.bustFade || 200 : 0,
                );
            }
        } else if (!previousScene && scene.bustRight) {
            this.showBust("right", scene.bustRight, scene.bustFade || 200, scene.bustRightBlobUrl);
        }
    }

    showBust(side, imageSrc, fadeTime = 0, blobUrl = null) {
        if (side === "left") {
            this.currentBustLeft = imageSrc;
        } else {
            this.currentBustRight = imageSrc;
        }

        const existingBust = document.querySelector(`.bust-image.${side}`);
        if (existingBust) {
            existingBust.remove();
        }

        const img = document.createElement("img");

        // Use blob URL if available
        if (blobUrl) {
            img.src = blobUrl;
        } else if (imageSrc.startsWith("http://") || imageSrc.startsWith("https://")) {
            img.src = imageSrc;
        } else {
            img.src = "img/" + imageSrc;
        }

        img.className = `bust-image ${side}`;

        if (fadeTime > 0) {
            img.style.transition = `opacity ${fadeTime}ms ease-in-out`;
            img.style.opacity = "0";
        } else {
            img.style.transition = "none";
            img.style.opacity = "1";
        }

        document.querySelector(".game-container").appendChild(img);

        img.onload = () => {
            if (fadeTime > 0) {
                img.offsetHeight;
                requestAnimationFrame(() => {
                    img.style.opacity = "1";
                });
            }
        };

        img.onerror = () => {
            //console.warn(`Failed to load bust image: ${imageSrc}`);
        };

        if (img.complete) {
            img.onload();
        }
    }

    hideBust(side, fadeTime = 0) {
        const bust = document.querySelector(`.bust-image.${side}`);
        if (!bust) return;

        if (side === "left") {
            this.currentBustLeft = null;
        } else {
            this.currentBustRight = null;
        }

        if (fadeTime > 0) {
            bust.style.transition = `opacity ${fadeTime}ms ease-in-out`;
            bust.style.opacity = "0";
            setTimeout(() => {
                bust.remove();
            }, fadeTime);
        } else {
            bust.remove();
        }
    }

    showImage(imageSrc, fadeInTime = 200, fadeOutTime = 200, blobUrl = null) {
        this.currentBackgroundImage = imageSrc;

        if (fadeOutTime > 0) {
            const existingImages = document.querySelectorAll(".background-image.active");
            existingImages.forEach((img) => {
                img.style.transition = `opacity ${fadeOutTime}ms ease-in-out`;
                img.classList.remove("active");
            });
        }

        const img = document.createElement("img");

        if (imageSrc === "") {
            img.src = "";
            return;
        }

        // Use blob URL if available
        if (blobUrl) {
            img.src = blobUrl;
        } else if (imageSrc.startsWith("http://") || imageSrc.startsWith("https://")) {
            img.src = imageSrc;
        } else {
            img.src = "img/" + imageSrc;
        }

        img.className = "background-image";

        if (fadeInTime > 0) {
            img.style.transition = `opacity ${fadeInTime}ms ease-in-out`;
        } else {
            img.style.transition = "none";
        }

        document.querySelector(".game-container").appendChild(img);
        img.offsetHeight;

        img.onload = () => {
            requestAnimationFrame(() => {
                img.classList.add("active");
            });
        };

        img.onerror = () => {
            //console.warn(`Failed to load image: ${imageSrc}`);
        };

        if (img.complete) {
            img.onload();
        }

        if (fadeOutTime > 0) {
            const cleanupTime = Math.max(fadeInTime, fadeOutTime) + 100;
            setTimeout(() => {
                const existingImages = document.querySelectorAll(".background-image:not(.active)");
                existingImages.forEach((img) => img.remove());
            }, cleanupTime);
        }
    }

    crossfadeImages(fromImageSrc, toImageSrc, fadeOutDuration = 1000, fadeInDuration = 1000) {
        this.currentBackgroundImage = toImageSrc;

        const existingImages = document.querySelectorAll(".background-image.active");

        const newImg = document.createElement("img");

        if (toImageSrc.startsWith("http://") || toImageSrc.startsWith("https://")) {
            newImg.src = toImageSrc;
        } else {
            newImg.src = "img/" + toImageSrc;
        }

        newImg.className = "background-image";
        newImg.style.transition = `opacity ${fadeInDuration}ms ease-in-out`;
        newImg.style.opacity = "0";

        document.querySelector(".game-container").appendChild(newImg);

        newImg.offsetHeight;

        const startCrossfade = () => {
            requestAnimationFrame(() => {
                existingImages.forEach((img) => {
                    img.style.transition = `opacity ${fadeOutDuration}ms ease-in-out`;
                    img.classList.remove("active");
                });

                newImg.classList.add("active");
                newImg.style.opacity = "1";
            });

            const maxDuration = Math.max(fadeOutDuration, fadeInDuration);
            setTimeout(() => {
                existingImages.forEach((img) => img.remove());
            }, maxDuration + 100);
        };

        newImg.onload = startCrossfade;

        newImg.onerror = () => {
            //console.warn(`Failed to load image: ${toImageSrc}`);
            existingImages.forEach((img) => {
                img.style.transition = `opacity ${fadeOutDuration}ms ease-in-out`;
                img.classList.remove("active");
            });
        };

        if (newImg.complete) {
            setTimeout(startCrossfade, 10);
        }
    }

    showImageInstant(imageSrc, blobUrl = null) {
        this.currentBackgroundImage = imageSrc;

        const existingImages = document.querySelectorAll(".background-image.active");
        existingImages.forEach((img) => {
            img.style.transition = "none";
            img.classList.remove("active");
        });

        const img = document.createElement("img");

        // Use blob URL if available
        if (blobUrl) {
            img.src = blobUrl;
        } else if (imageSrc.startsWith("http://") || imageSrc.startsWith("https://")) {
            img.src = imageSrc;
        } else {
            img.src = "img/" + imageSrc;
        }

        img.className = "background-image active";
        img.style.transition = "none";
        img.style.opacity = "1";

        img.onerror = () => {
            //console.warn(`Failed to load image: ${imageSrc}`);
        };

        document.querySelector(".game-container").appendChild(img);

        setTimeout(() => {
            existingImages.forEach((img) => img.remove());
        }, 10);
    }

    showDialogInstant(speaker, text, censorSpeaker) {
        const dialogContainer = document.getElementById("dialogContainer");

        this.showDialog(speaker, text, false, censorSpeaker);
        dialogContainer.style.transition = "none";
        dialogContainer.classList.add("active");

        setTimeout(() => {
            dialogContainer.style.transition = "";
        }, 10);
    }

    parseFormattedText(text) {
        const tempDiv = document.createElement("div");

        let formattedText = text
            .replace(/<b>/g, "<strong>")
            .replace(/<\/b>/g, "</strong>")
            .replace(/<i>/g, "<em>")
            .replace(/<\/i>/g, "</em>")
            .replace(/<u>/g, '<span style="text-decoration: underline;">')
            .replace(/<\/u>/g, "</span>");

        const glitchRegex = /<glitch([^>]*)>(.*?)<\/glitch>/g;
        let match;
        let glitchCounter = 0;

        while ((match = glitchRegex.exec(formattedText)) !== null) {
            const attributes = match[1];
            const glitchText = match[2];
            const glitchId = `glitch-${Date.now()}-${glitchCounter++}`;

            let glitchConfig = {};

            if (attributes) {
                const colorMatch = attributes.match(/color="([^"]+)"/);
                if (colorMatch) glitchConfig.realColor = colorMatch[1];

                const scrambledMatch = attributes.match(/scrambled="([^"]+)"/);
                if (scrambledMatch) glitchConfig.scrambledColor = scrambledMatch[1];

                const speedMatch = attributes.match(/speed="([^"]+)"/);
                if (speedMatch) glitchConfig.changeSpeed = parseInt(speedMatch[1]);
            }

            formattedText = formattedText.replace(
                match[0],
                `<span class="glitch-container" data-glitch-id="${glitchId}" data-glitch-config='${JSON.stringify(glitchConfig)}'>${glitchText}</span>`,
            );
        }

        tempDiv.innerHTML = formattedText;
        return tempDiv;
    }

    applyGlitchEffects(container) {
        const glitchContainers = container.querySelectorAll(".glitch-container");

        glitchContainers.forEach((glitchContainer) => {
            const config = JSON.parse(glitchContainer.dataset.glitchConfig);
            const glitchEffect = new GlitchTextEffect(glitchContainer, this.glitchConfig);
            this.glitchEffects.push(glitchEffect);
        });
    }

    cleanupGlitchEffects() {
        this.glitchEffects.forEach((effect) => effect.destroy());
        this.glitchEffects = [];

        if (this.speakerGlitch) {
            this.speakerGlitch.destroy();
            this.speakerGlitch = null;
        }
    }

    showDialog(speaker, line1, line2, showContainer = true, censorSpeaker = true, demonSpeaker = false) {
        const dialogContainer = document.getElementById("dialogContainer");
        const speakerLine = document.getElementById("speakerLine");
        const textLine1 = document.getElementById("textLine1");
        const textLine2 = document.getElementById("textLine2");

        this.cleanupGlitchEffects();

        speakerLine.className = "dialog-line speaker-line";
        textLine1.className = "dialog-line text-line";
        textLine2.className = "dialog-line text-line";
        speakerLine.innerHTML = "";
        textLine1.innerHTML = "";
        textLine2.innerHTML = "";

        const characterInfo = this.getCharacterFromSpeaker(speaker);
        if (speaker && characterInfo) {
            speakerLine.textContent = speaker;
            textLine1.classList.add(characterInfo.character.characterClassName);
            textLine2.classList.add(characterInfo.character.characterClassName);
            if (censorSpeaker) {
                this.speakerGlitch = new GlitchTextEffect(speakerLine, this.glitchConfig);
            }
        }

        let processedLine1 = line1 || "";
        let processedLine2 = line2 || "";

        if (demonSpeaker === true) {
            processedLine1 = dialogFramework.toEntitySpeech(processedLine1);
            processedLine2 = dialogFramework.toEntitySpeech(processedLine2);
        }

        if (speaker && characterInfo) {
            if (processedLine1.trim() !== "" && processedLine2.trim() !== "") {
                processedLine1 = '"' + processedLine1;
                processedLine2 = processedLine2 + '"';
            } else if (processedLine1.trim() !== "" && processedLine2.trim() === "") {
                processedLine1 = '"' + processedLine1 + '"';
            } else if (processedLine1.trim() === "" && processedLine2.trim() !== "") {
                processedLine2 = '"' + processedLine2 + '"';
            }
        }

        if (showContainer) {
            dialogContainer.classList.add("active");
        }

        this.typeDialogLines(textLine1, textLine2, processedLine1, processedLine2);
    }

    async typeDialogLines(textLine1Element, textLine2Element, line1, line2) {
        this.isTyping = true;

        textLine1Element.innerHTML = "";
        textLine2Element.innerHTML = "";

        if (line1) {
            const hasFormattingLine1 = line1.includes("<");

            if (hasFormattingLine1) {
                const parsedContainer1 = this.parseFormattedText(line1);
                await this.typeTextWithFormattingSequential(textLine1Element, parsedContainer1);
            } else {
                await this.typeText(textLine1Element, line1);
            }
        }

        if (line2 && this.isTyping) {
            const hasFormattingLine2 = line2.includes("<");

            if (hasFormattingLine2) {
                const parsedContainer2 = this.parseFormattedText(line2);
                await this.typeTextWithFormattingSequential(textLine2Element, parsedContainer2);
            } else {
                await this.typeText(textLine2Element, line2);
            }
        }

        this.isTyping = false;
    }

    showDialogInstant(speaker, line1, line2, censorSpeaker) {
        const dialogContainer = document.getElementById("dialogContainer");

        this.showDialog(speaker, line1, line2, false, censorSpeaker);
        dialogContainer.style.transition = "none";
        dialogContainer.classList.add("active");

        setTimeout(() => {
            dialogContainer.style.transition = "";
        }, 10);
    }

    createControlsToggle() {
        if (!document.getElementById("controlsToggle")) {
            const toggle = document.createElement("button");
            toggle.id = "controlsToggle";
            toggle.className = "controls-toggle";
            toggle.textContent = "Controls";

            toggle.addEventListener("click", () => {
                this.toggleMobileControls();
            });

            document.body.appendChild(toggle);
        }
    }

    toggleMobileControls() {
        const controls = document.getElementById("controlsContainer");
        const toggle = document.getElementById("controlsToggle");
        const debugArea = document.getElementById("debugArea");

        if (controls.classList.contains("visible")) {
            controls.classList.remove("visible");
            controls.classList.add("hidden");
            toggle.classList.remove("active");
            if (debugArea) {
                debugArea.classList.remove("fade-out");
            }
        } else {
            controls.classList.remove("hidden");
            controls.classList.add("visible");
            toggle.classList.add("active");
            if (debugArea) {
                debugArea.classList.add("fade-out");
            }
        }
    }

    checkScreenSize() {
        const isMobile = window.innerWidth <= 768 || window.innerHeight <= 600;

        if (isMobile) {
            if (typeof window.createMobileControls === "function") {
                window.createMobileControls();
            }
        } else {
            const existing = document.getElementById("mobileControls");
            if (existing) existing.remove();
        }

        if (typeof window.updateMobileControlsDebugVisibility === "function") {
            window.updateMobileControlsDebugVisibility();
        }
        if (typeof window.updateMobileButtonStates === "function") {
            window.updateMobileButtonStates();
        }
        if (typeof window.updateMobileDebugInfo === "function") {
            window.updateMobileDebugInfo();
        }
    }

    hideAllImages(fadeOutTime = 200) {
        const existingImages = document.querySelectorAll(".background-image.active");

        existingImages.forEach((img) => {
            if (fadeOutTime > 0) {
                img.style.transition = `opacity ${fadeOutTime}ms ease-in-out`;
                img.offsetHeight;
                img.classList.remove("active");
                img.style.opacity = "0";
            } else {
                img.style.transition = "none";
                img.style.opacity = "0";
                img.classList.remove("active");
            }
        });

        const cleanupTime = fadeOutTime + 100;
        setTimeout(() => {
            const imagesToRemove = document.querySelectorAll(".background-image:not(.active)");
            imagesToRemove.forEach((img) => img.remove());
        }, cleanupTime);
    }

    async fadeOutDialog(fadeOutTime = 200) {
        const dialogContainer = document.getElementById("dialogContainer");
        if (dialogContainer.classList.contains("active")) {
            if (fadeOutTime > 0) {
                dialogContainer.classList.remove("active");
                await this.wait(fadeOutTime);
            } else {
                dialogContainer.style.opacity = "0";
                dialogContainer.classList.remove("active");
                setTimeout(() => {
                    dialogContainer.style.opacity = "";
                }, 10);
            }
        }
    }

    async fadeInDialog(fadeInTime = 200) {
        const dialogContainer = document.getElementById("dialogContainer");
        if (fadeInTime > 0) {
            dialogContainer.classList.add("active");
            await this.wait(fadeInTime);
        } else {
            dialogContainer.style.opacity = "1";
            dialogContainer.classList.add("active");
            setTimeout(() => {
                dialogContainer.style.opacity = "";
            }, 10);
        }
    }

    wrapTextToLines(text, maxLines) {
        const words = text.split(" ");
        const lines = [];
        let currentLine = "";

        const maxCharsPerLine = 58;

        for (const word of words) {
            const testLine = currentLine + (currentLine ? " " : "") + word;

            if (testLine.length <= maxCharsPerLine) {
                currentLine = testLine;
            } else {
                if (currentLine) {
                    lines.push(currentLine);
                    currentLine = word;
                } else {
                    lines.push(word.substring(0, maxCharsPerLine));
                    currentLine = word.substring(maxCharsPerLine);
                }

                if (lines.length >= maxLines) {
                    break;
                }
            }
        }

        if (currentLine && lines.length < maxLines) {
            lines.push(currentLine);
        }

        while (lines.length < maxLines) {
            lines.push("");
        }

        return lines.slice(0, maxLines);
    }

    async typeTextLines(elements, textLines) {
        this.isTyping = true;
        this.currentText = textLines.join(" ");

        for (let lineIndex = 0; lineIndex < elements.length; lineIndex++) {
            const element = elements[lineIndex];
            const text = textLines[lineIndex] || "";

            if (!text) continue;

            element.textContent = "";

            for (let i = 0; i < text.length; i++) {
                if (!this.isTyping) break;

                element.textContent += text[i];
                await this.wait(this.typeSpeed);
            }

            if (!this.isTyping) break;
        }

        this.isTyping = false;
    }

    async typeTextWithFormatting(element, parsedContainer) {
        const plainText = parsedContainer.textContent || parsedContainer.innerText;

        if (!plainText) {
            element.textContent = "";
            return;
        }

        this.isTyping = true;
        element.textContent = "";

        for (let i = 0; i < plainText.length; i++) {
            if (!this.isTyping) break;

            element.textContent += plainText[i];
            await this.wait(this.typeSpeed);
        }

        if (!this.isTyping) {
            element.innerHTML = parsedContainer.innerHTML;

            const glitchContainers = element.querySelectorAll(".glitch-container");
            glitchContainers.forEach((container) => {
                const config = JSON.parse(container.dataset.glitchConfig);
                const glitchEffect = new GlitchTextEffect(container, this.glitchConfig);
                this.glitchEffects.push(glitchEffect);
            });
        }

        this.isTyping = false;
    }

    applyFormattingToLines(elements, textLines, parsedContainer) {
        const fullHTML = parsedContainer.innerHTML;
        const plainText = parsedContainer.textContent || parsedContainer.innerText;

        let charOffset = 0;

        for (let lineIndex = 0; lineIndex < elements.length && lineIndex < textLines.length; lineIndex++) {
            const element = elements[lineIndex];
            const lineText = textLines[lineIndex];

            if (!lineText) continue;

            const lineHTML = this.extractFormattedLineHTML(
                fullHTML,
                plainText,
                charOffset,
                charOffset + lineText.length,
            );

            if (lineHTML && lineHTML !== lineText) {
                element.innerHTML = lineHTML;

                const glitchContainers = element.querySelectorAll(".glitch-container");
                glitchContainers.forEach((container) => {
                    const config = JSON.parse(container.dataset.glitchConfig);
                    const glitchEffect = new GlitchTextEffect(container, this.glitchConfig);
                    this.glitchEffects.push(glitchEffect);
                });
            }

            charOffset += lineText.length;
        }
    }

    extractFormattedLineHTML(fullHTML, fullPlainText, startIndex, endIndex) {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = fullHTML;

        const targetText = fullPlainText.substring(startIndex, endIndex);

        if (!fullHTML.includes("<")) {
            return targetText;
        }

        let result = "";
        let currentIndex = 0;
        let inRange = false;

        const walker = document.createTreeWalker(tempDiv, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, null, false);

        let node;
        let openTags = [];

        while ((node = walker.nextNode())) {
            if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.classList && node.classList.contains("glitch-container")) {
                    const glitchText = node.textContent;
                    const glitchStart = currentIndex;
                    const glitchEnd = currentIndex + glitchText.length;

                    if (glitchEnd > startIndex && glitchStart < endIndex) {
                        for (let i = openTags.length - 1; i >= 0; i--) {
                            result += `</${openTags[i]}>`;
                        }

                        result += node.outerHTML;

                        for (const tag of openTags) {
                            if (tag === "span") {
                                result += `<span style="text-decoration: underline;">`;
                            } else {
                                result += `<${tag}>`;
                            }
                        }
                    }

                    currentIndex += glitchText.length;
                } else {
                    const tagName = node.tagName.toLowerCase();

                    if (currentIndex < endIndex && currentIndex + (node.textContent || "").length > startIndex) {
                        if (tagName === "span" && node.style.textDecoration === "underline") {
                            result += '<span style="text-decoration: underline;">';
                        } else {
                            result += `<${tagName}>`;
                        }
                        openTags.push(tagName);
                    }
                }
            } else if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent;

                for (let i = 0; i < text.length; i++) {
                    if (currentIndex >= startIndex && currentIndex < endIndex) {
                        result += text[i];
                    }
                    currentIndex++;
                }
            }
        }

        for (let i = openTags.length - 1; i >= 0; i--) {
            result += `</${openTags[i]}>`;
        }

        return result || targetText;
    }

    async typeText(element, text) {
        if (!text) {
            element.textContent = "";
            return;
        }

        element.textContent = "";

        for (let i = 0; i < text.length; i++) {
            if (!this.isTyping) break;

            element.textContent += text[i];
            await this.wait(this.typeSpeed);
        }
    }

    async typeTextWithFormattingSequential(element, parsedContainer) {
        const plainText = parsedContainer.textContent || parsedContainer.innerText;

        if (!plainText) {
            element.textContent = "";
            return;
        }

        element.textContent = "";

        for (let i = 0; i < plainText.length; i++) {
            if (!this.isTyping) break;

            element.textContent += plainText[i];
            await this.wait(this.typeSpeed);
        }

        if (this.isTyping) {
            element.innerHTML = parsedContainer.innerHTML;

            const glitchContainers = element.querySelectorAll(".glitch-container");
            glitchContainers.forEach((container) => {
                const config = JSON.parse(container.dataset.glitchConfig);
                const glitchEffect = new GlitchTextEffect(container, this.glitchConfig);
                this.glitchEffects.push(glitchEffect);
            });
        }
    }

    skipText() {
        if (this.isTyping) {
            this.isTyping = false;

            const textLine1 = document.getElementById("textLine1");
            const textLine2 = document.getElementById("textLine2");

            if (this.currentScene < this.scenes.length) {
                const scene = this.scenes[this.currentScene];

                // Process quotes
                let processedLine1 = scene.line1 || "";
                let processedLine2 = scene.line2 || "";

                if (scene.speaker && this.characters[scene.speaker]) {
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
                    const parsed1 = this.parseFormattedText(processedLine1);
                    textLine1.innerHTML = parsed1.innerHTML;
                    this.applyGlitchEffects(textLine1);
                } else {
                    textLine1.textContent = processedLine1;
                }

                if (processedLine2.includes("<")) {
                    const parsed2 = this.parseFormattedText(processedLine2);
                    textLine2.innerHTML = parsed2.innerHTML;
                    this.applyGlitchEffects(textLine2);
                } else {
                    textLine2.textContent = processedLine2;
                }
            }
        }
    }

    next() {
        if (this.isTyping) {
            this.skipText();
            return;
        }

        const wasNotStarted = this.currentScene === -1;

        this.currentScene++;
        if (this.currentScene < this.scenes.length) {
            this.showScene(this.currentScene);

            if (wasNotStarted && this.currentScene === 0) {
                this.playBackgroundMusic();
            }
        } else {
            this.hideDialog();
        }
        this.updateDebugInfo();
    }

    previous() {
        if (this.currentScene < 0) {
            return;
        }
        let currentIndex = this.currentScene;
        currentIndex--;
        if (currentIndex < 0) {
            currentIndex = 0;
        }
        this.reset();
        this.jumpToScene(currentIndex);
    }

    hideDialog() {
        const dialogContainer = document.getElementById("dialogContainer");
        dialogContainer.classList.remove("active");
    }

    reset() {
        this.currentScene = -1;
        this.isTyping = false;
        this.currentBackgroundImage = null;
        this.currentBustLeft = null;
        this.currentBustRight = null;
        this.cleanupGlitchEffects();
        this.hideDialog();
        this.stopBackgroundMusic();

        const images = document.querySelectorAll(".background-image");
        images.forEach((img) => img.remove());

        const busts = document.querySelectorAll(".bust-image");
        busts.forEach((bust) => bust.remove());

        this.updateDebugInfo();
    }

    wait(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    updateDebugInfo() {
        const debugInfo = document.getElementById("debugInfo");
        if (debugInfo) {
            if (this.currentScene >= this.scenes.length) {
                debugInfo.textContent = `End`;
                debugInfo.style.cursor = "default";
                debugInfo.onclick = null;
                if (!debugInfo.classList.contains("disabled")) {
                    debugInfo.classList.add("disabled");
                }
            } else {
                debugInfo.textContent = `${this.currentScene + 1} / ${this.scenes.length}`;
                debugInfo.style.cursor = "pointer";
                debugInfo.onclick = (e) => {
                    e.stopPropagation(); // Prevent click-through
                    this.showSceneJumpInput();
                };
                if (debugInfo.classList.contains("disabled")) {
                    debugInfo.classList.remove("disabled");
                }
            }
        }

        if (typeof updateMobileDebugInfo === "function") {
            updateMobileDebugInfo();
        }

        this.updateButtonStates();
        this.updateStartMessage();
    }

    showSceneJumpInput() {
        const debugInfo = document.getElementById("debugInfo");
        if (!debugInfo || this.currentScene >= this.scenes.length) return;

        const currentSceneNum = this.currentScene + 1;

        let selectHTML = '<select class="scene-jump-select">';

        selectHTML += `<option value="-1" ${this.currentScene === -1 ? "selected" : ""}>Scene 0 (Reset)</option>`;

        for (let i = 0; i < this.scenes.length; i++) {
            selectHTML += `<option value="${i}" ${i === this.currentScene ? "selected" : ""}>Scene ${i + 1}</option>`;
        }

        selectHTML += "</select>";

        const originalContent = debugInfo.innerHTML;
        debugInfo.innerHTML = selectHTML;

        const select = debugInfo.querySelector(".scene-jump-select");

        const confirmJump = () => {
            const targetScene = parseInt(select.value);
            if (!isNaN(targetScene) && targetScene >= -1 && targetScene < this.scenes.length) {
                if (targetScene === -1) {
                    this.reset();
                } else {
                    this.reset();
                    this.jumpToScene(targetScene);
                }
            }
            debugInfo.innerHTML = originalContent;
            this.updateDebugInfo();
        };

        select.addEventListener("change", confirmJump);

        select.addEventListener("blur", () => {
            setTimeout(() => {
                debugInfo.innerHTML = originalContent;
                this.updateDebugInfo();
            }, 200);
        });

        select.addEventListener("keydown", (e) => {
            e.stopPropagation();
            if (e.key === "Enter") {
                confirmJump();
            } else if (e.key === "Escape") {
                debugInfo.innerHTML = originalContent;
                this.updateDebugInfo();
            }
        });

        select.focus();
        select.showPicker();
    }

    setTypeSpeed(speed) {
        this.typeSpeed = speed;
        return this;
    }

    getCurrentScene() {
        return this.currentScene;
    }

    jumpToScene(index) {
        if (index >= 0 && index < this.scenes.length) {
            this.currentScene = index;
            this.showScene(index, true);
            this.updateDebugInfo();
        }
        return this;
    }
}

const dialogFramework = new DialogFramework();
if (dialogFramework.deferredInit) {
    setTimeout(() => {
        dialogFramework.deferredInit();
        delete dialogFramework.deferredInit;
    }, 0);
}
