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

class SpriteAnimator {
    constructor(spritesheet, frames, animSpeed = 250) {
        this.spritesheet = spritesheet;
        this.frames = frames;
        this.animSpeed = animSpeed;
        this.currentFrameIndex = 0;
        this.lastFrameTime = 0;
    }

    update(timestamp) {
        if (timestamp - this.lastFrameTime >= this.animSpeed) {
            this.currentFrameIndex = (this.currentFrameIndex + 1) % this.frames.length;
            this.lastFrameTime = timestamp;
        }
    }

    getCurrentFrame() {
        return this.frames[this.currentFrameIndex];
    }

    reset() {
        this.currentFrameIndex = 0;
        this.lastFrameTime = 0;
    }

    clone() {
        return new SpriteAnimator(this.spritesheet, [...this.frames], this.animSpeed);
    }
}

class GameAnimation {
    constructor(config, x, y, loop = false, onComplete = null) {
        this.config = config;
        this.spritesheet = config.spritesheetImage;
        this.frames = config.index;
        this.speed = config.speed || GAME_CONFIG.EFFECT_ANIMATION_SPEED;
        this.x = x;
        this.y = y;
        this.renderX = x;
        this.renderY = y;
        this.currentFrameIndex = 0;
        this.lastFrameTime = 0;
        this.finished = false;
        this.loop = loop;
        this.onComplete = onComplete; // Callback when animation finishes
    }

    update(timestamp, deltaTime) {
        const lerpFactor = Math.min(1, GAME_CONFIG.INTERPOLATION_SPEED * (deltaTime / 16));
        this.renderX += (this.x - this.renderX) * lerpFactor;
        this.renderY += (this.y - this.renderY) * lerpFactor;

        if (this.speed > 0 && timestamp - this.lastFrameTime >= this.speed) {
            this.currentFrameIndex++;

            if (this.currentFrameIndex >= this.frames.length) {
                if (this.loop) {
                    this.currentFrameIndex = 0;
                } else {
                    this.finished = true;
                }
            }

            this.lastFrameTime = timestamp;
        }
    }

    getCurrentFrame() {
        return this.frames[this.currentFrameIndex];
    }

    getCurrentSpritesheet() {
        return this.spritesheet;
    }
}

class Player {
    constructor(x, y, spritesheet, spriteIndices, speed) {
        this.x = x;
        this.y = y;
        this.renderX = x;
        this.renderY = y;
        this.direction = DIRECTIONS.DOWN;
        this.directionQueue = [];
        this.speed = speed;
        this.animator = new SpriteAnimator(spritesheet, spriteIndices, GAME_ASSETS.player_sprite.speed);
        this.lastMoveTime = 0;
        this.useDirectionalSprites = false;
        this.spriteConfig = null;
    }

    queueDirection(newDirection) {
        this.directionQueue = [newDirection];

        this.direction = newDirection;
        this.updateDirectionalFrames();

        this.lastMoveTime = 0;

        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
    }

    updateDirectionalFrames() {
        if (!this.useDirectionalSprites || !this.spriteConfig || !this.spriteConfig.frames) {
            return;
        }

        let frameKey;
        if (this.direction.y < 0) {
            frameKey = "backward";
        } else if (this.direction.y > 0) {
            frameKey = "forward";
        } else if (this.direction.x < 0) {
            frameKey = "left";
        } else if (this.direction.x > 0) {
            frameKey = "right";
        } else {
            frameKey = "forward";
        }

        if (this.spriteConfig.frames[frameKey]) {
            this.animator.frames = this.spriteConfig.frames[frameKey];
        }
    }

    move(timestamp) {
        if (timestamp - this.lastMoveTime < this.speed) {
            return false;
        }

        if (this.directionQueue.length === 0) {
            return false;
        }

        this.direction = this.directionQueue.shift();
        this.updateDirectionalFrames();

        this.prevX = this.x;
        this.prevY = this.y;

        this.x += this.direction.x;
        this.y += this.direction.y;

        this.lastMoveTime = timestamp;
        return true;
    }

    update(timestamp, deltaTime) {
        if (this.animator) {
            this.animator.update(timestamp);
        }

        const lerpFactor = Math.min(1, GAME_CONFIG.INTERPOLATION_SPEED * (deltaTime / 16));
        this.renderX += (this.x - this.renderX) * lerpFactor;
        this.renderY += (this.y - this.renderY) * lerpFactor;
    }
}

class Enemy {
    constructor(type, x, y, speed) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.renderX = x;
        this.renderY = y;
        this.direction = DIRECTIONS.UP;
        this.config = ENEMY_CONFIG[type];

        if (speed !== undefined) {
            this.speed = speed;
        } else if (this.config.speeds && Array.isArray(this.config.speeds)) {
            const [minSpeed, maxSpeed] = this.config.speeds;
            this.speed = minSpeed + Math.random() * (maxSpeed - minSpeed);
        } else {
            this.speed = this.config.speed;
        }

        this.lastMoveTime = 0;
        this.prevX = x;
        this.prevY = y;

        this.currentAnimDirection = "forward";
        if (this.config.frames.forward && this.config.frames.forward.length > 0 && this.config.spritesheetImage) {
            this.animator = new SpriteAnimator(this.config.spritesheetImage, this.config.frames.forward, 250);
        } else {
            this.animator = null;
        }
    }

    updateDirectionalFrames() {
        if (!this.animator || !this.config.frames) {
            return;
        }

        let frameKey;
        if (this.direction.y < 0) {
            frameKey = "backward";
        } else if (this.direction.y > 0) {
            frameKey = "forward";
        } else if (this.direction.x < 0) {
            frameKey = "left";
        } else if (this.direction.x > 0) {
            frameKey = "right";
        } else {
            frameKey = "forward";
        }

        if (this.config.frames[frameKey] && frameKey !== this.currentAnimDirection) {
            this.currentAnimDirection = frameKey;
            this.animator.frames = this.config.frames[frameKey];
        }
    }

    move(timestamp, player = null, otherEnemies = [], boxes = []) {
        if (timestamp - this.lastMoveTime < this.speed) {
            return false;
        }

        this.prevX = this.x;
        this.prevY = this.y;

        // Hussy tracking logic with simple pathfinding
        if (this.type === ENEMY_TYPES.ENEMY_HUSSY && player) {
            const dx = player.x - this.x;
            const dy = player.y - this.y;

            const isValidPosition = (x, y) => {
                if (x < 0 || x >= GAME_CONFIG.GRID_WIDTH || y < 0 || y >= GAME_CONFIG.GRID_HEIGHT) {
                    return false;
                }
                if (otherEnemies.some((e) => e !== this && e.x === x && e.y === y)) {
                    return false;
                }
                if (boxes.some((box) => box.x === x && box.y === y)) {
                    return false;
                }
                return true;
            };

            const movementOptions = [];

            // Primary: Move toward player (prioritize vertical)
            if (Math.abs(dy) > 0) {
                const verticalDir = { x: 0, y: dy > 0 ? 1 : -1 };
                movementOptions.push(verticalDir);
            }
            if (Math.abs(dx) > 0) {
                const horizontalDir = { x: dx > 0 ? 1 : -1, y: 0 };
                movementOptions.push(horizontalDir);
            }

            // Secondary: Try perpendicular directions if primary path is blocked
            if (Math.abs(dy) > 0) {
                // If moving vertically, try horizontal alternatives
                movementOptions.push({ x: 1, y: 0 });
                movementOptions.push({ x: -1, y: 0 });
            } else if (Math.abs(dx) > 0) {
                // If moving horizontally, try vertical alternatives
                movementOptions.push({ x: 0, y: 1 });
                movementOptions.push({ x: 0, y: -1 });
            }

            // Try each movement option until we find a valid one
            let moved = false;
            for (const moveDir of movementOptions) {
                const newX = this.x + moveDir.x;
                const newY = this.y + moveDir.y;

                if (isValidPosition(newX, newY)) {
                    this.x = newX;
                    this.y = newY;
                    this.direction = moveDir;
                    this.updateDirectionalFrames();
                    moved = true;
                    break;
                }
            }

            // If no valid move found, stay in place (but still update lastMoveTime)
        }

        this.lastMoveTime = timestamp;
        return true;
    }

    update(timestamp, deltaTime) {
        if (this.animator) {
            this.animator.update(timestamp);
        }

        const lerpFactor = Math.min(1, GAME_CONFIG.INTERPOLATION_SPEED * (deltaTime / 16));
        this.renderX += (this.x - this.renderX) * lerpFactor;
        this.renderY += (this.y - this.renderY) * lerpFactor;
    }
}

class AudioManager {
    constructor() {
        this.soundEffects = {
            playerMove: GAME_ASSETS.sound_effects.PLAYER_MOVE,
            gameOver: GAME_ASSETS.sound_effects.GAME_OVER,
            win: GAME_ASSETS.sound_effects.WIN,
            spawnAnim: GAME_ASSETS.sound_effects.SPAWN_ANIM,
            pocketDust: GAME_ASSETS.sound_effects.POCKET_DUST,
            spotted: GAME_ASSETS.sound_effects.SPOTTED || null,
            graveFilled: GAME_ASSETS.sound_effects.GRAVE_FILLED || null,
            graveEmptied: GAME_ASSETS.sound_effects.GRAVE_EMPTIED || null,
        };

        this.trackSource = "official";
        this.backgroundMusic = {
            normal: GAME_ASSETS.music.NORMAL,
        };
        this.officialMusic = null;
        this.kidevMusic = null;

        this.currentMusic = null;
        this.currentMusicName = null;
        this.musicMuted = false;
        this.soundMuted = false;
    }

    toggleMusicSource() {
        this.trackSource = this.trackSource === "official" ? "kidev" : "official";

        if (this.trackSource === "kidev" && this.kidevMusic) {
            this.backgroundMusic.normal = this.kidevMusic;
        } else {
            this.backgroundMusic.normal = this.officialMusic;
        }

        if (this.currentMusicName && !this.musicMuted) {
            this.playMusic(this.currentMusicName);
        }
    }

    toggleMusicMute() {
        this.musicMuted = !this.musicMuted;

        if (this.currentMusic) {
            if (this.musicMuted) {
                this.currentMusic.pause();
            } else {
                this.currentMusic.play();
            }
        }
    }

    toggleSoundMute() {
        this.soundMuted = !this.soundMuted;
    }

    playMusic(name) {
        if (this.musicMuted) {
            this.currentMusicName = name;
            return;
        }

        if (this.currentMusic) {
            this.currentMusic.pause();
            this.currentMusic.currentTime = 0;
        }

        const music = this.backgroundMusic[name];
        if (music && music instanceof Audio) {
            this.currentMusic = music;
            this.currentMusicName = name;
            this.currentMusic.volume = 0.5;
            this.currentMusic.play();
        }
    }

    playSound(name) {
        if (this.soundMuted) return;

        const sound = this.soundEffects[name];
        if (sound && sound instanceof Audio) {
            const audio = sound.cloneNode();
            audio.volume = 0.7;
            audio.play();
        }
    }

    toggleMuteMusic() {
        this.toggleMusicMute();
    }

    toggleMuteSound() {
        this.toggleSoundMute();
    }

    stopMusic() {
        if (this.currentMusic) {
            this.currentMusic.pause();
            this.currentMusic.currentTime = 0;
            this.currentMusic = null;
            this.currentMusicName = null;
        }
    }
}

class CollisionDetector {
    static checkStrictCollision(player, enemy) {
        return player.x === enemy.x && player.y === enemy.y;
    }
}

class HussyBox {
    constructor(x, y, timestamp, respawnMin, respawnMax) {
        this.x = x;
        this.y = y;
        this.renderX = x;
        this.renderY = y;

        const respawnDelay = respawnMin + Math.random() * (respawnMax - respawnMin);
        this.respawnTime = timestamp + respawnDelay;
        this.config = GAME_EVENTS_ASSETS.DEAD_HUSSY;
    }

    update(timestamp, deltaTime) {
        const lerpFactor = Math.min(1, GAME_CONFIG.INTERPOLATION_SPEED * (deltaTime / 16));
        this.renderX += (this.x - this.renderX) * lerpFactor;
        this.renderY += (this.y - this.renderY) * lerpFactor;
    }

    shouldRespawn(timestamp) {
        return timestamp >= this.respawnTime;
    }
}

class Grave {
    constructor(x, y, filled = false) {
        this.x = x;
        this.y = y;
        this.filled = filled;
        this.filledTime = null;
    }

    getConfig() {
        if (this.filled) {
            return {
                spritesheetImage: GAME_ASSETS.graves.sheetImage,
                index: GAME_ASSETS.graves.indexFilled,
            };
        } else {
            return {
                spritesheetImage: GAME_ASSETS.graves.sheetImage,
                index: GAME_ASSETS.graves.indexEmpty,
            };
        }
    }

