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

function setupScene() {
    dialogFramework.setConfig({
        backgroundMusic: null,
        showControls: true,
        showDebug: true,
    });

    dialogFramework.setCharacters({
        Andrew: {
            aliases: ["Andy", "Accident", "Disappointment", "Anders"],
            color: Color.GREEN,
        },
        Ashley: {
            aliases: ["Leyley", "Embarrassment", "Mistake"],
            color: Color.PURPLE,
        },
        Douglas: {
            aliases: ["Dad", "Mr. Graves", "Father"],
            color: Color.BLUE,
        },
        Renee: {
            aliases: ["Mom", "Mrs. Graves", "Mother"],
            color: Color.YELLOW,
        },
        Julia: {
            color: Color.YELLOW,
        },
        "Lord Unknown": {
            aliases: ["Something Terrifying", "Something Kind", "Fucking Snoop"],
            color: Color.RED,
        },
        "? ? ?": {
            aliases: ["The entity"],
            color: Color.RED,
        },
        Grandma: {
            color: Color.GREY_BLUE,
        },
        Grandpa: {
            color: Color.GREY,
        },
        "Others yellow": {
            aliases: ["A man", "Cultist", "Cultists", "Lady", "Kids"],
            color: Color.YELLOW,
        },
        "Others blue": {
            aliases: ["Warden", "TV", "Surgeon"],
            color: Color.BLUE,
        },
    });

    dialogFramework.setGlitchConfig({
        scrambledColor: Color.BLACK,
        realColor: Color.DEFAULT,
        changeSpeed: 50,
        realProbability: 5,
        autoStart: true,
        charsAllowed: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
    });

    dialogFramework
        .addScene({
            line1: "The narrator speaks!",
            censorSpeaker: false,
        })
        .addScene({});
}
