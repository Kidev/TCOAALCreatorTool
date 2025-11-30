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
    constructor(config, x, y, loop = false, followEntity = null, numberToShow = null) {
        this.config = config;
        this.spritesheet = config.spritesheetImage;
        this.frames = config.index;
        if (config === GAME_EVENTS_ASSETS.EAT_ANIM || config === GAME_EVENTS_ASSETS.HIT_ANIM) {
            this.speed = GAME_CONFIG.EFFECT_ANIMATION_SPEED;
        } else {
            this.speed = config.speed;
        }
        this.x = x; // Grid position
        this.y = y;
        this.renderX = x;
        this.renderY = y;
        this.currentFrameIndex = 0;
        this.lastFrameTime = 0;
        this.finished = false;
        this.loop = loop; // If true, animation loops
        this.followEntity = followEntity; // If set, animation follows this entity (for follower_anim)
        this.numberToShow = numberToShow; // For showing numbers after eat/hit animations
        this.showingNumber = false;
        this.numberStartTime = 0;
    }

    update(timestamp, deltaTime) {
        // If following an entity, sync position
        if (this.followEntity) {
            this.x = this.followEntity.x;
            this.y = this.followEntity.y;
        }

        // Interpolate render position
        const lerpFactor = Math.min(1, GAME_CONFIG.INTERPOLATION_SPEED * (deltaTime / 16));
        this.renderX += (this.x - this.renderX) * lerpFactor;
        this.renderY += (this.y - this.renderY) * lerpFactor;

        // Handle number display
        if (this.showingNumber) {
            if (timestamp - this.numberStartTime >= GAME_CONFIG.NUMBER_DISPLAY_DURATION) {
                this.finished = true;
            }
            return;
        }

        // Update animation frame
        if (this.speed > 0 && timestamp - this.lastFrameTime >= this.speed) {
            this.currentFrameIndex++;

            if (this.currentFrameIndex >= this.frames.length) {
                if (this.loop) {
                    this.currentFrameIndex = 0;
                } else {
                    // Animation finished
                    if (this.numberToShow !== null) {
                        // Start showing number
                        this.showingNumber = true;
                        this.numberStartTime = timestamp;
                    } else {
                        this.finished = true;
                    }
                }
            }

            this.lastFrameTime = timestamp;
        }
    }

    getCurrentFrame() {
        if (this.showingNumber && this.numberToShow !== null) {
            // Show the number sprite
            return GAME_EVENTS_ASSETS.NUMBERS.index[this.numberToShow];
        }
        return this.frames[this.currentFrameIndex];
    }

    getCurrentSpritesheet() {
        if (this.showingNumber) {
            return GAME_EVENTS_ASSETS.NUMBERS.spritesheetImage;
        }
        return this.spritesheet;
    }
}

class WarningWave {
    constructor(x, color) {
        this.x = x; // Column x position
        this.color = color; // 'white' or 'red'
        this.cells = []; // Array of {y, opacity, delay}
        this.startTime = null;
        this.finished = false;
        this.waveDuration = 80; // Time between each cell lighting up (ms)
        this.fadeOutDuration = 1000; // How long cells stay visible before fading (ms)
        this.maxOpacity = 0.6; // Maximum opacity for the glow

        // Create cells from spawn point (ENEMY_SPAWN_Y) to top (y=0)
        for (let y = GAME_CONFIG.ENEMY_SPAWN_Y; y >= 0; y--) {
            const delay = (GAME_CONFIG.ENEMY_SPAWN_Y - y) * this.waveDuration;
            this.cells.push({
                y: y,
                opacity: 0,
                delay: delay,
            });
        }
    }

    update(timestamp) {
        if (this.startTime === null) {
            this.startTime = timestamp;
        }

        const elapsed = timestamp - this.startTime;
        let allFaded = true;

        for (const cell of this.cells) {
            const cellAge = elapsed - cell.delay;

            if (cellAge < 0) {
                cell.opacity = 0;
                allFaded = false;
            } else if (cellAge < this.fadeOutDuration) {
                cell.opacity = Math.min(this.maxOpacity, (cellAge / 200) * this.maxOpacity);
                allFaded = false;
            } else {
                const fadeProgress = (cellAge - this.fadeOutDuration) / 500;
                cell.opacity = Math.max(0, this.maxOpacity * (1 - fadeProgress));
                if (cell.opacity > 0) {
                    allFaded = false;
                }
            }
        }

        if (allFaded) {
            this.finished = true;
        }
    }
}

class Player {
    constructor(x, y, spritesheet, spriteIndices, difficultyConfig) {
        this.x = x;
        this.y = y;
        this.renderX = x;
        this.renderY = y;
        this.direction = DIRECTIONS.DOWN;
        this.directionQueue = [];
        this.pace = 0;
        this.difficultyConfig = difficultyConfig;
        this.speed = difficultyConfig.PLAYER_INITIAL_SPEED;
        this.followers = [];
        this.animator = new SpriteAnimator(spritesheet, spriteIndices, GAME_ASSETS.player_sprite.speed);
        this.lastMoveTime = 0;
        this.useDirectionalSprites = false; // Flag for Ashley sprite
        this.spriteConfig = null; // Store sprite config for directional sprites
    }

    queueDirection(newDirection) {
        const currentDirection = this.direction;

        if (newDirection.x === -currentDirection.x && newDirection.y === -currentDirection.y) {
            return; // Ignore 180-degree turns
        }

        this.directionQueue = [newDirection];
    }

    updateSpeed() {
        this.speed = Math.max(
            this.difficultyConfig.MIN_SPEED,
            this.difficultyConfig.PLAYER_INITIAL_SPEED - this.pace * this.difficultyConfig.SPEED_DECREASE_PER_PACE,
        );
    }

    updateDirectionalFrames() {
        if (!this.useDirectionalSprites || !this.spriteConfig || !this.spriteConfig.frames) {
            return;
        }

        let frameKey;
        if (this.direction.y < 0) {
            frameKey = "backward"; // Moving up (away from camera)
        } else if (this.direction.y > 0) {
            frameKey = "forward"; // Moving down (toward camera)
        } else if (this.direction.x < 0) {
            frameKey = "left"; // Moving left
        } else if (this.direction.x > 0) {
            frameKey = "right"; // Moving right
        } else {
            frameKey = "forward"; // Default
        }

        if (this.spriteConfig.frames[frameKey]) {
            this.animator.frames = this.spriteConfig.frames[frameKey];
        }
    }

    addFollower(enemy) {
        const follower = {
            x: this.x,
            y: this.y,
            renderX: this.x,
            renderY: this.y,
            animator: enemy.animator ? enemy.animator.clone() : null,
            type: enemy.type,
            config: enemy.config, // Store config for directional sprites
            direction: { x: 0, y: 1 }, // Initial direction (forward)
        };
        this.followers.push(follower);
        this.pace++;
        this.updateSpeed();
    }

    removeFollower() {
        if (this.followers.length > 0) {
            this.followers.pop();
        }
    }

    move(timestamp, manualOnly = false) {
        if (timestamp - this.lastMoveTime < this.speed) {
            return false;
        }

        if (manualOnly && this.directionQueue.length === 0) {
            return false;
        }

        if (this.directionQueue.length > 0) {
            this.direction = this.directionQueue.shift();
            this.updateDirectionalFrames(); // Update sprite direction
        }

        const prevPositions = [{ x: this.x, y: this.y }];

        for (let i = 0; i < this.followers.length; i++) {
            prevPositions.push({ x: this.followers[i].x, y: this.followers[i].y });
        }

        this.prevX = this.x;
        this.prevY = this.y;

        this.x += this.direction.x;
        this.y += this.direction.y;

        for (let i = 0; i < this.followers.length; i++) {
            const follower = this.followers[i];
            const oldX = follower.x;
            const oldY = follower.y;
            follower.x = prevPositions[i].x;
            follower.y = prevPositions[i].y;

            if (follower.animator && follower.config && follower.config.frames) {
                const dx = follower.x - oldX;
                const dy = follower.y - oldY;
                if (dx !== 0 || dy !== 0) {
                    follower.direction = { x: dx, y: dy };

                    let frameKey;
                    if (dy < 0) {
                        frameKey = "backward";
                    } else if (dy > 0) {
                        frameKey = "forward";
                    } else if (dx < 0) {
                        frameKey = "left";
                    } else if (dx > 0) {
                        frameKey = "right";
                    }

                    if (frameKey && follower.config.frames[frameKey]) {
                        follower.animator.frames = follower.config.frames[frameKey];
                    }
                }
            }
        }

        this.lastMoveTime = timestamp;
        return true;
    }

    update(timestamp, deltaTime) {
        this.animator.update(timestamp);

        for (const follower of this.followers) {
            if (follower.animator) {
                follower.animator.update(timestamp);
            }
        }

        const lerpFactor = Math.min(1, GAME_CONFIG.INTERPOLATION_SPEED * (deltaTime / 16));
        this.renderX += (this.x - this.renderX) * lerpFactor;
        this.renderY += (this.y - this.renderY) * lerpFactor;

        for (const follower of this.followers) {
            follower.renderX += (follower.x - follower.renderX) * lerpFactor;
            follower.renderY += (follower.y - follower.renderY) * lerpFactor;
        }
    }
}

class Enemy {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.renderX = x;
        this.renderY = y;
        this.direction = DIRECTIONS.UP;
        this.config = ENEMY_CONFIG[type];

        // Handle randomized speed range for certain enemies (like Ninas)
        if (this.config.speeds && Array.isArray(this.config.speeds)) {
            const [minSpeed, maxSpeed] = this.config.speeds;
            this.speed =
                minSpeed +
                Math.random() * (maxSpeed - minSpeed) +
                tarSoulsGameInstance.getDifficultyConfig().SPEED_OFFSET;
        } else {
            this.speed = this.config.speed + tarSoulsGameInstance.getDifficultyConfig().SPEED_OFFSET;
        }

