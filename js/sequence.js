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
        image: 'https://i.imgur.com/kKegAOU.png',
        speaker: 'Andy',
        line1: "Leyley, I don't--... want to.",
        line2: "",
        censorSpeaker: false,
        dialogFadeInTime: 200,
        dialogFadeOutTime: 200,
        imageFadeInTime: 200,
        imageFadeOutTime: -200,
        dialogDelayIn: 500,
        dialogDelayOut: 0,
        imageDelayIn: 0,
        imageDelayOut: 0
    })
    .addScene({
        image: 'https://i.imgur.com/xGAMTx1.png',
        speaker: 'Leyley',
        line1: "Well, I do.",
        line2: "",
        censorSpeaker: false,
        dialogFadeInTime: 200,
        dialogFadeOutTime: 0,
        imageFadeInTime: -200,
        imageFadeOutTime: 0,
        dialogDelayIn: 500,
        dialogDelayOut: 0,
        imageDelayIn: 0,
        imageDelayOut: 0
    })
    .addScene({
        image: 'https://i.imgur.com/xGAMTx1.png',
        speaker: 'Leyley',
        line1: "Just go over and  __k  _e_  to  ____  __th  you.",
        line2: "",
        censorSpeaker: false,
        dialogFadeInTime: 0,
        dialogFadeOutTime: 0,
        imageFadeInTime: 0,
        imageFadeOutTime: 0,
        dialogDelayIn: 0,
        dialogDelayOut: 0,
        imageDelayIn: 0,
        imageDelayOut: 0
    })
    .addScene({
        image: 'https://i.imgur.com/xGAMTx1.png',
        speaker: 'Andy',
        line1: "I thought she's your friend?",
        line2: "",
        censorSpeaker: false,
        dialogFadeInTime: 0,
        dialogFadeOutTime: 200,
        imageFadeInTime: 0,
        imageFadeOutTime: 0,
        dialogDelayIn: 0,
        dialogDelayOut: 0,
        imageDelayIn: 0,
        imageDelayOut: 0
    })
    .addScene({
        image: 'https://i.imgur.com/xGAMTx1.png',
        speaker: 'Leyley',
        line1: "Mom said you'd help me with anything!",
        line2: "",
        censorSpeaker: false,
        dialogFadeInTime: 0,
        dialogFadeOutTime: 200,
        imageFadeInTime: 0,
        imageFadeOutTime: 200,
        dialogDelayIn: 500,
        dialogDelayOut: 0,
        imageDelayIn: 0,
        imageDelayOut: 0
    })
    .addScene({
        image: null,
        speaker: 'Andy',
        line1: "We'll get in trouble...",
        line2: "",
        censorSpeaker: false,
        dialogFadeInTime: 200,
        dialogFadeOutTime: 200,
        imageFadeInTime: 200,
        imageFadeOutTime: 200,
        dialogDelayIn: 500,
        dialogDelayOut: 0,
        imageDelayIn: 0,
        imageDelayOut: 0
    })
    .addScene({
        image: 'https://i.imgur.com/y74gtS9.png',
        speaker: '',
        line1: "",
        line2: "",
        censorSpeaker: false,
        dialogFadeInTime: 200,
        dialogFadeOutTime: 200,
        imageFadeInTime: 200,
        imageFadeOutTime: -600,
        dialogDelayIn: 500,
        dialogDelayOut: 0,
        imageDelayIn: 0,
        imageDelayOut: 0
    })
    .addScene({
        image: 'https://i.imgur.com/vd0sOg6.png',
        speaker: '',
        line1: "",
        line2: "",
        censorSpeaker: false,
        dialogFadeInTime: 200,
        dialogFadeOutTime: 200,
        imageFadeInTime: -600,
        imageFadeOutTime: 200,
        dialogDelayIn: 500,
        dialogDelayOut: 0,
        imageDelayIn: 0,
        imageDelayOut: 0
    })
    .addScene({
        image: 'https://i.imgur.com/qk5C9hO.png',
        speaker: '',
        line1: "Goooo-oood morning, Ashley!!",
        line2: "",
        censorSpeaker: false,
        dialogFadeInTime: 200,
        dialogFadeOutTime: 200,
        imageFadeInTime: 200,
        imageFadeOutTime: 0,
        dialogDelayIn: 500,
        dialogDelayOut: 0,
        imageDelayIn: 0,
        imageDelayOut: 0
    })
    .addScene({
        image: 'https://i.imgur.com/qk5C9hO.png',
        speaker: 'Ashley',
        line1: "Ugh..........",
        line2: "",
        censorSpeaker: false,
        dialogFadeInTime: 200,
        dialogFadeOutTime: 200,
        imageFadeInTime: 0,
        imageFadeOutTime: 0,
        dialogDelayIn: 0,
        dialogDelayOut: 0,
        imageDelayIn: 0,
        imageDelayOut: 0,
        bustRight: 'https://i.imgur.com/a8aI6qx.png',
        bustFade: 0
    })
    .addScene({
        image: 'https://i.imgur.com/qk5C9hO.png',
        speaker: '',
        line1: "As much as you love feeling sorry for yourself,",
        line2: "it is time for a little interlude...",
        censorSpeaker: false,
        dialogFadeInTime: 200,
        dialogFadeOutTime: 200,
        imageFadeInTime: 0,
        imageFadeOutTime: 0,
        dialogDelayIn: 500,
        dialogDelayOut: 0,
        imageDelayIn: 0,
        imageDelayOut: 0
    });
}
