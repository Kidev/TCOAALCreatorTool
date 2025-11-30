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

function getEpisode2Config() {
    const GAME_CONFIG = {
        GRID_WIDTH: 10,
        GRID_HEIGHT: 34,
        CELL_SIZE: 48,
        PLAY_AREA_X: 384,
        PLAY_AREA_Y: 240,
        CAMERA_SIZE: 600,
        PLAYER_START_X: 4,
        PLAYER_START_Y: 18,
        PLAYER_MIN_Y: 4, // Player can't go above this without being detected
        JULIA_X: 4,
        JULIA_Y: 4,

        GRAVE_POSITIONS: [
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 2, y: 0 },
            { x: 3, y: 0 },
            { x: 5, y: 0 },
            { x: 6, y: 0 },
            { x: 7, y: 0 },
            { x: 8, y: 0 },
            { x: 9, y: 0 },
        ],

        INTERPOLATION_SPEED: 0.15, // Lerp factor for smooth movement (lower = smoother glide)
        INPUT_BUFFER_SIZE: 3, // Max queued inputs

        POCKET_DUST_COOLDOWN: 750, // ms between shots

        DEBUG: false, // Show grid, borders, and hitboxes

        NUMBER_DISPLAY_DURATION: 1500, // How long numbers stay visible after animations
        EFFECT_ANIMATION_SPEED: 75, // Speed multiplier for effect animations

        INFINITE_MODE_GRAVE_RESPAWN_TIME: 30000, // 30 seconds for a filled grave to empty
    };

    const GAME_ASSETS = {
        player_sprite: {
            category: "Game sprites",
            sheet: "spritessheet_12x8_characters_8.png",
            spritesheet: "spritessheet_12x8_characters_8.png",
            indices: [0, 1, 2],
            frames: {
                forward: [0, 1, 2],
                backward: [36, 37, 38],
                left: [12, 13, 14],
                right: [24, 25, 26],
            },
            speed: 250,
            spriteScale: 1.5, // Visual scale for 1x2/2x1 sprites
        },
        background: {
            category: "Backgrounds",
            image: "backgrounds_178.png",
        },
        sound_effects: {
            PLAYER_MOVE: null,
            GAME_OVER: "se_50.ogg",
            WIN: "se_17.ogg",
            SPAWN_ANIM: "se_15.ogg",
            POCKET_DUST: "se_35.ogg",
            SPOTTED: "se_67.ogg",
            GRAVE_FILLED: "se_5.ogg",
            GRAVE_EMPTIED: "se_24.ogg",
        },
        music: {
            NORMAL: "hallucination_connect.ogg",
        },
        music_kidev: {
            NORMAL: "music/darkbells-kidev.mp3",
        },
        graves: {
            category: "Game sprites",
            sheet: "spritessheet_12x8_characters_1.png",
            indexFilled: [29],
            indexEmpty: [5],
            spriteScale: 1, // Graves excluded from scaling
        },
    };

    const DIFFICULTY_CONFIGS = {
        easy: {
            PLAYER_INITIAL_SPEED: 350, // ms per move (slower = easier)

            JULIA_LOOK_INTERVAL_MIN: 7000, // Min time Julia looks in one direction
            JULIA_LOOK_INTERVAL_MAX: 10000, // Max time Julia looks in one direction

            INITIAL_FILLED_GRAVES: 6, // Out of 9 total

            HUSSY_BOX_RESPAWN_MIN: 15000, // Min time before hussy respawns from box
            HUSSY_BOX_RESPAWN_MAX: 16000, // Max time before hussy respawns from box

            BOX_PUSH_DISTANCE: 1, // How many cells boxes are pushed

            WALL_BEHAVIOR: "teleport", // Options: "teleport", "push_down", "game_over"
        },
        normal: {
            PLAYER_INITIAL_SPEED: 350, // ms per move

            JULIA_LOOK_INTERVAL_MIN: 5000,
            JULIA_LOOK_INTERVAL_MAX: 7000,

            INITIAL_FILLED_GRAVES: 4, // Out of 9 total

            HUSSY_BOX_RESPAWN_MIN: 9000,
            HUSSY_BOX_RESPAWN_MAX: 14000,

            BOX_PUSH_DISTANCE: 1,

            WALL_BEHAVIOR: "push_down",
        },
        hard: {
            PLAYER_INITIAL_SPEED: 350, // ms per move (faster = harder)

            JULIA_LOOK_INTERVAL_MIN: 1500,
            JULIA_LOOK_INTERVAL_MAX: 5000,

            INITIAL_FILLED_GRAVES: 0, // Out of 9 total (harder = fewer filled)

            HUSSY_BOX_RESPAWN_MIN: 5000,
            HUSSY_BOX_RESPAWN_MAX: 9000,

            BOX_PUSH_DISTANCE: 1, // Harder = less push distance

            WALL_BEHAVIOR: "game_over",
        },
        infinite: {
            PLAYER_INITIAL_SPEED: 350, // Same as hard

            JULIA_LOOK_INTERVAL_MIN: 1500,
            JULIA_LOOK_INTERVAL_MAX: 5000,

            INITIAL_FILLED_GRAVES: 0, // Same as hard

            HUSSY_BOX_RESPAWN_MIN: 5000,
            HUSSY_BOX_RESPAWN_MAX: 9000,

            BOX_PUSH_DISTANCE: 1,

            WALL_BEHAVIOR: "game_over",

            GRAVE_RESPAWN_TIME: 33333, // 30 seconds for filled graves to empty and respawn hussies
        },
    };

    const ENEMY_TYPES = {
        ENEMY_JULIA: 0,
        ENEMY_HUSSY: 1,
    };

    const ENEMY_TYPES_NAME = {
        ENEMY_JULIA: "Julia",
        ENEMY_HUSSY: "Hussy",
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
            spriteScale: 1.5, // Visual scale for 1x2/2x1 sprites
            sound: "spawnAnim",
        },
        EAT_ANIM: {
            category: "System sprites",
            sheet: "spritessheet_8x15_system_24.png",
            index: [40, 41, 42, 43, 44, 45, 46, 47],
            speed: 0, // Will use EFFECT_ANIMATION_SPEED from config
            spriteScale: 1, // System sprite, no scaling
            sound: "eatSoul",
        },
        HIT_ANIM: {
            category: "System sprites",
            sheet: "spritessheet_8x15_system_24.png",
            index: [48, 49, 50, 51, 52, 53, 54, 55],
            speed: 0, // Will use EFFECT_ANIMATION_SPEED from config
            spriteScale: 1, // System sprite, no scaling
            sound: "eatGrimeSoul",
        },
        FOLLOWER_ANIM: {
            category: "Game sprites",
            sheet: "spritessheet_12x8_characters_17.png",
            index: [23, 21, 22, 11, 10, 9, 10, 11, 22, 21, 23],
            speed: 25,
            spriteScale: 1.5, // Visual scale for 1x2/2x1 sprites
            sound: null,
        },
        DEATH_ANIM: {
            category: "System sprites",
            sheet: "spritessheet_8x10_system_3.png",
            index: [8, 9, 10, 11, 12, 13, 14, 15],
            speed: 50,
            spriteScale: 1, // System sprite, no scaling
            sound: "gameOver",
        },
        WIN_ANIM: {
            category: "System sprites",
            sheet: "spritessheet_8x10_system_3.png",
            index: [40, 41, 42, 43, 44, 45, 46, 47],
            speed: 50,
            spriteScale: 1, // System sprite, no scaling
            sound: "win",
        },
        DEAD_HUSSY: {
            category: "Game sprites",
            sheet: "spritessheet_12x8_characters_7.png",
            index: [49],
            speed: 0,
            spriteScale: 1, // Graves excluded from scaling
            sound: null,
        },
        POCKET_DUST: {
            category: "System sprites",
            sheet: "spritessheet_8x10_system_3.png",
            index: [8, 9, 10, 11, 12, 13, 14, 15],
            speed: 50,
            spriteScale: 1, // System sprite, no scaling
            sound: "pocketDust",
            monochrome: true,
        },
        GREEN_HEART_ANIM: {
            category: "System sprites",
            sheet: "spritessheet_8x15_system_24.png",
            index: [64, 65, 66, 68, 69, 70, 71, 72],
            speed: 200,
            spriteScale: 1, // System sprite, no scaling
        },
        SKULL_ANIM: {
            category: "System sprites",
            sheet: "spritessheet_8x15_system_24.png",
            index: [16, 17, 18, 19, 20, 21, 22, 23],
            speed: 200,
            spriteScale: 1, // System sprite, no scaling
        },
        POOF_ANIM: {
            category: "Game sprites",
            sheet: "spritessheet_12x8_characters_1.png",
            index: [9, 21, 33, 45],
            speed: 250,
            spriteScale: 1.5, // Visual scale for 1x2/2x1 sprites
        },
        DOT_DOT_ANIM: {
            category: "System sprites",
            sheet: "spritessheet_8x10_system_3.png",
            index: [16, 17, 18, 19, 20, 21, 22, 23],
            speed: 150,
            spriteScale: 1, // System sprite, no scaling
        },
        SPOTTED_ANIM: {
            category: "System sprites",
            sheet: "spritessheet_8x15_system_24.png",
            index: [0, 1, 2, 3, 4, 5, 6, 7],
            speed: 100,
            spriteScale: 1, // System sprite, no scaling
        },
    };

    const ENEMY_CONFIG = [
        {
            // Julia
            type: 0,
            category: "Game sprites",
            spritesheet: "spritessheet_12x8_characters_13.png",
            speed: 10000,
            spriteScale: 1.5, // Visual scale for 1x2/2x1 sprites
            frames: {
                forward: [18],
                backward: [19],
                left: [18],
                right: [19],
            },
        },
        {
            // Hussy
            type: 1,
            category: "Game sprites",
            spritesheet: "spritessheet_12x8_characters_1.png",
            speeds: [800, 1200], // Slower speed range for Episode 2
            spriteScale: 1.5, // Visual scale for 1x2/2x1 sprites
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

    return {
        GAME_CONFIG,
        GAME_ASSETS,
        DIFFICULTY_CONFIGS,
        ENEMY_TYPES,
        ENEMY_TYPES_NAME,
        GAME_EVENTS_ASSETS,
        ENEMY_CONFIG,
        DIRECTIONS,
        KEY_LAYOUTS,
    };
}
