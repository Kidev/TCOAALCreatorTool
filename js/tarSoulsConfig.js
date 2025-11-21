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

// Base game configuration (common to all difficulties)
const GAME_CONFIG = {
    GRID_WIDTH: 10,
    GRID_HEIGHT: 34,
    CELL_SIZE: 48,
    PLAY_AREA_X: 384,
    PLAY_AREA_Y: 240,
    CAMERA_SIZE: 600,
    PLAYER_START_X: 4,
    PLAYER_START_Y: 4,
    PLAYER_MIN_Y: 25,
    ENEMY_SPAWN_Y: 30,

    // Movement smoothness
    INTERPOLATION_SPEED: 0.15, // Lerp factor for smooth movement (lower = smoother glide)
    INPUT_BUFFER_SIZE: 3, // Max queued inputs

    // Attack
    POCKET_DUST_COOLDOWN: 750, // ms between shots

    // Debug
    DEBUG: false, // Show grid, borders, and hitboxes

    // Effect animation display durations (ms)
    NUMBER_DISPLAY_DURATION: 1500, // How long numbers stay visible after animations
    EFFECT_ANIMATION_SPEED: 75, // Speed multiplier for effect animations
};

const GAME_ASSETS = {
    player_sprite: {
        category: "Game sprites",
        sheet: "spritessheet_12x8_characters_10.png",
        indices: [0, 1, 2],
        speed: 250,
    },
    player_ashley: {
        category: "Game sprites",
        spritesheet: "spritessheet_12x8_characters_8.png",
        frames: {
            forward: [0, 1, 2],
            backward: [36, 37, 38],
            left: [12, 13, 14],
            right: [24, 25, 26],
        },
        speed: 250,
    },
    background: {
        category: "Backgrounds",
        image: "backgrounds_178.png",
    },
    sound_effects: {
        PLAYER_MOVE: null,
        EAT_SOUL: "se_23.ogg",
        EAT_GRIME_SOUL: "se_3.ogg",
        TAR_SOUL_SPAWN: "se_57.ogg",
        ANDY_SPAWNED: "se_18.ogg",
        GAME_OVER: "se_50.ogg",
        WIN: "se_17.ogg",
        SPAWN_ANIM: "se_15.ogg",
        POCKET_DUST: "se_35.ogg",
    },
    music: {
        NORMAL: "hallucination_connect.ogg",
        ANDY_IS_HERE: "snail_eyes.ogg",
    },
    music_kidev: {
        NORMAL: "music/darkbells-kidev.mp3",
        ANDY_IS_HERE: "music/cultist-kidev.mp3",
    },
};

// Difficulty-specific configurations
const DIFFICULTY_CONFIGS = {
    easy: {
        // Player speed
        PLAYER_INITIAL_SPEED: 350, // ms per move (slower = easier)
        SPEED_DECREASE_PER_PACE: 10, // Slow progression
        MIN_SPEED: 125,
        SPEED_OFFSET: 200,

        // Enemy spawn rates (must sum to 1.0)
        SOUL_SPAWN_RATE: 0.7, // 70% Souls
        GRIME_SPAWN_RATE: 0.2, // 20% grime Souls
        TAR_SPAWN_RATE: 0.1, // 10% tar Souls

        // Win conditions
        FOLLOWERS_NEEDED_FOR_ANDY: 7,
        NINAS_TO_SPAWN: 5,
        GRACE_SPAWNS: 5,

        // Nina box respawn mechanics
        NINA_RESPAWN_COOLDOWN: 1500, // ms before respawned Nina can move
        NINA_CAN_TRIGGER_BOX_RESPAWN: true,
        NINA_BOX_PLAYER_PUSHBACK: 2, // cells to push player back when hitting box

        // Wall behavior
        WALL_BEHAVIOR: "teleport", // Options: "teleport", "push_down", "game_over"
    },
    normal: {
        // Player speed
        PLAYER_INITIAL_SPEED: 300, // ms per move
        SPEED_DECREASE_PER_PACE: 12, // Moderate progression
        MIN_SPEED: 100,
        SPEED_OFFSET: 100,

        // Enemy spawn rates
        SOUL_SPAWN_RATE: 0.5, // 50% Souls
        GRIME_SPAWN_RATE: 0.3, // 30% grime Souls
        TAR_SPAWN_RATE: 0.2, // 20% tar Souls

        // Win conditions
        FOLLOWERS_NEEDED_FOR_ANDY: 10,
        NINAS_TO_SPAWN: 5,
        GRACE_SPAWNS: 3,

        // Nina box respawn mechanics
        NINA_RESPAWN_COOLDOWN: 1000, // ms before respawned Nina can move
        NINA_CAN_TRIGGER_BOX_RESPAWN: true,
        NINA_BOX_PLAYER_PUSHBACK: 3, // cells to push player back when hitting box

        // Wall behavior
        WALL_BEHAVIOR: "push_down",
    },
    hard: {
        // Player speed
        PLAYER_INITIAL_SPEED: 250, // ms per move (faster = harder)
        SPEED_DECREASE_PER_PACE: 15, // Fast progression
        MIN_SPEED: 75,
        SPEED_OFFSET: 0,

        // Enemy spawn rates
        SOUL_SPAWN_RATE: 0.4, // 40% Souls
        GRIME_SPAWN_RATE: 0.4, // 40% grime Souls
        TAR_SPAWN_RATE: 0.2, // 20% tar Souls

        // Win conditions
        FOLLOWERS_NEEDED_FOR_ANDY: 10,
        NINAS_TO_SPAWN: 10,
        GRACE_SPAWNS: 2,

        // Pocket dust
        POCKET_DUST_COOLDOWN: 500, // ms between shots (harder = shorter cooldown)

        // Nina box respawn mechanics
        NINA_RESPAWN_COOLDOWN: 500, // ms before respawned Nina can move
        NINA_CAN_TRIGGER_BOX_RESPAWN: true,
        NINA_BOX_PLAYER_PUSHBACK: 5, // cells to push player back when hitting box (harder = less pushback)

        // Wall behavior
        WALL_BEHAVIOR: "game_over",
    },
};