    fill(timestamp) {
        if (!this.filled) {
            this.filled = true;
            this.filledTime = timestamp;
            return true;
        }
        return false;
    }

    empty() {
        if (this.filled) {
            this.filled = false;
            this.filledTime = null;
            return true;
        }
        return false;
    }

    shouldEmpty(timestamp, infiniteMode, respawnTime = 30000) {
        if (!infiniteMode || !this.filled || !this.filledTime) {
            return false;
        }
        return timestamp - this.filledTime >= respawnTime;
    }

    getCountdownNumber(timestamp, infiniteMode, respawnTime = 30000) {
        if (!infiniteMode || !this.filled || !this.filledTime) {
            return null;
        }

        const timeElapsed = timestamp - this.filledTime;
        const timeRemaining = respawnTime - timeElapsed;

        // Show countdown for last 10 seconds (9->0)
        if (timeRemaining <= 10000 && timeRemaining > 0) {
            return Math.floor(timeRemaining / 1000);
        }

        return null;
    }
}

class Julia {
    constructor(x, y, lookMin, lookMax) {
        this.x = x;
        this.y = y;
        this.renderX = x;
        this.renderY = y;
        this.config = ENEMY_CONFIG[ENEMY_TYPES.ENEMY_JULIA];
        this.lookingRight = Math.random() < 0.5;

        this.lookMin = lookMin;
        this.lookMax = lookMax;
        this.nextLookChangeTime = this.getNextLookChangeTime(performance.now());
        this.dotAnimTriggered = false;
        this.shouldTriggerDotAnim = false;

        if (this.config.frames && this.config.spritesheetImage) {
            this.updateSprite();
        } else {
            this.animator = null;
        }
    }

    getNextLookChangeTime(currentTime) {
        const interval = this.lookMin + Math.random() * (this.lookMax - this.lookMin);
        return currentTime + interval;
    }

    updateSprite() {
        const frameKey = this.lookingRight ? "right" : "left";
        if (this.config.frames[frameKey]) {
            this.animator = new SpriteAnimator(
                this.config.spritesheetImage,
                this.config.frames[frameKey],
                this.config.speed,
            );
        }
    }

    update(timestamp, deltaTime) {
        // Check if we should trigger DOT_DOT_ANIM (1.5s before look change)
        const timeUntilChange = this.nextLookChangeTime - timestamp;
        if (timeUntilChange <= 1500 && timeUntilChange > 0 && !this.dotAnimTriggered) {
            this.shouldTriggerDotAnim = true;
            this.dotAnimTriggered = true;
        }

        if (timestamp >= this.nextLookChangeTime) {
            this.lookingRight = !this.lookingRight;
            this.nextLookChangeTime = this.getNextLookChangeTime(timestamp);
            this.dotAnimTriggered = false; // Reset for next cycle
            this.updateSprite();
        }

        if (this.animator) {
            this.animator.update(timestamp);
        }

        const lerpFactor = Math.min(1, GAME_CONFIG.INTERPOLATION_SPEED * (deltaTime / 16));
        this.renderX += (this.x - this.renderX) * lerpFactor;
        this.renderY += (this.y - this.renderY) * lerpFactor;
    }

    canSeePlayer(player, boxes = []) {
        if (player.y > GAME_CONFIG.PLAYER_MIN_Y) {
            return false;
        }

        if (player.x === this.x) {
            return false;
        }

        if (player.x < this.x && this.lookingRight) {
            return false;
        }
        if (player.x > this.x && !this.lookingRight) {
            return false;
        }

        const minX = Math.min(this.x, player.x);
        const maxX = Math.max(this.x, player.x);

        for (const box of boxes) {
            if (box.y === player.y && box.x > minX && box.x < maxX) {
                return false; // Line of sight blocked by box
            }
        }

        return true;
    }
}

class AshleyOnDutyEp2Game {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.player = null;
        this.julia = null;
        this.graves = [];
        this.hussies = [];
        this.hussyBoxes = [];
        this.animations = [];

        this.gameState = "beforeGame";
        this.difficulty = "normal";
        this.infiniteMode = false;

        this.keyLayout = null;
        this.audioManager = null;
        this.hardcoreAudio = null;
        this.backgroundImage = null;
        this.playerSpritesheet = null;

        this.cameraY = 0;
        this.cameraRenderY = 0;
        this.lastTimestamp = 0;
        this.lastPocketDustTime = 0;

        this.canvasWidth = 0;
        this.canvasHeight = 0;
        this.bgScale = 1;

        this.waitingForFirstInput = false;
        this.playerVisible = false;
        this.spawnAnimPlaying = false;

        this.boundHandleKeyDown = this.handleKeyDown.bind(this);
        this.boundGameLoop = this.gameLoop.bind(this);
        this.animationFrameId = null;

        this.gameAssets = null;

        this.gameStartTime = 0;
        this.gameTotalTime = 0;
        this.gameTimerActive = false;
        this.lastTimerUpdate = 0;