        this.lastMoveTime = 0;
        this.blocked = false;
        this.movementCooldownUntil = 0; // Timestamp until which movement is disabled

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
            frameKey = "backward"; // Moving up (away from camera)
        } else if (this.direction.y > 0) {
            frameKey = "forward"; // Moving down (toward camera)
        } else if (this.direction.x < 0) {
            frameKey = "left"; // Moving left
        } else if (this.direction.x > 0) {
            frameKey = "right"; // Moving right
        } else {
            frameKey = "forward"; // Default
        }

        if (this.config.frames[frameKey] && frameKey !== this.currentAnimDirection) {
            this.currentAnimDirection = frameKey;
            this.animator.frames = this.config.frames[frameKey];
        }
    }

    move(timestamp, player = null, otherEnemies = []) {
        if (timestamp < this.movementCooldownUntil) {
            return false;
        }

        if (timestamp - this.lastMoveTime < this.speed) {
            return false;
        }

        this.prevX = this.x;
        this.prevY = this.y;

        if (this.type === ENEMY_TYPES.ENEMY_HUSSY && player) {
            const dx = player.x - this.x;
            const dy = player.y - this.y;

            let newX = this.x;
            let newY = this.y;
            let moveDir = { x: 0, y: 0 };

            if (Math.abs(dy) > 0) {
                moveDir.y = dy > 0 ? 1 : -1;
                newY += moveDir.y;
            } else if (Math.abs(dx) > 0) {
                moveDir.x = dx > 0 ? 1 : -1;
                newX += moveDir.x;
            }

            const isOccupied = otherEnemies.some((e) => e !== this && e.x === newX && e.y === newY);

            if (!isOccupied) {
                this.x = newX;
                this.y = newY;
                if (moveDir.x !== 0 || moveDir.y !== 0) {
                    this.direction = moveDir;
                    this.updateDirectionalFrames();
                }
            }
        } else {
            this.y += this.direction.y;
            this.updateDirectionalFrames();
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

    setBlocked(blocked) {
        this.blocked = blocked;
    }

    setMovementCooldown(timestamp, cooldownMs) {
        this.movementCooldownUntil = timestamp + cooldownMs;
    }
}

class AudioManager {
    constructor() {
        this.soundEffects = {
            playerMove: GAME_ASSETS.sound_effects.PLAYER_MOVE,
            eatSoul: GAME_ASSETS.sound_effects.EAT_SOUL,
            eatGrimeSoul: GAME_ASSETS.sound_effects.EAT_GRIME_SOUL,
            tarSoulSpawn: GAME_ASSETS.sound_effects.TAR_SOUL_SPAWN,
            andySpawned: GAME_ASSETS.sound_effects.ANDY_SPAWNED,
            gameOver: GAME_ASSETS.sound_effects.GAME_OVER,
            win: GAME_ASSETS.sound_effects.WIN,
            spawnAnim: GAME_ASSETS.sound_effects.SPAWN_ANIM,
            pocketDust: GAME_ASSETS.sound_effects.POCKET_DUST,
        };

        this.trackSource = "official"; // 'official' or 'kidev'
        this.backgroundMusic = {
            normal: GAME_ASSETS.music.NORMAL,
            andyIsHere: GAME_ASSETS.music.ANDY_IS_HERE,
        };

        this.currentMusic = null;
        this.currentMusicName = null;
        this.musicMuted = false;
        this.soundMuted = false;
    }

    playSound(soundName, volume = 1.0) {
        if (this.soundMuted) return;

        const sound = this.soundEffects[soundName];
        if (sound) {
            sound.currentTime = 0;
            sound.volume = volume;
            sound.play().catch((e) => console.log("Audio play failed:", e));
        } else {
            //console.log(`[AUDIO PLACEHOLDER] ${soundName}`);
        }
    }

    playMusic(musicName) {
        const music = this.backgroundMusic[musicName];
        if (this.currentMusic) {
            this.currentMusic.pause();
            this.currentMusic.currentTime = 0;
        }

        if (music) {
            this.currentMusic = music;
            this.currentMusicName = musicName;
            music.loop = true;
            if (!this.musicMuted) {
                music.play().catch((e) => console.log("Music play failed:", e));
            }
        } else {
            //console.log(`[MUSIC PLACEHOLDER] ${musicName}`);
        }
    }

    stopMusic() {
        if (this.currentMusic) {
            this.currentMusic.pause();
            this.currentMusic.currentTime = 0;
            this.currentMusic = null;
        }
    }

    setMusicMuted(muted) {
        this.musicMuted = muted;
        if (this.currentMusic) {
            if (muted) {
                this.currentMusic.pause();
            } else {
                this.currentMusic.play().catch((e) => console.log("Music play failed:", e));
            }
        }
    }

    setSoundMuted(muted) {
        this.soundMuted = muted;
    }

    setTrackSource(source, gameAssets) {
        this.trackSource = source;
        const musicSource = source === "kidev" ? GAME_ASSETS.music_kidev : GAME_ASSETS.music;

        this.backgroundMusic = {
            normal: this.createAudioElement(gameAssets, musicSource.NORMAL),
            andyIsHere: this.createAudioElement(gameAssets, musicSource.ANDY_IS_HERE),
        };

        if (this.currentMusicName && this.currentMusic) {
            const wasPlaying = !this.currentMusic.paused;
            this.currentMusic.pause();
            this.currentMusic.currentTime = 0;

            const newMusic = this.backgroundMusic[this.currentMusicName];
            if (newMusic) {
                this.currentMusic = newMusic;
                newMusic.loop = true;
                if (wasPlaying && !this.musicMuted) {
                    newMusic.play().catch((e) => console.log("Music play failed:", e));
                }
            }
        }
    }

    createAudioElement(gameAssets, filename) {
        if (!filename) return null;

        if (filename.startsWith("music/")) {
            const audio = new Audio(filename);
            audio.preload = "auto";
            return audio;
        }

        const asset = gameAssets?.audio?.["Background songs"]?.[filename];
        if (asset?.url) {
            const audio = new Audio(asset.url);
            audio.preload = "auto";
            return audio;
        }

        return null;
    }
}

class CollisionDetector {
    static checkWallCollision(entity) {
        return (
            entity.x < 0 || entity.x >= GAME_CONFIG.GRID_WIDTH || entity.y < 0 || entity.y >= GAME_CONFIG.GRID_HEIGHT
        );
    }

    static checkPlayerBoundary(player) {
        return player.y > GAME_CONFIG.PLAYER_MIN_Y;
    }

    static checkSelfCollision(player) {
        for (const follower of player.followers) {
            if (follower.x === player.x && follower.y === player.y) {
                return true;
            }
        }
        return false;
    }

    static checkEnemyCollision(player, enemy) {
        if (player.x === enemy.x && player.y === enemy.y) {
            return true;
        }

        if (player.prevX === undefined || enemy.prevX === undefined) {
            return false;
        }

        const crossed =
            player.prevX === enemy.x &&
            player.prevY === enemy.y &&
            enemy.prevX === player.x &&
            enemy.prevY === player.y;

        return crossed;
    }

    static checkStrictCollision(player, enemy) {
        return player.x === enemy.x && player.y === enemy.y;
    }

    static checkEnemyBlockedByTail(enemy, player) {
        for (const follower of player.followers) {
            if (follower.x === enemy.x + enemy.direction.x && follower.y === enemy.y + enemy.direction.y) {
                return true;
            }
        }
        return false;
    }

    static checkEnemyTailCollision(enemy, player) {
        for (let i = 0; i < player.followers.length; i++) {
            const follower = player.followers[i];
            if (follower.x === enemy.x && follower.y === enemy.y) {
                return i;
            }
        }
        return -1; // No collision
    }

    static checkEnemyReachedTop(enemy) {
        return enemy.y < 0;
    }
}

class TarSoulsGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.player = null;
        this.enemies = [];
        this.gameState = "beforeGame"; // beforeGame, playing, paused, won, lost
        this.keyLayout = null; // Will be set in init()
        this.audioManager = null; // Will be created in init()
        this.backgroundImage = null;
        this.playerSpritesheet = null;
        this.playerSpriteIndices = null; // Will be set in init()
        this.originalPlayerSpritesheet = null; // Backup for restart
        this.originalPlayerSpriteIndices = null; // Will be set in init()
        this.cameraY = 0;
        this.cameraRenderY = 0;
        this.lastTimestamp = 0;
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 3000;
        this.enemySpawnCount = 0; // Track total enemies spawned for grace period
        this.andySpawned = false;
        this.boundHandleKeyDown = this.handleKeyDown.bind(this);
        this.boundGameLoop = this.gameLoop.bind(this);
        this.animationFrameId = null;

        this.gameAssets = null;

        this.canvasWidth = 0;
        this.canvasHeight = 0;
        this.bgScale = 1;
        this.bgOffsetX = 0;
        this.bgOffsetY = 0;

        this.animations = [];
        this.staticSprites = [];
        this.warningWaves = [];
        this.spawnAnimPlaying = false;
        this.playerVisible = false;
        this.waitingForFirstInput = false;

        this.phase2Active = false;
        this.ninasAlive = 0;
        this.pocketDustActive = null;
        this.lastPocketDustTime = 0;
        this.attackQueued = false; // Only 1 attack action buffered
        this.lastPlayerMoveTime = 0;
        this.victoryPortalActive = false;

        // Timer tracking for speedrun
        this.gameStartTime = 0;
        this.gameTotalTime = 0; // Total active play time in ms
        this.gameTimerActive = false;
        this.lastTimerUpdate = 0;

        this.difficulty = "normal";
    }

    async init(episode = 1) {
        this.episode = episode;

        const episodeConfig = episode === 1 ? getEpisode1Config() : getEpisode2Config();

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
        this.playerSpriteIndices = window.GAME_ASSETS.player_sprite.indices;
        this.originalPlayerSpriteIndices = window.GAME_ASSETS.player_sprite.indices;
        this.audioManager = new AudioManager();

        this.gameAssets = await window.memoryManager.loadSavedAssets();

        this.createGameUI();

        await this.loadAssets();

        this.setupCanvas();

        this.player = new Player(
            GAME_CONFIG.PLAYER_START_X,
            GAME_CONFIG.PLAYER_START_Y,
            this.playerSpritesheet,
            this.playerSpriteIndices,
            this.getDifficultyConfig(),
        );

        const scaledPlayAreaY = GAME_CONFIG.PLAY_AREA_Y * this.bgScale;
        const scaledCellSize = GAME_CONFIG.CELL_SIZE * this.bgScale;
        const playerScreenY = scaledPlayAreaY + GAME_CONFIG.PLAYER_START_Y * scaledCellSize;
        this.cameraY = playerScreenY - this.canvasHeight / 2;

        const scaledBgHeight = this.backgroundImage ? this.backgroundImage.height * this.bgScale : this.canvasHeight;
        const maxCameraY = scaledBgHeight - this.canvasHeight;
        this.cameraY = Math.max(0, Math.min(this.cameraY, maxCameraY));
        this.cameraRenderY = this.cameraY;

        window.addEventListener("keydown", this.boundHandleKeyDown);

        // Auto-pause when window loses focus
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

    createGameUI() {
        const dialogContainer = document.querySelector(".dialog-container");
        const controls = document.getElementById("controlsContainer");
        if (dialogContainer) dialogContainer.style.display = "none";
        if (controls) controls.style.display = "none";

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

        this.boundHandleResize = this.handleResize.bind(this);
        window.addEventListener("resize", this.boundHandleResize);

        this.setDifficulty(this.difficulty);
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
        leftArrow.style.cssText = `
            background: none;
            border: none;
            color: #666;
            font-size: 1.2vmax;
            cursor: not-allowed;
            padding: 0;
            opacity: 0.5;
        `;
        leftArrow.disabled = true;

        const episodeTitle = document.createElement("span");
        episodeTitle.textContent = "Saving Andrew's Privates";
        episodeTitle.style.cssText = `
            flex: 1;
            text-align: center;
            font-size: 0.9vmax;
        `;

        const rightArrow = document.createElement("button");
        rightArrow.textContent = "▶";
        rightArrow.title = "Episode 2";
        rightArrow.style.cssText = `
            background: none;
            border: none;
            color: var(--text-color);
            font-size: 1.2vmax;
            cursor: pointer;
            padding: 0;
        `;
        rightArrow.onclick = () => {
            startAshleyOnDuty(2);
        };

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

        // Add hover animation listeners
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
        const hasEasyBest = localStorage.getItem("ashleyOnDuty_ep1_easy_bestTime");
        easyButton.textContent = hasEasyBest ? "✔ Easy" : "Easy";
        easyButton.onclick = () => this.setDifficulty("easy");
        easyButton.style.cssText = "flex: 1;";
        difficultyContainer.appendChild(easyButton);

        const normalButton = document.createElement("button");
        normalButton.className = "tcoaal-button-tarsouls-small";
        normalButton.id = "tarSoulsDiffNormal";
        const hasNormalBest = localStorage.getItem("ashleyOnDuty_ep1_normal_bestTime");
        normalButton.textContent = hasNormalBest ? "✔ Normal" : "Normal";
        normalButton.onclick = () => this.setDifficulty("normal");
        normalButton.style.cssText = "flex: 1;";
        difficultyContainer.appendChild(normalButton);

        const hardButton = document.createElement("button");
        hardButton.className = "tcoaal-button-tarsouls-small";
        hardButton.id = "tarSoulsDiffHard";
        const hasHardBest = localStorage.getItem("ashleyOnDuty_ep1_hard_bestTime");
        hardButton.textContent = hasHardBest ? "✔ Hard" : "Hard";
        hardButton.onclick = () => this.setDifficulty("hard");
        hardButton.style.cssText = "flex: 1;";
        difficultyContainer.appendChild(hardButton);

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

    async loadAssets() {
        const bgAsset = this.getGameAsset("images", GAME_ASSETS.background.category, GAME_ASSETS.background.image);
        if (bgAsset) {
            this.backgroundImage = await this.loadImage(bgAsset.url);
        } else {
            console.warn("Background image not found in game assets");
        }

        const parseSpriteSheetDimensions = (filename) => {
            const match = filename.match(/spritessheet_(\d+)x(\d+)_/);
            if (match) {
                return {
                    cols: parseInt(match[1]),
                    rows: parseInt(match[2]),
                };
            }
            return { cols: 12, rows: 8 };
        };

        const playerSheet = this.getGameAsset(
            "images",
            GAME_ASSETS.player_sprite.category,
            GAME_ASSETS.player_sprite.sheet,
        );
        if (playerSheet) {
            this.playerSpritesheet = await this.loadImage(playerSheet.url);
            const dimensions = parseSpriteSheetDimensions(GAME_ASSETS.player_sprite.sheet);
            this.playerSpritesheet.gridCols = dimensions.cols;
            this.originalPlayerSpritesheet = this.playerSpritesheet;
            this.playerSpritesheet.gridRows = dimensions.rows;
        } else {
            console.warn("Player spritesheet not found in game assets");
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
                } else {
                    console.warn(`Enemy ${i} spritesheet not found in ${config.category}: ${config.spritesheet}`);
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
                    console.warn(`Sound effect not found: ${value}`);
                    this.audioManager.soundEffects[key] = null;
                }
            }
        }

        for (const [key, value] of Object.entries(this.audioManager.backgroundMusic)) {
            if (value && typeof value === "string") {
                const musicAsset = this.getGameAsset("audio", "Background songs", value);
                if (musicAsset) {
                    const audio = new Audio(musicAsset.url);
                    audio.loop = true;
                    this.audioManager.backgroundMusic[key] = audio;
                } else {
                    console.warn(`Background music not found: ${value}`);
                    this.audioManager.backgroundMusic[key] = null;
                }
            }
        }

        const animSheets = new Set();
        for (const [key, config] of Object.entries(GAME_EVENTS_ASSETS)) {
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
            } else {
                console.warn(`Animation spritesheet not found: ${conf}`);
            }
        }
    }

    getGameAsset(type, category, name) {
        //console.log(this.gameAssets);
        if (!this.gameAssets[type] || !this.gameAssets[type][category]) {
            console.warn(`Game assets not available: ${type}`);
            return null;
        }
        const asset = this.gameAssets[type][category][name];
        if (!asset) {
            console.warn(`Asset not found: ${name} in ${category}`);
        }
        return asset;
    }

    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    setupCanvas() {
        this.ctx.imageSmoothingEnabled = false;

        if (this.backgroundImage) {
            this.bgScale = this.canvasWidth / this.backgroundImage.width;

            const scaledBgHeight = this.backgroundImage.height * this.bgScale;
            this.bgOffsetX = 0;
            this.bgOffsetY = 0;
        }
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

    toggleKeyLayout() {
        if (this.keyLayout === KEY_LAYOUTS.QWERTY) {
            this.keyLayout = KEY_LAYOUTS.AZERTY;
            document.getElementById("tarSoulsLayoutBtn").textContent = "Layout: AZERTY";
            const controlKeys = document.getElementById("tarSoulsControlKeys");
            if (controlKeys) controlKeys.textContent = "ZQSD";
        } else {
            this.keyLayout = KEY_LAYOUTS.QWERTY;
            document.getElementById("tarSoulsLayoutBtn").textContent = "Layout: QWERTY";
            const controlKeys = document.getElementById("tarSoulsControlKeys");
            if (controlKeys) controlKeys.textContent = "WASD";
        }
    }

    toggleMuteMusic() {
        this.audioManager.setMusicMuted(!this.audioManager.musicMuted);
        const btn = document.getElementById("tarSoulsMuteMusicBtn");
        if (btn) {
            btn.textContent = this.audioManager.musicMuted ? "Music: OFF" : "Music: ON";
        }
    }

    toggleTrackSource() {
        const newSource = this.audioManager.trackSource === "official" ? "kidev" : "official";
        this.audioManager.setTrackSource(newSource, this.gameAssets);
        const btn = document.getElementById("tarSoulsTrackSourceBtn");
        if (btn) {
            btn.textContent = newSource === "official" ? "Tracks: Official" : "Tracks: Kidev";
        }
    }

    toggleMuteSound() {
        this.audioManager.setSoundMuted(!this.audioManager.soundMuted);
        const btn = document.getElementById("tarSoulsMuteSoundBtn");
        if (btn) {
            btn.textContent = this.audioManager.soundMuted ? "Sound FX: OFF" : "Sound FX: ON";
        }
    }

    setDifficulty(difficulty) {
        this.difficulty = difficulty;

        const easyBtn = document.getElementById("tarSoulsDiffEasy");
        const normalBtn = document.getElementById("tarSoulsDiffNormal");
        const hardBtn = document.getElementById("tarSoulsDiffHard");

        if (easyBtn) {
            easyBtn.style.background = "";
            easyBtn.style.boxShadow = "";
            easyBtn.style.border = "";
        }
        if (normalBtn) {
            normalBtn.style.background = "";
            normalBtn.style.boxShadow = "";
            normalBtn.style.border = "";
        }
        if (hardBtn) {
            hardBtn.style.background = "";
            hardBtn.style.boxShadow = "";
            hardBtn.style.border = "";
        }

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
        }

        //console.log(`Difficulty set to: ${difficulty}`);

        this.updateRulesForDifficulty();
        this.displayBestScore();
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
            this.resumeTimer(performance.now());

            if (leftSidebar) leftSidebar.style.display = "none";
            if (rightSidebar) rightSidebar.style.display = "none";
        }
    }

    startGame() {
        this.player = new Player(
            GAME_CONFIG.PLAYER_START_X,
            GAME_CONFIG.PLAYER_START_Y,
            this.playerSpritesheet,
            this.playerSpriteIndices,
            this.getDifficultyConfig(),
        );

        this.enemies = [];
        this.enemySpawnTimer = 0;
        this.enemySpawnCount = 0; // Reset spawn counter for grace period
        this.andySpawned = false;

        // Initialize camera centered on player spawn position to avoid jump
        const scaledPlayAreaY = GAME_CONFIG.PLAY_AREA_Y * this.bgScale;
        const scaledCellSize = GAME_CONFIG.CELL_SIZE * this.bgScale;
        const playerScreenY = scaledPlayAreaY + GAME_CONFIG.PLAYER_START_Y * scaledCellSize;
        this.cameraY = playerScreenY - this.canvasHeight / 2;

        const scaledBgHeight = this.backgroundImage ? this.backgroundImage.height * this.bgScale : this.canvasHeight;
        const maxCameraY = scaledBgHeight - this.canvasHeight;
        this.cameraY = Math.max(0, Math.min(this.cameraY, maxCameraY));
        this.cameraRenderY = this.cameraY; // Set render position to match immediately

        this.animations = [];
        this.staticSprites = [];
        this.warningWaves = [];

        this.phase2Active = false;
        this.ninasAlive = 0;
        this.pocketDustActive = null;
        this.lastPocketDustTime = 0;
        this.attackQueued = false;
        this.lastPlayerMoveTime = 0;
        this.victoryPortalActive = false;

        const startBtn = document.getElementById("tarSoulsStartBtn");
        const pauseBtn = document.getElementById("tarSoulsPauseBtn");
        const restartBtn = document.getElementById("tarSoulsRestartBtn");
        const leftSidebar = document.getElementById("tarSoulsLeftSidebar");
        const rightSidebar = document.getElementById("tarSoulsInstructionsPanel");

        // Disable difficulty buttons when game starts
        const easyBtn = document.getElementById("tarSoulsDiffEasy");
        const normalBtn = document.getElementById("tarSoulsDiffNormal");
        const hardBtn = document.getElementById("tarSoulsDiffHard");
        if (easyBtn) easyBtn.disabled = true;
        if (normalBtn) normalBtn.disabled = true;
        if (hardBtn) hardBtn.disabled = true;

        if (startBtn) startBtn.style.display = "none";
        if (pauseBtn) pauseBtn.style.display = "block";
        if (restartBtn) restartBtn.style.display = "block";
        if (leftSidebar) leftSidebar.style.display = "none";
        if (rightSidebar) rightSidebar.style.display = "none";

        for (let x = 0; x < GAME_CONFIG.GRID_WIDTH; x++) {
            this.staticSprites.push({
                x: x,
                y: GAME_CONFIG.PLAYER_MIN_Y,
                config: GAME_EVENTS_ASSETS.LIMIT_PLAYER,
            });
        }

        this.spawnAnimPlaying = true;
        this.playerVisible = false;
        const spawnAnim = new GameAnimation(
            GAME_EVENTS_ASSETS.SPAWN_ANIM,
            GAME_CONFIG.PLAYER_START_X,
            GAME_CONFIG.PLAYER_START_Y,
            false,
        );
        this.animations.push(spawnAnim);

        this.audioManager.playMusic("normal");

        this.gameState = "playing";
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
                let drawWidth = size;
                let drawHeight = size;
                let drawX = 0;
                let drawY = 0;

                if (is2x1) {
                    drawWidth = size / 2;
                    drawHeight = size;
                    drawX = size / 4;
                    drawY = 0;
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
                ctx.fillStyle = colors[type];
                ctx.fillRect(0, 0, size, size);
            }

            return canvas;
        };

        const soulIcon = createSpriteIcon(ENEMY_TYPES.ENEMY_SOUL);
        const grimeIcon = createSpriteIcon(ENEMY_TYPES.ENEMY_GRIME);
        const tarIcon = createSpriteIcon(ENEMY_TYPES.ENEMY_TAR);
        const andyIcon = createSpriteIcon(ENEMY_TYPES.ENEMY_ANDY);
        const ninaIcon = createSpriteIcon(ENEMY_TYPES.ENEMY_HUSSY);

        instructionsPanel.innerHTML = `
            <h2 style="color: var(--purple, #e2829a); margin-top: 2vmax; margin-bottom:0.5vmax; font-size:1.2vmax;display:flex; justify-content:center;">Description</h2>
            <p style="margin-bottom: 1.11vmax;text-align:justify;">Ashley must venture through the demon realm to save Andy from the hussies. She needs to collect pure Souls, avoid Grime Souls, and sometimes sacrifice some of her Souls to prevent a Tar Soul from Ascending! Once powerful enough, she'll be able to summon and grab her useless brother. Finally, she must dust off the hussies to open the portal back to the human realm and leave!</p>
<p style="margin-bottom: 1.11vmax;"><ul style="padding-left: 0; margin-bottom: 1.11vmax;">
            <li>Do not go into the Shadows at the bottom of the area</li>
            <li>Do not Ascend, stay below the top of the area</li>
            <li>Catch Souls by touching them</li>
            <li>Push Tar Souls and Grime Souls by touching them</li>
            <li>Pushing from the sides will push them down, otherwise it'll push them sideways</li>
            <li>Pushed Souls affect what they hit</li>
            <li>Tar Soul cannot be allowed to Ascend, but they disappear after stealing at least one Soul. Use this at your advantage</li>
            <li>Grime Souls steal one Soul but keep moving, just avoid them</li>
</ul></p>

            <h2 style="color: var(--purple, #e2829a); margin-bottom:0.5vmax;margin-top:2vmax; font-size: 1.2vmax;display:flex; justify-content:center;">Characters</h2>
            <div style="margin-bottom: 15px;">
                <div id="soulEntity" style="margin-bottom: 12px; display: flex; align-items: center; gap: 12px;">
                    <div><strong>Soul</strong> - Your favourite food!</div>
                </div>
                <div id="grimeEntity" style="margin-bottom: 12px; display: flex; align-items: center; gap: 12px;">
                    <div><strong>Grime Soul</strong> - If it touches your Souls, it steals one!</div>
                </div>
                <div id="tarEntity" style="margin-bottom: 12px; display: flex; align-items: center; gap: 12px;">
                    <div><strong>Tar Soul</strong> - It MUST NOT Ascend! If it touches your Souls, it vanishes but steals all Souls after the one it touched.</div>
                </div>
                <div id="ninaEntity" style="margin-bottom: 12px; display: flex; align-items: center; gap: 12px;">
                    <div><strong>Nina</strong> - Must be dusted. Leaves cute box when she dies: don't touch it, she will escape!</div>
                </div>
                <div id="andyEntity" style="margin-bottom: 12px; display: flex; align-items: center; gap: 12px;">
                    <div><strong>Andy</strong> - Appears once you own enough Souls. Grab him, dust off the hussies and leave!</div>
                </div>
            </div>

            <h2 style="color: var(--purple, #e2829a); margin-top: 2vmax; margin-bottom:0; font-size: 1.2vmax;display:flex;justify-content:center;">Controls</h2>
            <ul style="padding-inline-start: 0;color: var(--txt-color, #ddd); font-family: TCOAAL, monospace; font-size: 0.75vmax; line-height: 1.4; z-index: 10;padding-left: 0; margin-bottom: 1.11vmax; list-style: none; text-align: center;padding-top: 0;margin-top:0;">
                <li>Move around using <strong id="tarSoulsControlKeys">WASD</strong> or <strong style="font-size: 1.2vmax;">←↑↓→</strong></li>
                <li>Throw dust using <strong>E</strong> or <strong>SPACE</strong></li>
                <li>Pause using <strong>ESC</strong></li>
            </ul>
        `;

        const soulDiv = instructionsPanel.querySelector("#soulEntity");
        const grimeDiv = instructionsPanel.querySelector("#grimeEntity");
        const tarDiv = instructionsPanel.querySelector("#tarEntity");
        const ninaDiv = instructionsPanel.querySelector("#ninaEntity");
        const andyDiv = instructionsPanel.querySelector("#andyEntity");

        if (soulDiv) soulDiv.insertBefore(soulIcon, soulDiv.firstChild);
        if (grimeDiv) grimeDiv.insertBefore(grimeIcon, grimeDiv.firstChild);
        if (tarDiv) tarDiv.insertBefore(tarIcon, tarDiv.firstChild);
        if (ninaDiv) ninaDiv.insertBefore(ninaIcon, ninaDiv.firstChild);
        if (andyDiv) andyDiv.insertBefore(andyIcon, andyDiv.firstChild);

        this.updateRulesForDifficulty();
        this.displayBestScore();
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

    updateRulesForDifficulty() {
        const rulesList = document.getElementById("tarSoulsRulesList");
        if (!rulesList) return;

        rulesList.innerHTML = "";

        const config = this.getDifficultyConfig();
        const commonRules = [
            `Get ${config.FOLLOWERS_NEEDED_FOR_ANDY} Souls without letting a Tar Soul Ascend`,
            `Catch Andy, kill ${config.NINAS_TO_SPAWN} hussies and escape`,
            //`First ${config.GRACE_SPAWNS} enemies cannot be Tar Souls`,
        ];

        const wallBehaviorText = {
            teleport: "get to the opposite side",
            push_down: "get forced down",
            game_over: "die",
        };

        const difficultyRules = [
            `When touching side walls, you ${wallBehaviorText[config.WALL_BEHAVIOR]}`,
            //`<strong>Initial speed:</strong> ${config.PLAYER_INITIAL_SPEED}ms per move`,
            //`<strong>Speed decrease:</strong> ${config.SPEED_DECREASE_PER_PACE}ms per follower`,
            //`<strong>Min speed:</strong> ${config.MIN_SPEED}ms`,
            this.difficulty === "easy"
                ? `You move carefully and have time to react`
                : this.difficulty === "normal"
                  ? `You move decisively`
                  : `You move very fast`,
        ];

        //const spawnRates = `There is ${Math.round(config.SOUL_SPAWN_RATE * 100)}% Souls, ${Math.round(config.GRIME_SPAWN_RATE * 100)}% Grime Souls and ${Math.round(config.TAR_SPAWN_RATE * 100)}% Tar Souls`;
        const spawnRates =
            this.difficulty === "easy"
                ? `Mostly Souls, few Grime Souls, rarely Tar Souls`
                : this.difficulty === "normal"
                  ? `Some Souls, few Grime Souls, few Tar Souls`
                  : `As many Souls as Grime Souls, few Tar Souls`;

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

        if (spawnRates) {
            const li = document.createElement("li");
            li.innerHTML = `${spawnRates}`;
            rulesList.appendChild(li);
        }
    }

    handleKeyDown(event) {
        const code = event.code;

        if (code === "Escape" || code === "KeyP") {
            if (this.gameState === "playing" || this.gameState === "paused") {
                this.togglePause();
                event.preventDefault();
            }
            return;
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
            this.startTimer(performance.now());
        }

        if (code === "Space" && this.phase2Active) {
            this.attackQueued = true;
            event.preventDefault();
        }
    }

    throwPocketDust() {
        const now = performance.now();

        if (now - this.lastPocketDustTime < GAME_CONFIG.POCKET_DUST_COOLDOWN) {
            return;
        }

        //if (this.pocketDustActive) return;

        // Create dust clouds at 2 positions: 1 block away and 2 blocks away
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

        // Filter out positions outside grid
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

            for (let i = this.enemies.length - 1; i >= 0; i--) {
                const enemy = this.enemies[i];
                if (enemy.type === ENEMY_TYPES.ENEMY_HUSSY && enemy.x === pos.x && enemy.y === pos.y) {
                    this.killNina(enemy, i);
                }
            }
        }

        this.pocketDustActive = {
            x: validPositions[0].x,
            y: validPositions[0].y,
            ticksRemaining: 1,
        };
    }

    killNina(nina, ninaIndex) {
        this.staticSprites.push({
            x: nina.x,
            y: nina.y,
            config: GAME_EVENTS_ASSETS.DEAD_HUSSY,
            blocksMovement: true,
        });

        this.enemies.splice(ninaIndex, 1);
        this.ninasAlive--;

        if (this.ninasAlive === 0) {
            this.spawnVictoryPortal();
        }
    }

    respawnNinaFromBox(x, y, timestamp) {
        const config = this.getDifficultyConfig();
        const nina = new Enemy(ENEMY_TYPES.ENEMY_HUSSY, x, y);
        nina.renderX = x;
        nina.renderY = y;
        nina.direction = DIRECTIONS.DOWN; // Ninas move down towards the player
        nina.setMovementCooldown(timestamp, config.NINA_RESPAWN_COOLDOWN);
        this.enemies.push(nina);
        this.ninasAlive++;
    }

    handlePlayerPushbackBoundaries() {
        const hitLeftWall = this.player.x < 0;
        const hitRightWall = this.player.x >= GAME_CONFIG.GRID_WIDTH;
        const hitTopWall = this.player.y < 0;
        const hitBottomWall = this.player.y >= GAME_CONFIG.GRID_HEIGHT;

        // Top/bottom walls are always game over
        if (hitTopWall || hitBottomWall) {
            this.gameOver("Hit the wall!");
            return;
        }

        // Left/right wall behavior depends on difficulty
        if (hitLeftWall || hitRightWall) {
            if (this.difficulty === "easy") {
                // Teleport to opposite side
                if (hitLeftWall) {
                    this.player.x = GAME_CONFIG.GRID_WIDTH - 1;
                    this.player.renderX = GAME_CONFIG.GRID_WIDTH - 1;
                } else if (hitRightWall) {
                    this.player.x = 0;
                    this.player.renderX = 0;
                }
            } else if (this.difficulty === "normal") {
                // Push down
                this.player.direction = DIRECTIONS.DOWN;
                this.player.y += 1;
                this.player.directionQueue = [];
                this.player.x = Math.max(0, Math.min(GAME_CONFIG.GRID_WIDTH - 1, this.player.x));
                this.player.renderX = this.player.x;
            } else {
                this.gameOver("You fell in the void!");
                return;
            }
        }

        if (!this.phase2Active && CollisionDetector.checkPlayerBoundary(this.player)) {
            this.gameOver("You got lost in the Shadows!");
            return;
        }
    }

    spawnVictoryPortal() {
        this.victoryPortalActive = true;

        const portalAnim = new GameAnimation(
            GAME_EVENTS_ASSETS.SPAWN_ANIM,
            GAME_CONFIG.PLAYER_START_X,
            GAME_CONFIG.PLAYER_START_Y,
            true,
        );
        this.animations.push(portalAnim);
    }

    startPhase2(andyEnemy) {
        this.phase2Active = true;

        this.player.followers = [];
        this.player.addFollower(andyEnemy);

        const ashleySheet = this.getGameAsset(
            "images",
            GAME_ASSETS.player_ashley.category,
            GAME_ASSETS.player_ashley.spritesheet,
        );
        if (ashleySheet) {
            this.loadImage(ashleySheet.url).then((loadedSheet) => {
                const parseSpriteSheetDimensions = (filename) => {
                    const match = filename.match(/spritessheet_(\d+)x(\d+)_/);
                    if (match) {
                        return { cols: parseInt(match[1]), rows: parseInt(match[2]) };
                    }
                    return { cols: 12, rows: 8 };
                };
                const dimensions = parseSpriteSheetDimensions(GAME_ASSETS.player_ashley.spritesheet);
                loadedSheet.gridCols = dimensions.cols;
                loadedSheet.gridRows = dimensions.rows;
                this.playerSpritesheet = loadedSheet;
                this.player.animator.spritesheet = loadedSheet;

                this.player.useDirectionalSprites = true;
                this.player.spriteConfig = GAME_ASSETS.player_ashley;

                this.player.updateDirectionalFrames();
            });
        }

        const winAnim = new GameAnimation(GAME_EVENTS_ASSETS.WIN_ANIM, this.player.x, this.player.y, true, this.player);
        this.animations.push(winAnim);

        const config = this.getDifficultyConfig();
        const ninasToSpawn = Math.min(config.NINAS_TO_SPAWN, GAME_CONFIG.GRID_WIDTH);
        const spacing = GAME_CONFIG.GRID_WIDTH / ninasToSpawn;

        for (let i = 0; i < ninasToSpawn; i++) {
            const x = Math.floor(i * spacing);
            this.spawnEnemy(ENEMY_TYPES.ENEMY_HUSSY, x);

            const nina = this.enemies[this.enemies.length - 1];
            nina.y = 0;
            nina.renderY = 0;
            nina.direction = DIRECTIONS.DOWN; // Ninas move down towards the player
            this.ninasAlive++;
        }
    }

    spawnEnemy(type, x) {
        const enemy = new Enemy(type, x, GAME_CONFIG.ENEMY_SPAWN_Y);
        this.enemies.push(enemy);

        if (type === ENEMY_TYPES.ENEMY_ANDY) {
            const scaledPlayAreaY = GAME_CONFIG.PLAY_AREA_Y * this.bgScale;
            const scaledCellSize = GAME_CONFIG.CELL_SIZE * this.bgScale;

            const cameraTopGridY = Math.floor((this.cameraY - scaledPlayAreaY) / scaledCellSize);
            const visibleRows = Math.floor(this.canvasHeight / scaledCellSize);
            const cameraBottomGridY = cameraTopGridY + visibleRows - 1;

            let indicatorY;

            if (enemy.y >= cameraTopGridY && enemy.y <= cameraBottomGridY) {
                indicatorY = enemy.y - 1;
            } else {
                indicatorY = cameraBottomGridY;
            }

            const heartAnim = new GameAnimation(GAME_EVENTS_ASSETS.GREEN_HEART_ANIM, x, indicatorY, false);
            this.animations.push(heartAnim);
            this.audioManager.playSound("andySpawned", 0.25);
        } else if (type === ENEMY_TYPES.ENEMY_TAR) {
            const scaledPlayAreaY = GAME_CONFIG.PLAY_AREA_Y * this.bgScale;
            const scaledCellSize = GAME_CONFIG.CELL_SIZE * this.bgScale;

            const cameraTopGridY = Math.floor((this.cameraY - scaledPlayAreaY) / scaledCellSize);
            const visibleRows = Math.floor(this.canvasHeight / scaledCellSize);
            const cameraBottomGridY = cameraTopGridY + visibleRows - 1;

            let indicatorY;

            if (enemy.y >= cameraTopGridY && enemy.y <= cameraBottomGridY) {
                indicatorY = enemy.y - 1;
            } else {
                indicatorY = cameraBottomGridY;
            }

            const skullAnim = new GameAnimation(GAME_EVENTS_ASSETS.SKULL_ANIM, x, indicatorY, false);
            this.animations.push(skullAnim);
            this.audioManager.playSound("tarSoulSpawn", 0.25);
        }
    }

    spawnRandomEnemy() {
        if (this.phase2Active) {
            const config = this.getDifficultyConfig();
            const rand = Math.random();
            let type;

            // Check if we should spawn a tar soul (50% chance)
            if (rand < 0.5) {
                // Only spawn tar soul if we haven't reached the limit
                const activeTarSouls = this.countActiveTarSouls();
                if (activeTarSouls < config.MAX_TAR_SOULS) {
                    type = ENEMY_TYPES.ENEMY_TAR;
                } else {
                    type = ENEMY_TYPES.ENEMY_GRIME;
                }
            } else {
                type = ENEMY_TYPES.ENEMY_GRIME;
            }

            const offset = Math.random() < 0.5 ? -1 : 1;
            let x = this.player.x + offset;
            x = Math.max(0, Math.min(GAME_CONFIG.GRID_WIDTH - 1, x));

            this.spawnEnemy(type, x);
            this.enemySpawnCount++;
        } else {
            const config = this.getDifficultyConfig();
            const rand = Math.random();
            let type;
            let x;

            if (rand < config.SOUL_SPAWN_RATE) {
                type = ENEMY_TYPES.ENEMY_SOUL;
                x = this.getFarthestXFromPlayer();
            } else if (rand < config.SOUL_SPAWN_RATE + config.GRIME_SPAWN_RATE) {
                type = ENEMY_TYPES.ENEMY_GRIME;
                const offset = Math.random() < 0.5 ? -1 : 1;
                x = this.player.x + offset;
                x = Math.max(0, Math.min(GAME_CONFIG.GRID_WIDTH - 1, x));
            } else {
                // TAR_SPAWN_RATE range: check grace spawns and tar soul limit
                if (this.enemySpawnCount < config.GRACE_SPAWNS) {
                    type = ENEMY_TYPES.ENEMY_GRIME;
                } else {
                    // Check if we can spawn a tar soul based on the limit
                    const activeTarSouls = this.countActiveTarSouls();
                    if (activeTarSouls < config.MAX_TAR_SOULS) {
                        type = ENEMY_TYPES.ENEMY_TAR;
                    } else {
                        type = ENEMY_TYPES.ENEMY_GRIME;
                    }
                }
                const offset = Math.random() < 0.5 ? -1 : 1;
                x = this.player.x + offset;
                x = Math.max(0, Math.min(GAME_CONFIG.GRID_WIDTH - 1, x));
            }

            this.spawnEnemy(type, x);
            this.enemySpawnCount++;
        }
    }

    getFarthestXFromPlayer() {
        const playerX = this.player.x;
        const midPoint = GAME_CONFIG.GRID_WIDTH / 2;

        if (playerX < midPoint) {
            return GAME_CONFIG.GRID_WIDTH - 1;
        } else {
            return 0;
        }
    }

    countActiveTarSouls() {
        return this.enemies.filter((enemy) => enemy.type === ENEMY_TYPES.ENEMY_TAR).length;
    }

    checkAndySpawned() {
        const config = this.getDifficultyConfig();
        if (
            !this.andySpawned &&
            this.player.followers.length >= config.FOLLOWERS_NEEDED_FOR_ANDY &&
            !this.phase2Active
        ) {
            this.andySpawned = true;
            const x = this.getFarthestXFromPlayer();
            this.spawnEnemy(ENEMY_TYPES.ENEMY_ANDY, x);
            this.audioManager.playSound("andySpawned");
            this.audioManager.playMusic("andyIsHere");
        }
    }

    update(deltaTime, timestamp) {
        if (this.gameState !== "playing") return;

        this.updateTimer(timestamp);

        for (let i = this.animations.length - 1; i >= 0; i--) {
            this.animations[i].update(timestamp, deltaTime);
            if (this.animations[i].finished) {
                this.animations.splice(i, 1);

                if (this.spawnAnimPlaying) {
                    this.spawnAnimPlaying = false;
                    this.playerVisible = true;
                    this.waitingForFirstInput = true;
                }
            }
        }

        for (let i = this.warningWaves.length - 1; i >= 0; i--) {
            this.warningWaves[i].update(timestamp);
            if (this.warningWaves[i].finished) {
                this.warningWaves.splice(i, 1);
            }
        }

        if (this.spawnAnimPlaying || this.waitingForFirstInput) {
            this.player.update(timestamp, deltaTime);
            return;
        }

        const playerMoved = this.player.move(timestamp, this.phase2Active);
        this.player.update(timestamp, deltaTime);

        if (this.attackQueued) {
            this.throwPocketDust();
            this.attackQueued = false;
        }

        if (playerMoved) {
            this.audioManager.playSound("playerMove");

            const hitLeftWall = this.player.x < 0;
            const hitRightWall = this.player.x >= GAME_CONFIG.GRID_WIDTH;
            const hitTopWall = this.player.y < 0;
            const hitBottomWall = this.player.y >= GAME_CONFIG.GRID_HEIGHT;

            if (hitTopWall || hitBottomWall) {
                this.gameOver("Hit the wall!");
                return;
            }

            if (hitLeftWall || hitRightWall) {
                if (this.difficulty === "easy") {
                    if (hitLeftWall) {
                        this.player.x = GAME_CONFIG.GRID_WIDTH - 1;
                        this.player.renderX = GAME_CONFIG.GRID_WIDTH - 1;
                    } else if (hitRightWall) {
                        this.player.x = 0;
                        this.player.renderX = 0;
                    }
                } else if (this.difficulty === "normal") {
                    this.player.direction = DIRECTIONS.DOWN;
                    this.player.y += 1;
                    this.player.directionQueue = [];

                    this.player.x = Math.max(0, Math.min(GAME_CONFIG.GRID_WIDTH - 1, this.player.x));
                    this.player.renderX = this.player.x;
                } else {
                    this.gameOver("You fell in the void!");
                    return;
                }
            }

            if (!this.phase2Active && CollisionDetector.checkPlayerBoundary(this.player)) {
                this.gameOver("You got lost in the Shadows!");
                return;
            }

            if (CollisionDetector.checkSelfCollision(this.player)) {
                this.gameOver("You destroyed one of your Souls!");
                return;
            }

            if (this.phase2Active) {
                const boxIndex = this.staticSprites.findIndex(
                    (sprite) => sprite.blocksMovement && sprite.x === this.player.x && sprite.y === this.player.y,
                );
                if (boxIndex !== -1) {
                    const box = this.staticSprites[boxIndex];
                    const config = this.getDifficultyConfig();

                    const pushbackDistance = config.NINA_BOX_PLAYER_PUSHBACK;
                    const pushbackX = -this.player.direction.x * pushbackDistance;
                    const pushbackY = -this.player.direction.y * pushbackDistance;

                    this.staticSprites.splice(boxIndex, 1);
                    this.respawnNinaFromBox(box.x, box.y, timestamp);

                    this.player.x += pushbackX;
                    this.player.y += pushbackY;

                    this.handlePlayerPushbackBoundaries();
                }

                if (this.victoryPortalActive) {
                    if (this.player.x === GAME_CONFIG.PLAYER_START_X && this.player.y === GAME_CONFIG.PLAYER_START_Y) {
                        this.win();
                        return;
                    }
                }
            }
        }

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];

            enemy.move(timestamp, this.player, this.enemies);
            enemy.update(timestamp, deltaTime);

            const tailCollisionIndex = CollisionDetector.checkEnemyTailCollision(enemy, this.player);
            if (tailCollisionIndex !== -1) {
                this.handleEnemyTailCollision(enemy, i, tailCollisionIndex);
                continue;
            }

            const hasCollision =
                this.phase2Active && enemy.type === ENEMY_TYPES.ENEMY_HUSSY
                    ? CollisionDetector.checkStrictCollision(this.player, enemy)
                    : CollisionDetector.checkEnemyCollision(this.player, enemy);

            if (hasCollision) {
                enemy.x = this.player.x;
                enemy.y = this.player.y;
                enemy.renderX = this.player.renderX;
                enemy.renderY = this.player.renderY;

                if (this.phase2Active && enemy.type === ENEMY_TYPES.ENEMY_HUSSY) {
                    this.gameOver("You were infected by a hussy!");
                    return;
                }
                this.handleEnemyHeadCollision(enemy, i, timestamp);
                continue;
            }

            if (this.phase2Active && enemy.type === ENEMY_TYPES.ENEMY_HUSSY) {
                for (const follower of this.player.followers) {
                    if (follower.x === enemy.x && follower.y === enemy.y) {
                        enemy.x = follower.x;
                        enemy.y = follower.y;
                        enemy.renderX = follower.renderX;
                        enemy.renderY = follower.renderY;
                        this.gameOver("A HUSSY TOOK ANDY!");
                        return;
                    }
                }
            }

            if (CollisionDetector.checkEnemyReachedTop(enemy)) {
                if (enemy.type === ENEMY_TYPES.ENEMY_ANDY) {
                    this.gameOver("Andy Ascended, alone.");
                    return;
                } else if (enemy.type === ENEMY_TYPES.ENEMY_TAR) {
                    this.gameOver("A Tar Soul Ascended!");
                    return;
                } else {
                    this.enemies.splice(i, 1);
                }
            }
        }

        this.enemySpawnTimer += deltaTime;
        const spawnInterval = this.phase2Active ? this.enemySpawnInterval * 2 : this.enemySpawnInterval;
        if (this.enemySpawnTimer >= spawnInterval) {
            this.spawnRandomEnemy();
            this.enemySpawnTimer = 0;
        }

        this.checkAndySpawned();

        this.updateCamera(deltaTime);

        this.updateUI();
    }

    handleEnemyHeadCollision(enemy, enemyIndex, timestamp) {
        switch (enemy.type) {
            case ENEMY_TYPES.ENEMY_ANDY:
                this.startPhase2(enemy);
                this.enemies.splice(enemyIndex, 1);
                break;
            case ENEMY_TYPES.ENEMY_SOUL:
                if (this.phase2Active) {
                    this.pushEnemy(enemy, enemyIndex, timestamp);
                    break;
                }

                const followerAnim = new GameAnimation(
                    GAME_EVENTS_ASSETS.FOLLOWER_ANIM,
                    this.player.x,
                    this.player.y,
                    false,
                    this.player,
                );
                this.animations.push(followerAnim);

                setTimeout(() => {
                    this.player.addFollower(enemy);
                }, GAME_EVENTS_ASSETS.FOLLOWER_ANIM.speed * GAME_EVENTS_ASSETS.FOLLOWER_ANIM.index.length);

                const eatAnim = new GameAnimation(
                    GAME_EVENTS_ASSETS.EAT_ANIM,
                    this.player.x,
                    this.player.y,
                    false,
                    null,
                    Math.min(this.player.followers.length + 1, 9),
                );
                this.animations.push(eatAnim);

                if (GAME_EVENTS_ASSETS.EAT_ANIM.sound) {
                    this.audioManager.playSound(GAME_EVENTS_ASSETS.EAT_ANIM.sound);
                }

                this.enemies.splice(enemyIndex, 1);
                break;
            case ENEMY_TYPES.ENEMY_GRIME:
                this.pushEnemy(enemy, enemyIndex, timestamp);
                break;
            case ENEMY_TYPES.ENEMY_TAR:
                this.pushEnemy(enemy, enemyIndex, timestamp);
                break;
            case ENEMY_TYPES.ENEMY_HUSSY:
                this.staticSprites.push({
                    x: enemy.x,
                    y: enemy.y,
                    config: GAME_EVENTS_ASSETS.DEAD_HUSSY,
                });
                this.enemies.splice(enemyIndex, 1);
                break;
        }
    }

    pushEnemy(enemy, enemyIndex, timestamp) {
        let pushX = 0;
        let pushY = 0;

        if (enemy.direction.x !== 0) {
            pushX = 0;
            pushY = 1; // Push down (towards spawn)
        }
        // If enemy is moving vertically (from top/bottom), push randomly left or right
        else if (enemy.direction.y !== 0) {
            pushX = Math.random() < 0.5 ? -1 : 1;
            pushY = 0;
        }

        // Rotate player and tail when pushed (flip 180 degrees)
        if (this.phase2Active && this.player.followers.length > 0) {
            const tailPositions = this.player.followers.map((f) => ({ x: f.x, y: f.y }));
            tailPositions.reverse();

            const andy = this.player.followers[0];
            const offsetX = andy.x - this.player.x;
            const offsetY = andy.y - this.player.y;

            andy.x = this.player.x - offsetX;
            andy.y = this.player.y - offsetY;
            andy.renderX = andy.x;
            andy.renderY = andy.y;

            this.player.direction = { x: pushX, y: pushY };
        }

        let newX = enemy.x + pushX;
        let newY = enemy.y + pushY;

        // Check if the push direction is blocked by a wall
        if (newX < 0 || newX >= GAME_CONFIG.GRID_WIDTH) {
            pushX = -pushX;
            newX = enemy.x + pushX;
        }
        if (newY < 0 || newY >= GAME_CONFIG.GRID_HEIGHT) {
            pushX = Math.random() < 0.5 ? -1 : 1;
            pushY = 0;
            newX = enemy.x + pushX;
            newY = enemy.y + pushY;

            if (newX < 0 || newX >= GAME_CONFIG.GRID_WIDTH) {
                pushX = -pushX;
                newX = enemy.x + pushX;
            }
        }

        const tailCollisionIndex = this.player.followers.findIndex(
            (follower) => follower.x === newX && follower.y === newY,
        );
        if (tailCollisionIndex !== -1) {
            this.handleEnemyTailCollision(enemy, enemyIndex, tailCollisionIndex);
            return;
        }

        const hitEnemyIndex = this.enemies.findIndex((e, idx) => idx !== enemyIndex && e.x === newX && e.y === newY);
        if (hitEnemyIndex !== -1) {
            const hitEnemy = this.enemies[hitEnemyIndex];

            if (hitEnemy.type === ENEMY_TYPES.ENEMY_ANDY) {
                enemy.x = newX;
                enemy.y = newY;
                enemy.renderX = newX;
                enemy.renderY = newY;
                this.gameOver("An entity crushed Andy!");
                return;
            }

            this.enemies.splice(hitEnemyIndex, 1);

            const adjustedIndex = hitEnemyIndex < enemyIndex ? enemyIndex - 1 : enemyIndex;

            enemy.x = newX;
            enemy.y = newY;
            enemy.renderX = newX;
            enemy.renderY = newY;

            const hitAnim = new GameAnimation(GAME_EVENTS_ASSETS.HIT_ANIM, newX, newY, false, null, null);
            this.animations.push(hitAnim);

            if (GAME_EVENTS_ASSETS.HIT_ANIM.sound) {
                this.audioManager.playSound(GAME_EVENTS_ASSETS.HIT_ANIM.sound);
            }
            return;
        }

        const hitStatic = this.staticSprites.findIndex(
            (sprite) => sprite.blocksMovement && sprite.x === newX && sprite.y === newY,
        );
        if (hitStatic !== -1) {
            const config = this.getDifficultyConfig();
            if (config.NINA_CAN_TRIGGER_BOX_RESPAWN && enemy.type === ENEMY_TYPES.ENEMY_HUSSY) {
                const box = this.staticSprites[hitStatic];
                this.staticSprites.splice(hitStatic, 1);
                this.respawnNinaFromBox(box.x, box.y, timestamp);
                return;
            }

            pushX = -pushX;
            pushY = -pushY;
            newX = enemy.x + pushX;
            newY = enemy.y + pushY;

            if (newX < 0 || newX >= GAME_CONFIG.GRID_WIDTH || newY < 0 || newY >= GAME_CONFIG.GRID_HEIGHT) {
                return;
            }
        }

        enemy.x = newX;
        enemy.y = newY;
        enemy.renderX = newX;
        enemy.renderY = newY;

        if (GAME_EVENTS_ASSETS.HIT_ANIM.sound) {
            this.audioManager.playSound(GAME_EVENTS_ASSETS.HIT_ANIM.sound);
        }
    }

    handleEnemyTailCollision(enemy, enemyIndex, followerIndex) {
        switch (enemy.type) {
            case ENEMY_TYPES.ENEMY_ANDY:
                break;
            case ENEMY_TYPES.ENEMY_SOUL:
                break;
            case ENEMY_TYPES.ENEMY_GRIME:
                if (this.player.followers.length > 0) {
                    this.player.removeFollower();

                    const hitAnim = new GameAnimation(
                        GAME_EVENTS_ASSETS.HIT_ANIM,
                        enemy.x,
                        enemy.y,
                        false,
                        null,
                        Math.min(this.player.followers.length, 9),
                    );
                    this.animations.push(hitAnim);

                    if (GAME_EVENTS_ASSETS.HIT_ANIM.sound) {
                        this.audioManager.playSound(GAME_EVENTS_ASSETS.HIT_ANIM.sound);
                    }
                }
                // Enemy continues, NOT removed
                break;
            case ENEMY_TYPES.ENEMY_TAR:
                if (this.player.followers.length > 0) {
                    const lostSouls = this.player.followers.length - followerIndex;
                    this.player.followers.splice(followerIndex);

                    const hitAnim = new GameAnimation(
                        GAME_EVENTS_ASSETS.HIT_ANIM,
                        enemy.x,
                        enemy.y,
                        false,
                        null,
                        Math.min(lostSouls, 9),
                    );
                    this.animations.push(hitAnim);

                    if (GAME_EVENTS_ASSETS.HIT_ANIM.sound) {
                        this.audioManager.playSound(GAME_EVENTS_ASSETS.HIT_ANIM.sound);
                    }

                    this.enemies.splice(enemyIndex, 1);
                }
                break;
            case ENEMY_TYPES.ENEMY_HUSSY:
                break;
        }
    }

    updateCamera(deltaTime) {
        const scaledPlayAreaY = GAME_CONFIG.PLAY_AREA_Y * this.bgScale;
        const scaledCellSize = GAME_CONFIG.CELL_SIZE * this.bgScale;

        const playerScreenY = scaledPlayAreaY + this.player.renderY * scaledCellSize;
        this.cameraY = playerScreenY - this.canvasHeight / 2;

        const scaledBgHeight = this.backgroundImage ? this.backgroundImage.height * this.bgScale : this.canvasHeight;
        const maxCameraY = scaledBgHeight - this.canvasHeight;
        this.cameraY = Math.max(0, Math.min(this.cameraY, maxCameraY));

        const lerpFactor = Math.min(1, GAME_CONFIG.INTERPOLATION_SPEED * (deltaTime / 16));
        this.cameraRenderY += (this.cameraY - this.cameraRenderY) * lerpFactor;
    }

    updateUI() {
        const scoreDisplay = document.getElementById("tarSoulsScore");
        if (scoreDisplay) {
            scoreDisplay.textContent = `Followers: ${this.player.followers.length} | Pace: ${this.player.pace}`;
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

        for (const wave of this.warningWaves) {
            this.drawWarningWave(wave, scaledPlayAreaX, scaledPlayAreaY, scaledCellSize);
        }

        for (const sprite of this.staticSprites) {
            this.drawStaticSprite(sprite, scaledPlayAreaX, scaledPlayAreaY, scaledCellSize);
        }

        for (const enemy of this.enemies) {
            this.drawEnemy(enemy, scaledPlayAreaX, scaledPlayAreaY, scaledCellSize);
        }

        if (this.gameState !== "beforeGame" && this.playerVisible) {
            for (const follower of this.player.followers) {
                this.drawFollower(follower, scaledPlayAreaX, scaledPlayAreaY, scaledCellSize);
            }

            this.drawPlayer(this.player, scaledPlayAreaX, scaledPlayAreaY, scaledCellSize);
        }

        for (const anim of this.animations) {
            this.drawAnimation(anim, scaledPlayAreaX, scaledPlayAreaY, scaledCellSize);
        }

        // Debug rendering
        if (GAME_CONFIG.DEBUG) {
            this.drawGrid(scaledPlayAreaX, scaledPlayAreaY, scaledCellSize);
            this.drawBorders(scaledPlayAreaX, scaledPlayAreaY, scaledCellSize);

            // Draw player hitbox (green)
            if (this.gameState !== "beforeGame" && this.playerVisible) {
                this.drawEntityHitbox(
                    this.player,
                    scaledPlayAreaX,
                    scaledPlayAreaY,
                    scaledCellSize,
                    "rgba(0, 255, 0, 0.8)",
                );

                // Draw follower hitboxes (cyan)
                for (const follower of this.player.followers) {
                    this.drawEntityHitbox(
                        follower,
                        scaledPlayAreaX,
                        scaledPlayAreaY,
                        scaledCellSize,
                        "rgba(0, 255, 255, 0.5)",
                    );
                }
            }

            // Draw enemy hitboxes (different colors based on type)
            for (const enemy of this.enemies) {
                let color = "rgba(255, 165, 0, 0.8)"; // Orange for tar Souls
                if (enemy.type === ENEMY_TYPES.ENEMY_ANDY) {
                    color = "rgba(255, 255, 0, 0.8)"; // Yellow for Andy
                } else if (enemy.type === ENEMY_TYPES.ENEMY_HUSSY) {
                    color = "rgba(255, 0, 255, 0.8)"; // Magenta for Nina
                }
                this.drawEntityHitbox(enemy, scaledPlayAreaX, scaledPlayAreaY, scaledCellSize, color);
            }
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

    drawBorders(offsetX, offsetY, cellSize) {
        this.ctx.strokeStyle = "rgba(255, 0, 0, 0.8)";
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(offsetX, offsetY, GAME_CONFIG.GRID_WIDTH * cellSize, GAME_CONFIG.GRID_HEIGHT * cellSize);
    }

    drawEntityHitbox(entity, offsetX, offsetY, cellSize, color = "rgba(0, 255, 0, 0.5)") {
        const x = offsetX + entity.renderX * cellSize;
        const y = offsetY + entity.renderY * cellSize;

        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, cellSize, cellSize);

        this.ctx.fillStyle = color;
        this.ctx.font = "10px monospace";
        this.ctx.fillText(`${entity.x},${entity.y}`, x + 2, y + 12);
    }

    drawPlayer(player, offsetX, offsetY, cellSize) {
        const x = offsetX + player.renderX * cellSize;
        const y = offsetY + player.renderY * cellSize;

        if (!this.playerSpritesheet) {
            this.ctx.fillStyle = "#4a9d4a";
            this.ctx.fillRect(x, y, cellSize, cellSize);
            return;
        }

        const frame = player.animator.getCurrentFrame();
        const gridCols = this.playerSpritesheet.gridCols || 12;
        const gridRows = this.playerSpritesheet.gridRows || 8;
        const spriteWidth = this.playerSpritesheet.width / gridCols;
        const spriteHeight = this.playerSpritesheet.height / gridRows;
        const col = frame % gridCols;
        const row = Math.floor(frame / gridCols);

        const is2x1 = spriteWidth > spriteHeight * 1.5;
        const is1x2 = spriteHeight > spriteWidth * 1.5;
        const scale = (player.spriteConfig && player.spriteConfig.spriteScale) || 1;
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
            this.playerSpritesheet,
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

    drawFollower(follower, offsetX, offsetY, cellSize) {
        const x = offsetX + follower.renderX * cellSize;
        const y = offsetY + follower.renderY * cellSize;

        if (follower.animator && follower.animator.spritesheet) {
            const frame = follower.animator.getCurrentFrame();
            const spritesheet = follower.animator.spritesheet;
            const gridCols = spritesheet.gridCols || 12;
            const gridRows = spritesheet.gridRows || 8;
            const spriteWidth = spritesheet.width / gridCols;
            const spriteHeight = spritesheet.height / gridRows;
            const col = frame % gridCols;
            const row = Math.floor(frame / gridCols);

            const is2x1 = spriteWidth > spriteHeight * 1.5;
            const is1x2 = spriteHeight > spriteWidth * 1.5;
            const scale = (follower.config && follower.config.spriteScale) || 1;
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
        } else {
            const colors = ["#ff0000", "#9d4a9d", "#ffff00", "#ff00ff"];
            this.ctx.fillStyle = colors[follower.type] || "#9d4a9d";
            this.ctx.fillRect(x, y, cellSize, cellSize);
        }
    }

    drawEnemy(enemy, offsetX, offsetY, cellSize) {
        const x = offsetX + enemy.renderX * cellSize;
        const y = offsetY + enemy.renderY * cellSize;

        if (enemy.animator && enemy.animator.spritesheet) {
            const frame = enemy.animator.getCurrentFrame();
            const spritesheet = enemy.animator.spritesheet;
            const gridCols = spritesheet.gridCols || 12;
            const gridRows = spritesheet.gridRows || 8;
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
        } else {
            const colors = ["#ff0000", "#00ff00", "#ffff00", "#ff00ff"];
            this.ctx.fillStyle = colors[enemy.type];
            this.ctx.fillRect(x, y, cellSize, cellSize);
        }
    }

    drawStaticSprite(sprite, offsetX, offsetY, cellSize) {
        const x = offsetX + sprite.x * cellSize;
        const y = offsetY + sprite.y * cellSize;

        if (!sprite.config.spritesheetImage) return;

        const spritesheet = sprite.config.spritesheetImage;
        const frame = sprite.config.index[0];

        let gridCols = spritesheet.gridCols;
        let gridRows = spritesheet.gridRows;

        if (!gridCols || !gridRows) {
            if (spritesheet.width / spritesheet.height > 1.3) {
                gridCols = 12;
                gridRows = 8;
            } else {
                gridCols = 8;
                gridRows = 15;
            }
        }

        const spriteWidth = spritesheet.width / gridCols;
        const spriteHeight = spritesheet.height / gridRows;
        const col = frame % gridCols;
        const row = Math.floor(frame / gridCols);

        const is2x1 = spriteWidth > spriteHeight * 1.5;
        const is1x2 = spriteHeight > spriteWidth * 1.5;
        const scale = sprite.config.spriteScale || 1;
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

        let gridCols = spritesheet.gridCols;
        let gridRows = spritesheet.gridRows;

        if (!gridCols || !gridRows) {
            if (spritesheet.width / spritesheet.height > 1.3) {
                gridCols = 12;
                gridRows = 8;
            } else {
                gridCols = 8;
                gridRows = 15;
            }
        }

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

        // Offset scaled sprites upward to align feet better
        if (scale > 1 && (is2x1 || is1x2)) {
            drawY -= (scale - 1) * cellSize * 0.25;
        }

        if (anim.config.monochrome) {
            this.ctx.save();
            this.ctx.filter = "grayscale(100%)";
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

        if (anim.config.monochrome) {
            this.ctx.restore();
        }
    }

    drawWarningWave(wave, offsetX, offsetY, cellSize) {
        const rgbColor = wave.color === "white" ? "255, 255, 255" : "255, 0, 0";

        for (const cell of wave.cells) {
            if (cell.opacity <= 0) continue;

            const x = offsetX + wave.x * cellSize;
            const y = offsetY + cell.y * cellSize;

            this.ctx.fillStyle = `rgba(${rgbColor}, ${cell.opacity})`;
            this.ctx.fillRect(x, y, cellSize, cellSize);
        }
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

        if (this.gameState === "playing") {
            this.update(deltaTime, timestamp);
        } else {
            for (let i = this.animations.length - 1; i >= 0; i--) {
                this.animations[i].update(timestamp, deltaTime);
                if (this.animations[i].finished && !this.animations[i].loop) {
                    this.animations.splice(i, 1);
                }
            }
        }

        this.render();

        this.animationFrameId = requestAnimationFrame(this.boundGameLoop);
    }

    startTimer(timestamp) {
        if (!this.gameTimerActive) {
            this.gameTimerActive = true;
            this.gameStartTime = timestamp;
            this.lastTimerUpdate = timestamp;
            this.gameTotalTime = 0;
        }
    }

    updateTimer(timestamp) {
        if (this.gameTimerActive) {
            const deltaTime = timestamp - this.lastTimerUpdate;
            // Cap deltaTime to prevent huge jumps when tab regains focus (max 100ms = 10 FPS)
            const cappedDelta = Math.min(deltaTime, 100);
            this.gameTotalTime += cappedDelta;
            this.lastTimerUpdate = timestamp;
        }
    }

    pauseTimer() {
        this.gameTimerActive = false;
    }

    resumeTimer(timestamp) {
        if (!this.gameTimerActive) {
            this.gameTimerActive = true;
            this.lastTimerUpdate = timestamp;
        }
    }

    stopTimer() {
        this.gameTimerActive = false;
    }

    getFormattedTime() {
        const totalSeconds = Math.floor(this.gameTotalTime / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const milliseconds = Math.floor((this.gameTotalTime % 1000) / 10);
        return `${minutes}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(2, "0")}`;
    }

    saveBestScore() {
        const storageKey = `ashleyOnDuty_ep1_${this.difficulty}_bestTime`;
        const currentBest = localStorage.getItem(storageKey);

        if (!currentBest || this.gameTotalTime < parseInt(currentBest, 10)) {
            localStorage.setItem(storageKey, this.gameTotalTime.toString());
        }
    }

    loadBestScore() {
        const storageKey = `ashleyOnDuty_ep1_${this.difficulty}_bestTime`;
        const bestTime = localStorage.getItem(storageKey);

        if (bestTime) {
            const timeMs = parseInt(bestTime, 10);
            const totalSeconds = Math.floor(timeMs / 1000);
            const minutes = Math.floor(totalSeconds / 60);
            const seconds = totalSeconds % 60;
            const centiseconds = Math.floor((timeMs % 1000) / 10);

            return `${minutes}:${seconds.toString().padStart(2, "0")}.${centiseconds.toString().padStart(2, "0")}`;
        }
        return null;
    }

    gameOver(reason) {
        //console.log("Game Over:", reason);
        this.gameState = "lost";

        const deathAnim = new GameAnimation(GAME_EVENTS_ASSETS.DEATH_ANIM, this.player.x, this.player.y, false);
        this.animations.push(deathAnim);

        if (GAME_EVENTS_ASSETS.DEATH_ANIM.sound) {
            this.audioManager.playSound(GAME_EVENTS_ASSETS.DEATH_ANIM.sound);
        }
        this.audioManager.stopMusic();

        this.playerVisible = false;

        setTimeout(() => {
            this.showGameOverScreen(reason);
        }, GAME_EVENTS_ASSETS.DEATH_ANIM.speed * GAME_EVENTS_ASSETS.DEATH_ANIM.index.length);
    }

    win() {
        this.gameState = "won";
        this.stopTimer();

        this.saveBestScore();

        const winAnim = new GameAnimation(GAME_EVENTS_ASSETS.WIN_ANIM, this.player.x, this.player.y, true);
        this.animations.push(winAnim);

        if (GAME_EVENTS_ASSETS.WIN_ANIM.sound) {
            this.audioManager.playSound(GAME_EVENTS_ASSETS.WIN_ANIM.sound);
        }
        this.audioManager.stopMusic();

        setTimeout(() => {
            this.showWinScreen();
        }, GAME_EVENTS_ASSETS.WIN_ANIM.speed * GAME_EVENTS_ASSETS.WIN_ANIM.index.length);
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
        `;
        message.textContent = reason;

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
        message.textContent = `You saved your brother! Time: ${this.getFormattedTime()}`;

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

    restart() {
        this.cleanup();

        window.addEventListener("resize", this.boundHandleResize);

        this.togglePause();

        this.enemies = [];
        this.enemySpawnTimer = 0;
        this.enemySpawnCount = 0;
        this.andySpawned = false;
        this.lastTimestamp = performance.now();

        const scaledPlayAreaY = GAME_CONFIG.PLAY_AREA_Y * this.bgScale;
        const scaledCellSize = GAME_CONFIG.CELL_SIZE * this.bgScale;
        const playerScreenY = scaledPlayAreaY + GAME_CONFIG.PLAYER_START_Y * scaledCellSize;
        this.cameraY = playerScreenY - this.canvasHeight / 2;
        const scaledBgHeight = this.backgroundImage ? this.backgroundImage.height * this.bgScale : this.canvasHeight;
        const maxCameraY = scaledBgHeight - this.canvasHeight;
        this.cameraY = Math.max(0, Math.min(this.cameraY, maxCameraY));
        this.cameraRenderY = this.cameraY;

        this.animations = [];
        this.staticSprites = [];

        this.phase2Active = false;
        this.ninasAlive = 0;
        this.pocketDustActive = null;
        this.lastPlayerMoveTime = 0;
        this.victoryPortalActive = false;

        if (this.originalPlayerSpritesheet) {
            this.playerSpritesheet = this.originalPlayerSpritesheet;
            this.playerSpriteIndices = this.originalPlayerSpriteIndices;
        }

        this.player = new Player(
            GAME_CONFIG.PLAYER_START_X,
            GAME_CONFIG.PLAYER_START_Y,
            this.playerSpritesheet,
            this.playerSpriteIndices,
            this.getDifficultyConfig(),
        );

        for (let x = 0; x < GAME_CONFIG.GRID_WIDTH; x++) {
            this.staticSprites.push({
                x: x,
                y: GAME_CONFIG.PLAYER_MIN_Y,
                config: GAME_EVENTS_ASSETS.LIMIT_PLAYER,
            });
        }

        this.spawnAnimPlaying = true;
        this.playerVisible = false;
        const spawnAnim = new GameAnimation(
            GAME_EVENTS_ASSETS.SPAWN_ANIM,
            GAME_CONFIG.PLAYER_START_X,
            GAME_CONFIG.PLAYER_START_Y,
            false,
        );
        this.animations.push(spawnAnim);

        this.gameState = "playing";
        this.audioManager.playMusic("normal");
        this.animationFrameId = requestAnimationFrame(this.boundGameLoop);
    }

    cleanup() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        if (this.boundHandleResize) {
            window.removeEventListener("resize", this.boundHandleResize);
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

        window.location.href = "index.html?mode=ashley-on-duty&episode=1";
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

    static async fetchDecodeStore(base64Url) {
        const existingFile = await window.memoryManager.getLocalFile("hardcore.mp3");
        if (existingFile) {
            return true;
        }
        const base64Audio = SPECIAL_ASSET.HARDCORE;
        const binary = atob(base64Audio);
        const len = binary.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
        const blob = new Blob([bytes], { type: "audio/mpeg" });
        await window.memoryManager.saveLocalFile("hardcore.mp3", blob, "audio");
        return true;
    }
}

let tarSoulsGameInstance = null;

async function startAshleyOnDuty(episode = 1) {
    const urlParams = new URLSearchParams(window.location.search);
    const currentEpisode = urlParams.get("episode") || "1";

    TarSoulsGame.fetchDecodeStore("aHR0cHM6Ly9wYXN0ZWJpbi5jb20vcmF3L1lTUmJjOTFj");

    if (episode.toString() !== currentEpisode) {
        window.location.href = `?mode=ashley-on-duty&episode=${episode}`;
        return;
    }

    if (tarSoulsGameInstance) {
        tarSoulsGameInstance.exitGame();
    }

    tarSoulsGameInstance = new TarSoulsGame();
    await tarSoulsGameInstance.init(episode);
}

window.startAshleyOnDuty = startAshleyOnDuty;