// Enemy type behaviors
const ENEMY_TYPES = {
    ENEMY_ANDY: 0,
    ENEMY_SOUL: 1,
    ENEMY_GRIME: 2,
    ENEMY_TAR: 3,
    ENEMY_HUSSY: 4,
};

const ENEMY_TYPES_NAME = {
    ENEMY_ANDY: "Andy",
    ENEMY_SOUL: "Soul",
    ENEMY_GRIME: "Grime Soul",
    ENEMY_TAR: "Tar Soul",
    ENEMY_HUSSY: "Nina",
};

const GAME_EVENTS_ASSETS = {
    NUMBERS: {
        category: "Game sprites",
        sheet: "spritessheet_12x8_characters_9.png",
        index: [73, 36, 37, 38, 48, 49, 50, 60, 61, 62],
        speed: 0, // Will use NUMBER_DISPLAY_DURATION from config
        sound: null,
    },
    LIMIT_PLAYER: {
        category: "Game sprites",
        sheet: "spritessheet_12x8_characters_14.png",
        index: [86],
        speed: 0,
        sound: null,
    },
    SPAWN_ANIM: {
        category: "Game sprites",
        sheet: "spritessheet_12x8_characters_7.png",
        index: [57, 58, 59],
        speed: 250,
        sound: "spawnAnim",
    },
    EAT_ANIM: {
        category: "System sprites",
        sheet: "spritessheet_8x15_system_24.png",
        index: [40, 41, 42, 43, 44, 45, 46, 47],
        speed: 0, // Will use EFFECT_ANIMATION_SPEED from config
        sound: "eatSoul",
    },
    HIT_ANIM: {
        category: "System sprites",
        sheet: "spritessheet_8x15_system_24.png",
        index: [48, 49, 50, 51, 52, 53, 54, 55],
        speed: 0, // Will use EFFECT_ANIMATION_SPEED from config
        sound: "eatGrimeSoul",
    },
    FOLLOWER_ANIM: {
        category: "Game sprites",
        sheet: "spritessheet_12x8_characters_17.png",
        index: [23, 21, 22, 11, 10, 9, 10, 11, 22, 21, 23],
        speed: 25,
        sound: null,
    },
    DEATH_ANIM: {
        category: "System sprites",
        sheet: "spritessheet_8x10_system_3.png",
        index: [8, 9, 10, 11, 12, 13, 14, 15],
        speed: 50,
        sound: "gameOver",
    },
    WIN_ANIM: {
        category: "System sprites",
        sheet: "spritessheet_8x10_system_3.png",
        index: [40, 41, 42, 43, 44, 45, 46, 47],
        speed: 50,
        sound: "win",
    },
    DEAD_HUSSY: {
        category: "Game sprites",
        sheet: "spritessheet_12x8_characters_7.png",
        index: [49],
        speed: 0,
        sound: null,
    },
    POCKET_DUST: {
        category: "System sprites",
        sheet: "spritessheet_8x10_system_3.png",
        index: [8, 9, 10, 11, 12, 13, 14, 15],
        speed: 50,
        sound: "pocketDust",
        monochrome: true,
    },
    GREEN_HEART_ANIM: {
        category: "System sprites",
        sheet: "spritessheet_8x15_system_24.png",
        index: [64, 65, 66, 68, 69, 70, 71, 72],
        speed: 200,
    },
    SKULL_ANIM: {
        category: "System sprites",
        sheet: "spritessheet_8x15_system_24.png",
        index: [16, 17, 18, 19, 20, 21, 22, 23],
        speed: 200,
    },
};

const ENEMY_CONFIG = [
    {
        // Andy
        type: 0,
        category: "Game sprites",
        spritesheet: "spritessheet_12x8_characters_1.png",
        speed: 200,
        frames: {
            forward: [51, 52, 53],
            backward: [87, 88, 89],
            left: [63, 64, 65],
            right: [75, 76, 77],
        },
    },
    {
        // Soul
        type: 1,
        category: "Game sprites",
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
        // Grime Soul
        type: 2,
        category: "Game sprites",
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
        // Tar Soul
        type: 3,
        category: "Game sprites",
        spritesheet: "spritessheet_12x8_characters_17.png",
        speed: 800,
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
        category: "Game sprites",
        spritesheet: "spritessheet_12x8_characters_1.png",
        speeds: [400, 800],
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
