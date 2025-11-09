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

const GAME_CONFIG = {
    GRID_WIDTH: 10,
    GRID_HEIGHT: 34,
    CELL_SIZE: 48,
    PLAY_AREA_X: 379,
    PLAY_AREA_Y: 240,
    CAMERA_SIZE: 600,
    PLAYER_START_X: 4,
    PLAYER_START_Y: 4,
    PLAYER_MIN_Y: 25,
    ENEMY_SPAWN_Y: 30,
    PLAYER_INITIAL_SPEED: 300, // ms per move
    SPEED_DECREASE_PER_PACE: 20, // Speed increase per follower
    MIN_SPEED: 100,
    INTERPOLATION_SPEED: 0.3, // Lerp factor for smooth movement
    INPUT_BUFFER_SIZE: 3, // Max queued inputs
};

// Enemy type behaviors
const ENEMY_TYPES = {
    ENEMY_ANDY: 0, // Win condition: fastest, game over if reaches y=0, spawns at 10 followers
    ENEMY_SOUL: 1, // Eat for +1 follower +1 pace, game over if reaches y=0
    ENEMY_GRIME: 2, // Eat for -1 follower, safe at y=0
    ENEMY_TAR: 3, // Eat for game over, safe at y=0,
    ENEMY_HUSSY: 4, // Shoot them all
};

const ENEMY_TYPES_NAME = {
    ENEMY_ANDY: "Andy",
    ENEMY_SOUL: "soul",
    ENEMY_GRIME: "grime soul",
    ENEMY_TAR: "tar soul",
    ENEMY_HUSSY: "Nina",
};

const GAME_EVENTS_ASSETS = {
    NUMBERS: {
        sheet: "spritessheet_12x8_characters_9.png",
        index: [73, 36, 37, 38, 48, 49, 50, 60, 61, 62],
        speed: 1000,
        sound: null,
    },
    LIMIT_PLAYER: {
        sheet: "spritessheet_12x8_characters_14.png",
        index: [86],
        speed: 0,
        sound: null,
    },
    SPAWN_ANIM: {
        sheet: "spritessheet_12x8_characters_7.png",
        index: [57, 58, 59],
        speed: 250,
        sound: "spawnAnim",
    },
    EAT_ANIM: {
        sheet: "spritessheet_8x15_system_24.png",
        index: [40, 41, 42, 43, 44, 45, 46, 47],
        speed: 50,
        sound: "eatSoul",
    },
    HIT_ANIM: {
        sheet: "spritessheet_8x15_system_24.png",
        index: [48, 49, 50, 51, 52, 53, 54, 55],
        speed: 50,
        sound: "eatGrimeSoul",
    },
    FOLLOWER_ANIM: {
        sheet: "spritessheet_12x8_characters_17.png",
        index: [23, 21, 22, 11, 10, 9, 10, 11, 22, 21, 23],
        speed: 25,
        sound: null,
    },
    DEATH_ANIM: {
        sheet: "spritessheet_8x10_system_3.png",
        index: [8, 9, 10, 11, 12, 13, 14, 15],
        speed: 50,
        sound: "gameOver",
    },
    WIN_ANIM: {
        sheet: "spritessheet_8x10_system_3.png",
        index: [40, 41, 42, 43, 44, 45, 46, 47],
        speed: 50,
        sound: "win",
    },
    DEAD_HUSSY: {
        sheet: "spritessheet_12x8_characters_7.png",
        index: [49],
        speed: 0,
        sound: null,
    },
    POCKET_DUST: {
        sheet: "spritessheet_8x10_system_3.png",
        index: [8, 9, 10, 11, 12, 13, 14, 15],
        speed: 50,
        sound: "pocketDust",
        monochrome: true,
    },
};

const ENEMY_CONFIG = [
    {
        // Andy
        type: 0,
        spritesheet: "spritessheet_12x8_characters_1.png",
        speed: 150,
        frames: {
            forward: [51, 52, 53],
            backward: [87, 88, 89],
            left: [63, 64, 65],
            right: [77, 78, 79],
        },
    },
    {
        // Soul
        type: 1,
        spritesheet: "spritessheet_12x8_characters_11.png",
        speed: 400,
        frames: {
            forward: [57, 58, 59],
            backward: [93, 94, 95],
            left: [69, 70, 71],
            right: [81, 82, 83],
        },
    },
    {
        // Grime soul
        type: 2,
        spritesheet: "spritessheet_12x8_characters_11.png",
        speed: 350,
        frames: {
            forward: [51, 52, 53],
            backward: [87, 88, 89],
            left: [63, 64, 65],
            right: [75, 76, 77],
        },
    },
    {
        // Tar soul
        type: 3,
        spritesheet: "spritessheet_12x8_characters_17.png",
        speed: 300,
        frames: {
            forward: [0, 1, 2],
            backward: [36, 37, 38],
            left: [12, 13, 14],
            right: [26, 27, 28],
        },
    },
    {
        // Nina
        type: 4,
        spritesheet: "spritessheet_12x8_characters_1.png",
        speed: 300,
        frames: {
            forward: [54, 55, 56],
            backward: [90, 91, 92],
            left: [66, 67, 68],
            right: [78, 79, 80],
        },
    },
];

const DIRECTIONS = {
    UP: { x: 0, y: -1, name: "up" },
    DOWN: { x: 0, y: 1, name: "down" },
    LEFT: { x: -1, y: 0, name: "left" },
    RIGHT: { x: 1, y: 0, name: "right" },
};

