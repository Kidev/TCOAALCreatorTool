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

        this.isAutoPlaying = false;
        this.autoPlayTimeout = null;
        this.autoPlaySettings = {
            delayBetweenScenes: 1000,
            typeSpeed: 20,
        };
        this.typingTimeout = null;
        this.typingCompletedForScene = -1;
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
        this.isMuted = false;

        this.gifCache = new Map(); // Map<url, {status: 'loading'|'ready'|'error', frames: [...], promise: Promise}>

        this.choicesSoundMove = {
            path: "gallery:Sound effects/se_53.ogg",
            volume: 0.9,
            pitch: 0.9,
            speed: 1.0,
        };
        this.choicesSoundClick = {
            path: "gallery:Sound effects/se_53.ogg",
            volume: 0.9,
            pitch: 1.0,
            speed: 1.0,
        };

        this.initializeEventListeners();
        this.initializeAudio();
        this.updateDebugInfo();

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

    generateUUID() {
        if (typeof crypto !== "undefined" && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        // Fallback UUID v4 generator for browsers/contexts without crypto.randomUUID
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            const r = (Math.random() * 16) | 0;
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
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

    toEntitySpeechPreserveTags(text) {
        if (!text.includes("<")) {
            return this.toEntitySpeech(text);
        }

        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = text;

        const processTextNodes = (node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                node.textContent = this.toEntitySpeech(node.textContent);
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                Array.from(node.childNodes).forEach((child) => processTextNodes(child));
            }
        };

        processTextNodes(tempDiv);
        return tempDiv.innerHTML;
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

        await this.preloadGifs();

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
            this.stopBackgroundMusic();

            let audioSrc;

            if (this.config.backgroundMusicBlobUrl) {
                audioSrc = this.config.backgroundMusicBlobUrl;
            } else if (this.config.backgroundMusic.startsWith("gallery:")) {
                const match = this.config.backgroundMusic.match(/^gallery:([^/]+)\/(.+)$/);
                if (match && window.gameImporterAssets) {
                    const [, category, name] = match;
                    const asset = window.gameImporterAssets.audio[category]?.[name];
                    if (asset) {
                        audioSrc = asset.url;
                    } else {
                        audioSrc = "sounds/" + this.config.backgroundMusic;
                    }
                } else {
                    audioSrc = "sounds/" + this.config.backgroundMusic;
                }
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
            this.backgroundMusicAudio.volume = this.isMuted ? 0 : this.config.backgroundMusicVolume || 0.5;

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

    async playSceneBackgroundMusic(musicPath, volume = 1.0, blobUrl = null, pitch = 1.0, speed = 1.0) {
        if (!musicPath) return;

        try {
            this.stopBackgroundMusic();

            let audioSrc;

            if (blobUrl) {
                audioSrc = blobUrl;
            } else if (musicPath.startsWith("gallery:")) {
                const match = musicPath.match(/^gallery:([^/]+)\/(.+)$/);
                if (match && window.gameImporterAssets) {
                    const [, category, name] = match;
                    const asset = window.gameImporterAssets.audio[category]?.[name];
                    if (asset) {
                        audioSrc = asset.url;
                    } else {
                        audioSrc = "sounds/" + musicPath;
                    }
                } else {
                    audioSrc = "sounds/" + musicPath;
                }
            } else if (musicPath.startsWith("http://") || musicPath.startsWith("https://")) {
                audioSrc = musicPath;
            } else {
                audioSrc = "sounds/" + musicPath;
            }

            this.backgroundMusicAudio = new Audio(audioSrc);
            this.backgroundMusicAudio.loop = true;
            this.backgroundMusicAudio.volume = this.isMuted ? 0 : Math.max(0, Math.min(1, volume));

            this.backgroundMusicAudio.playbackRate = speed * pitch;

            if (this.backgroundMusicAudio.preservesPitch !== undefined) {
                this.backgroundMusicAudio.preservesPitch = false;
            }
            if (this.backgroundMusicAudio.mozPreservesPitch !== undefined) {
                this.backgroundMusicAudio.mozPreservesPitch = false;
            }
            if (this.backgroundMusicAudio.webkitPreservesPitch !== undefined) {
                this.backgroundMusicAudio.webkitPreservesPitch = false;
            }

            const playPromise = this.backgroundMusicAudio.play();
            if (playPromise !== undefined) {
                playPromise.catch((error) => {
                    //console.warn(`Failed to play scene background music: ${musicPath}`, error);
                });
            }
        } catch (error) {
            //console.warn(`Error playing scene background music: ${musicPath}`, error);
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
            let audioSrc;

            if (soundPath.startsWith("gallery:")) {
                const match = soundPath.match(/^gallery:([^/]+)\/(.+)$/);
                if (match && window.gameImporterAssets) {
                    const [, category, name] = match;
                    const asset = window.gameImporterAssets.audio[category]?.[name];
                    if (asset) {
                        audioSrc = asset.url;
                    } else {
                        audioSrc = "sounds/" + soundPath;
                    }
                } else {
                    audioSrc = "sounds/" + soundPath;
                }
            } else if (soundPath.startsWith("http://") || soundPath.startsWith("https://")) {
                audioSrc = soundPath;
            } else {
                audioSrc = "sounds/" + soundPath;
            }

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

    async playSound(soundPath, volume = 1.0, soundBlobUrl = null, pitch = 1.0, speed = 1.0) {
        if (!soundPath) return;

        try {
            let audio = await this.loadSound(soundPath, soundBlobUrl);

            if (!audio) {
                //console.warn(`Could not load sound: ${soundPath}`);
                return;
            }

            const audioClone = audio.cloneNode();
            audioClone.volume = this.isMuted ? 0 : Math.max(0, Math.min(1, volume));

            audioClone.playbackRate = speed * pitch;

            if (audioClone.preservesPitch !== undefined) {
                audioClone.preservesPitch = false;
            }
            if (audioClone.mozPreservesPitch !== undefined) {
                audioClone.mozPreservesPitch = false;
            }
            if (audioClone.webkitPreservesPitch !== undefined) {
                audioClone.webkitPreservesPitch = false;
            }

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
            this.characters[key].uuid = `character-${this.generateUUID()}`;
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
        if (this.characters[speaker]) {
            return { name: speaker, character: this.characters[speaker] };
        }

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

    setCompositions(compositions) {}

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
    }

    addScene(options) {
        const scene = {
            image: options.image !== undefined ? options.image : DEFAULTS.scene.image,
            speaker: options.speaker !== undefined ? options.speaker : DEFAULTS.scene.speaker,
            line1: options.line1 !== undefined ? options.line1 : DEFAULTS.scene.line1,
            line2: options.line2 !== undefined ? options.line2 : DEFAULTS.scene.line2,

            dialogFadeInTime:
                options.dialogFadeInTime !== undefined ? options.dialogFadeInTime : DEFAULTS.scene.dialogFadeInTime,
            dialogFadeOutTime:
                options.dialogFadeOutTime !== undefined ? options.dialogFadeOutTime : DEFAULTS.scene.dialogFadeOutTime,
            imageFadeInTime:
                options.imageFadeInTime !== undefined ? options.imageFadeInTime : DEFAULTS.scene.imageFadeInTime,
            imageFadeOutTime:
                options.imageFadeOutTime !== undefined ? options.imageFadeOutTime : DEFAULTS.scene.imageFadeOutTime,

            dialogDelayIn: options.dialogDelayIn !== undefined ? options.dialogDelayIn : DEFAULTS.scene.dialogDelayIn,
            dialogDelayOut:
                options.dialogDelayOut !== undefined ? options.dialogDelayOut : DEFAULTS.scene.dialogDelayOut,
            imageDelayIn: options.imageDelayIn !== undefined ? options.imageDelayIn : DEFAULTS.scene.imageDelayIn,
            imageDelayOut: options.imageDelayOut !== undefined ? options.imageDelayOut : DEFAULTS.scene.imageDelayOut,

            sound: options.sound !== undefined ? options.sound : DEFAULTS.scene.sound,
            soundVolume: options.soundVolume !== undefined ? options.soundVolume : DEFAULTS.scene.soundVolume,
            soundDelay: options.soundDelay !== undefined ? options.soundDelay : DEFAULTS.scene.soundDelay,
            soundPitch: options.soundPitch !== undefined ? options.soundPitch : DEFAULTS.scene.soundPitch,
            soundSpeed: options.soundSpeed !== undefined ? options.soundSpeed : DEFAULTS.scene.soundSpeed,
            soundBlobUrl: options.soundBlobUrl || null,

            backgroundMusic:
                options.backgroundMusic !== undefined ? options.backgroundMusic : DEFAULTS.scene.backgroundMusic,
            backgroundMusicVolume:
                options.backgroundMusicVolume !== undefined
                    ? options.backgroundMusicVolume
                    : DEFAULTS.scene.backgroundMusicVolume,
            backgroundMusicPitch:
                options.backgroundMusicPitch !== undefined
                    ? options.backgroundMusicPitch
                    : DEFAULTS.scene.backgroundMusicPitch,
            backgroundMusicSpeed:
                options.backgroundMusicSpeed !== undefined
                    ? options.backgroundMusicSpeed
                    : DEFAULTS.scene.backgroundMusicSpeed,
            backgroundMusicBlobUrl: options.backgroundMusicBlobUrl || null,

            censorSpeaker: options.censorSpeaker !== undefined ? options.censorSpeaker : DEFAULTS.scene.censorSpeaker,
            demonSpeaker: options.demonSpeaker !== undefined ? options.demonSpeaker : DEFAULTS.scene.demonSpeaker,

            bustLeft: options.bustLeft !== undefined ? options.bustLeft : DEFAULTS.scene.bustLeft,
            bustRight: options.bustRight !== undefined ? options.bustRight : DEFAULTS.scene.bustRight,
            loopBackgroundGif:
                options.loopBackgroundGif !== undefined ? options.loopBackgroundGif : DEFAULTS.scene.loopBackgroundGif,
            centerDialog: options.centerDialog !== undefined ? options.centerDialog : DEFAULTS.scene.centerDialog,
            hideDialogBox: options.hideDialogBox !== undefined ? options.hideDialogBox : DEFAULTS.scene.hideDialogBox,
            portraitsTimings:
                options.portraitsTimings !== undefined
                    ? options.portraitsTimings
                    : JSON.parse(JSON.stringify(DEFAULTS.scene.portraitsTimings)),

            imageBlobUrl: options.imageBlobUrl || null,
            bustLeftBlobUrl: options.bustLeftBlobUrl || null,
            bustRightBlobUrl: options.bustRightBlobUrl || null,

            shake: options.shake !== undefined ? options.shake : DEFAULTS.scene.shake,
            shakeDelay: options.shakeDelay !== undefined ? options.shakeDelay : DEFAULTS.scene.shakeDelay,
            shakeIntensity:
                options.shakeIntensity !== undefined ? options.shakeIntensity : DEFAULTS.scene.shakeIntensity,
            shakeDuration: options.shakeDuration !== undefined ? options.shakeDuration : DEFAULTS.scene.shakeDuration,

            choices: options.choices !== undefined ? options.choices : DEFAULTS.scene.choices,
            choicesList:
                options.choicesList !== undefined
                    ? options.choicesList
                    : JSON.parse(JSON.stringify(DEFAULTS.scene.choicesList)),
            correctChoice: options.correctChoice !== undefined ? options.correctChoice : DEFAULTS.scene.correctChoice,
            choiceSpeed: options.choiceSpeed !== undefined ? options.choiceSpeed : DEFAULTS.scene.choiceSpeed,
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

            if (window.isImportingAssets) {
                return;
            }

            if (e.code === "Tab") {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();

                this.toggleControls();
                this.toggleDebugInfo();

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
            }
        });

        document.addEventListener("click", (e) => {
            if (document.getElementById("editorOverlay").classList.contains("active")) {
                return;
            }

            if (window.isImportingAssets) {
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
    }

    toggleControls() {
        const controls = document.getElementById("controlsContainer");
        controls.classList.toggle("hidden");
    }

    toggleDebugInfo() {
        const debugArea = document.getElementById("debugArea");
        debugArea?.classList.toggle("hidden");
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

            if (this.scenes.length <= 0 || this.currentScene >= this.scenes.length) {
                nextButton.disabled = true;
            }
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

    async preloadGifs() {
        const gifUrls = new Set();

        this.scenes.forEach((scene) => {
            [scene.image, scene.bustLeft, scene.bustRight].forEach((imageSrc) => {
                if (!imageSrc) return;

                if (!imageSrc.endsWith(".gif")) return;

                let finalUrl = null;
                const blobUrl = scene.imageBlobUrl || scene.bustLeftBlobUrl || scene.bustRightBlobUrl;

                if (blobUrl) {
                    finalUrl = blobUrl;
                } else if (imageSrc.startsWith("gallery:")) {
                    const match = imageSrc.match(/^gallery:([^/]+)\/(.+)$/);
                    if (match && window.gameImporterAssets) {
                        const [, category, name] = match;
                        const asset = window.gameImporterAssets.images[category]?.[name];
                        if (asset) {
                            finalUrl = asset.url;
                        } else {
                            finalUrl = "img/" + imageSrc;
                        }
                    } else {
                        finalUrl = "img/" + imageSrc;
                    }
                } else if (imageSrc.startsWith("http://") || imageSrc.startsWith("https://")) {
                    finalUrl = imageSrc;
                } else {
                    finalUrl = "img/" + imageSrc;
                }

                if (finalUrl) {
                    gifUrls.add(finalUrl);
                }
            });
        });

        if (gifUrls.size === 0) {
            return;
        }

        if (typeof createLoadingIndicator === "function") {
            createLoadingIndicator();
        }

        if (typeof showLoadingIndicator === "function") {
            //console.log(`Showing loading indicator for ${gifUrls.size} GIF(s)...`);
            //showLoadingIndicator(`Preloading ${gifUrls.size} animation${gifUrls.size > 1 ? "s" : ""}...`);
            showLoadingIndicator(`Preloading sequence...`);
        } else {
            console.warn("showLoadingIndicator function not available");
        }

        await new Promise((resolve) => setTimeout(resolve, 50));

        const gifUrlsArray = Array.from(gifUrls);
        const totalGifs = gifUrlsArray.length;

        if (typeof updateLoadingProgress === "function") {
            updateLoadingProgress("Initializing...");
        }

        try {
            for (let i = 0; i < gifUrlsArray.length; i++) {
                await this.preloadSingleGif(gifUrlsArray[i], i, totalGifs);
            }
        } finally {
            if (typeof hideLoadingIndicator === "function") {
                hideLoadingIndicator();
            }
        }
    }

    async preloadSingleGif(url, gifIndex = 0, totalGifs = 1) {
        if (this.gifCache.has(url)) {
            return this.gifCache.get(url).promise;
        }

        const cacheEntry = {
            status: "loading",
            frames: null,
            promise: null,
        };

        const promise = (async () => {
            try {
                //console.log("Preloading GIF:", url);

                if (typeof updateLoadingProgress === "function") {
                    updateLoadingProgress(`GIF ${gifIndex + 1} / ${totalGifs}`);
                }

                const res = await fetch(url);
                const buf = await res.arrayBuffer();

                if (typeof updateLoadingProgress === "function") {
                    updateLoadingProgress(`GIF ${gifIndex + 1} / ${totalGifs}<br>Parsing frames...`);
                }

                const gif = gifuct.parseGIF(buf);
                const frames = gifuct.decompressFrames(gif, true);

                cacheEntry.status = "ready";
                cacheEntry.frames = frames;
                //console.log("GIF preloaded successfully:", url);

                return frames;
            } catch (err) {
                console.warn("Failed to preload GIF:", url, err);
                cacheEntry.status = "error";
                throw err;
            }
        })();

        cacheEntry.promise = promise;
        this.gifCache.set(url, cacheEntry);

        return promise;
    }

    async getPreloadedGif(url) {
        const cacheEntry = this.gifCache.get(url);
        if (!cacheEntry) {
            await this.preloadSingleGif(url);
            return this.gifCache.get(url);
        }

        if (cacheEntry.status === "loading") {
            try {
                await cacheEntry.promise;
            } catch (err) {}
        }

        return cacheEntry;
    }

    async showScene(index, force = false) {
        if (index >= this.scenes.length) {
            this.hideDialog();
            return;
        }

        this.hideDialogArrow();
        this.hideChoices();

        this.sceneVersion++;
        const currentVersion = this.sceneVersion;

        if (this.currentScene !== index) {
            this.typingCompletedForScene = -1;
        }

        const scene = this.scenes[index];
        const previousScene = index > 0 ? this.scenes[index - 1] : null;

        if (scene.sound) {
            if (scene.soundDelay > 0) {
                setTimeout(() => {
                    if (this.sceneVersion !== currentVersion) return;
                    this.playSound(
                        scene.sound,
                        scene.soundVolume,
                        scene.soundBlobUrl,
                        scene.soundPitch,
                        scene.soundSpeed,
                    );
                }, scene.soundDelay);
            } else {
                this.playSound(scene.sound, scene.soundVolume, scene.soundBlobUrl, scene.soundPitch, scene.soundSpeed);
            }
        }

        const currentBgMusic = scene.backgroundMusic;
        const previousBgMusic = previousScene ? previousScene.backgroundMusic : null;

        if (currentBgMusic !== previousBgMusic) {
            if (!currentBgMusic) {
                this.stopBackgroundMusic();
            } else {
                this.playSceneBackgroundMusic(
                    currentBgMusic,
                    scene.backgroundMusicVolume,
                    scene.backgroundMusicBlobUrl,
                    scene.backgroundMusicPitch,
                    scene.backgroundMusicSpeed,
                );
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
                    this.crossfadeImages(
                        previousScene.image,
                        scene.image,
                        fadeOutDuration,
                        fadeInDuration,
                        scene.imageBlobUrl,
                        scene.loopBackgroundGif || false,
                    );
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
                                this.showImageInstant(
                                    scene.image,
                                    scene.imageBlobUrl,
                                    scene.loopBackgroundGif || false,
                                );
                            }
                        } else if (imageFadeOutTime === 0 && scene.imageFadeInTime === 0) {
                            this.showImageInstant(scene.image, scene.imageBlobUrl, scene.loopBackgroundGif || false);
                        } else {
                            this.showImage(
                                scene.image,
                                scene.imageFadeInTime,
                                0,
                                scene.imageBlobUrl,
                                scene.loopBackgroundGif || false,
                            ); // fadeOutTime handled above
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
                    this.showImage(
                        scene.image,
                        scene.imageFadeInTime,
                        0,
                        scene.imageBlobUrl,
                        scene.loopBackgroundGif || false,
                    );
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

                const dialogContainer = document.getElementById("dialogContainer");
                if (scene.centerDialog) {
                    dialogContainer.classList.add("center-dialog");
                } else {
                    dialogContainer.classList.remove("center-dialog");
                }
                if (scene.hideDialogBox) {
                    dialogContainer.classList.add("hide-dialog-box");
                } else {
                    dialogContainer.classList.remove("hide-dialog-box");
                }

                if (
                    (scene.line1 !== null && scene.line1.trim() !== "") ||
                    (scene.line2 !== null && scene.line2.trim() !== "")
                ) {
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
                } else {
                    this.typingCompletedForScene = this.currentScene;
                    document.dispatchEvent(
                        new CustomEvent("typingComplete", {
                            detail: { sceneIndex: this.currentScene },
                        }),
                    );
                    this.displayChoicesIfPresent();
                }
            }, totalDialogDelay);
        } else {
            // Scene 0: just use current scene's delays
            setTimeout(() => {
                if (this.sceneVersion !== currentVersion) return;

                const dialogContainer = document.getElementById("dialogContainer");
                if (scene.centerDialog) {
                    dialogContainer.classList.add("center-dialog");
                } else {
                    dialogContainer.classList.remove("center-dialog");
                }
                if (scene.hideDialogBox) {
                    dialogContainer.classList.add("hide-dialog-box");
                } else {
                    dialogContainer.classList.remove("hide-dialog-box");
                }

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
                    this.typingCompletedForScene = this.currentScene;
                    document.dispatchEvent(
                        new CustomEvent("typingComplete", {
                            detail: { sceneIndex: this.currentScene },
                        }),
                    );
                    this.hideDialog();
                    this.displayChoicesIfPresent();
                }
            }, scene.dialogDelayIn || 0);
        }

        this.updateDebugInfo();
    }

    async displayChoicesIfPresent() {
        const scene = this.scenes[this.currentScene];
        if (scene && scene.choices && scene.choicesList && scene.choicesList.length > 0) {
            // Filter out empty choices
            const validChoices = scene.choicesList.filter((choice) => choice && choice.trim() !== "");
            if (validChoices.length > 0) {
                // Find the correct choice index in the filtered list
                let adjustedCorrectChoice = 0;
                let validIndex = 0;
                for (let i = 0; i <= scene.correctChoice && i < scene.choicesList.length; i++) {
                    if (scene.choicesList[i] && scene.choicesList[i].trim() !== "") {
                        if (i === scene.correctChoice) {
                            adjustedCorrectChoice = validIndex;
                        }
                        validIndex++;
                    }
                }
                await this.showChoices(validChoices, adjustedCorrectChoice, scene.choiceSpeed);
            }
        }
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
        // portraitsTimings = [[fadeInLeft, fadeOutLeft, delayInLeft, delayOutLeft], [fadeInRight, fadeOutRight, delayInRight, delayOutRight]]
        const leftTimings = scene.portraitsTimings ? scene.portraitsTimings[0] : [0, 0, 0, 0];
        const rightTimings = scene.portraitsTimings ? scene.portraitsTimings[1] : [0, 0, 0, 0];
        const prevLeftTimings =
            previousScene && previousScene.portraitsTimings ? previousScene.portraitsTimings[0] : [0, 0, 0, 0];
        const prevRightTimings =
            previousScene && previousScene.portraitsTimings ? previousScene.portraitsTimings[1] : [0, 0, 0, 0];

        // Handle left bust
        if (previousScene && previousScene.bustLeft !== scene.bustLeft) {
            if (previousScene.bustLeft) {
                const fadeOutTime = prevLeftTimings[1] || 200;
                const delayOut = prevLeftTimings[3] || 0;
                setTimeout(() => {
                    this.hideBust("left", fadeOutTime);
                }, delayOut);
            }
            if (scene.bustLeft) {
                const fadeInTime = leftTimings[0] || 200;
                const delayIn = leftTimings[2] || 0;
                const prevFadeOut = previousScene.bustLeft ? prevLeftTimings[1] || 200 : 0;
                const prevDelayOut = previousScene.bustLeft ? prevLeftTimings[3] || 0 : 0;
                const totalPrevTime = prevDelayOut + prevFadeOut;

                setTimeout(() => {
                    this.showBust("left", scene.bustLeft, fadeInTime, scene.bustLeftBlobUrl);
                }, totalPrevTime + delayIn);
            }
        } else if (!previousScene && scene.bustLeft) {
            const fadeInTime = leftTimings[0] || 200;
            const delayIn = leftTimings[2] || 0;
            setTimeout(() => {
                this.showBust("left", scene.bustLeft, fadeInTime, scene.bustLeftBlobUrl);
            }, delayIn);
        }

        // Handle right bust
        if (previousScene && previousScene.bustRight !== scene.bustRight) {
            if (previousScene.bustRight) {
                const fadeOutTime = prevRightTimings[1] || 200;
                const delayOut = prevRightTimings[3] || 0;
                setTimeout(() => {
                    this.hideBust("right", fadeOutTime);
                }, delayOut);
            }
            if (scene.bustRight) {
                const fadeInTime = rightTimings[0] || 200;
                const delayIn = rightTimings[2] || 0;
                const prevFadeOut = previousScene.bustRight ? prevRightTimings[1] || 200 : 0;
                const prevDelayOut = previousScene.bustRight ? prevRightTimings[3] || 0 : 0;
                const totalPrevTime = prevDelayOut + prevFadeOut;

                setTimeout(() => {
                    this.showBust("right", scene.bustRight, fadeInTime, scene.bustRightBlobUrl);
                }, totalPrevTime + delayIn);
            }
        } else if (!previousScene && scene.bustRight) {
            const fadeInTime = rightTimings[0] || 200;
            const delayIn = rightTimings[2] || 0;
            setTimeout(() => {
                this.showBust("right", scene.bustRight, fadeInTime, scene.bustRightBlobUrl);
            }, delayIn);
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

        if (blobUrl) {
            img.src = blobUrl;
        } else if (imageSrc.startsWith("gallery:")) {
            const match = imageSrc.match(/^gallery:([^/]+)\/(.+)$/);
            if (match && window.gameImporterAssets) {
                const [, category, name] = match;
                const asset = window.gameImporterAssets.images[category]?.[name];
                if (asset) {
                    img.src = asset.url;
                } else {
                    img.src = "img/" + imageSrc;
                }
            } else {
                img.src = "img/" + imageSrc;
            }
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

    async showImage(imageSrc, fadeInTime = 0, fadeOutTime = 0, blobUrl = null, loopGif = false) {
        this.currentBackgroundImage = imageSrc;

        //console.log("showImage", imageSrc);

        if (imageSrc === "") {
            return;
        }

        let finalUrl = null;
        let isAnimated = imageSrc.endsWith(".gif");
        if (blobUrl) {
            finalUrl = blobUrl;
        } else if (imageSrc.startsWith("gallery:")) {
            const match = imageSrc.match(/^gallery:([^/]+)\/(.+)$/);
            if (match && window.gameImporterAssets) {
                const [, category, name] = match;
                const asset = window.gameImporterAssets.images[category]?.[name];
                if (asset) {
                    finalUrl = asset.url;
                } else {
                    finalUrl = "img/" + imageSrc;
                }
            } else {
                finalUrl = "img/" + imageSrc;
            }
        } else if (imageSrc.startsWith("http://") || imageSrc.startsWith("https://")) {
            finalUrl = imageSrc;
        } else {
            finalUrl = "img/" + imageSrc;
        }

        if (isAnimated) {
            //console.log("GIF", finalUrl);

            const container = document.querySelector(".game-container");

            // Fade out old images first
            if (fadeOutTime > 0) {
                const existingImages = container.querySelectorAll(".background-image.active");
                existingImages.forEach((img) => {
                    img.style.transition = `opacity ${fadeOutTime}ms ease-in-out`;
                    img.classList.remove("active");
                });
            }

            try {
                const gifData = await this.getPreloadedGif(finalUrl);

                if (gifData.status === "error" || !gifData.frames) {
                    throw new Error("GIF failed to load");
                }

                const frames = gifData.frames;
                const existingImages = container.querySelectorAll(".background-image.active");

                const canvas = document.createElement("canvas");
                canvas.className = "background-image";
                canvas.style.opacity = "0";

                if (fadeInTime > 0) {
                    canvas.style.transition = `opacity ${fadeInTime}ms ease-in-out`;
                } else {
                    canvas.style.transition = "none";
                }

                container.appendChild(canvas);

                const ctx = canvas.getContext("2d");
                canvas.width = frames[0].dims.width;
                canvas.height = frames[0].dims.height;
                canvas.style.width = "100%";
                canvas.style.height = "100%";

                let frameIndex = 0;
                let firstDrawn = false;

                const renderFrame = () => {
                    const frame = frames[frameIndex];

                    if (frame.disposalType === 2) {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                    }

                    const imgData = ctx.createImageData(frame.dims.width, frame.dims.height);
                    imgData.data.set(frame.patch);
                    ctx.putImageData(imgData, frame.dims.left, frame.dims.top);

                    if (!firstDrawn) {
                        firstDrawn = true;
                        requestAnimationFrame(() => {
                            canvas.classList.add("active");
                            canvas.style.opacity = "1";
                        });

                        const startEvent = new CustomEvent("gifPlaybackStarted", {
                            detail: { src: imageSrc, type: "background" },
                        });
                        document.dispatchEvent(startEvent);
                    }

                    frameIndex++;

                    if (frameIndex < frames.length) {
                        setTimeout(() => requestAnimationFrame(renderFrame), frame.delay);
                    } else {
                        if (loopGif) {
                            // Loop the GIF by resetting frame index
                            frameIndex = 0;
                            setTimeout(() => requestAnimationFrame(renderFrame), frame.delay);
                        } else {
                            const endEvent = new CustomEvent("gifPlaybackEnded", {
                                detail: { src: imageSrc, type: "background" },
                            });
                            document.dispatchEvent(endEvent);
                        }
                    }
                };

                requestAnimationFrame(renderFrame);

                const cleanupTime = Math.max(fadeInTime, fadeOutTime) + 100;
                setTimeout(() => {
                    existingImages.forEach((el) => el.remove());
                }, cleanupTime);

                return;
            } catch (error) {
                console.warn("Failed to load GIF, falling back to regular image:", error);
            }
        }

        if (fadeOutTime > 0) {
            const existingImages = document.querySelectorAll(".background-image.active");
            existingImages.forEach((img) => {
                img.style.transition = `opacity ${fadeOutTime}ms ease-in-out`;
                img.classList.remove("active");
            });
        }

        const img = document.createElement("img");
        img.src = finalUrl;
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

            const loadEvent = new CustomEvent("imageLoaded", {
                detail: { src: imageSrc, type: "background" },
            });
            document.dispatchEvent(loadEvent);
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

    async crossfadeImages(
        fromImageSrc,
        toImageSrc,
        fadeOutDuration = 1000,
        fadeInDuration = 1000,
        toBlobUrl = null,
        loopGif = false,
    ) {
        this.currentBackgroundImage = toImageSrc;
        //console.log("showImage", fromImageSrc, toImageSrc);
        const existingImages = document.querySelectorAll(".background-image.active");

        let finalUrl = null;
        let isAnimated = toImageSrc.endsWith(".gif");
        if (toBlobUrl) {
            finalUrl = toBlobUrl;
        } else if (toImageSrc.startsWith("gallery:")) {
            const match = toImageSrc.match(/^gallery:([^/]+)\/(.+)$/);
            if (match && window.gameImporterAssets) {
                const [, category, name] = match;
                const asset = window.gameImporterAssets.images[category]?.[name];
                if (asset) {
                    finalUrl = asset.url;
                } else {
                    finalUrl = "img/" + toImageSrc;
                }
            } else {
                finalUrl = "img/" + toImageSrc;
            }
        } else if (toImageSrc.startsWith("http://") || toImageSrc.startsWith("https://")) {
            finalUrl = toImageSrc;
        } else {
            finalUrl = "img/" + toImageSrc;
        }
        if (isAnimated) {
            //console.log("GIF", finalUrl);

            const container = document.querySelector(".game-container");

            try {
                const gifData = await this.getPreloadedGif(finalUrl);

                if (gifData.status === "error" || !gifData.frames) {
                    throw new Error("GIF failed to load");
                }

                const frames = gifData.frames;

                const canvas = document.createElement("canvas");
                canvas.className = "background-image";
                canvas.style.opacity = "0";
                canvas.style.transition = `opacity ${fadeInDuration}ms ease-in-out`;

                container.appendChild(canvas);

                const ctx = canvas.getContext("2d");
                canvas.width = frames[0].dims.width;
                canvas.height = frames[0].dims.height;
                canvas.style.width = "100%";
                canvas.style.height = "100%";

                let frameIndex = 0;
                let firstDrawn = false;

                const renderFrame = () => {
                    const frame = frames[frameIndex];

                    if (frame.disposalType === 2) {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                    }

                    const imgData = ctx.createImageData(frame.dims.width, frame.dims.height);
                    imgData.data.set(frame.patch);
                    ctx.putImageData(imgData, frame.dims.left, frame.dims.top);

                    if (!firstDrawn) {
                        firstDrawn = true;
                        requestAnimationFrame(() => {
                            existingImages.forEach((existingImg) => {
                                existingImg.style.transition = `opacity ${fadeOutDuration}ms ease-in-out`;
                                existingImg.classList.remove("active");
                            });

                            canvas.classList.add("active");
                            canvas.style.opacity = "1";
                        });

                        const startEvent = new CustomEvent("gifPlaybackStarted", {
                            detail: { src: toImageSrc, type: "background" },
                        });
                        document.dispatchEvent(startEvent);
                    }

                    frameIndex++;

                    if (frameIndex < frames.length) {
                        setTimeout(() => requestAnimationFrame(renderFrame), frame.delay);
                    } else {
                        if (loopGif) {
                            // Loop the GIF by resetting frame index
                            frameIndex = 0;
                            setTimeout(() => requestAnimationFrame(renderFrame), frame.delay);
                        } else {
                            const endEvent = new CustomEvent("gifPlaybackEnded", {
                                detail: { src: toImageSrc, type: "background" },
                            });
                            document.dispatchEvent(endEvent);
                        }
                    }
                };

                requestAnimationFrame(renderFrame);

                const maxDuration = Math.max(fadeOutDuration, fadeInDuration);
                setTimeout(() => {
                    existingImages.forEach((el) => {
                        el.remove();
                    });
                }, maxDuration + 100);

                return;
            } catch (error) {
                console.warn("Failed to load GIF in crossfade, falling back to regular image:", error);
            }
        }

        const newImg = document.createElement("img");
        newImg.src = finalUrl;
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

            const loadEvent = new CustomEvent("imageLoaded", {
                detail: { src: toImageSrc, type: "background" },
            });
            document.dispatchEvent(loadEvent);

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

    async showImageInstant(imageSrc, blobUrl = null, loopGif = false) {
        this.currentBackgroundImage = imageSrc;

        //console.log("showImageInstant", imageSrc);

        let finalUrl = null;
        const isGif = imageSrc.endsWith(".gif");
        if (blobUrl) {
            finalUrl = blobUrl;
        } else if (imageSrc.startsWith("gallery:")) {
            const match = imageSrc.match(/^gallery:([^/]+)\/(.+)$/);
            if (match && window.gameImporterAssets) {
                const [, category, name] = match;
                const asset = window.gameImporterAssets.images[category]?.[name];
                if (asset) {
                    finalUrl = asset.url;
                } else {
                    finalUrl = "img/" + imageSrc;
                }
            } else {
                finalUrl = "img/" + imageSrc;
            }
        } else if (imageSrc.startsWith("http://") || imageSrc.startsWith("https://")) {
            finalUrl = imageSrc;
        } else {
            finalUrl = "img/" + imageSrc;
        }

        if (isGif) {
            //console.log("GIF", finalUrl);

            const container = document.querySelector(".game-container");
            const existingImages = container.querySelectorAll(".background-image.active");

            const canvas = document.createElement("canvas");
            canvas.className = "background-image";
            canvas.style.transition = "none";
            canvas.style.opacity = "0";
            container.appendChild(canvas);

            try {
                const gifData = await this.getPreloadedGif(finalUrl);

                if (gifData.status === "error" || !gifData.frames) {
                    throw new Error("GIF failed to load");
                }

                const frames = gifData.frames;
                const ctx = canvas.getContext("2d");
                canvas.width = frames[0].dims.width;
                canvas.height = frames[0].dims.height;
                canvas.style.width = "100%";
                canvas.style.height = "100%";

                let frameIndex = 0;
                let firstDrawn = false;

                const renderFrame = () => {
                    const frame = frames[frameIndex];

                    if (frame.disposalType === 2) {
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                    }

                    const imgData = ctx.createImageData(frame.dims.width, frame.dims.height);
                    imgData.data.set(frame.patch);
                    ctx.putImageData(imgData, frame.dims.left, frame.dims.top);

                    if (!firstDrawn) {
                        firstDrawn = true;
                        canvas.style.opacity = "1";
                        canvas.classList.add("active");
                        setTimeout(() => existingImages.forEach((el) => el.remove()), 50);

                        const startEvent = new CustomEvent("gifPlaybackStarted", {
                            detail: { src: imageSrc, type: "background" },
                        });
                        document.dispatchEvent(startEvent);
                    }

                    frameIndex++;

                    if (frameIndex < frames.length) {
                        setTimeout(() => requestAnimationFrame(renderFrame), frame.delay);
                    } else {
                        if (loopGif) {
                            // Loop the GIF by resetting frame index
                            frameIndex = 0;
                            setTimeout(() => requestAnimationFrame(renderFrame), frame.delay);
                        } else {
                            const endEvent = new CustomEvent("gifPlaybackEnded", {
                                detail: { src: imageSrc, type: "background" },
                            });
                            document.dispatchEvent(endEvent);
                        }
                    }
                };

                requestAnimationFrame(renderFrame);
            } catch (err) {
                console.warn("Failed to load or play GIF:", err);

                const img = document.createElement("img");
                img.src = finalUrl;
                img.className = "background-image active";
                container.appendChild(img);
                setTimeout(() => existingImages.forEach((img) => img.remove()), 10);
            }

            return;
        }

        const existingImages = document.querySelectorAll(".background-image.active");
        existingImages.forEach((el) => {
            el.style.transition = "none";
            el.classList.remove("active");
        });

        const img = document.createElement("img");
        img.src = finalUrl;
        img.className = "background-image active";
        img.style.transition = "none";
        img.style.opacity = "1";

        img.onload = () => {
            const loadEvent = new CustomEvent("imageLoaded", {
                detail: { src: imageSrc, type: "background" },
            });
            document.dispatchEvent(loadEvent);
        };

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

        const lRegex = /<l([^>]*)>(.*?)<\/l>/g;
        formattedText = formattedText.replace(lRegex, (match, attributes, content) => {
            const sizeMatch = attributes.match(/size="([^"]+)"/);
            const size = sizeMatch ? sizeMatch[1] : "1.3";
            return `<span style="font-size: ${size}em;">${content}</span>`;
        });

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
            const tagConfig = JSON.parse(glitchContainer.dataset.glitchConfig);
            const mergedConfig = { ...this.glitchConfig, ...tagConfig };
            const glitchEffect = new GlitchTextEffect(glitchContainer, mergedConfig);
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

        this.currentSpeaker = speaker;

        this.cleanupGlitchEffects();

        speakerLine.className = "dialog-line speaker-line";
        textLine1.className = "dialog-line text-line";
        textLine2.className = "dialog-line text-line";
        speakerLine.innerHTML = "";
        textLine1.innerHTML = "";
        textLine2.innerHTML = "";

        if (speaker === "Notification") {
            dialogContainer.classList.add("notification-mode");
        } else {
            dialogContainer.classList.remove("notification-mode");
        }

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
            processedLine1 = dialogFramework.toEntitySpeechPreserveTags(processedLine1);
            processedLine2 = dialogFramework.toEntitySpeechPreserveTags(processedLine2);
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
        const hasDialog = (line1 && line1.trim() !== "") || (line2 && line2.trim() !== "");

        if (!hasDialog) {
            this.typingCompletedForScene = this.currentScene;
            document.dispatchEvent(
                new CustomEvent("typingComplete", {
                    detail: { sceneIndex: this.currentScene },
                }),
            );
            return;
        }

        const scene = this.scenes[this.currentScene];
        if (scene && scene.dialogFadeInTime > 0) {
            await this.wait(scene.dialogFadeInTime);
        }

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

        if (line2) {
            const hasFormattingLine2 = line2.includes("<");

            if (hasFormattingLine2) {
                const parsedContainer2 = this.parseFormattedText(line2);
                await this.typeTextWithFormattingSequential(textLine2Element, parsedContainer2);
            } else {
                await this.typeText(textLine2Element, line2);
            }
        }

        this.isTyping = false;

        this.typingCompletedForScene = this.currentScene;
        document.dispatchEvent(
            new CustomEvent("typingComplete", {
                detail: { sceneIndex: this.currentScene },
            }),
        );

        if (this.config.showDialogArrow !== false) {
            this.showDialogArrow();
        }

        if (scene && scene.choices && scene.choicesList && scene.choicesList.length > 0) {
            const validChoices = scene.choicesList.filter((choice) => choice && choice.trim() !== "");
            if (validChoices.length > 0) {
                let adjustedCorrectChoice = 0;
                let validIndex = 0;
                for (let i = 0; i <= scene.correctChoice && i < scene.choicesList.length; i++) {
                    if (scene.choicesList[i] && scene.choicesList[i].trim() !== "") {
                        if (i === scene.correctChoice) {
                            adjustedCorrectChoice = validIndex;
                        }
                        validIndex++;
                    }
                }
                await this.showChoices(validChoices, adjustedCorrectChoice, scene.choiceSpeed);
            }
        }
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

    async showChoices(choicesList, correctChoice, choiceSpeed) {
        const choicesContainer = document.getElementById("choicesContainer");
        if (!choicesContainer) return;

        this.hideDialogArrow();

        choicesContainer.innerHTML = "";
        const choiceElements = [];

        choicesList.forEach((choice, i) => {
            const choiceElement = document.createElement("div");
            choiceElement.className = "choice-item";
            choiceElement.textContent = choice;
            choicesContainer.appendChild(choiceElement);
            choiceElements.push(choiceElement);
        });

        choicesContainer.style.display = "flex";

        await this.animateChoicesSelection(choiceElements, correctChoice, choiceSpeed);
    }

    async animateChoicesSelection(choiceElements, correctChoice, choiceSpeed) {
        for (let i = 0; i <= correctChoice; i++) {
            choiceElements[i].classList.add("selected");

            await this.playSound(
                this.choicesSoundMove.path,
                this.choicesSoundMove.volume,
                null,
                this.choicesSoundMove.pitch,
                this.choicesSoundMove.speed,
            );

            await this.wait(choiceSpeed);

            if (i < correctChoice) {
                choiceElements[i].classList.remove("selected");
            }
        }

        await this.wait(choiceSpeed);

        await this.playSound(
            this.choicesSoundClick.path,
            this.choicesSoundClick.volume,
            null,
            this.choicesSoundClick.pitch,
            this.choicesSoundClick.speed,
        );

        const choicesContainer = document.getElementById("choicesContainer");
        if (choicesContainer) {
            choicesContainer.style.display = "none";
        }
    }

    hideChoices() {
        const choicesContainer = document.getElementById("choicesContainer");
        if (choicesContainer) {
            choicesContainer.innerHTML = "";
            choicesContainer.style.display = "none";
        }
    }

    createControlsToggle() {
        if (!document.getElementById("controlsToggle")) {
            const toggle = document.createElement("button");
            toggle.id = "controlsToggle";
            toggle.className = "controls-toggle";
            toggle.textContent = "Controls";
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

        this.typingCompletedForScene = this.currentScene;
        document.dispatchEvent(
            new CustomEvent("typingComplete", {
                detail: { sceneIndex: this.currentScene },
            }),
        );
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
                const tagConfig = JSON.parse(container.dataset.glitchConfig);
                const mergedConfig = { ...this.glitchConfig, ...tagConfig };
                const glitchEffect = new GlitchTextEffect(container, mergedConfig);
                this.glitchEffects.push(glitchEffect);
            });
        }

        this.isTyping = false;

        this.typingCompletedForScene = this.currentScene;
        document.dispatchEvent(
            new CustomEvent("typingComplete", {
                detail: { sceneIndex: this.currentScene },
            }),
        );
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
                    const tagConfig = JSON.parse(container.dataset.glitchConfig);
                    const mergedConfig = { ...this.glitchConfig, ...tagConfig };
                    const glitchEffect = new GlitchTextEffect(container, mergedConfig);
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

        element.innerHTML = "";

        const chars = [];
        for (let i = 0; i < text.length; i++) {
            const span = document.createElement("span");
            span.className = "typing-char";
            span.textContent = text[i] === " " ? "\u00A0" : text[i];
            span.style.opacity = "0";
            element.appendChild(span);
            chars.push(span);
        }

        for (let i = 0; i < chars.length; i++) {
            if (!this.isTyping) {
                for (let i = 0; i < chars.length; i++) {
                    chars[i].style.opacity = "1";
                }
                break;
            }
            chars[i].style.opacity = "1";
            await this.wait(this.typeSpeed);
        }
    }

    async typeTextWithFormattingSequential(element, parsedContainer) {
        const plainText = parsedContainer.textContent || parsedContainer.innerText;

        if (!plainText) {
            element.textContent = "";
            return;
        }

        element.innerHTML = parsedContainer.innerHTML;

        const glitchContainers = element.querySelectorAll(".glitch-container");
        glitchContainers.forEach((container) => {
            const tagConfig = JSON.parse(container.dataset.glitchConfig);
            const mergedConfig = { ...this.glitchConfig, ...tagConfig };
            const glitchEffect = new GlitchTextEffect(container, mergedConfig);
            this.glitchEffects.push(glitchEffect);
        });

        const chars = this.wrapTextNodesInSpans(element);

        for (let i = 0; i < chars.length; i++) {
            if (!this.isTyping) break;

            chars[i].style.opacity = "1";
            await this.wait(this.typeSpeed);
        }
    }

    wrapTextNodesInSpans(element) {
        const chars = [];
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
            acceptNode: function (node) {
                if (node.parentElement && node.parentElement.classList.contains("glitch-container")) {
                    return NodeFilter.FILTER_REJECT;
                }
                return NodeFilter.FILTER_ACCEPT;
            },
        });

        const textNodes = [];
        let node;
        while ((node = walker.nextNode())) {
            textNodes.push(node);
        }

        textNodes.forEach((textNode) => {
            const text = textNode.textContent;
            const parent = textNode.parentNode;
            const fragment = document.createDocumentFragment();

            for (let i = 0; i < text.length; i++) {
                const span = document.createElement("span");
                span.className = "typing-char";
                span.textContent = text[i] === " " ? "\u00A0" : text[i];
                span.style.opacity = "0";
                fragment.appendChild(span);
                chars.push(span);
            }

            parent.replaceChild(fragment, textNode);
        });

        return chars;
    }

    skipText() {
        if (this.isTyping) {
            this.isTyping = false;
        }
    }

    /*skipText() {
        if (this.isTyping) {
            this.isTyping = false;

            const textLine1 = document.getElementById("textLine1");
            const textLine2 = document.getElementById("textLine2");

            if (this.currentScene < this.scenes.length) {
                const scene = this.scenes[this.currentScene];

                let processedLine1 = scene.line1 || "";
                let processedLine2 = scene.line2 || "";

                const characterInfo = this.getCharacterFromSpeaker(scene.speaker);
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
    }*/

    next(isAutoPlay = false) {
        if (this.isTyping) {
            this.skipText();
            return;
        }

        if (!isAutoPlay && this.isAutoPlaying) {
            this.stopAutoPlay();
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
        if (this.isAutoPlaying) {
            this.stopAutoPlay();
        }

        if (this.currentScene < 0) {
            return;
        }
        let currentIndex = this.currentScene;

        if (currentIndex >= this.scenes.length) {
            currentIndex = this.scenes.length - 1;
        } else {
            currentIndex--;
            if (currentIndex < 0) {
                currentIndex = 0;
            }
        }

        this.reset();
        this.jumpToScene(currentIndex);
    }

    hideDialog() {
        const dialogContainer = document.getElementById("dialogContainer");
        dialogContainer.classList.remove("active");
        this.hideDialogArrow();
        this.hideChoices();
    }

    showDialogArrow() {
        const dialogArrow = document.getElementById("dialogArrow");
        if (dialogArrow) {
            dialogArrow.style.display = "block";
            if (this.currentSpeaker === "Notification") {
                dialogArrow.classList.toggle("notification-mode", true);
            } else {
                dialogArrow.classList.toggle("notification-mode", false);
            }
        }
    }

    hideDialogArrow() {
        const dialogArrow = document.getElementById("dialogArrow");
        if (dialogArrow) {
            dialogArrow.style.display = "none";
        }
    }

    showDialogArrowPreview(sceneIndex) {
        const dialogArrow = document.getElementById(`dialogArrowPreview-${sceneIndex}`);
        if (dialogArrow) {
            dialogArrow.style.display = "block";

            if (this.currentSpeaker === "Notification") {
                dialogArrow.classList.toggle("notification-mode", true);
            } else {
                dialogArrow.classList.toggle("notification-mode", false);
            }
        }
    }

    hideDialogArrowPreview(sceneIndex) {
        const dialogArrow = document.getElementById("dialogArrowPreview-${sceneIndex}");
        if (dialogArrow) {
            dialogArrow.style.display = "none";
        }
    }

    reset() {
        if (this.isAutoPlaying) {
            this.stopAutoPlay();
        }

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

    clearScenes() {
        this.scenes = [];
        this.gifCache.clear();
    }

    wait(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    playPauseSequence() {
        if (this.isAutoPlaying) {
            this.stopAutoPlay();
        } else {
            this.startAutoPlay();
        }
    }

    toggleMuteSequenceButton() {
        this.isMuted = !this.isMuted;

        const muteButton = document.getElementById("toggleMuteSequenceButton");
        if (muteButton) {
            if (this.isMuted) {
                muteButton.style.textDecoration = "line-through";
                muteButton.title = "Unmute sound in the sequence";
            } else {
                muteButton.style.textDecoration = "none";
                muteButton.title = "Mute / Unmute sound in the sequence";
            }
        }

        if (this.backgroundMusicAudio) {
            if (this.isMuted) {
                this.backgroundMusicAudio.volume = 0;
            } else {
                const scene = this.scenes[this.currentScene];
                if (scene && scene.backgroundMusic) {
                    this.backgroundMusicAudio.volume = Math.max(0, Math.min(1, scene.backgroundMusicVolume || 1.0));
                } else {
                    this.backgroundMusicAudio.volume = this.config.backgroundMusicVolume || 0.5;
                }
            }
        }
    }

    startAutoPlay() {
        this.isAutoPlaying = true;
        const playButton = document.getElementById("playSequenceButton");
        if (playButton) {
            playButton.textContent = "⏸";
            playButton.title = "Pause auto-play (right-click for settings)";
        }

        this.typeSpeed = this.autoPlaySettings.typeSpeed;

        if (this.currentScene === -1) {
            this.currentScene = 0;
            this.showScene(0);
            this.updateDebugInfo();
        }

        this.continueAutoPlay();
    }

    stopAutoPlay() {
        this.isAutoPlaying = false;
        if (this.autoPlayTimeout) {
            clearTimeout(this.autoPlayTimeout);
            this.autoPlayTimeout = null;
        }
        const playButton = document.getElementById("playSequenceButton");
        if (playButton) {
            playButton.textContent = "▶";
            playButton.title = "Auto-play (right-click for settings)";
        }
    }

    continueAutoPlay() {
        if (!this.isAutoPlaying) return;

        if (this.currentScene >= this.scenes.length) {
            this.stopAutoPlay();
            return;
        }

        this.waitForSceneCompletion().then(() => {
            if (!this.isAutoPlaying) return;

            this.autoPlayTimeout = setTimeout(() => {
                if (!this.isAutoPlaying) return;

                this.currentScene++;
                if (this.currentScene < this.scenes.length) {
                    this.showScene(this.currentScene);
                } else {
                    this.hideDialog();
                    this.stopAutoPlay();
                    this.updateDebugInfo();
                    return;
                }
                this.updateDebugInfo();

                this.continueAutoPlay();
            }, this.autoPlaySettings.delayBetweenScenes);
        });
    }

    async waitForSceneCompletion() {
        if (this.typingCompletedForScene !== this.currentScene) {
            const typingPromise = new Promise((resolve) => {
                const handler = (event) => {
                    if (event.detail.sceneIndex === this.currentScene) {
                        document.removeEventListener("typingComplete", handler);
                        resolve();
                    }
                };
                document.addEventListener("typingComplete", handler);
            });

            await typingPromise;
        }

        if (this.currentScene >= 0 && this.currentScene < this.scenes.length) {
            const scene = this.scenes[this.currentScene];

            let totalDuration = 0;

            const hasGif = scene.image && scene.image.endsWith(".gif");
            const isLoopingGif = scene.loopBackgroundGif || false;

            // Only wait for GIF to complete if it's not looping
            // Looping GIFs never end, so autoplay should not wait for them
            if (hasGif && !isLoopingGif) {
                const gifEndedPromise = new Promise((resolve) => {
                    const handler = (event) => {
                        document.removeEventListener("gifPlaybackEnded", handler);
                        resolve();
                    };
                    document.addEventListener("gifPlaybackEnded", handler);
                });
                await gifEndedPromise;
            }

            if (scene.choices && scene.choicesList && scene.choicesList.length > 0) {
                const validChoices = scene.choicesList.filter((choice) => choice && choice.trim() !== "");
                if (validChoices.length > 0) {
                    const correctChoice = scene.correctChoice || 0;
                    const choiceSpeed = scene.choiceSpeed || 500;
                    const choiceAnimationDuration = (correctChoice + 1) * choiceSpeed + choiceSpeed + 200;
                    await this.wait(choiceAnimationDuration);
                }
            }
        }
    }

    updateDebugInfo() {
        const debugInfo = document.getElementById("debugInfo");

        if (this.scenes.length >= 1) {
            if (debugInfo.classList.contains("disabled")) {
                debugInfo.classList.remove("disabled");
            }
            if (this.currentScene >= this.scenes.length) {
                debugInfo.textContent = `End`;
                //debugInfo.onclick = null;
                debugInfo.onclick = (e) => {
                    e.stopPropagation();
                    this.showSceneJumpInput();
                };
                if (!debugInfo.classList.contains("disabled")) {
                    //debugInfo.classList.add("disabled");
                }
            } else {
                debugInfo.textContent = `${this.currentScene + 1 < 10 ? " " : ""}${this.currentScene + 1} / ${this.scenes.length}${this.scenes.length < 10 ? " " : ""}`;
                debugInfo.onclick = (e) => {
                    e.stopPropagation();
                    this.showSceneJumpInput();
                };
            }
        } else {
            if (!debugInfo.classList.contains("disabled")) {
                debugInfo.classList.add("disabled");
            }
            debugInfo.textContent = "No scene";
        }

        this.updateButtonStates();
        this.updateStartMessage();
    }

    showSceneJumpInput() {
        const debugInfo = document.getElementById("debugInfo");
        if (!debugInfo /*|| this.currentScene >= this.scenes.length*/) return;

        const currentSceneNum = this.currentScene + 1;

        let selectHTML = '<select class="scene-jump-select">';

        selectHTML += `<option value="-1" ${this.currentScene === -1 || this.currentScene >= this.scenes.length ? "selected" : ""}>Scene 0 (Reset)</option>`;

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
        if (this.isAutoPlaying) {
            this.stopAutoPlay();
        }

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