        this.godMode = false;
        this.playerFilledGraves = 0; // Track graves filled by player (not initial filled)
    }

    async init() {
        const episodeConfig = getEpisode2Config();

        window.GAME_CONFIG = episodeConfig.GAME_CONFIG;
        window.GAME_ASSETS = episodeConfig.GAME_ASSETS;
        window.DIFFICULTY_CONFIGS = episodeConfig.DIFFICULTY_CONFIGS;
        window.ENEMY_TYPES = episodeConfig.ENEMY_TYPES;
        window.ENEMY_TYPES_NAME = episodeConfig.ENEMY_TYPES_NAME;
        window.GAME_EVENTS_ASSETS = episodeConfig.GAME_EVENTS_ASSETS;
        window.ENEMY_CONFIG = episodeConfig.ENEMY_CONFIG;
        window.DIRECTIONS = episodeConfig.DIRECTIONS;
        window.KEY_LAYOUTS = episodeConfig.KEY_LAYOUTS;

        this.keyLayout = window.KEY_LAYOUTS.QWERTY;
        this.audioManager = new AudioManager();

        this.gameAssets = await window.memoryManager.loadSavedAssets();

        this.createGameUI();
        await this.loadAssets();
        this.setupCanvas();

        const config = this.getDifficultyConfig();
        this.player = new Player(
            GAME_CONFIG.PLAYER_START_X,
            GAME_CONFIG.PLAYER_START_Y,
            this.playerSpritesheet,
            GAME_ASSETS.player_sprite.indices,
            config.PLAYER_INITIAL_SPEED,
        );

        this.player.useDirectionalSprites = true;
        this.player.spriteConfig = GAME_ASSETS.player_sprite;
        this.player.updateDirectionalFrames();

        const scaledPlayAreaY = GAME_CONFIG.PLAY_AREA_Y * this.bgScale;
        const scaledCellSize = GAME_CONFIG.CELL_SIZE * this.bgScale;
        const playerScreenY = scaledPlayAreaY + GAME_CONFIG.PLAYER_START_Y * scaledCellSize;
        this.cameraY = playerScreenY - this.canvasHeight / 2;

        const scaledBgHeight = this.backgroundImage ? this.backgroundImage.height * this.bgScale : this.canvasHeight;
        const maxCameraY = scaledBgHeight - this.canvasHeight;
        this.cameraY = Math.max(0, Math.min(this.cameraY, maxCameraY));
        this.cameraRenderY = this.cameraY;

        window.addEventListener("keydown", this.boundHandleKeyDown);

        this.boundHandleVisibilityChange = this.handleVisibilityChange.bind(this);
        this.boundHandleBlur = this.handleBlur.bind(this);
        document.addEventListener("visibilitychange", this.boundHandleVisibilityChange);
        window.addEventListener("blur", this.boundHandleBlur);

        this.gameState = "beforeGame";
        this.lastTimestamp = performance.now();
        this.animationFrameId = requestAnimationFrame(this.boundGameLoop);

        this.showBeforeGameScreen();
    }

    getDifficultyConfig() {
        return DIFFICULTY_CONFIGS[this.difficulty] || DIFFICULTY_CONFIGS.normal;
    }

    initializeGame() {
        const config = this.getDifficultyConfig();

        this.playerFilledGraves = 0;

        this.graves = [];
        const gravePositions = [...GAME_CONFIG.GRAVE_POSITIONS];
        gravePositions.sort(() => Math.random() - 0.5);

        for (let i = 0; i < gravePositions.length; i++) {
            const pos = gravePositions[i];
            const filled = i < config.INITIAL_FILLED_GRAVES;
            this.graves.push(new Grave(pos.x, pos.y, filled));
        }

        this.julia = new Julia(
            GAME_CONFIG.JULIA_X,
            GAME_CONFIG.JULIA_Y,
            config.JULIA_LOOK_INTERVAL_MIN,
            config.JULIA_LOOK_INTERVAL_MAX,
        );

        this.hussies = [];
        this.hussyBoxes = [];
    }

    startGame() {
        this.stopHardcoreMusic();

        const config = this.getDifficultyConfig();

        this.player = new Player(
            GAME_CONFIG.PLAYER_START_X,
            GAME_CONFIG.PLAYER_START_Y,
            this.playerSpritesheet,
            GAME_ASSETS.player_sprite.indices,
            config.PLAYER_INITIAL_SPEED,
        );

        this.player.useDirectionalSprites = true;
        this.player.spriteConfig = GAME_ASSETS.player_sprite;
        this.player.updateDirectionalFrames();

        this.initializeGame();

        const scaledPlayAreaY = GAME_CONFIG.PLAY_AREA_Y * this.bgScale;
        const scaledCellSize = GAME_CONFIG.CELL_SIZE * this.bgScale;
        const playerScreenY = scaledPlayAreaY + GAME_CONFIG.PLAYER_START_Y * scaledCellSize;
        this.cameraY = playerScreenY - this.canvasHeight / 2;

        const scaledBgHeight = this.backgroundImage ? this.backgroundImage.height * this.bgScale : this.canvasHeight;
        const maxCameraY = scaledBgHeight - this.canvasHeight;
        this.cameraY = Math.max(0, Math.min(this.cameraY, maxCameraY));
        this.cameraRenderY = this.cameraY;

        this.animations = [];
        this.lastPocketDustTime = 0;

        const startBtn = document.getElementById("tarSoulsStartBtn");
        const pauseBtn = document.getElementById("tarSoulsPauseBtn");
        const restartBtn = document.getElementById("tarSoulsRestartBtn");
        const leftSidebar = document.getElementById("tarSoulsLeftSidebar");
        const rightSidebar = document.getElementById("tarSoulsInstructionsPanel");

        const easyBtn = document.getElementById("tarSoulsDiffEasy");
        const normalBtn = document.getElementById("tarSoulsDiffNormal");
        const hardBtn = document.getElementById("tarSoulsDiffHard");
        const infiniteBtn = document.getElementById("tarSoulsDiffInfinite");
        if (easyBtn) easyBtn.disabled = true;
        if (normalBtn) normalBtn.disabled = true;
        if (hardBtn) hardBtn.disabled = true;
        if (infiniteBtn) infiniteBtn.disabled = true;

        if (startBtn) startBtn.style.display = "none";
        if (pauseBtn) pauseBtn.style.display = "block";
        if (restartBtn) restartBtn.style.display = "block";
        if (leftSidebar) leftSidebar.style.display = "none";
        if (rightSidebar) rightSidebar.style.display = "none";

        this.spawnAnimPlaying = true;
        this.playerVisible = false;
        const spawnAnim = new GameAnimation(
            GAME_EVENTS_ASSETS.SPAWN_ANIM,
            GAME_CONFIG.PLAYER_START_X,
            GAME_CONFIG.PLAYER_START_Y,
            false,
        );
        this.animations.push(spawnAnim);

        for (const grave of this.graves) {
            if (!grave.filled) {
                const poofAnim = new GameAnimation(GAME_EVENTS_ASSETS.POOF_ANIM, grave.x, 2, false, () => {
                    const hussy = new Enemy(ENEMY_TYPES.ENEMY_HUSSY, grave.x, 2);
                    hussy.renderX = grave.x;
                    hussy.renderY = 2;
                    this.hussies.push(hussy);
                });
                this.animations.push(poofAnim);
            }
        }

        this.gameState = "playing";
        this.audioManager.playMusic("normal");
        this.lastTimestamp = performance.now();
        this.startTimer(this.lastTimestamp);
    }

    handleKeyDown(event) {
        const code = event.code;

        // Handle pause keys (ESC, P) in playing or paused state
        if (code === "Escape" || code === "KeyP") {
            if (this.gameState === "playing" || this.gameState === "paused") {
                this.togglePause();
                event.preventDefault();
                return;
            }
        }

        if (this.gameState !== "playing") return;

        let directionPressed = false;

        if (this.keyLayout.UP.includes(code)) {
            this.player.queueDirection(DIRECTIONS.UP);
            directionPressed = true;
            event.preventDefault();
        } else if (this.keyLayout.DOWN.includes(code)) {
            this.player.queueDirection(DIRECTIONS.DOWN);
            directionPressed = true;
            event.preventDefault();
        } else if (this.keyLayout.LEFT.includes(code)) {
            this.player.queueDirection(DIRECTIONS.LEFT);
            directionPressed = true;
            event.preventDefault();
        } else if (this.keyLayout.RIGHT.includes(code)) {
            this.player.queueDirection(DIRECTIONS.RIGHT);
            directionPressed = true;
            event.preventDefault();
        }

        if (directionPressed && this.waitingForFirstInput) {
            this.waitingForFirstInput = false;
        }

        // Handle attack keys (Space, E)
        if (code === "Space" || code === "KeyE") {
            this.throwPocketDust(performance.now());
            event.preventDefault();
        }

        // Handle god mode toggle (G key) when debug is enabled
        if (code === "KeyG" && GAME_CONFIG.DEBUG) {
            this.godMode = !this.godMode;
            console.log(`[GOD MODE] ${this.godMode ? "ENABLED" : "DISABLED"}`);
            event.preventDefault();
        }
    }

    throwPocketDust(timestamp) {
        const now = performance.now();

        if (now - this.lastPocketDustTime < GAME_CONFIG.POCKET_DUST_COOLDOWN) {
            return;
        }

        const dustPositions = [
            {
                x: this.player.x + this.player.direction.x,
                y: this.player.y + this.player.direction.y,
            },
            {
                x: this.player.x + this.player.direction.x * 2,
                y: this.player.y + this.player.direction.y * 2,
            },
        ];

        const validPositions = dustPositions.filter(
            (pos) => pos.x >= 0 && pos.x < GAME_CONFIG.GRID_WIDTH && pos.y >= 0 && pos.y < GAME_CONFIG.GRID_HEIGHT,
        );

        if (validPositions.length === 0) {
            return;
        }

        this.lastPocketDustTime = now;
        this.audioManager.playSound("pocketDust");

        for (const pos of validPositions) {
            const dustAnim = new GameAnimation(GAME_EVENTS_ASSETS.POCKET_DUST, pos.x, pos.y, false);
            this.animations.push(dustAnim);

            for (let i = this.hussies.length - 1; i >= 0; i--) {
                const hussy = this.hussies[i];
                if (hussy.x === pos.x && hussy.y === pos.y) {
                    const config = this.getDifficultyConfig();
                    const box = new HussyBox(
                        hussy.x,
                        hussy.y,
                        timestamp,
                        config.HUSSY_BOX_RESPAWN_MIN,
                        config.HUSSY_BOX_RESPAWN_MAX,
                    );
                    this.hussyBoxes.push(box);
                    this.hussies.splice(i, 1);
                }
            }
        }
    }

    update(deltaTime, timestamp) {
        if (this.gameState !== "playing") return;

        this.updateTimer(timestamp);

        for (let i = this.animations.length - 1; i >= 0; i--) {
            this.animations[i].update(timestamp, deltaTime);
            if (this.animations[i].finished) {
                const anim = this.animations[i];

                if (anim.onComplete) {
                    anim.onComplete();
                }

                this.animations.splice(i, 1);

                if (this.spawnAnimPlaying) {
                    this.spawnAnimPlaying = false;
                    this.playerVisible = true;
                    this.waitingForFirstInput = true;
                }
            }
        }

        if (this.spawnAnimPlaying || this.waitingForFirstInput) {
            this.player.update(timestamp, deltaTime);

            if (this.julia) {
                this.julia.update(timestamp, deltaTime);
            }

            for (const hussy of this.hussies) {
                hussy.update(timestamp, deltaTime);
                hussy.lastMoveTime = timestamp;
            }

            for (const box of this.hussyBoxes) {
                box.update(timestamp, deltaTime);
            }

            return;
        }

        if (this.julia) {
            this.julia.update(timestamp, deltaTime);

            // Trigger DOT_DOT_ANIM 1.5s before Julia changes direction
            if (this.julia.shouldTriggerDotAnim) {
                const dotAnim = new GameAnimation(
                    GAME_EVENTS_ASSETS.DOT_DOT_ANIM,
                    this.julia.x,
                    this.julia.y, // Position on top of Julia
                    false,
                );
                this.animations.push(dotAnim);
                this.julia.shouldTriggerDotAnim = false;
            }
        }

        // Update hussy boxes and check for respawn
        for (let i = this.hussyBoxes.length - 1; i >= 0; i--) {
            const box = this.hussyBoxes[i];
            box.update(timestamp, deltaTime);

            if (box.shouldRespawn(timestamp) && !box.respawning) {
                box.respawning = true;
                const poofAnim = new GameAnimation(GAME_EVENTS_ASSETS.POOF_ANIM, box.x, box.y, false, () => {
                    const hussy = new Enemy(ENEMY_TYPES.ENEMY_HUSSY, box.x, box.y);
                    hussy.renderX = box.x;
                    hussy.renderY = box.y;
                    this.hussies.push(hussy);
                    const index = this.hussyBoxes.indexOf(box);
                    if (index !== -1) {
                        this.hussyBoxes.splice(index, 1);
                    }
                });
                this.animations.push(poofAnim);
            }
        }

        if (this.infiniteMode) {
            const config = this.getDifficultyConfig();
            const graveRespawnTime = config.GRAVE_RESPAWN_TIME || 30000;

            for (const grave of this.graves) {
                if (grave.shouldEmpty(timestamp, this.infiniteMode, graveRespawnTime)) {
                    if (!grave.respawning && grave.empty()) {
                        grave.respawning = true; // Mark as respawning
                        this.audioManager.playSound("graveEmptied");
                        const poofAnim = new GameAnimation(GAME_EVENTS_ASSETS.POOF_ANIM, grave.x, 2, false, () => {
                            const hussy = new Enemy(ENEMY_TYPES.ENEMY_HUSSY, grave.x, 2);
                            hussy.renderX = grave.x;
                            hussy.renderY = 2;
                            this.hussies.push(hussy);
                            grave.respawning = false;
                        });
                        this.animations.push(poofAnim);
                    }
                }
            }
        }

        // Move player
        const playerMoved = this.player.move(timestamp);
        this.player.update(timestamp, deltaTime);

        if (playerMoved) {
            this.audioManager.playSound("playerMove");

            // Check wall collisions
            const config = this.getDifficultyConfig();
            const hitSideWall = this.player.x < 0 || this.player.x >= GAME_CONFIG.GRID_WIDTH;
            const hitTopBottomWall = this.player.y < 0 || this.player.y >= GAME_CONFIG.GRID_HEIGHT;

            if (hitTopBottomWall) {
                this.gameOver("Fell into the void!");
                return;
            }

            if (hitSideWall) {
                if (config.WALL_BEHAVIOR === "teleport") {
                    // Teleport to opposite side
                    this.player.x = this.player.x < 0 ? GAME_CONFIG.GRID_WIDTH - 1 : 0;
                    this.player.renderX = this.player.x;
                } else if (config.WALL_BEHAVIOR === "push_down") {
                    // Push player down
                    this.player.x = Math.max(0, Math.min(GAME_CONFIG.GRID_WIDTH - 1, this.player.x));
                    this.player.y += 1;
                    this.player.renderX = this.player.x;
                    this.player.renderY = this.player.y;
                    if (this.player.y >= GAME_CONFIG.GRID_HEIGHT) {
                        this.gameOver("Fell into the void!");
                        return;
                    }
                } else {
                    // game_over for hard/infinite
                    this.gameOver("Hit the wall!");
                    return;
                }
            }

            // Check Julia vision (boxes can block line of sight)
            if (this.julia && this.julia.canSeePlayer(this.player, this.hussyBoxes)) {
                if (this.godMode) {
                    console.log(
                        `[GOD MODE] Prevented death: Julia spotted you at (${this.player.x}, ${this.player.y})`,
                    );
                } else {
                    this.audioManager.playSound("spotted");
                    const spottedAnim = new GameAnimation(
                        GAME_EVENTS_ASSETS.SPOTTED_ANIM,
                        this.player.x,
                        this.player.y,
                        false,
                    );
                    this.animations.push(spottedAnim);
                    this.gameOver("Julia spotted you!");
                    return;
                }
            }

            const boxIndex = this.hussyBoxes.findIndex((box) => box.x === this.player.x && box.y === this.player.y);

            if (boxIndex !== -1) {
                const box = this.hussyBoxes[boxIndex];
                const config = this.getDifficultyConfig();
                const pushDistance = config.BOX_PUSH_DISTANCE;

                const newBoxX = box.x + this.player.direction.x * pushDistance;
                const newBoxY = box.y + this.player.direction.y * pushDistance;

                let otherBoxIndex = -1;
                let collisionX = newBoxX;
                let collisionY = newBoxY;

                for (let step = 1; step <= pushDistance; step++) {
                    const checkX = box.x + this.player.direction.x * step;
                    const checkY = box.y + this.player.direction.y * step;

                    const foundBoxIndex = this.hussyBoxes.findIndex(
                        (b, idx) => idx !== boxIndex && b.x === checkX && b.y === checkY,
                    );

                    if (foundBoxIndex !== -1) {
                        otherBoxIndex = foundBoxIndex;
                        collisionX = checkX;
                        collisionY = checkY;
                        break;
                    }
                }

                if (otherBoxIndex !== -1) {
                    const otherBox = this.hussyBoxes[otherBoxIndex];

                    const adjacentPositions = [
                        { x: collisionX + 1, y: collisionY },
                        { x: collisionX - 1, y: collisionY },
                        { x: collisionX, y: collisionY + 1 },
                        { x: collisionX, y: collisionY - 1 },
                    ].filter((pos) => {
                        if (pos.x < 0 || pos.x >= GAME_CONFIG.GRID_WIDTH) return false;
                        if (pos.y < 0 || pos.y >= GAME_CONFIG.GRID_HEIGHT) return false;
                        if (this.hussies.some((h) => h.x === pos.x && h.y === pos.y)) return false;
                        if (this.hussyBoxes.some((b) => b.x === pos.x && b.y === pos.y)) return false;
                        return true;
                    });

                    if (adjacentPositions.length >= 2) {
                        const pos1 = adjacentPositions[0];
                        const pos2 = adjacentPositions[1];

                        const hussy1 = new Enemy(ENEMY_TYPES.ENEMY_HUSSY, pos1.x, pos1.y);
                        hussy1.renderX = pos1.x;
                        hussy1.renderY = pos1.y;
                        this.hussies.push(hussy1);

                        const hussy2 = new Enemy(ENEMY_TYPES.ENEMY_HUSSY, pos2.x, pos2.y);
                        hussy2.renderX = pos2.x;
                        hussy2.renderY = pos2.y;
                        this.hussies.push(hussy2);

                        const poof1 = new GameAnimation(GAME_EVENTS_ASSETS.POOF_ANIM, pos1.x, pos1.y, false);
                        const poof2 = new GameAnimation(GAME_EVENTS_ASSETS.POOF_ANIM, pos2.x, pos2.y, false);
                        this.animations.push(poof1);
                        this.animations.push(poof2);

                        this.hussyBoxes.splice(Math.max(boxIndex, otherBoxIndex), 1);
                        this.hussyBoxes.splice(Math.min(boxIndex, otherBoxIndex), 1);
                    } else {
                        for (let i = 0; i < Math.min(adjacentPositions.length, 2); i++) {
                            const pos = adjacentPositions[i];
                            const hussy = new Enemy(ENEMY_TYPES.ENEMY_HUSSY, pos.x, pos.y);
                            hussy.renderX = pos.x;
                            hussy.renderY = pos.y;
                            this.hussies.push(hussy);

                            const poof = new GameAnimation(GAME_EVENTS_ASSETS.POOF_ANIM, pos.x, pos.y, false);
                            this.animations.push(poof);
                        }

                        this.hussyBoxes.splice(Math.max(boxIndex, otherBoxIndex), 1);
                        this.hussyBoxes.splice(Math.min(boxIndex, otherBoxIndex), 1);
                    }

                    return;
                }

                // Check if box path crosses through grave positions (y=0 or y=1)
                const crossesGrave =
                    this.player.direction.y < 0 && // Moving up
                    box.y >= 0 && // Started at or below grave level
                    newBoxY <= 1; // Ends at or above grave level (includes overshooting)

                if (crossesGrave) {
                    const grave = this.graves.find((g) => g.x === box.x);
                    if (grave && !grave.filled) {
                        grave.fill(timestamp);
                        this.playerFilledGraves++; // Track player-filled graves
                        this.audioManager.playSound("graveFilled");
                        this.hussyBoxes.splice(boxIndex, 1);

                        if (this.checkWinCondition()) {
                            this.win();
                            return;
                        }
                        return;
                    }
                }

                // Check boundaries
                if (newBoxY < 0 || newBoxY >= GAME_CONFIG.GRID_HEIGHT) {
                    this.gameOver("Box fell into the void!");
                    return;
                }

                if (newBoxX < 0 || newBoxX >= GAME_CONFIG.GRID_WIDTH) {
                    if (config.WALL_BEHAVIOR === "teleport") {
                        box.x = newBoxX < 0 ? GAME_CONFIG.GRID_WIDTH - 1 : 0;
                        box.y = newBoxY;
                    } else if (config.WALL_BEHAVIOR === "push_down") {
                        box.x = Math.max(0, Math.min(GAME_CONFIG.GRID_WIDTH - 1, newBoxX));
                        box.y = newBoxY + 1;
                        if (box.y >= GAME_CONFIG.GRID_HEIGHT) {
                            this.gameOver("Box fell into the void!");
                            return;
                        }
                    } else {
                        this.gameOver("Box hit the wall!");
                        return;
                    }
                } else {
                    box.x = newBoxX;
                    box.y = newBoxY;
                }

                if (box.y === 0 || box.y === 1) {
                    const grave = this.graves.find((g) => g.x === box.x);
                    if (grave && !grave.filled) {
                        grave.fill(timestamp);
                        this.playerFilledGraves++;
                        this.audioManager.playSound("graveFilled");
                        this.hussyBoxes.splice(boxIndex, 1);

                        if (this.checkWinCondition()) {
                            this.win();
                            return;
                        }
                    }
                }
            }
        }

        // Update and move hussies
        for (let i = this.hussies.length - 1; i >= 0; i--) {
            const hussy = this.hussies[i];
            hussy.move(timestamp, this.player, this.hussies, this.hussyBoxes);
            hussy.update(timestamp, deltaTime);

            // Check collision with player
            if (CollisionDetector.checkStrictCollision(this.player, hussy)) {
                if (this.godMode) {
                    console.log(`[GOD MODE] Prevented death: Hussy collision at (${this.player.x}, ${this.player.y})`);
                } else {
                    this.gameOver("You were infected by a hussy!");
                    return;
                }
            }
        }

        this.updateCamera(deltaTime);
    }

    checkWinCondition() {
        if (this.infiniteMode) {
            return false;
        }
        return this.graves.every((grave) => grave.filled);
    }

    updateCamera(deltaTime) {
        const scaledPlayAreaY = GAME_CONFIG.PLAY_AREA_Y * this.bgScale;
        const scaledCellSize = GAME_CONFIG.CELL_SIZE * this.bgScale;
        const playerScreenY = scaledPlayAreaY + this.player.renderY * scaledCellSize;
        const targetCameraY = playerScreenY - this.canvasHeight / 2;

        const scaledBgHeight = this.backgroundImage ? this.backgroundImage.height * this.bgScale : this.canvasHeight;
        const maxCameraY = scaledBgHeight - this.canvasHeight;
        this.cameraY = Math.max(0, Math.min(targetCameraY, maxCameraY));

        const cameraLerpFactor = 0.1;
        this.cameraRenderY += (this.cameraY - this.cameraRenderY) * cameraLerpFactor;
    }

    gameOver(reason) {
        this.gameState = "lost";
        this.audioManager.playSound("gameOver");
        this.pauseTimer();
        this.showGameOverScreen(reason);
    }

    win() {
        this.gameState = "won";
        this.audioManager.playSound("win");
        this.pauseTimer();

        this.saveBestScore();

        this.showWinScreen();
    }

    showGameOverScreen(reason) {
        const overlay = document.createElement("div");
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 2000;
        `;

        const title = document.createElement("h1");
        title.style.cssText = `
            font-family: 'TCOAAL', monospace;
            font-size: 3.2vmax;
            color: var(--red, #ff4444);
            margin-bottom: 1.11vmax;
        `;
        title.textContent = "GAME OVER";

        const message = document.createElement("p");
        message.style.cssText = `
            font-family: 'TCOAAL', monospace;
            font-size: 1.2vmax;
            color: var(--txt-color, #ddd);
            margin-bottom: 40px;
            text-align: center;
        `;

        if (this.infiniteMode) {
            message.innerHTML = `${reason}<br><br>Time: ${this.formatTime(this.gameTotalTime)}<br>Graves filled: ${this.playerFilledGraves}`;
        } else {
            message.textContent = reason;
        }

        const restartButton = document.createElement("button");
        restartButton.className = "tcoaal-button-tarsouls";
        restartButton.textContent = "Restart";
        restartButton.onclick = () => {
            overlay.remove();
            this.restart();
        };

        const menuButton = document.createElement("button");
        menuButton.className = "tcoaal-button-tarsouls";
        menuButton.textContent = "Back to menu";
        menuButton.style.marginLeft = "10px";
        menuButton.onclick = () => this.backToMenu();

        const buttonContainer = document.createElement("div");
        buttonContainer.style.cssText = "display: flex; gap: 10px;";
        buttonContainer.appendChild(restartButton);
        buttonContainer.appendChild(menuButton);

        overlay.appendChild(title);
        overlay.appendChild(message);
        overlay.appendChild(buttonContainer);
        document.body.appendChild(overlay);
    }

    showWinScreen() {
        const overlay = document.createElement("div");
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.9);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 2000;
        `;

        const title = document.createElement("h1");
        title.style.cssText = `
            font-family: 'TCOAAL', monospace;
            font-size: 3.2vmax;
            color: var(--green, #4a9d4a);
            margin-bottom: 1.11vmax;
        `;
        title.textContent = "YOU WIN!";

        const message = document.createElement("p");
        message.style.cssText = `
            font-family: 'TCOAAL', monospace;
            font-size: 1.2vmax;
            color: var(--txt-color, #ddd);
            margin-bottom: 40px;
        `;
        message.textContent = `All graves filled! Time: ${this.formatTime(this.gameTotalTime)}`;

        const restartButton = document.createElement("button");
        restartButton.className = "tcoaal-button-tarsouls";
        restartButton.textContent = "Play Again";
        restartButton.onclick = () => {
            overlay.remove();
            this.restart();
        };

        const menuButton = document.createElement("button");
        menuButton.className = "tcoaal-button-tarsouls";
        menuButton.textContent = "Back to menu";
        menuButton.style.marginLeft = "10px";
        menuButton.onclick = () => this.backToMenu();

        const buttonContainer = document.createElement("div");
        buttonContainer.style.cssText = "display: flex; gap: 10px;";
        buttonContainer.appendChild(restartButton);
        buttonContainer.appendChild(menuButton);

        overlay.appendChild(title);
        overlay.appendChild(message);
        overlay.appendChild(buttonContainer);
        document.body.appendChild(overlay);
    }

    showBeforeGameScreen() {
        const instructionsPanel = document.getElementById("tarSoulsInstructionsPanel");
        if (!instructionsPanel) return;

        const createSpriteIcon = (type, size = 32) => {
            const canvas = document.createElement("canvas");
            canvas.width = size;
            canvas.height = size;
            canvas.style.cssText = `vertical-align: middle; margin-right: 8px; image-rendering: pixelated; display: inline-block;`;
            const ctx = canvas.getContext("2d");

            if (typeof type === "number" && ENEMY_CONFIG[type] && ENEMY_CONFIG[type].spritesheetImage) {
                const config = ENEMY_CONFIG[type];
                const spritesheet = config.spritesheetImage;
                const frame = config.frames.forward[0];
                const gridCols = spritesheet.gridCols || 12;
                const gridRows = spritesheet.gridRows || 8;
                const spriteWidth = spritesheet.width / gridCols;
                const spriteHeight = spritesheet.height / gridRows;
                const col = frame % gridCols;
                const row = Math.floor(frame / gridCols);

                const is2x1 = spriteHeight > spriteWidth * 1.5;
                const is1x2 = spriteHeight > spriteWidth * 1.5;
                const scale = config.spriteScale || 1;
                let drawWidth = size;
                let drawHeight = size;
                let drawX = 0;
                let drawY = 0;

                if (is2x1) {
                    drawWidth = (size / 2) * scale;
                    drawHeight = size * scale;
                    drawX = (size - drawWidth) / 2;
                    drawY = (size - drawHeight) / 2;
                } else if (is1x2) {
                    drawWidth = (size / 2) * scale;
                    drawHeight = size * scale;
                    drawX = (size - drawWidth) / 2;
                    drawY = (size - drawHeight) / 2;
                }

                ctx.drawImage(
                    spritesheet,
                    col * spriteWidth,
                    row * spriteHeight,
                    spriteWidth,
                    spriteHeight,
                    drawX,
                    drawY,
                    drawWidth,
                    drawHeight,
                );
            } else {
                const colors = [Color.WHITE, Color.DEFAULT, Color.GREEN, Color.PURPLE];
                ctx.fillStyle = colors[type] || Color.DEFAULT;
                ctx.fillRect(0, 0, size, size);
            }

            return canvas;
        };

        const juliaIcon = createSpriteIcon(ENEMY_TYPES.ENEMY_JULIA);
        const hussyIcon = createSpriteIcon(ENEMY_TYPES.ENEMY_HUSSY);

        instructionsPanel.innerHTML = `
            <h2 style="color: var(--purple, #e2829a); margin-top: 2vmax; margin-bottom:0.5vmax; font-size:1.2vmax;display:flex; justify-content:center;">Description</h2>
            <p style="margin-bottom: 1.11vmax;text-align:justify;">The hussies are resurrecting! Ashley must dust them off back into boxes, and push those into graves before they break free! To make things worse, the bitch Julia is there and ready to call the cops if she sees Ashley.</p>
            <p style="margin-bottom: 1.11vmax;"><ul style="padding-left: 0; margin-bottom: 1.11vmax;">
            <li>Use pocket dust to turn hussies into boxes</li>
            <li>Push boxes into graves at the top of the area</li>
            <li>Don't let Julia see you when you're in the top area</li>
            <li>Boxes can be used to sneak in the top area more easily</li>
            <li>Hussies break free from boxes after a delay</li>
            <li>Fill all empty graves to win!</li>
            </ul></p>

            <h2 style="color: var(--purple, #e2829a); margin-bottom:0.5vmax;margin-top:2vmax; font-size: 1.2vmax;display:flex; justify-content:center;">Characters</h2>
            <div style="margin-bottom: 15px;">
                <div id="juliaEntity" style="margin-bottom: 12px; display: flex; align-items: center; gap: 12px;">
                    <div><strong>Julia</strong> - Watches left and right. Don't let her see you in the top area! She can't see behind boxes.</div>
                </div>
                <div id="hussyEntity" style="margin-bottom: 12px; display: flex; align-items: center; gap: 12px;">
                    <div><strong>Hussy</strong> - Tracks and chases you. Turn them into boxes with pocket dust and bury them, again! Don't let them touch you!</div>
                </div>
            </div>

            <h2 style="color: var(--purple, #e2829a); margin-top: 2vmax; margin-bottom:0; font-size: 1.2vmax;display:flex;justify-content:center;">Controls</h2>
            <ul style="padding-inline-start: 0;color: var(--txt-color, #ddd); font-family: TCOAAL, monospace; font-size: 0.75vmax; line-height: 1.4; z-index: 10;padding-left: 0; margin-bottom: 1.11vmax; list-style: none; text-align: center;padding-top: 0;margin-top:0;">
                <li>Move around using <strong id="tarSoulsControlKeys">WASD</strong> or <strong style="font-size: 1.2vmax;">←↑↓→</strong></li>
                <li>Throw dust using <strong>E</strong> or <strong>SPACE</strong></li>
                <li>Pause using <strong>ESC</strong></li>
            </ul>
        `;

        const juliaDiv = instructionsPanel.querySelector("#juliaEntity");
        const hussyDiv = instructionsPanel.querySelector("#hussyEntity");

        if (juliaDiv) juliaDiv.insertBefore(juliaIcon, juliaDiv.firstChild);
        if (hussyDiv) hussyDiv.insertBefore(hussyIcon, hussyDiv.firstChild);

        this.updateRulesForDifficulty();
        this.displayBestScore();

        const leftSidebar = document.getElementById("tarSoulsLeftSidebar");
        const rightSidebar = document.getElementById("tarSoulsInstructionsPanel");

        if (leftSidebar) leftSidebar.style.display = "flex";
        if (rightSidebar) rightSidebar.style.display = "block";
    }

    updateRulesForDifficulty() {
        const rulesList = document.getElementById("tarSoulsRulesList");
        if (!rulesList) return;

        rulesList.innerHTML = "";

        const config = this.getDifficultyConfig();

        let commonRules;
        if (this.difficulty === "infinite") {
            commonRules = [
                `Win by having all hussies buried at once`, // ${(config.GRAVE_RESPAWN_TIME || 30000) / 1000}s`,
                `Don't get spotted by Julia`,
            ];
        } else {
            const totalGraves = GAME_CONFIG.GRAVE_POSITIONS.length;
            const initialFilled = config.INITIAL_FILLED_GRAVES;
            const gravesToFill = totalGraves - initialFilled;
            commonRules = [
                gravesToFill === 9
                    ? `Fill the graves with boxes`
                    : `Fill the remaining ${gravesToFill} graves with boxes`, // (${initialFilled} already filled)`,
                `Don't get spotted by Julia`,
            ];
        }

        const wallBehaviorText = {
            teleport: "get to the opposite side",
            push_down: "get forced down",
            game_over: "die",
        };

        const difficultyRules = [
            `When touching side walls, you ${wallBehaviorText[config.WALL_BEHAVIOR]}`,
            /*this.difficulty === "easy"
                ? `You push boxes ${config.BOX_PUSH_DISTANCE} cells`
                : this.difficulty === "normal"
                  ? `You push boxes ${config.BOX_PUSH_DISTANCE} cells`
                  : `You push boxes ${config.BOX_PUSH_DISTANCE} cell`,*/
        ];

        const hussyRespawnInfo =
            this.difficulty === "infinite"
                ? `Hussies break out of boxes and graves`
                : this.difficulty === "easy"
                  ? `Hussies break out of boxes slowly` // (${config.HUSSY_BOX_RESPAWN_MIN / 1000}-${config.HUSSY_BOX_RESPAWN_MAX / 1000}s)`
                  : this.difficulty === "normal"
                    ? `Hussies break out of boxes reasonably fast` // (${config.HUSSY_BOX_RESPAWN_MIN / 1000}-${config.HUSSY_BOX_RESPAWN_MAX / 1000}s)`
                    : `Hussies break out of boxes quickly`; // (${config.HUSSY_BOX_RESPAWN_MIN / 1000}-${config.HUSSY_BOX_RESPAWN_MAX / 1000}s)`;

        commonRules.forEach((rule) => {
            const li = document.createElement("li");
            li.innerHTML = `${rule}`;
            rulesList.appendChild(li);
        });

        difficultyRules.forEach((rule) => {
            const li = document.createElement("li");
            li.innerHTML = `${rule}`;
            rulesList.appendChild(li);
        });

        const hussyLi = document.createElement("li");
        hussyLi.innerHTML = hussyRespawnInfo;
        rulesList.appendChild(hussyLi);
    }

    displayBestScore() {
        const bestScoreTitle = document.getElementById("tarSoulsBestScoreTitle");
        const bestScoreList = document.getElementById("tarSoulsBestScore");

        if (!bestScoreTitle || !bestScoreList) return;

        const bestTime = this.loadBestScore();

        if (bestTime) {
            bestScoreTitle.textContent = `Best time: ${bestTime}`;
            bestScoreTitle.style.display = "flex";
            bestScoreList.style.display = "none";
        } else {
            bestScoreTitle.style.display = "none";
            bestScoreList.style.display = "none";
        }
    }

    startTimer(timestamp) {
        this.gameStartTime = timestamp;
        this.lastTimerUpdate = timestamp;
        this.gameTimerActive = true;
    }

    updateTimer(timestamp) {
        if (!this.gameTimerActive) return;

        const delta = timestamp - this.lastTimerUpdate;
        const cappedDelta = Math.min(delta, 100);
        this.gameTotalTime += cappedDelta;
        this.lastTimerUpdate = timestamp;
        this.updateUI();
    }

    pauseTimer() {
        this.gameTimerActive = false;
    }

    formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const centiseconds = Math.floor((ms % 1000) / 10);

        return `${minutes}:${seconds.toString().padStart(2, "0")}.${centiseconds.toString().padStart(2, "0")}`;
    }

    saveBestScore() {
        if (this.infiniteMode) return;

        const storageKey = `ashleyOnDuty_ep2_${this.difficulty}_bestTime`;
        const currentBest = localStorage.getItem(storageKey);

        if (!currentBest || this.gameTotalTime < parseInt(currentBest, 10)) {
            localStorage.setItem(storageKey, this.gameTotalTime.toString());
        }
    }

    loadBestScore() {
        if (this.infiniteMode) return null;

        const storageKey = `ashleyOnDuty_ep2_${this.difficulty}_bestTime`;
        const bestTime = localStorage.getItem(storageKey);

        if (bestTime) {
            return this.formatTime(parseInt(bestTime, 10));
        }
        return null;
    }

    updateUI() {
        const timerDisplay = document.getElementById("tarSoulsTimer");
        if (timerDisplay) {
            timerDisplay.textContent = `Time: ${this.formatTime(this.gameTotalTime)}`;
        }

        const graveDisplay = document.getElementById("tarSoulsGraves");
        if (graveDisplay) {
            const filled = this.graves.filter((g) => g.filled).length;
            const total = this.graves.length;
            graveDisplay.textContent = `Graves: ${filled}/${total}`;
        }
    }

    render() {
        if (!this.ctx) return;

        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

        this.ctx.save();
        this.ctx.translate(0, -this.cameraRenderY);

        if (this.backgroundImage) {
            const scaledWidth = this.backgroundImage.width * this.bgScale;
            const scaledHeight = this.backgroundImage.height * this.bgScale;
            this.ctx.drawImage(
                this.backgroundImage,
                0,
                0,
                this.backgroundImage.width,
                this.backgroundImage.height,
                0,
                0,
                scaledWidth,
                scaledHeight,
            );
        }

        const scaledPlayAreaX = GAME_CONFIG.PLAY_AREA_X * this.bgScale;
        const scaledPlayAreaY = GAME_CONFIG.PLAY_AREA_Y * this.bgScale;
        const scaledCellSize = GAME_CONFIG.CELL_SIZE * this.bgScale;

        if (this.julia && this.gameState === "playing") {
            this.ctx.fillStyle = "rgba(255, 80, 80, 0.25)";

            const canSeeCell = (cellX, cellY) => {
                const minX = Math.min(this.julia.x, cellX);
                const maxX = Math.max(this.julia.x, cellX);

                for (const box of this.hussyBoxes) {
                    if (box.y === cellY && box.x > minX && box.x < maxX) {
                        return false; // Line of sight blocked
                    }
                }
                return true;
            };

            for (let y = 0; y <= GAME_CONFIG.PLAYER_MIN_Y; y++) {
                if (this.julia.lookingRight) {
                    for (let x = this.julia.x + 1; x < GAME_CONFIG.GRID_WIDTH; x++) {
                        if (canSeeCell(x, y)) {
                            const cellX = scaledPlayAreaX + x * scaledCellSize;
                            const cellY = scaledPlayAreaY + y * scaledCellSize;
                            this.ctx.fillRect(cellX, cellY, scaledCellSize, scaledCellSize);
                        }
                    }
                } else {
                    for (let x = 0; x < this.julia.x; x++) {
                        if (canSeeCell(x, y)) {
                            const cellX = scaledPlayAreaX + x * scaledCellSize;
                            const cellY = scaledPlayAreaY + y * scaledCellSize;
                            this.ctx.fillRect(cellX, cellY, scaledCellSize, scaledCellSize);
                        }
                    }
                }
            }
        }

        for (const grave of this.graves) {
            this.drawGrave(grave, scaledPlayAreaX, scaledPlayAreaY, scaledCellSize);

            if (this.infiniteMode) {
                const config = this.getDifficultyConfig();
                const graveRespawnTime = config.GRAVE_RESPAWN_TIME || 30000;
                const countdownNum = grave.getCountdownNumber(this.lastTimestamp, this.infiniteMode, graveRespawnTime);

                if (countdownNum !== null) {
                    this.drawCountdownNumber(
                        countdownNum,
                        grave.x,
                        grave.y - 0.5,
                        scaledPlayAreaX,
                        scaledPlayAreaY,
                        scaledCellSize,
                    );
                }
            }
        }

        for (const box of this.hussyBoxes) {
            this.drawBox(box, scaledPlayAreaX, scaledPlayAreaY, scaledCellSize);
        }

        if (this.julia) {
            this.drawJulia(this.julia, scaledPlayAreaX, scaledPlayAreaY, scaledCellSize);
        }

        for (const hussy of this.hussies) {
            this.drawEnemy(hussy, scaledPlayAreaX, scaledPlayAreaY, scaledCellSize);
        }

        if (this.gameState !== "beforeGame" && this.playerVisible) {
            this.drawPlayer(this.player, scaledPlayAreaX, scaledPlayAreaY, scaledCellSize);
        }

        for (const anim of this.animations) {
            this.drawAnimation(anim, scaledPlayAreaX, scaledPlayAreaY, scaledCellSize);
        }

        if (GAME_CONFIG.DEBUG) {
            this.drawGrid(scaledPlayAreaX, scaledPlayAreaY, scaledCellSize);
            this.drawDebugInfo(scaledPlayAreaX, scaledPlayAreaY, scaledCellSize);
        }

        this.ctx.restore();

        if (this.gameState === "paused") {
            this.drawPauseOverlay();
        }
    }

    drawGrid(offsetX, offsetY, cellSize) {
        this.ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        this.ctx.lineWidth = 1;

        for (let x = 0; x <= GAME_CONFIG.GRID_WIDTH; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(offsetX + x * cellSize, offsetY);
            this.ctx.lineTo(offsetX + x * cellSize, offsetY + GAME_CONFIG.GRID_HEIGHT * cellSize);
            this.ctx.stroke();
        }

        for (let y = 0; y <= GAME_CONFIG.GRID_HEIGHT; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(offsetX, offsetY + y * cellSize);
            this.ctx.lineTo(offsetX + GAME_CONFIG.GRID_WIDTH * cellSize, offsetY + y * cellSize);
            this.ctx.stroke();
        }
    }

    drawDebugInfo(offsetX, offsetY, cellSize) {
        // Draw player hitbox
        if (this.playerVisible) {
            this.ctx.strokeStyle = "rgba(0, 255, 0, 0.8)";
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(
                offsetX + this.player.renderX * cellSize,
                offsetY + this.player.renderY * cellSize,
                cellSize,
                cellSize,
            );
        }

        // Draw hussy hitboxes
        this.ctx.strokeStyle = "rgba(255, 0, 255, 0.8)";
        for (const hussy of this.hussies) {
            this.ctx.strokeRect(
                offsetX + hussy.renderX * cellSize,
                offsetY + hussy.renderY * cellSize,
                cellSize,
                cellSize,
            );
        }

        // Draw Julia's vision line
        if (this.julia && GAME_CONFIG.PLAYER_MIN_Y) {
            this.ctx.strokeStyle = "rgba(255, 0, 0, 0.5)";
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(offsetX, offsetY + GAME_CONFIG.PLAYER_MIN_Y * cellSize);
            this.ctx.lineTo(offsetX + GAME_CONFIG.GRID_WIDTH * cellSize, offsetY + GAME_CONFIG.PLAYER_MIN_Y * cellSize);
            this.ctx.stroke();
        }
    }

    drawPlayer(player, offsetX, offsetY, cellSize) {
        const x = offsetX + player.renderX * cellSize;
        const y = offsetY + player.renderY * cellSize;

        if (!player.animator) return;

        const spritesheet = player.animator.spritesheet;
        const frame = player.animator.getCurrentFrame();

        let gridCols = spritesheet.gridCols || 12;
        let gridRows = spritesheet.gridRows || 8;

        const spriteWidth = spritesheet.width / gridCols;
        const spriteHeight = spritesheet.height / gridRows;
        const col = frame % gridCols;
        const row = Math.floor(frame / gridCols);

        // Player sprites are 2x1, apply sprite scale
        const is2x1 = spriteWidth > spriteHeight * 1.5;
        const is1x2 = spriteHeight > spriteWidth * 1.5;
        const scale = GAME_ASSETS.player_sprite.spriteScale || 1;
        let drawWidth = cellSize;
        let drawHeight = cellSize;
        let drawX = x;
        let drawY = y;

        if (is2x1) {
            drawWidth = (cellSize / 2) * scale;
            drawHeight = (cellSize / 2) * scale;
            drawX = x + (cellSize - drawWidth) / 2;
            drawY = y + (cellSize - drawHeight) / 2;
        } else if (is1x2) {
            drawWidth = (cellSize / 2) * scale;
            drawHeight = cellSize * scale;
            drawX = x + (cellSize - drawWidth) / 2;
            drawY = y + (cellSize - drawHeight) / 2;
        }

        // Offset scaled sprites upward to align feet better
        if (scale > 1 && (is2x1 || is1x2)) {
            drawY -= (scale - 1) * cellSize * 0.25;
        }

        this.ctx.drawImage(
            spritesheet,
            col * spriteWidth,
            row * spriteHeight,
            spriteWidth,
            spriteHeight,
            drawX,
            drawY,
            drawWidth,
            drawHeight,
        );
    }

    drawEnemy(enemy, offsetX, offsetY, cellSize) {
        const x = offsetX + enemy.renderX * cellSize;
        const y = offsetY + enemy.renderY * cellSize;

        if (!enemy.animator) return;

        const spritesheet = enemy.animator.spritesheet;
        const frame = enemy.animator.getCurrentFrame();

        let gridCols = spritesheet.gridCols || 12;
        let gridRows = spritesheet.gridRows || 8;

        const spriteWidth = spritesheet.width / gridCols;
        const spriteHeight = spritesheet.height / gridRows;
        const col = frame % gridCols;
        const row = Math.floor(frame / gridCols);

        const is2x1 = spriteWidth > spriteHeight * 1.5;
        const is1x2 = spriteHeight > spriteWidth * 1.5;
        const scale = enemy.config.spriteScale || 1;
        let drawWidth = cellSize;
        let drawHeight = cellSize;
        let drawX = x;
        let drawY = y;

        if (is2x1) {
            drawWidth = (cellSize / 2) * scale;
            drawHeight = (cellSize / 2) * scale;
            drawX = x + (cellSize - drawWidth) / 2;
            drawY = y + (cellSize - drawHeight) / 2;
        } else if (is1x2) {
            drawWidth = (cellSize / 2) * scale;
            drawHeight = cellSize * scale;
            drawX = x + (cellSize - drawWidth) / 2;
            drawY = y + (cellSize - drawHeight) / 2;
        }

        if (scale > 1 && (is2x1 || is1x2)) {
            drawY -= (scale - 1) * cellSize * 0.25;
        }

        this.ctx.drawImage(
            spritesheet,
            col * spriteWidth,
            row * spriteHeight,
            spriteWidth,
            spriteHeight,
            drawX,
            drawY,
            drawWidth,
            drawHeight,
        );
    }

    drawGrave(grave, offsetX, offsetY, cellSize) {
        const x = offsetX + grave.x * cellSize;
        const y = offsetY + grave.y * cellSize;

        const config = grave.getConfig();
        if (!config.spritesheetImage) return;

        const spritesheet = config.spritesheetImage;
        const frame = config.index[0];

        let gridCols = spritesheet.gridCols || 12;
        let gridRows = spritesheet.gridRows || 8;

        const spriteWidth = spritesheet.width / gridCols;
        const spriteHeight = spritesheet.height / gridRows;
        const col = frame % gridCols;
        const row = Math.floor(frame / gridCols);

        this.ctx.drawImage(
            spritesheet,
            col * spriteWidth,
            row * spriteHeight,
            spriteWidth,
            spriteHeight,
            x,
            y,
            cellSize,
            cellSize * 2,
        );
    }

    drawCountdownNumber(number, gridX, gridY, offsetX, offsetY, cellSize) {
        const config = GAME_EVENTS_ASSETS.NUMBERS;
        if (!config.spritesheetImage) return;

        const spritesheet = config.spritesheetImage;
        const frame = config.index[number];

        const gridCols = spritesheet.gridCols || 12;
        const gridRows = spritesheet.gridRows || 8;

        const spriteWidth = spritesheet.width / gridCols;
        const spriteHeight = spritesheet.height / gridRows;
        const col = frame % gridCols;
        const row = Math.floor(frame / gridCols);

        const x = offsetX + gridX * cellSize;
        const y = offsetY + gridY * cellSize;

        this.ctx.drawImage(
            spritesheet,
            col * spriteWidth,
            row * spriteHeight,
            spriteWidth,
            spriteHeight,
            x,
            y,
            cellSize,
            cellSize,
        );
    }

    drawBox(box, offsetX, offsetY, cellSize) {
        const x = offsetX + box.renderX * cellSize;
        const y = offsetY + box.renderY * cellSize;

        if (!box.config.spritesheetImage) return;

        const spritesheet = box.config.spritesheetImage;
        const frame = box.config.index[0];

        let gridCols = spritesheet.gridCols || 12;
        let gridRows = spritesheet.gridRows || 8;

        const spriteWidth = spritesheet.width / gridCols;
        const spriteHeight = spritesheet.height / gridRows;
        const col = frame % gridCols;
        const row = Math.floor(frame / gridCols);

        this.ctx.drawImage(
            spritesheet,
            col * spriteWidth,
            row * spriteHeight,
            spriteWidth,
            spriteHeight,
            x,
            y,
            cellSize,
            cellSize,
        );
    }

    drawJulia(julia, offsetX, offsetY, cellSize) {
        const x = offsetX + julia.renderX * cellSize;
        const y = offsetY + julia.renderY * cellSize;

        if (!julia.animator) return;

        const spritesheet = julia.animator.spritesheet;
        const frame = julia.animator.getCurrentFrame();

        let gridCols = spritesheet.gridCols || 12;
        let gridRows = spritesheet.gridRows || 8;

        const spriteWidth = spritesheet.width / gridCols;
        const spriteHeight = spritesheet.height / gridRows;
        const col = frame % gridCols;
        const row = Math.floor(frame / gridCols);

        const is2x1 = spriteWidth > spriteHeight * 1.5;
        const is1x2 = spriteHeight > spriteWidth * 1.5;
        const scale = julia.config.spriteScale || 1;
        let drawWidth = cellSize;
        let drawHeight = cellSize;
        let drawX = x;
        let drawY = y;

        if (is2x1) {
            drawWidth = (cellSize / 2) * scale;
            drawHeight = (cellSize / 2) * scale;
            drawX = x + (cellSize - drawWidth) / 2;
            drawY = y + (cellSize - drawHeight) / 2;
        } else if (is1x2) {
            drawWidth = (cellSize / 2) * scale;
            drawHeight = cellSize * scale;
            drawX = x + (cellSize - drawWidth) / 2;
            drawY = y + (cellSize - drawHeight) / 2;
        }

        if (scale > 1 && (is2x1 || is1x2)) {
            drawY -= (scale - 1) * cellSize * 0.25;
        }

        this.ctx.drawImage(
            spritesheet,
            col * spriteWidth,
            row * spriteHeight,
            spriteWidth,
            spriteHeight,
            drawX,
            drawY,
            drawWidth,
            drawHeight,
        );
    }

    drawAnimation(anim, offsetX, offsetY, cellSize) {
        const x = offsetX + anim.renderX * cellSize;
        const y = offsetY + anim.renderY * cellSize;

        const spritesheet = anim.getCurrentSpritesheet();
        if (!spritesheet) return;

        const frame = anim.getCurrentFrame();

        let gridCols = spritesheet.gridCols || 12;
        let gridRows = spritesheet.gridRows || 8;

        const spriteWidth = spritesheet.width / gridCols;
        const spriteHeight = spritesheet.height / gridRows;
        const col = frame % gridCols;
        const row = Math.floor(frame / gridCols);

        const is2x1 = spriteWidth > spriteHeight * 1.5;
        const is1x2 = spriteHeight > spriteWidth * 1.5;
        const scale = (anim.config && anim.config.spriteScale) || 1;
        let drawWidth = cellSize;
        let drawHeight = cellSize;
        let drawX = x;
        let drawY = y;

        if (is2x1) {
            drawWidth = (cellSize / 2) * scale;
            drawHeight = (cellSize / 2) * scale;
            drawX = x + (cellSize - drawWidth) / 2;
            drawY = y + (cellSize - drawHeight) / 2;
        } else if (is1x2) {
            drawWidth = (cellSize / 2) * scale;
            drawHeight = cellSize * scale;
            drawX = x + (cellSize - drawWidth) / 2;
            drawY = y + (cellSize - drawHeight) / 2;
        }

        if (scale > 1 && (is2x1 || is1x2)) {
            drawY -= (scale - 1) * cellSize * 0.25;
        }

        this.ctx.drawImage(
            spritesheet,
            col * spriteWidth,
            row * spriteHeight,
            spriteWidth,
            spriteHeight,
            drawX,
            drawY,
            drawWidth,
            drawHeight,
        );
    }

    drawPauseOverlay() {
        this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

        this.ctx.fillStyle = "#fff";
        this.ctx.font = "48px TCOAAL, monospace";
        this.ctx.textAlign = "center";
        this.ctx.fillText("PAUSED", this.canvasWidth / 2, this.canvasHeight / 2);
    }

    gameLoop(timestamp) {
        const deltaTime = timestamp - this.lastTimestamp;
        this.lastTimestamp = timestamp;

        this.update(deltaTime, timestamp);
        this.render();

        this.animationFrameId = requestAnimationFrame(this.boundGameLoop);
    }

    handleVisibilityChange() {
        if (document.hidden && this.gameState === "playing") {
            this.togglePause();
        }
    }

    handleBlur() {
        if (this.gameState === "playing") {
            this.togglePause();
        }
    }

    togglePause() {
        const leftSidebar = document.getElementById("tarSoulsLeftSidebar");
        const rightSidebar = document.getElementById("tarSoulsInstructionsPanel");

        if (this.gameState === "playing") {
            this.gameState = "paused";
            document.getElementById("tarSoulsPauseBtn").textContent = "Resume";
            this.pauseTimer();

            if (leftSidebar) leftSidebar.style.display = "flex";
            if (rightSidebar) rightSidebar.style.display = "block";
        } else if (this.gameState === "paused") {
            this.gameState = "playing";
            document.getElementById("tarSoulsPauseBtn").textContent = "Pause";
            this.lastTimerUpdate = performance.now();
            this.gameTimerActive = true;

            if (leftSidebar) leftSidebar.style.display = "none";
            if (rightSidebar) rightSidebar.style.display = "none";
        }
    }

    cleanup() {
        window.removeEventListener("keydown", this.boundHandleKeyDown);

        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }

        if (this.audioManager && this.audioManager.currentMusic) {
            this.audioManager.currentMusic.pause();
        }

        const container = document.getElementById("tarSoulsContainer");
        if (container) {
            container.remove();
        }
    }

    toggleMuteMusic() {
        this.audioManager.toggleMuteMusic();
        const btn = document.getElementById("tarSoulsMuteMusicBtn");
        if (btn) {
            btn.textContent = this.audioManager.musicMuted ? "Music: OFF" : "Music: ON";
        }
    }

    toggleMuteSound() {
        this.audioManager.toggleMuteSound();
        const btn = document.getElementById("tarSoulsMuteSoundBtn");
        if (btn) {
            btn.textContent = this.audioManager.soundMuted ? "Sound FX: OFF" : "Sound FX: ON";
        }
    }

    async playHardcoreMusic() {
        this.stopHardcoreMusic();

        try {
            const fileRecord = await window.memoryManager.getLocalFile("hardcore.mp3");
            if (fileRecord && fileRecord.blob) {
                const blobUrl = URL.createObjectURL(fileRecord.blob);
                this.hardcoreAudio = new Audio(blobUrl);
                this.hardcoreAudio.volume = 0.7;
                this.hardcoreAudio.play();
                this.hardcoreAudio.onended = () => {
                    URL.revokeObjectURL(blobUrl);
                    this.hardcoreAudio = null;
                };
            }
        } catch (error) {
            console.error("Failed to play hardcore.mp3:", error);
        }
    }

    stopHardcoreMusic() {
        if (this.hardcoreAudio) {
            this.hardcoreAudio.pause();
            this.hardcoreAudio.currentTime = 0;
            this.hardcoreAudio = null;
        }
    }

    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        this.infiniteMode = difficulty === "infinite";

        if (difficulty === "infinite") {
            this.playHardcoreMusic();
        } else {
            this.stopHardcoreMusic();
        }

        const easyBtn = document.getElementById("tarSoulsDiffEasy");
        const normalBtn = document.getElementById("tarSoulsDiffNormal");
        const hardBtn = document.getElementById("tarSoulsDiffHard");
        const infiniteBtn = document.getElementById("tarSoulsDiffInfinite");

        [easyBtn, normalBtn, hardBtn, infiniteBtn].forEach((btn) => {
            if (btn) {
                btn.style.background = "";
                btn.style.boxShadow = "";
                btn.style.border = "";
            }
        });

        if (difficulty === "easy" && easyBtn) {
            easyBtn.style.backgroundColor = "color-mix(in srgb, var(--green) 60%, transparent)";
            easyBtn.style.boxShadow =
                "inset 0 0 25px color-mix(in srgb, var(--green) 80%, transparent), 0 0 10px color-mix(in srgb, var(--green) 40%, transparent)";
            easyBtn.style.border = "2px solid var(--green)";
        } else if (difficulty === "normal" && normalBtn) {
            normalBtn.style.backgroundColor = "color-mix(in srgb, var(--yellow) 60%, transparent)";
            normalBtn.style.boxShadow =
                "inset 0 0 25px color-mix(in srgb, var(--yellow) 80%, transparent), 0 0 10px color-mix(in srgb, var(--yellow) 40%, transparent)";
            normalBtn.style.border = "2px solid var(--yellow)";
        } else if (difficulty === "hard" && hardBtn) {
            hardBtn.style.backgroundColor = "color-mix(in srgb, var(--red) 60%, transparent)";
            hardBtn.style.boxShadow =
                "inset 0 0 25px color-mix(in srgb, var(--red) 80%, transparent), 0 0 10px color-mix(in srgb, var(--red) 40%, transparent)";
            hardBtn.style.border = "2px solid var(--red)";
        } else if (difficulty === "infinite" && infiniteBtn) {
            const darkPurple = "#4a0e4e";
            infiniteBtn.style.backgroundColor = `color-mix(in srgb, ${darkPurple} 60%, transparent)`;
            infiniteBtn.style.boxShadow = `inset 0 0 25px color-mix(in srgb, ${darkPurple} 80%, transparent), 0 0 10px color-mix(in srgb, ${darkPurple} 40%, transparent)`;
            infiniteBtn.style.border = `2px solid ${darkPurple}`;
        }

        this.updateRulesForDifficulty();
        this.displayBestScore();
    }

    toggleKeyLayout() {
        this.keyLayout = this.keyLayout === KEY_LAYOUTS.QWERTY ? KEY_LAYOUTS.AZERTY : KEY_LAYOUTS.QWERTY;
        const btn = document.getElementById("tarSoulsLayoutBtn");
        if (btn) {
            btn.textContent = this.keyLayout === KEY_LAYOUTS.QWERTY ? "Layout: QWERTY" : "Layout: AZERTY";
        }
        const controlKeysDisplay = document.getElementById("tarSoulsControlKeys");
        if (controlKeysDisplay) {
            controlKeysDisplay.textContent = this.keyLayout === KEY_LAYOUTS.QWERTY ? "WASD" : "ZQSD";
        }
    }

    toggleTrackSource() {
        this.audioManager.toggleMusicSource();
        const btn = document.getElementById("tarSoulsTrackSourceBtn");
        if (btn) {
            btn.textContent = this.audioManager.trackSource === "official" ? "Tracks: Official" : "Tracks: Kidev";
        }
    }

    backToMenu() {
        this.cleanup();
        window.removeEventListener("keydown", this.boundHandleKeyDown);
        this.audioManager.stopMusic();

        const container = document.getElementById("tarSoulsContainer");
        if (container) {
            container.remove();
        }

        window.location.href = "index.html?mode=ashley-on-duty&episode=2";
    }

    exitGame() {
        this.cleanup();
        window.removeEventListener("keydown", this.boundHandleKeyDown);
        this.audioManager.stopMusic();

        const container = document.getElementById("tarSoulsContainer");
        if (container) {
            container.remove();
        }

        window.location.href = "index.html";
    }

    createGameUI() {
        const dialogContainer = document.querySelector(".dialog-container");
        const controls = document.getElementById("controlsContainer");
        if (dialogContainer) dialogContainer.style.display = "none";
        if (controls) controls.style.display = "none";

        // Add CSS keyframes for pulsing glow animation
        /*if (!document.getElementById("tarSoulsPulseAnimation")) {
            const style = document.createElement("style");
            style.id = "tarSoulsPulseAnimation";
            style.textContent = `
         @keyframes tarSoulsPulse {
         0%, 100% {
         background: radial-gradient(ellipse at center,
         color-mix(in srgb, white 65%, transparent) 0%,
         color-mix(in srgb, white 48%, transparent) 25%,
         color-mix(in srgb, white 28%, transparent) 50%,
         transparent 100%);
         filter: blur(13px);
         opacity: 0.2;
         }
         50% {
         background: radial-gradient(ellipse at center,
         color-mix(in srgb, white 68%, transparent) 0%,
         color-mix(in srgb, white 50%, transparent) 25%,
         color-mix(in srgb, white 30%, transparent) 50%,
         transparent 100%);
         filter: blur(14px);
         opacity: 0.7;
         }
         }
            `;
            document.head.appendChild(style);
        }*/

        const gameContainer = document.createElement("div");
        gameContainer.id = "tarSoulsContainer";
        gameContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: #000;
            z-index: 1000;
        `;

        const canvas = document.createElement("canvas");
        canvas.id = "tarSoulsCanvas";

        this.canvasWidth = window.innerWidth;
        this.canvasHeight = window.innerHeight;

        canvas.width = this.canvasWidth;
        canvas.height = this.canvasHeight;
        canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            image-rendering: pixelated;
            image-rendering: crisp-edges;
            background: #000;
        `;

        const leftSidebar = document.createElement("div");
        leftSidebar.id = "tarSoulsLeftSidebar";
        leftSidebar.style.cssText = `
            position: absolute;
            left: 0;
            top: 0;
            width: 30vw;
            height: 100%;
            background: rgba(17, 17, 17, 0.75);
            padding: 0.5vmax;
            box-sizing: border-box;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 15px;
            z-index: 10;
        `;

        const rightSidebar = document.createElement("div");
        rightSidebar.id = "tarSoulsInstructionsPanel";
        rightSidebar.style.cssText = `
            position: absolute;
            right: 0;
            top: 0;
            width: 30vw;
            height: 100%;
            background: rgba(17, 17, 17, 0.75);
            padding: 0.5vmax;
            box-sizing: border-box;
            overflow-y: auto;
            color: var(--txt-color, #ddd);
            font-family: 'TCOAAL', monospace;
            font-size: 0.75vmax;
            line-height: 1.4;
            z-index: 10;
        `;

        this.buildLeftSidebar(leftSidebar);
        this.buildRightSidebar(rightSidebar);

        gameContainer.appendChild(canvas);
        gameContainer.appendChild(leftSidebar);
        gameContainer.appendChild(rightSidebar);
        document.body.appendChild(gameContainer);

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");

        this.handleResize = this.handleResize.bind(this);
        window.addEventListener("resize", this.handleResize);

        this.setDifficulty(this.difficulty);
    }

    handleResize() {
        this.canvasWidth = window.innerWidth;
        this.canvasHeight = window.innerHeight;

        if (this.canvas) {
            this.canvas.width = this.canvasWidth;
            this.canvas.height = this.canvasHeight;
        }

        this.setupCanvas();
    }

    buildLeftSidebar(sidebar) {
        const topBlock = document.createElement("div");
        const botBlock = document.createElement("div");

        sidebar.appendChild(topBlock);
        sidebar.appendChild(botBlock);

        sidebar.style.display = "flex";
        sidebar.style.flexDirection = "column";
        sidebar.style.justifyContent = "space-between";
        botBlock.style.cssText = `display:flex;flex-direction:column;align-items:center;`;

        const title = document.createElement("img");
        title.src = "img/tcoaal-ashley-on-duty-line.webp";
        title.alt = "Ashley on Duty";
        title.style.cssText = `
            width: 100%;
            max-width: 300px;
            height: auto;
            margin: 0 auto 1.11vmax auto;
            display: block;
        `;
        topBlock.appendChild(title);

        const subtitleContainer = document.createElement("div");
        subtitleContainer.classList.add("subtitle-game");
        subtitleContainer.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: var(--dialog-box);
            color: var(--text-color);
            padding: 0.5vmax 1vmax;
            margin: 0 auto 0.5vmax auto;
            width: 100%;
            font-family: TCOAAL, monospace;
            font-size: 0.9vmax;
            background-size: 100% 100%;
        `;

        const leftArrow = document.createElement("button");
        leftArrow.textContent = "◀";
        leftArrow.title = "Episode 1";
        leftArrow.style.cssText = `
            background: none;
            border: none;
            color: var(--text-color);
            font-size: 1.2vmax;
            cursor: pointer;
            padding: 0;
            
        `;
        leftArrow.onclick = () => {
            window.location.href = "?mode=ashley-on-duty&episode=1";
        };

        const episodeTitle = document.createElement("span");
        episodeTitle.textContent = "Night of the Hussies";
        episodeTitle.style.cssText = `
            flex: 1;
            text-align: center;
            font-size: 0.9vmax;
        `;

        const rightArrow = document.createElement("button");
        rightArrow.textContent = "▶";
        rightArrow.title = "LOCKED";
        rightArrow.style.cssText = `
            background: none;
            border: none;
            color: #666;
            font-size: 1.2vmax;
            cursor: not-allowed;
            padding: 0;
            opacity: 0.5;
        `;
        rightArrow.disabled = true;

        subtitleContainer.appendChild(leftArrow);
        subtitleContainer.appendChild(episodeTitle);
        subtitleContainer.appendChild(rightArrow);
        topBlock.appendChild(subtitleContainer);

        const startButtonContainer = document.createElement("div");
        startButtonContainer.style.cssText = "position: relative; width: 100%;justify-content:center;display: flex;";

        const startButtonGlow = document.createElement("div");
        startButtonGlow.className = "tarSoulsStartGlow";
        startButtonGlow.style.cssText = `
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            border-radius: 16px;
            pointer-events: none;
            z-index: -1;
            animation: tarSoulsPulse 1.2s cubic-bezier(0.15, 1, 0.5, 1) infinite;
        `;

        const startButton = document.createElement("button");
        startButton.className = "tcoaal-button-tarsouls";
        startButton.id = "tarSoulsStartBtn";
        startButton.textContent = "PLAY";
        startButton.onclick = () => this.startGame();
        startButton.style.cssText =
            "width: 80%; border-radius: 8px; position: relative; z-index: 1; font-weight: 900; text-shadow: 0 0 23px #000000, 0 0 3px #000000, 0 0 3px #000000, 0 0 3px #000000, 0 0 3px #000000, 0 0 3px #000000, 0 0 3px #000000, 0 0 3px #000000, 0 0 3px #000000;";

        startButton.addEventListener("mouseenter", () => {
            startButtonGlow.style.animation = "tarSoulsPulseHovered 1.2s ease-in-out infinite";
        });
        startButton.addEventListener("mouseleave", () => {
            startButtonGlow.style.animation = "tarSoulsPulse 1.2s cubic-bezier(0.15, 1, 0.5, 1) infinite";
        });

        startButtonContainer.appendChild(startButtonGlow);
        startButtonContainer.appendChild(startButton);
        topBlock.appendChild(startButtonContainer);

        const pauseButton = document.createElement("button");
        pauseButton.className = "tcoaal-button-tarsouls";
        pauseButton.id = "tarSoulsPauseBtn";
        pauseButton.textContent = "Pause";
        pauseButton.onclick = () => this.togglePause();
        pauseButton.style.cssText = "width: 100%; display: none;";
        topBlock.appendChild(pauseButton);

        const restartButton = document.createElement("button");
        restartButton.className = "tcoaal-button-tarsouls";
        restartButton.id = "tarSoulsRestartBtn";
        restartButton.textContent = "Back to menu";
        restartButton.onclick = () => this.backToMenu();
        restartButton.style.cssText = "width: 100%; display: none;";
        topBlock.appendChild(restartButton);

        const difficultyLabel = document.createElement("h2");
        difficultyLabel.style.cssText = `color: var(--purple, #e2829a); margin-top: 0; margin-bottom:0.5vmax; font-size: 1.2vmax; font-family: TCOAAL, monospace;display:flex;justify-content:center;`;
        difficultyLabel.textContent = "Rules";
        difficultyLabel.style.marginTop = "2vmax";
        topBlock.appendChild(difficultyLabel);

        const difficultyContainer = document.createElement("div");
        difficultyContainer.style.cssText = `
            display: flex;
            gap: 5px;
            width: 100%;
        `;

        const easyButton = document.createElement("button");
        easyButton.className = "tcoaal-button-tarsouls-small";
        easyButton.id = "tarSoulsDiffEasy";
        const hasEasyBest = localStorage.getItem("ashleyOnDuty_ep2_easy_bestTime");
        easyButton.textContent = hasEasyBest ? "✔ Easy" : "Easy";
        easyButton.onclick = () => this.setDifficulty("easy");
        easyButton.style.cssText = "flex: 1;";
        difficultyContainer.appendChild(easyButton);

        const normalButton = document.createElement("button");
        normalButton.className = "tcoaal-button-tarsouls-small";
        normalButton.id = "tarSoulsDiffNormal";
        const hasNormalBest = localStorage.getItem("ashleyOnDuty_ep2_normal_bestTime");
        normalButton.textContent = hasNormalBest ? "✔ Normal" : "Normal";
        normalButton.onclick = () => this.setDifficulty("normal");
        normalButton.style.cssText = "flex: 1;";
        difficultyContainer.appendChild(normalButton);

        const hardButton = document.createElement("button");
        hardButton.className = "tcoaal-button-tarsouls-small";
        hardButton.id = "tarSoulsDiffHard";
        const hasHardBest = localStorage.getItem("ashleyOnDuty_ep2_hard_bestTime");
        hardButton.textContent = hasHardBest ? "✔ Hard" : "Hard";
        hardButton.onclick = () => this.setDifficulty("hard");
        hardButton.style.cssText = "flex: 1;";
        difficultyContainer.appendChild(hardButton);

        const infiniteButton = document.createElement("button");
        infiniteButton.className = "tcoaal-button-tarsouls-small";
        infiniteButton.id = "tarSoulsDiffInfinite";
        const hasInfiniteBest = localStorage.getItem("ashleyOnDuty_ep2_infinite_bestTime");
        infiniteButton.textContent = hasInfiniteBest ? "✔ Nightmare" : "Nightmare";
        infiniteButton.onclick = () => this.setDifficulty("infinite");
        infiniteButton.style.cssText = "flex: 1;";

        const hardBestTime = localStorage.getItem("ashleyOnDuty_ep2_hard_bestTime");
        if (!hardBestTime) {
            infiniteButton.disabled = true;
            infiniteButton.title = "Not yet worthy";
            infiniteButton.style.opacity = "0.3";
            infiniteButton.style.cursor = "not-allowed";
        }

        difficultyContainer.appendChild(infiniteButton);

        topBlock.appendChild(difficultyContainer);

        const rulesContainer = document.createElement("div");
        const rules = document.createElement("ul");
        rulesContainer.style.cssText = `margin-top: 1vmax;color: var(--txt-color, #ddd); font-family: TCOAAL, monospace; font-size: 0.75vmax; line-height: 1.4; z-index: 10;`;
        rules.style.cssText = `padding-left: 0; margin-bottom: 1.11vmax; list-style: none; text-align: center;`;
        rules.id = "tarSoulsRulesList";
        rulesContainer.appendChild(rules);
        topBlock.appendChild(rulesContainer);

        const bestScoreTitle = document.createElement("h2");
        bestScoreTitle.id = "tarSoulsBestScoreTitle";
        bestScoreTitle.style.cssText = `color: var(--purple, #e2829a); margin-top: 0; margin-bottom:0.5vmax; font-size: 1.2vmax; font-family: TCOAAL, monospace;display:flex;justify-content:center;`;
        bestScoreTitle.textContent = "Best time";
        const bestScoreList = document.createElement("ul");
        bestScoreList.id = "tarSoulsBestScore";
        bestScoreList.style.cssText = `margin-top: 1vmax;color: var(--txt-color, #ddd); font-family: TCOAAL, monospace; font-size: 1.1vmax; line-height: 1.4; z-index: 10;list-style: none; text-align: center`;
        topBlock.appendChild(bestScoreTitle);
        topBlock.appendChild(bestScoreList);

        const settingsLabel = document.createElement("h2");
        settingsLabel.style.cssText = `color: var(--purple, #e2829a); margin-top: 0; margin-bottom:0.5vmax; font-size: 1.2vmax; font-family: TCOAAL, monospace;display:flex;justify-content:center;`;
        settingsLabel.textContent = "Settings";
        botBlock.appendChild(settingsLabel);

        const layoutButton = document.createElement("button");
        layoutButton.className = "tcoaal-button-tarsouls";
        layoutButton.id = "tarSoulsLayoutBtn";
        layoutButton.textContent = "Layout: QWERTY";
        layoutButton.onclick = () => this.toggleKeyLayout();
        layoutButton.style.width = "55%";
        botBlock.appendChild(layoutButton);

        const muteMusicButton = document.createElement("button");
        muteMusicButton.className = "tcoaal-button-tarsouls";
        muteMusicButton.id = "tarSoulsMuteMusicBtn";
        muteMusicButton.textContent = "Music: ON";
        muteMusicButton.onclick = () => this.toggleMuteMusic();
        muteMusicButton.style.width = "55%";
        botBlock.appendChild(muteMusicButton);

        const trackSourceButton = document.createElement("button");
        trackSourceButton.className = "tcoaal-button-tarsouls";
        trackSourceButton.id = "tarSoulsTrackSourceBtn";
        trackSourceButton.textContent = "Tracks: Official";
        trackSourceButton.onclick = () => this.toggleTrackSource();
        trackSourceButton.style.width = "55%";
        botBlock.appendChild(trackSourceButton);

        const muteSoundButton = document.createElement("button");
        muteSoundButton.className = "tcoaal-button-tarsouls";
        muteSoundButton.id = "tarSoulsMuteSoundBtn";
        muteSoundButton.textContent = "Sound FX: ON";
        muteSoundButton.onclick = () => this.toggleMuteSound();
        muteSoundButton.style.width = "55%";
        botBlock.appendChild(muteSoundButton);

        const backButton = document.createElement("button");
        backButton.className = "tcoaal-button-tarsouls";
        backButton.textContent = "Quit";
        backButton.onclick = () => this.exitGame();
        backButton.style.width = "100%";
        backButton.style.marginTop = "1vmax";
        botBlock.appendChild(backButton);

        const scoreDisplay = document.createElement("div");
        scoreDisplay.id = "tarSoulsScore";
        scoreDisplay.style.cssText = `
            color: var(--txt-color, #ddd);
            font-family: 'TCOAAL', monospace;
            font-size: 0.8vmax;
            padding: 12px;
            background: rgba(0,0,0,0.5);
            border-radius: 4px;
            text-align: center;
            margin-top: 10px;
            display: none;
        `;
        scoreDisplay.textContent = "Followers: 0 | Pace: 0";
        botBlock.appendChild(scoreDisplay);
    }

    buildRightSidebar(sidebar) {
        sidebar.id = "tarSoulsInstructionsPanel";
    }

    setupCanvas() {
        const computeScale = () => {
            const canvasAspect = this.canvasWidth / this.canvasHeight;
            const bgAspect = this.backgroundImage ? this.backgroundImage.width / this.backgroundImage.height : 1;

            if (canvasAspect > bgAspect) {
                return this.canvasWidth / (this.backgroundImage ? this.backgroundImage.width : this.canvasWidth);
            } else {
                return this.canvasHeight / (this.backgroundImage ? this.backgroundImage.height : this.canvasHeight);
            }
        };

        this.bgScale = computeScale();
    }

    async loadAssets() {
        const parseSpriteSheetDimensions = (filename) => {
            const match = filename.match(/spritessheet_(\d+)x(\d+)_/);
            if (match) {
                return { cols: parseInt(match[1]), rows: parseInt(match[2]) };
            }
            return { cols: 12, rows: 8 };
        };

        const bgAsset = this.getGameAsset("images", GAME_ASSETS.background.category, GAME_ASSETS.background.image);
        if (bgAsset) {
            this.backgroundImage = await this.loadImage(bgAsset.url);
        }

        const playerSheet = this.getGameAsset(
            "images",
            GAME_ASSETS.player_sprite.category,
            GAME_ASSETS.player_sprite.sheet,
        );
        if (playerSheet) {
            this.playerSpritesheet = await this.loadImage(playerSheet.url);
            const dimensions = parseSpriteSheetDimensions(GAME_ASSETS.player_sprite.sheet);
            this.playerSpritesheet.gridCols = dimensions.cols;
            this.playerSpritesheet.gridRows = dimensions.rows;
        }

        for (let i = 0; i < ENEMY_CONFIG.length; i++) {
            const config = ENEMY_CONFIG[i];
            if (config.spritesheet) {
                const enemySheet = this.getGameAsset("images", config.category, config.spritesheet);
                if (enemySheet) {
                    const loadedSheet = await this.loadImage(enemySheet.url);
                    const dimensions = parseSpriteSheetDimensions(config.spritesheet);
                    loadedSheet.gridCols = dimensions.cols;
                    loadedSheet.gridRows = dimensions.rows;
                    ENEMY_CONFIG[i].spritesheetImage = loadedSheet;
                }
            }
        }

        for (const [key, value] of Object.entries(this.audioManager.soundEffects)) {
            if (value && typeof value === "string") {
                const soundAsset = this.getGameAsset("audio", "Sound effects", value);
                if (soundAsset) {
                    const audio = new Audio(soundAsset.url);
                    this.audioManager.soundEffects[key] = audio;
                } else {
                    this.audioManager.soundEffects[key] = null;
                }
            }
        }

        const officialMusicPath = GAME_ASSETS.music.NORMAL;
        const officialAsset = this.getGameAsset("audio", "Background songs", officialMusicPath);
        if (officialAsset) {
            const audio = new Audio(officialAsset.url);
            audio.loop = true;
            this.audioManager.officialMusic = audio;
            this.audioManager.backgroundMusic.normal = audio;
        } else {
            try {
                const audio = new Audio(officialMusicPath);
                audio.loop = true;
                this.audioManager.officialMusic = audio;
                this.audioManager.backgroundMusic.normal = audio;
            } catch (e) {
                console.warn(`Failed to load official music: ${officialMusicPath}`, e);
                this.audioManager.officialMusic = null;
            }
        }

        if (GAME_ASSETS.music_kidev && GAME_ASSETS.music_kidev.NORMAL) {
            const kidevMusicPath = GAME_ASSETS.music_kidev.NORMAL;
            const kidevAsset = this.getGameAsset("audio", "Background songs", kidevMusicPath);
            if (kidevAsset) {
                const audio = new Audio(kidevAsset.url);
                audio.loop = true;
                this.audioManager.kidevMusic = audio;
            } else {
                try {
                    const audio = new Audio(kidevMusicPath);
                    audio.loop = true;
                    this.audioManager.kidevMusic = audio;
                } catch (e) {
                    console.warn(`Failed to load Kidev music: ${kidevMusicPath}`, e);
                    this.audioManager.kidevMusic = null;
                }
            }
        }

        const animSheets = new Set();
        for (const config of Object.values(GAME_EVENTS_ASSETS)) {
            if (config.sheet) {
                animSheets.add(config);
            }
        }

        for (const conf of animSheets) {
            const sheetAsset = this.getGameAsset("images", conf.category, conf.sheet);
            if (sheetAsset) {
                conf.spritesheetImage = await this.loadImage(sheetAsset.url);
                const dimensions = parseSpriteSheetDimensions(conf.sheet);
                conf.spritesheetImage.gridCols = dimensions.cols;
                conf.spritesheetImage.gridRows = dimensions.rows;
            }
        }

        if (GAME_ASSETS.graves && GAME_ASSETS.graves.sheet) {
            const graveSheet = this.getGameAsset("images", GAME_ASSETS.graves.category, GAME_ASSETS.graves.sheet);
            if (graveSheet) {
                GAME_ASSETS.graves.sheetImage = await this.loadImage(graveSheet.url);
                const dimensions = parseSpriteSheetDimensions(GAME_ASSETS.graves.sheet);
                GAME_ASSETS.graves.sheetImage.gridCols = dimensions.cols;
                GAME_ASSETS.graves.sheetImage.gridRows = dimensions.rows;
            }
        }
    }

    getGameAsset(type, category, name) {
        if (!this.gameAssets[type] || !this.gameAssets[type][category]) {
            return null;
        }
        return this.gameAssets[type][category][name];
    }

    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    async restart() {
        this.cleanup();
        window.tarSoulsGameInstance = new AshleyOnDutyEp2Game();
        await window.tarSoulsGameInstance.init();
        window.tarSoulsGameInstance.startGame();
    }
}

let tarSoulsGameInstance = null;

async function startEpisode2() {
    if (tarSoulsGameInstance) {
        tarSoulsGameInstance.cleanup();
    }

    tarSoulsGameInstance = new AshleyOnDutyEp2Game();
    window.tarSoulsGameInstance = tarSoulsGameInstance;
    await tarSoulsGameInstance.init();
}

async function startAshleyOnDuty(episode = 2) {
    await startEpisode2();
}

if (typeof window !== "undefined") {
    window.startEpisode2 = startEpisode2;
    window.startAshleyOnDuty = startAshleyOnDuty;
}