const KEY_LAYOUTS = {
    QWERTY: {
        UP: ["ArrowUp", "KeyW"],
        DOWN: ["ArrowDown", "KeyS"],
        LEFT: ["ArrowLeft", "KeyA"],
        RIGHT: ["ArrowRight", "KeyD"],
    },
    AZERTY: {
        UP: ["ArrowUp", "KeyZ"],
        DOWN: ["ArrowDown", "KeyS"],
        LEFT: ["ArrowLeft", "KeyQ"],
        RIGHT: ["ArrowRight", "KeyD"],
    },
};

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
        this.speed = config.speed;
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
            if (timestamp - this.numberStartTime >= this.speed) {
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

class Player {
    constructor(x, y, spritesheet, difficultyModifier = 1.0) {
        this.x = x;
        this.y = y;
        this.renderX = x;
        this.renderY = y;
        this.direction = DIRECTIONS.DOWN;
        this.directionQueue = [];
        this.pace = 0;
        this.difficultyModifier = difficultyModifier;
        this.speed = GAME_CONFIG.PLAYER_INITIAL_SPEED * difficultyModifier;
        this.followers = [];
        this.animator = new SpriteAnimator(spritesheet, [0, 1, 2], 250);
        this.lastMoveTime = 0;
    }

    queueDirection(newDirection) {
        // Prevent 180-degree turns
        const lastDirection =
            this.directionQueue.length > 0 ? this.directionQueue[this.directionQueue.length - 1] : this.direction;

        if (
            newDirection.x !== -lastDirection.x ||
            newDirection.y !== -lastDirection.y ||
            (newDirection.x === 0 && newDirection.y === 0)
        ) {
            // Add to queue if not full
            if (this.directionQueue.length < GAME_CONFIG.INPUT_BUFFER_SIZE) {
                this.directionQueue.push(newDirection);
            }
        }
    }

    updateSpeed() {
        this.speed = Math.max(
            GAME_CONFIG.MIN_SPEED * this.difficultyModifier,
            (GAME_CONFIG.PLAYER_INITIAL_SPEED - this.pace * GAME_CONFIG.SPEED_DECREASE_PER_PACE) *
                this.difficultyModifier,
        );
    }

    addFollower(enemy) {
        // Clone the enemy's sprite data for the follower
        const follower = {
            x: this.x,
            y: this.y,
            renderX: this.x,
            renderY: this.y,
            animator: enemy.animator ? enemy.animator.clone() : null,
            type: enemy.type,
        };
        this.followers.push(follower);
        this.pace++;
        this.updateSpeed();
    }

    removeFollower() {
        if (this.followers.length > 0) {
            this.followers.pop();
            // Don't decrease pace when removing follower
        }
    }

    move(timestamp, manualOnly = false) {
        if (timestamp - this.lastMoveTime < this.speed) {
            return false;
        }

        // In manual mode, only move if there's a queued direction
        if (manualOnly && this.directionQueue.length === 0) {
            return false;
        }

        // Apply queued direction
        if (this.directionQueue.length > 0) {
            this.direction = this.directionQueue.shift();
        }

        // Store old positions for followers
        const prevPositions = [{ x: this.x, y: this.y }];

        // Collect follower positions
        for (let i = 0; i < this.followers.length; i++) {
            prevPositions.push({ x: this.followers[i].x, y: this.followers[i].y });
        }

        // Move player
        this.x += this.direction.x;
        this.y += this.direction.y;

        // Update follower positions (snake-like following)
        for (let i = 0; i < this.followers.length; i++) {
            this.followers[i].x = prevPositions[i].x;
            this.followers[i].y = prevPositions[i].y;
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

        // Interpolate render position towards grid position
        const lerpFactor = Math.min(1, GAME_CONFIG.INTERPOLATION_SPEED * (deltaTime / 16));
        this.renderX += (this.x - this.renderX) * lerpFactor;
        this.renderY += (this.y - this.renderY) * lerpFactor;

        // Interpolate follower positions
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
        this.speed = this.config.speed;
        this.lastMoveTime = 0;
        this.blocked = false;

        this.currentAnimDirection = "forward";
        if (this.config.frames.forward && this.config.frames.forward.length > 0 && this.config.spritesheetImage) {
            this.animator = new SpriteAnimator(this.config.spritesheetImage, this.config.frames.forward, 250);
        } else {
            this.animator = null;
        }
    }

    move(timestamp) {
        if (this.blocked) return false;

        if (timestamp - this.lastMoveTime < this.speed) {
            return false;
        }

        this.y += this.direction.y;
        this.lastMoveTime = timestamp;
        return true;
    }

    update(timestamp, deltaTime) {
        if (this.animator) {
            this.animator.update(timestamp);
        }

        // Interpolate render position
        const lerpFactor = Math.min(1, GAME_CONFIG.INTERPOLATION_SPEED * (deltaTime / 16));
        this.renderX += (this.x - this.renderX) * lerpFactor;
        this.renderY += (this.y - this.renderY) * lerpFactor;
    }

    setBlocked(blocked) {
        this.blocked = blocked;
    }
}

class AudioManager {
    constructor() {
        this.soundEffects = {
            playerMove: null,
            eatSoul: "se_23.ogg",
            eatGrimeSoul: "se_3.ogg",
            eatTarSoul: "se_72.ogg",
            andySpawned: "se_57.ogg",
            gameOver: "se_61.ogg",
            win: "se_17.ogg",
            spawnAnim: "se_15.ogg",
            pocketDust: "se_35.ogg",
        };

        this.backgroundMusic = {
            normal: "hallucination_connect.ogg",
            andyIsHere: "snail_eyes.ogg",
        };

        this.currentMusic = null;
        this.musicMuted = false;
        this.soundMuted = false;
    }

    playSound(soundName) {
        if (this.soundMuted) return;

        const sound = this.soundEffects[soundName];
        if (sound) {
            sound.currentTime = 0;
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

    static checkEnemyReachedTop(enemy) {
        return enemy.y <= 0;
    }
}

class TarSoulsGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.player = null;
        this.enemies = [];
        this.gameState = "beforeGame"; // beforeGame, playing, paused, won, lost
        this.keyLayout = KEY_LAYOUTS.QWERTY;
        this.audioManager = new AudioManager();
        this.backgroundImage = null;
        this.playerSpritesheet = null;
        this.cameraY = 0;
        this.cameraRenderY = 0;
        this.lastTimestamp = 0;
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 3000;
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
        this.spawnAnimPlaying = false;
        this.playerVisible = false;
        this.waitingForFirstInput = false;

        this.phase2Active = false;
        this.ninasAlive = 0;
        this.pocketDustActive = null;
        this.lastPlayerMoveTime = 0;
        this.victoryPortalActive = false;

        this.difficulty = "normal";
    }

    async init() {
        this.gameAssets = await window.memoryManager.loadSavedAssets();

        this.createGameUI();

        await this.loadAssets();

        this.setupCanvas();

        this.player = new Player(GAME_CONFIG.PLAYER_START_X, GAME_CONFIG.PLAYER_START_Y, this.playerSpritesheet);

        window.addEventListener("keydown", this.boundHandleKeyDown);

        this.gameState = "beforeGame";
        this.lastTimestamp = performance.now();
        this.animationFrameId = requestAnimationFrame(this.boundGameLoop);

        this.showBeforeGameScreen();
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
            height: 100vh;
            max-width: 30vw;
            background: rgba(17, 17, 17, 0.75);
            padding: 20px;
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
            max-width: 30vw;
            height: 100vh;
            background: rgba(17, 17, 17, 0.75);
            padding: 20px;
            box-sizing: border-box;
            overflow-y: auto;
            color: var(--txt-color, #ddd);
            font-family: 'TCOAAL', monospace;
            font-size: 0.9rem;
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
    }

    buildLeftSidebar(sidebar) {
        const title = document.createElement("img");
        title.src = "img/tcoaal-tarsouls.webp";
        title.alt = "Tar Souls";
        title.style.cssText = `
            width: 100%;
            max-width: 300px;
            height: auto;
            margin: 0 auto 20px auto;
            display: block;
        `;
        sidebar.appendChild(title);

        const startButton = document.createElement("button");
        startButton.className = "tcoaal-button-tarsouls";
        startButton.id = "tarSoulsStartBtn";
        startButton.textContent = "Start Game";
        startButton.onclick = () => this.startGame();
        startButton.style.width = "100%";
        sidebar.appendChild(startButton);

        const pauseButton = document.createElement("button");
        pauseButton.className = "tcoaal-button-tarsouls";
        pauseButton.id = "tarSoulsPauseBtn";
        pauseButton.textContent = "Pause";
        pauseButton.onclick = () => this.togglePause();
        pauseButton.style.cssText = "width: 100%; display: none;";
        sidebar.appendChild(pauseButton);

        const difficultyContainer = document.createElement("div");
        difficultyContainer.style.cssText = `
            display: flex;
            gap: 5px;
            width: 100%;
        `;

        const easyButton = document.createElement("button");
        easyButton.className = "tcoaal-button-tarsouls-small";
        easyButton.id = "tarSoulsDiffEasy";
        easyButton.textContent = "Easy";
        easyButton.onclick = () => this.setDifficulty("easy");
        easyButton.style.cssText = "flex: 1;";
        difficultyContainer.appendChild(easyButton);

        const normalButton = document.createElement("button");
        normalButton.className = "tcoaal-button-tarsouls-small";
        normalButton.id = "tarSoulsDiffNormal";
        normalButton.textContent = "Normal";
        normalButton.onclick = () => this.setDifficulty("normal");
        normalButton.style.cssText = "flex: 1; background: var(--yellow);";
        difficultyContainer.appendChild(normalButton);

        const hardButton = document.createElement("button");
        hardButton.className = "tcoaal-button-tarsouls-small";
        hardButton.id = "tarSoulsDiffHard";
        hardButton.textContent = "Hard";
        hardButton.onclick = () => this.setDifficulty("hard");
        hardButton.style.cssText = "flex: 1;";
        difficultyContainer.appendChild(hardButton);

        sidebar.appendChild(difficultyContainer);

        const restartButton = document.createElement("button");
        restartButton.className = "tcoaal-button-tarsouls";
        restartButton.id = "tarSoulsRestartBtn";
        restartButton.textContent = "Restart Game";
        restartButton.onclick = () => this.restart();
        restartButton.style.cssText = "width: 100%; display: none;";
        sidebar.appendChild(restartButton);

        const difficultyLabel = document.createElement("div");
        difficultyLabel.style.cssText = `
            color: var(--txt-color, #ddd);
            font-family: 'TCOAAL', monospace;
            font-size: 0.9rem;
            margin-top: 10px;
            text-align: center;
        `;
        difficultyLabel.textContent = "Settings";
        sidebar.appendChild(difficultyLabel);

        const layoutButton = document.createElement("button");
        layoutButton.className = "tcoaal-button-tarsouls";
        layoutButton.id = "tarSoulsLayoutBtn";
        layoutButton.textContent = "Layout: QWERTY";
        layoutButton.onclick = () => this.toggleKeyLayout();
        layoutButton.style.width = "100%";
        sidebar.appendChild(layoutButton);

        const muteMusicButton = document.createElement("button");
        muteMusicButton.className = "tcoaal-button-tarsouls";
        muteMusicButton.id = "tarSoulsMuteMusicBtn";
        muteMusicButton.textContent = "Music: ON";
        muteMusicButton.onclick = () => this.toggleMuteMusic();
        muteMusicButton.style.width = "100%";
        sidebar.appendChild(muteMusicButton);

        const muteSoundButton = document.createElement("button");
        muteSoundButton.className = "tcoaal-button-tarsouls";
        muteSoundButton.id = "tarSoulsMuteSoundBtn";
        muteSoundButton.textContent = "Sound FX: ON";
        muteSoundButton.onclick = () => this.toggleMuteSound();
        muteSoundButton.style.width = "100%";
        sidebar.appendChild(muteSoundButton);

        const backButton = document.createElement("button");
        backButton.className = "tcoaal-button-tarsouls";
        backButton.textContent = "Quit";
        backButton.onclick = () => this.exitGame();
        backButton.style.width = "100%";
        sidebar.appendChild(backButton);

        const scoreDisplay = document.createElement("div");
        scoreDisplay.id = "tarSoulsScore";
        scoreDisplay.style.cssText = `
            color: var(--txt-color, #ddd);
            font-family: 'TCOAAL', monospace;
            font-size: 1rem;
            padding: 12px;
            background: rgba(0,0,0,0.5);
            border-radius: 4px;
            text-align: center;
            margin-top: 10px;
            display: none;
        `;
        scoreDisplay.textContent = "Followers: 0 | Pace: 0";
        sidebar.appendChild(scoreDisplay);
    }

    buildRightSidebar(sidebar) {
        sidebar.id = "tarSoulsInstructionsPanel";
    }

    async loadAssets() {
        const bgAsset = this.getGameAsset("images", "Backgrounds", "backgrounds_178.png");
        if (bgAsset) {
            this.backgroundImage = await this.loadImage(bgAsset.url);
        } else {
            console.warn("Background image not found in game assets");
        }

        const playerSheet = this.getGameAsset("images", "Game sprites", "spritessheet_12x8_characters_10.png");
        if (playerSheet) {
            this.playerSpritesheet = await this.loadImage(playerSheet.url);
        } else {
            console.warn("Player spritesheet not found in game assets");
        }

        for (let i = 0; i < ENEMY_CONFIG.length; i++) {
            const config = ENEMY_CONFIG[i];
            if (config.spritesheet) {
                const enemySheet = this.getGameAsset("images", "Game sprites", config.spritesheet);
                if (enemySheet) {
                    const loadedSheet = await this.loadImage(enemySheet.url);
                    ENEMY_CONFIG[i].spritesheetImage = loadedSheet;
                } else {
                    console.warn(`Enemy ${i} spritesheet not found: ${config.spritesheet}`);
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
                animSheets.add(config.sheet);
            }
        }

        for (const sheetName of animSheets) {
            let sheetAsset = this.getGameAsset("images", "Game sprites", sheetName);
            if (!sheetAsset) {
                sheetAsset = this.getGameAsset("images", "System", sheetName);
            }

            if (sheetAsset) {
                const loadedSheet = await this.loadImage(sheetAsset.url);

                for (const config of Object.values(GAME_EVENTS_ASSETS)) {
                    if (config.sheet === sheetName) {
                        config.spritesheetImage = loadedSheet;
                    }
                }
            } else {
                console.warn(`Animation spritesheet not found: ${sheetName}`);
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

        if (easyBtn) easyBtn.style.background = "";
        if (normalBtn) normalBtn.style.background = "";
        if (hardBtn) hardBtn.style.background = "";

        if (difficulty === "easy" && easyBtn) {
            easyBtn.style.background = "var(--green)";
        } else if (difficulty === "normal" && normalBtn) {
            normalBtn.style.background = "var(--yellow)";
        } else if (difficulty === "hard" && hardBtn) {
            hardBtn.style.background = "var(--red)";
        }

        //console.log(`Difficulty set to: ${difficulty}`);

        this.updateRulesForDifficulty();
    }

    togglePause() {
        const leftSidebar = document.getElementById("tarSoulsLeftSidebar");
        const rightSidebar = document.getElementById("tarSoulsInstructionsPanel");

        if (this.gameState === "playing") {
            this.gameState = "paused";
            document.getElementById("tarSoulsPauseBtn").textContent = "Resume";

            if (leftSidebar) leftSidebar.style.display = "flex";
            if (rightSidebar) rightSidebar.style.display = "block";
        } else if (this.gameState === "paused") {
            this.gameState = "playing";
            document.getElementById("tarSoulsPauseBtn").textContent = "Pause";

            if (leftSidebar) leftSidebar.style.display = "none";
            if (rightSidebar) rightSidebar.style.display = "none";
        }
    }

    startGame() {
        const difficultyModifier = this.difficulty === "easy" ? 0.75 : this.difficulty === "hard" ? 1.5 : 1.0;
        this.player = new Player(
            GAME_CONFIG.PLAYER_START_X,
            GAME_CONFIG.PLAYER_START_Y,
            this.playerSpritesheet,
            difficultyModifier,
        );

        this.enemies = [];
        this.enemySpawnTimer = 0;
        this.andySpawned = false;
        this.cameraY = 0;
        this.cameraRenderY = 0;
        this.animations = [];
        this.staticSprites = [];

        this.phase2Active = false;
        this.ninasAlive = 0;
        this.pocketDustActive = null;
        this.lastPlayerMoveTime = 0;
        this.victoryPortalActive = false;

        const startBtn = document.getElementById("tarSoulsStartBtn");
        const pauseBtn = document.getElementById("tarSoulsPauseBtn");
        const restartBtn = document.getElementById("tarSoulsRestartBtn");
        const leftSidebar = document.getElementById("tarSoulsLeftSidebar");
        const rightSidebar = document.getElementById("tarSoulsInstructionsPanel");

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
                const spriteWidth = spritesheet.width / 12;
                const spriteHeight = spritesheet.height / 8;
                const col = frame % 12;
                const row = Math.floor(frame / 12);

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
            <h2 style="color: var(--purple, #e2829a); margin-top: 0; font-size: 1.5rem;">Story</h2>
            <p style="margin-bottom: 20px;">Ashley must venture through the demon realm to save her brother Andy from the tar souls. Collect lost souls to grow stronger and faster! Then grab your useless brother, get rid of the hussies and leave!</p>

            <h2 style="color: var(--purple, #e2829a); font-size: 1.5rem;">Controls</h2>
            <ul style="list-style: none; padding-left: 0; margin-bottom: 20px;">
                <li><strong>↑↓←→</strong> or <strong id="tarSoulsControlKeys">WASD</strong> - Move</li>
                <li><strong>SPACE</strong> - Throw dust clouds</li>
                <li><strong>P</strong> / <strong>ESC</strong> - Pause</li>
            </ul>

            <h2 style="color: var(--purple, #e2829a); font-size: 1.5rem;">Entities</h2>
            <div style="margin-bottom: 15px;">
                <div id="soulEntity" style="margin-bottom: 12px; display: flex; align-items: center; gap: 12px;">
                    <div><strong>Soul</strong> - Catch to gain one soul!</div>
                </div>
                <div id="grimeEntity" style="margin-bottom: 12px; display: flex; align-items: center; gap: 12px;">
                    <div><strong>Grime Soul</strong> - Will steal one of your souls.</div>
                </div>
                <div id="tarEntity" style="margin-bottom: 12px; display: flex; align-items: center; gap: 12px;">
                    <div><strong>Tar Soul</strong> - DEADLY! Avoid!</div>
                </div>
                <div id="ninaEntity" style="margin-bottom: 12px; display: flex; align-items: center; gap: 12px;">
                    <div><strong>Nina</strong> - Must be dusted. Leaves a deadly box.</div>
                </div>
                <div id="andyEntity" style="margin-bottom: 12px; display: flex; align-items: center; gap: 12px;">
                    <div><strong>Andy</strong> - Appears at 10 souls. Catch and leave to win!</div>
                </div>
            </div>

            <h2 style="color: var(--purple, #e2829a); font-size: 1.5rem;">Rules</h2>
            <ul id="tarSoulsRulesList" style="list-style: none; padding-left: 0; font-size: 0.85rem;">
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
    }

    updateRulesForDifficulty() {
        const rulesList = document.getElementById("tarSoulsRulesList");
        if (!rulesList) return;

        rulesList.innerHTML = "";

        const commonRules = [
            "Keep moving",
            "Stay above boundary",
            "Don't hit top, bottom, side walls or your souls",
            "Get 10 souls, get Andy, kill hussies and leave",
        ];

        let difficultyRules = [];
        let spawnRates = "";

        if (this.difficulty === "easy") {
            difficultyRules = [
                "<strong>Side walls:</strong> Teleport to opposite side",
                "<strong>Speed:</strong> 75% (slower)",
            ];
            spawnRates = "<strong>Spawns:</strong> 70% Souls, 20% Grime Souls, 10% Tar Souls";
        } else if (this.difficulty === "normal") {
            difficultyRules = ["<strong>Side walls:</strong> Force you down", "<strong>Speed:</strong> 100% (normal)"];
            spawnRates = "<strong>Spawns:</strong> 50% Souls, 30% Grime Souls, 20% Tar Souls";
        } else if (this.difficulty === "hard") {
            difficultyRules = ["<strong>Side walls:</strong> Game over!", "<strong>Speed:</strong> 150% (faster)"];
            spawnRates = "<strong>Spawns:</strong> 40% Souls, 40% Grime Souls, 20% Tar Souls";
        }

        commonRules.forEach((rule) => {
            const li = document.createElement("li");
            li.innerHTML = `• ${rule}`;
            rulesList.appendChild(li);
        });

        difficultyRules.forEach((rule) => {
            const li = document.createElement("li");
            li.innerHTML = `• ${rule}`;
            rulesList.appendChild(li);
        });

        if (spawnRates) {
            const li = document.createElement("li");
            li.innerHTML = `• ${spawnRates}`;
            rulesList.appendChild(li);
        }
    }

    handleKeyDown(event) {
        if (this.gameState !== "playing") return;

        const code = event.code;

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

        if (code === "Space" && this.phase2Active) {
            this.throwPocketDust();
            event.preventDefault();
        }

        if (code === "Escape" || code === "KeyP") {
            this.togglePause();
            event.preventDefault();
        }
    }

    throwPocketDust() {
        if (this.pocketDustActive) return;

        const dustX = this.player.x + this.player.direction.x * 2;
        const dustY = this.player.y + this.player.direction.y * 2;

        if (dustX < 0 || dustX >= GAME_CONFIG.GRID_WIDTH || dustY < 0 || dustY >= GAME_CONFIG.GRID_HEIGHT) {
            return;
        }

        this.pocketDustActive = {
            x: dustX,
            y: dustY,
            ticksRemaining: 1,
        };

        this.audioManager.playSound("pocketDust");

        const dustAnim = new GameAnimation(GAME_EVENTS_ASSETS.POCKET_DUST, dustX, dustY, false);
        this.animations.push(dustAnim);

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            if (enemy.type === ENEMY_TYPES.ENEMY_HUSSY && enemy.x === dustX && enemy.y === dustY) {
                this.killNina(enemy, i);
            }
        }
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

        const winAnim = new GameAnimation(GAME_EVENTS_ASSETS.WIN_ANIM, this.player.x, this.player.y, true, this.player);
        this.animations.push(winAnim);

        for (let x = 0; x < GAME_CONFIG.GRID_WIDTH; x++) {
            this.spawnEnemy(ENEMY_TYPES.ENEMY_HUSSY, x);

            const nina = this.enemies[this.enemies.length - 1];
            nina.y = 0;
            nina.renderY = 0;
            this.ninasAlive++;
        }
    }

    spawnEnemy(type, x) {
        const enemy = new Enemy(type, x, GAME_CONFIG.ENEMY_SPAWN_Y);
        this.enemies.push(enemy);
    }

    spawnRandomEnemy() {
        if (this.phase2Active) {
            const rand = Math.random();
            const type = rand < 0.5 ? ENEMY_TYPES.ENEMY_TAR : ENEMY_TYPES.ENEMY_GRIME;

            const offset = Math.random() < 0.5 ? -1 : 1;
            let x = this.player.x + offset;
            x = Math.max(0, Math.min(GAME_CONFIG.GRID_WIDTH - 1, x));

            this.spawnEnemy(type, x);
        } else {
            const rand = Math.random();
            let type;
            let x;

            let soulRate, grimeRate, tarRate;

            if (this.difficulty === "easy") {
                soulRate = 0.7;
                grimeRate = 0.9;
                tarRate = 1.0;
            } else if (this.difficulty === "normal") {
                soulRate = 0.5;
                grimeRate = 0.8;
                tarRate = 1.0;
            } else {
                soulRate = 0.4;
                grimeRate = 0.8;
                tarRate = 1.0;
            }

            if (rand < soulRate) {
                type = ENEMY_TYPES.ENEMY_SOUL;
                x = this.getFarthestXFromPlayer();
            } else if (rand < grimeRate) {
                type = ENEMY_TYPES.ENEMY_GRIME;
                const offset = Math.random() < 0.5 ? -1 : 1;
                x = this.player.x + offset;
                x = Math.max(0, Math.min(GAME_CONFIG.GRID_WIDTH - 1, x));
            } else {
                type = ENEMY_TYPES.ENEMY_TAR;
                const offset = Math.random() < 0.5 ? -1 : 1;
                x = this.player.x + offset;
                x = Math.max(0, Math.min(GAME_CONFIG.GRID_WIDTH - 1, x));
            }

            this.spawnEnemy(type, x);
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

    checkandySpawned() {
        if (!this.andySpawned && this.player.followers.length >= 10 && !this.phase2Active) {
            this.andySpawned = true;
            const x = this.getFarthestXFromPlayer();
            this.spawnEnemy(ENEMY_TYPES.ENEMY_ANDY, x);
            this.audioManager.playSound("andySpawned");
            this.audioManager.playMusic("andyIsHere");
        }
    }

    update(deltaTime, timestamp) {
        if (this.gameState !== "playing") return;

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

        if (this.spawnAnimPlaying || this.waitingForFirstInput) {
            this.player.update(timestamp, deltaTime);
            return;
        }

        const playerMoved = this.player.move(timestamp, this.phase2Active);
        this.player.update(timestamp, deltaTime);

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
                    this.player.directionQueue = [];

                    this.player.x = Math.max(0, Math.min(GAME_CONFIG.GRID_WIDTH - 1, this.player.x));
                    this.player.renderX = this.player.x;
                } else {
                    this.gameOver("Hit the wall!");
                    return;
                }
            }

            if (!this.phase2Active && CollisionDetector.checkPlayerBoundary(this.player)) {
                this.gameOver("Went too far down!");
                return;
            }

            if (CollisionDetector.checkSelfCollision(this.player)) {
                this.gameOver("Hit your souls!");
                return;
            }

            if (this.phase2Active) {
                for (const sprite of this.staticSprites) {
                    if (sprite.blocksMovement && sprite.x === this.player.x && sprite.y === this.player.y) {
                        this.gameOver("Hit a dead hussy!");
                        return;
                    }
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

            if (enemy.type !== ENEMY_TYPES.ENEMY_ANDY) {
                const blocked = CollisionDetector.checkEnemyBlockedByTail(enemy, this.player);
                enemy.setBlocked(blocked);
            }

            enemy.move(timestamp);
            enemy.update(timestamp, deltaTime);

            if (CollisionDetector.checkEnemyCollision(this.player, enemy)) {
                if (this.phase2Active && enemy.type === ENEMY_TYPES.ENEMY_HUSSY) {
                    this.gameOver("Touched by Nina!");
                    return;
                }
                this.handleEnemyEaten(enemy, i);
                continue;
            }

            if (this.phase2Active && enemy.type === ENEMY_TYPES.ENEMY_HUSSY) {
                for (const follower of this.player.followers) {
                    if (follower.x === enemy.x && follower.y === enemy.y) {
                        this.gameOver("Nina touched Andy!");
                        return;
                    }
                }
            }

            if (CollisionDetector.checkEnemyReachedTop(enemy)) {
                if (enemy.type === ENEMY_TYPES.ENEMY_ANDY) {
                    this.gameOver("Andy reached the top alone!");
                    return;
                } else if (enemy.type === ENEMY_TYPES.ENEMY_SOUL) {
                    const numFollowers = this.player.followers.length;
                    this.player.followers = [];
                    this.player.pace = 0;
                    this.player.updateSpeed();
                    this.enemies.splice(i, 1);
                } else {
                    this.enemies.splice(i, 1);
                }
            }
        }

        this.enemySpawnTimer += deltaTime;
        if (this.enemySpawnTimer >= this.enemySpawnInterval) {
            this.spawnRandomEnemy();
            this.enemySpawnTimer = 0;
        }

        this.checkandySpawned();

        this.updateCamera(deltaTime);

        this.updateUI();
    }

    handleEnemyEaten(enemy, enemyIndex) {
        switch (enemy.type) {
            case ENEMY_TYPES.ENEMY_ANDY:
                this.startPhase2(enemy);
                this.enemies.splice(enemyIndex, 1);
                break;
            case ENEMY_TYPES.ENEMY_SOUL:
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
                this.player.removeFollower();

                const hitAnim = new GameAnimation(
                    GAME_EVENTS_ASSETS.HIT_ANIM,
                    this.player.x,
                    this.player.y,
                    false,
                    null,
                    Math.min(this.player.followers.length, 9),
                );
                this.animations.push(hitAnim);

                if (GAME_EVENTS_ASSETS.HIT_ANIM.sound) {
                    this.audioManager.playSound(GAME_EVENTS_ASSETS.HIT_ANIM.sound);
                }

                this.enemies.splice(enemyIndex, 1);
                break;
            case ENEMY_TYPES.ENEMY_TAR:
                this.audioManager.playSound("eatTarSoul");
                this.gameOver(`Ate a ${ENEMY_TYPES_NAME.ENEMY_TAR}!`);
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

        this.ctx.restore();

        if (this.gameState === "paused") {
            this.drawPauseOverlay();
        }
    }

    drawGrid() {
        this.ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        this.ctx.lineWidth = 1;

        for (let x = 0; x <= GAME_CONFIG.GRID_WIDTH; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * GAME_CONFIG.CELL_SIZE, 0);
            this.ctx.lineTo(x * GAME_CONFIG.CELL_SIZE, GAME_CONFIG.GRID_HEIGHT * GAME_CONFIG.CELL_SIZE);
            this.ctx.stroke();
        }

        for (let y = 0; y <= GAME_CONFIG.GRID_HEIGHT; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * GAME_CONFIG.CELL_SIZE);
            this.ctx.lineTo(GAME_CONFIG.GRID_WIDTH * GAME_CONFIG.CELL_SIZE, y * GAME_CONFIG.CELL_SIZE);
            this.ctx.stroke();
        }
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
        const spriteWidth = this.playerSpritesheet.width / 12;
        const spriteHeight = this.playerSpritesheet.height / 8;
        const col = frame % 12;
        const row = Math.floor(frame / 12);

        const is2x1 = spriteWidth > spriteHeight * 1.5;
        let drawWidth = cellSize;
        let drawHeight = cellSize;
        let drawX = x;
        let drawY = y;

        if (is2x1) {
            drawWidth = cellSize / 2;
            drawHeight = cellSize / 2;
            drawX = x + cellSize / 4;
            drawY = y + cellSize / 4;
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
            const spriteWidth = spritesheet.width / 12;
            const spriteHeight = spritesheet.height / 8;
            const col = frame % 12;
            const row = Math.floor(frame / 12);

            const is2x1 = spriteWidth > spriteHeight * 1.5;
            let drawWidth = cellSize;
            let drawHeight = cellSize;
            let drawX = x;
            let drawY = y;

            if (is2x1) {
                drawWidth = cellSize / 2;
                drawHeight = cellSize / 2;
                drawX = x + cellSize / 4;
                drawY = y + cellSize / 4;
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
            const spriteWidth = spritesheet.width / 12;
            const spriteHeight = spritesheet.height / 8;
            const col = frame % 12;
            const row = Math.floor(frame / 12);

            const is2x1 = spriteWidth > spriteHeight * 1.5;
            let drawWidth = cellSize;
            let drawHeight = cellSize;
            let drawX = x;
            let drawY = y;

            if (is2x1) {
                drawWidth = cellSize / 2;
                drawHeight = cellSize / 2;
                drawX = x + cellSize / 4;
                drawY = y + cellSize / 4;
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

        if (enemy.blocked) {
            this.ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
            this.ctx.fillRect(x + 4, y + 4, cellSize - 8, cellSize - 8);
        }
    }

    drawStaticSprite(sprite, offsetX, offsetY, cellSize) {
        const x = offsetX + sprite.x * cellSize;
        const y = offsetY + sprite.y * cellSize;

        if (!sprite.config.spritesheetImage) return;

        const spritesheet = sprite.config.spritesheetImage;
        const frame = sprite.config.index[0];

        let gridCols = 12;
        let gridRows = 8;
        if (spritesheet.width / spritesheet.height > 1.3) {
            gridCols = 12;
            gridRows = 8;
        } else {
            gridCols = 8;
            gridRows = 15;
        }

        const spriteWidth = spritesheet.width / gridCols;
        const spriteHeight = spritesheet.height / gridRows;
        const col = frame % gridCols;
        const row = Math.floor(frame / gridCols);

        const is2x1 = spriteWidth > spriteHeight * 1.5;
        const is1x2 = spriteHeight > spriteWidth * 1.5;
        let drawWidth = cellSize;
        let drawHeight = cellSize;
        let drawX = x;
        let drawY = y;

        if (is2x1) {
            drawWidth = cellSize / 2;
            drawHeight = cellSize / 2;
            drawX = x + cellSize / 4;
            drawY = y + cellSize / 4;
        } else if (is1x2) {
            drawWidth = cellSize / 2;
            drawHeight = cellSize;
            drawX = x + cellSize / 4;
            drawY = y;
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

        let gridCols = 12;
        let gridRows = 8;
        if (spritesheet.width / spritesheet.height > 1.3) {
            gridCols = 12;
            gridRows = 8;
        } else {
            gridCols = 8;
            gridRows = 15;
        }

        const spriteWidth = spritesheet.width / gridCols;
        const spriteHeight = spritesheet.height / gridRows;
        const col = frame % gridCols;
        const row = Math.floor(frame / gridCols);

        const is2x1 = spriteWidth > spriteHeight * 1.5;
        const is1x2 = spriteHeight > spriteWidth * 1.5;
        let drawWidth = cellSize;
        let drawHeight = cellSize;
        let drawX = x;
        let drawY = y;

        if (is2x1) {
            drawWidth = cellSize / 2;
            drawHeight = cellSize / 2;
            drawX = x + cellSize / 4;
            drawY = y + cellSize / 4;
        } else if (is1x2) {
            drawWidth = cellSize / 2;
            drawHeight = cellSize;
            drawX = x + cellSize / 4;
            drawY = y;
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
            font-size: 4rem;
            color: var(--red, #ff4444);
            margin-bottom: 20px;
        `;
        title.textContent = "GAME OVER";

        const message = document.createElement("p");
        message.style.cssText = `
            font-family: 'TCOAAL', monospace;
            font-size: 1.5rem;
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
        menuButton.textContent = "Quit";
        menuButton.style.marginLeft = "10px";
        menuButton.onclick = () => this.exitGame();

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
            font-size: 4rem;
            color: var(--green, #4a9d4a);
            margin-bottom: 20px;
        `;
        title.textContent = "YOU WIN!";

        const message = document.createElement("p");
        message.style.cssText = `
            font-family: 'TCOAAL', monospace;
            font-size: 1.5rem;
            color: var(--txt-color, #ddd);
            margin-bottom: 40px;
        `;
        message.textContent = `You saved your brother! Followers: ${this.player.followers.length}`;

        const restartButton = document.createElement("button");
        restartButton.className = "tcoaal-button-tarsouls";
        restartButton.textContent = "Play Again";
        restartButton.onclick = () => {
            overlay.remove();
            this.restart();
        };

        const menuButton = document.createElement("button");
        menuButton.className = "tcoaal-button-tarsouls";
        menuButton.textContent = "Quit";
        menuButton.style.marginLeft = "10px";
        menuButton.onclick = () => this.exitGame();

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

        this.enemies = [];
        this.enemySpawnTimer = 0;
        this.andySpawned = false;
        this.lastTimestamp = performance.now();
        this.cameraY = 0;
        this.cameraRenderY = 0;
        this.animations = [];
        this.staticSprites = [];

        this.phase2Active = false;
        this.ninasAlive = 0;
        this.pocketDustActive = null;
        this.lastPlayerMoveTime = 0;
        this.victoryPortalActive = false;

        const difficultyModifier = this.difficulty === "easy" ? 0.75 : this.difficulty === "hard" ? 1.5 : 1.0;
        this.player = new Player(
            GAME_CONFIG.PLAYER_START_X,
            GAME_CONFIG.PLAYER_START_Y,
            this.playerSpritesheet,
            difficultyModifier,
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
}

let tarSoulsGameInstance = null;

async function startTarSoulsGame() {
    if (tarSoulsGameInstance) {
        tarSoulsGameInstance.exitGame();
    }

    tarSoulsGameInstance = new TarSoulsGame();
    await tarSoulsGameInstance.init();
}

window.startTarSoulsGame = startTarSoulsGame;
