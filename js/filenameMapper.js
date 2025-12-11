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

const assetTypeOrder = {
    "images": 0,
    "sounds": 1,
    "data": 2,
};

const assetCategoryOrder = {
    "Portraits": 0,
    "Game sprites": 1,
    "Backgrounds": 2,
    "Pictures": 3,
    "System sprites": 4,
    "Misc": 5,

    "Background songs": 0,
    "Background sounds": 1,
    "Event sounds": 2,
    "Sound effects": 3,
};

const numberOfPictures = 1012;
const numberOfBackgrounds = 285;
const numberOfData = 234;

const spritesSheetsVariants = {
    "spritessheet_16x16_system_12.png": {
        sizes: [
            { cols: 2, rows: 2 },
            { cols: 4, rows: 4 },
            { cols: 8, rows: 8 },
            { cols: 16, rows: 16 },
        ],
        default: 2,
    },
};

const filenamesMapped = {
    // === Map Files ===
    "f548a33ef014a2a9": "map_Actors", // "Actors"
    "6c2761ba70863900": "map_Animations", // "Animations"
    "1578c9babaee50aa": "map_Armors", // "Armors"
    "7aa4f7e2b748a9b1": "map_Classes", // "Classes"
    "93165b65a9ecda9b": "map_CommonEvents", // "CommonEvents"
    "b0cfe5f195d0d61b": "map_Enemies", // "Enemies"
    "fca9ba82c2e9907e": "map_Items", // "Items"
    "e2179bd0c2dc98da": "map_MapInfos", // "MapInfos"
    "d4882f67829cb7a8": "map_Skills", // "Skills"
    "8e0412b9817913ed": "map_States", // "States"
    "be1a37535e921f91": "map_System", // "System"
    "ac711434613b8c64": "map_Tilesets", // "Tilesets"
    "08ef2224f07a731e": "map_Troops", // "Troops"
    "5281c3e6b5a90e7f": "map_Weapons", // "Weapons"
    "26d47de73a40bdad": "map_1", // "Map001"
    "701ca312447feeff": "map_2", // "Map002"
    "eb08202b408f34a7": "map_3", // "Map003"
    "3a0ad431671e9969": "map_4", // "Map004"
    "a6508bd215624838": "map_5", // "Map005"
    "7b62476c532a63b2": "map_6", // "Map006"
    "59844f4ba628a616": "map_7", // "Map007"
    "054cb6c0fb3a4287": "map_8", // "Map008"
    "db27ad902d95af45": "map_9", // "Map009"
    "bed6b049e84e7992": "map_10", // "Map010"
    "c1d0913db015a7f9": "map_11", // "Map011"
    "06a5c2c0040a37fe": "map_12", // "Map012"
    "7061ce2052cc93e0": "map_13", // "Map013"
    "ce75f846f12ff0cc": "map_14", // "Map014"
    "41994b52078001c6": "map_15", // "Map015"
    "1e29e5b2ac8b5ab1": "map_16", // "Map016"
    "d94cd2768932c06a": "map_17", // "Map017"
    "41d31c139a8afeb9": "map_18", // "Map018"
    "4f072360c6b94567": "map_19", // "Map019"
    "3d604cacb48ef965": "map_20", // "Map020"
    "8af5d121f7003916": "map_21", // "Map021"
    "06d1650812c92d1f": "map_22", // "Map022"
    "ae760b41908472ae": "map_23", // "Map023"
    "8b7dabc172728c30": "map_24", // "Map024"
    "800344a950e65187": "map_25", // "Map025"
    "2b18d7dc081dc62b": "map_26", // "Map026"
    "225f3ab08bef402d": "map_27", // "Map027"
    "df8a857eec8680c5": "map_28", // "Map028"
    "56c6157c0cef0d71": "map_29", // "Map029"
    "43ff8d1358484703": "map_30", // "Map030"
    "eb464b634bb21262": "map_31", // "Map031"
    "2ffa3bb51859a242": "map_32", // "Map032"
    "79590c22f5c0128d": "map_33", // "Map033"
    "6655c6127544e5fd": "map_34", // "Map034"
    "326ca006a81bb4b5": "map_35", // "Map035"
    "1124eee982150e41": "map_36", // "Map036"
    "8da10d2f34eaa36d": "map_37", // "Map037"
    "2db29042af447095": "map_38", // "Map038"
    "de33dea8dbf590d7": "map_39", // "Map039"
    "ee83399e9c8467e1": "map_40", // "Map040"
    "d4b687332dfd6546": "map_41", // "Map041"
    "154629d325c17b8d": "map_42", // "Map042"
    "0fa2aa7bcdba1978": "map_43", // "Map043"
    "dbaf035d6a7daa70": "map_44", // "Map044"
    "f7abc2ea09dd1dc1": "map_45", // "Map045"
    "5e3ee90558cf8b9c": "map_46", // "Map046"
    "f4700abf0cc09876": "map_47", // "Map047"
    "d88e5ac3a06a9e41": "map_48", // "Map048"
    "95d5dc1e16e7599a": "map_49", // "Map049"
    "8f7e0f347ee2d96c": "map_50", // "Map050"
    "30e8cd7cb027b77c": "map_51", // "Map051"
    "8ef62552742bfaeb": "map_52", // "Map052"
    "fc234c9e5ea398a7": "map_53", // "Map053"
    "880702f4bef60e2b": "map_54", // "Map054"
    "57f3411f6dfb1cc0": "map_55", // "Map055"
    "2478e47ea38d116d": "map_56", // "Map056"
    "93193f433c078e67": "map_57", // "Map057"
    "a6df8a4fc070572c": "map_58", // "Map058"
    "2d63e9a6b22d5754": "map_59", // "Map059"
    "d775a2847901ae30": "map_60", // "Map060"
    "41157d8209e24b13": "map_61",
    "cb6b79b53dcf9cce": "map_62", // "Map062"
    "5e3c54603e0a02fe": "map_76", // "Map076"
    "02edb9e9dbed9ed1": "map_78",
    "9c0da7f6ee1baba0": "map_79",
    "eeac9206c6ef8544": "map_80",
    "c012ed0db9e740e4": "map_81",
    "98e0aaf1267b51b5": "map_82",
    "65ae51f77f180001": "map_83",
    "9230edb275fedc56": "map_86",
    "552de4b3c2a6e722": "map_90", // "Map090"
    "b1a34d2ccc9ccf36": "map_91", // "Map091"
    "b7ab29068ab79381": "map_92", // "Map092"
    "5cd593dc35c7271e": "map_93", // "Map093"
    "b0ba735a85dd34b1": "map_94", // "Map094"
    "3920efa60e948c36": "map_95", // "Map095"
    "5b05a158b9e6b13e": "map_96", // "Map096"
    "ff41c61f0e584afb": "map_98",
    "536c41c6b1cbcb4b": "map_99",
    "2eea0cd657ee09db": "map_100",
    "d1b3c829c523e20c": "map_101",
    "09d5de6bc7c29508": "map_102",
    "939225260c04d3dc": "map_103",
    "fb711a2e828e683d": "map_104",
    "d3251e089176aa21": "map_105",
    "2bac73a56ff7d020": "map_106",
    "4aa48799359b8079": "map_108",
    "45d98573e3c57308": "map_109",
    "5aeaf820111dc18c": "map_110",
    "5f31206517ed14d0": "map_111",
    "6dff3167d92aa584": "map_112",
    "da8da5b9c97de240": "map_113",
    "572beaa6867766dd": "map_114",
    "8f5ec0988f02d975": "map_115",
    "3473568ba9dae8b5": "map_116",
    "ae48e05b4e79bf56": "map_117",
    "cf4dec666df6ae5b": "map_118",
    "f8444f09c7e01c6e": "map_120",
    "21641b615775303b": "map_121",
    "e166acc928b4d969": "map_122",
    "8130fc508e83a715": "map_123",
    "1b2f3042111d109c": "map_125",
    "9dfa772b276dc184": "map_128",
    "b471003ffdcf7950": "map_129",
    "1620515bccc66c95": "map_130",
    "9bcf3a89d1a2423b": "map_131",
    "f760ae3058a29adb": "map_138",
    "e96cd4ebbe1256ae": "map_142",
    "3c760a523df2793a": "map_143",
    "3650431aaab1d232": "map_144",
    "311108257038b81b": "map_145",
    "b45eb7eaf1229405": "map_146",
    "9e1dc561d06953fc": "map_147",
    "0b9acdb076dcd45d": "map_148",
    "d744a18452d3dfbd": "map_152",
    "a2b977b4d98205d1": "map_158",
    "283249c270778ae1": "map_159",
    "e3e707a94164a91e": "map_160",
    "48abc987622778cd": "map_161",
    "140f035936ca2cc0": "map_162",
    "371689aec2b32427": "map_163",
    "360554f3641df924": "map_164",
    "ff7eac5471eb740f": "map_165",
    "63cf102e58e9dfc8": "map_166",
    "9734693e5e20ccf8": "map_167",
    "4f6cff2377563d16": "map_168",
    "16a91350fa571fc6": "map_169",
    "4723de0f3a64f88e": "map_170",
    "f00c1fb9a0e4cd37": "map_171",
    "9462653e1b8ae4dc": "map_172",
    "d2c49021f405dedd": "map_173",
    "08928aa93a9e6f6d": "map_174",
    "00d652e9341d5d14": "map_176",
    "d4a47b2f99e704f3": "map_177",
    "4cf94c80f6323e7f": "map_179",
    "fb09f02229efe21d": "map_180",
    "102f4f880c43a659": "map_181",
    "35fa0bfbd305bf00": "map_182",
    "6417dd61583e3596": "map_183",
    "8c580a506bc1bbc2": "map_184",
    "ce2cfc01680c5e40": "map_185",
    "4b91f011ed4c052a": "map_187",
    "fbb46286d5677e9c": "map_188",
    "01a229379d11ae7a": "map_189",
    "807d903a8fa3d3bb": "map_190",
    "eb50be30675a1338": "map_191",
    "6f1debed4cd6c977": "map_192",
    "ffb410dd7b475318": "map_193",
    "bf056204745a9799": "map_196",
    "dbf06bdc1d8b5c1d": "map_197",
    "c6da2fac2d31c99d": "map_198",
    "7bbce7caa03e0c50": "map_199",
    "1d05bd2a5f417902": "map_201",
    "2ed0077f6bb521af": "map_202",
    "48352a31db06b515": "map_203",
    "8950949860d6ac78": "map_204",
    "7b6e18c1910d7c36": "map_206",
    "0cd902c879bb1992": "map_207",
    "f462830b0e8ed3d1": "map_208",
    "36369c6e3f5c70b4": "map_209",
    "92c48575c0f90412": "map_211",
    "d309b9adda500c07": "map_213",
    "b5e77bd370058447": "map_214",
    "62ad6dae864492b9": "map_215",
    "553a9328ca7ad696": "map_216",
    "ce51667cc62e4ba9": "map_218",
    "b9a425898788be50": "map_220",
    "a56bdd7bdd1d47a7": "map_221",
    "d8da2e80548655a7": "map_222",
    "7960f4f28a7e3afa": "map_223",
    "ce78a15537198f93": "map_224",
    "e60e2ae5e1f0142b": "map_225",
    "253d9b554530e34e": "map_226",
    "45791b4524a60de2": "map_227",
    "8851a9e8f2cca99c": "map_228",
    "4824cdd8133e0ba1": "map_229",
    "9212d331901e61a2": "map_230",
    "df026a179c978862": "map_231",
    "a762f08edadf182c": "map_232",
    "c2d15a736f0362cc": "map_233",
    "59a51009213c4d14": "map_234",
    "560085437919b3ae": "map_235",
    "0d5c29db0acf1dfb": "map_236",
    "f16b0b8ac870030f": "map_237",
    "daefa4f82e8c29a8": "map_238",
    "ef67e4e229519e25": "map_239",
    "93c43d4cbf4336ac": "map_241",
    "10f24ea2f4194e69": "map_242",
    "af6084c63a35ed62": "map_243",
    "be4ea0427c554cd9": "map_unknown_1",
    "0f0ddf1441b3f3f9": "map_unknown_2",
    "f49c0ae25167ed55": "map_unknown_3",
    "19f6ccb456f42e7f": "map_unknown_4",
    "380ac8da56af340d": "map_unknown_5",
    "39538e98b604697a": "map_unknown_6",
    "3d2050b7f6a05304": "map_unknown_7",
    "3e09b2d7ff4d577b": "map_unknown_8",
    "cf331dd3d89de0ce": "map_unknown_9",
    "45475481eebe059c": "map_unknown_10",
    "13195526e1e78f1c": "map_unknown_11",
    "03d23b256c30ee7f": "map_unknown_12",
    "6faf1c02e530f786": "map_unknown_13",
    "76ef1d27e887074e": "map_unknown_14",
    "3d71012efc9032a3": "map_unknown_15",
    "9185501964bb45be": "map_unknown_16",
    "9581eaef313284c0": "map_unknown_17",
    "9fce3adda53a3a0b": "map_unknown_18",
    "ab430e27123ff9c7": "map_unknown_19",
    "adb9d777182b38c4": "map_unknown_20",
    "af6d71c8d47db1cf": "map_unknown_21",
    "b5ea7150036f2049": "map_unknown_22",
    "c30a6f45f3118b03": "map_unknown_23",
    "cd64a52988a871c9": "map_unknown_24",
    "d008bb79be0f5d70": "map_unknown_25",
    "e3453d1d6d4231bd": "map_unknown_26",
    "e4f88b8e366fd60d": "map_unknown_27",
    "eab176917ac6057a": "map_unknown_28",
    "f3a481a4b3309457": "map_unknown_29",
    "f4fce3b5b60b3c5b": "map_unknown_30",
    "f7049de2b41b8c72": "map_unknown_31",

    // === Spritesheets ===
    "29de30eb871e6a80": "spritessheet_12x8_characters_1",
    "!5f2c6f7eccc9ce7c": "spritessheet_12x8_characters_2",
    "e6edcaf432253196": "spritessheet_12x8_characters_3",
    "!11544aa3c9d9c1d0": "spritessheet_12x8_characters_4", // "!Other2"
    "!b0d3c1937367e615": "spritessheet_12x8_characters_5", // "Actor6"
    "9f4926bf71ea081e": "spritessheet_12x8_characters_6",
    "!8dd72fe14c4dfc98": "spritessheet_12x8_characters_7", // "!Other3"
    "7d7d5b7fb68621e6": "spritessheet_12x8_characters_8", // "Actor1"
    "05a60f9a9844fd78": "spritessheet_12x8_characters_9", // "Actor2"
    "!2f9b8afe4feed70f": "spritessheet_12x8_characters_10", // "!Other1"
    "24b75a8f0c4d2590": "spritessheet_12x8_characters_11", // "Actor3"
    "947be83cc3cd63db": "spritessheet_12x8_characters_12",
    "!33ff3cdc5d1becfe": "spritessheet_12x8_characters_13",
    "9a0d0a3b36aaea9f": "spritessheet_12x8_characters_14",
    "!bb8d49d8f3d6ea56": "spritessheet_12x8_characters_15", // "!Other4"
    "6125287f520bf9d4": "spritessheet_12x8_characters_16",
    "2a6a9ef435715ef2": "spritessheet_12x8_characters_17", // "Actor4"
    "70aea8d2df30f33a": "spritessheet_12x8_characters_18", // "Actor5"
    "42f813e66a22d1ca": "spritessheet_1x1_system_1", // "stamp"
    "7264681f0ab11b47": "spritessheet_1x5_system_2", // "VNButtons"
    "3be2dd83cc8de939": "spritessheet_8x10_system_3", // "States"
    "7c493e2658ac87cb": "spritessheet_1x1_system_4", // "options"
    "3ef8c87532694e08": "spritessheet_1x1_system_5",
    "e5230bf37c4fabb0": "spritessheet_1x1_system_6", // "Shadow1"
    "7d6f1e67e074a178": "spritessheet_1x1_system_7", // "Weapons1"
    "ddd8237f2d4b4360": "spritessheet_1x1_system_8", // "Weapons2"
    "1311d51e1765316b": "spritessheet_1x1_system_9", // "Shadow2"
    "ddf9cdd7da11cc2a": "spritessheet_1x1_system_10", // "GameOver"
    "8b8bdf10b5c3bc7b": "spritessheet_1x1_system_11", // "continue"
    "ffacabd73f8529e9": "spritessheet_16x16_system_12", // "Window"
    "547ae1cf2d9eecf9": "spritessheet_1x1_system_13", // "vision"
    "766d372c84f1dac0": "spritessheet_1x1_system_14", // "IconSet"
    "73b473e346224cb1": "spritessheet_1x1_system_15", // "new_game"
    "b35a172f174d8653": "spritessheet_1x1_system_16", // "Damage"
    "5c380e0964eed8e4": "spritessheet_1x1_system_17", // "credits"
    "eed4022786be328d": "spritessheet_1x1_system_18", // "Loading"
    "ad1c62514586e83b": "spritessheet_1x1_system_19", // "ButtonSet"
    "f633ab2ca861decf": "spritessheet_1x1_system_20", // "language"
    "65a05ab7b4f18191": "spritessheet_1x1_system_21", // "msgimg_0"
    "f9248bf25001c910": "spritessheet_1x1_system_22", // "quit"
    "30f14a2c7734a492": "spritessheet_1x1_system_23", // "Weapons3"
    "f8410e597b074776": "spritessheet_8x15_system_24", // "Balloon"

    // Tilesets
    "c2ccf2930ff9deb6": "spritessheet_8x16_tilesets_1", // "Outside_A5"

    // === Backgrounds ===
    "36c5323d0aa0b9dc": "backgrounds_1",
    "fa140e6fbaeef759": "backgrounds_2",
    "93fa9d26cc777f57": "backgrounds_3", // "ground2"
    "c440ee2023de1a4b": "backgrounds_4", // "par2"
    "d90f1f28b74c386f": "backgrounds_5", // "ground3"
    "49e70c913c970d96": "backgrounds_6", // "par3"
    "26472d7da1885ca9": "backgrounds_7", // "ground4"
    "413628f4e3942051": "backgrounds_8", // "par4"
    "d67196f29a0669bd": "backgrounds_9", // "ground5"
    "2abe22319ff01828": "backgrounds_10", // "par5"
    "0e4b049e654adcc2": "backgrounds_11", // "ground6"
    "54ab0a7e383cea05": "backgrounds_12", // "par6"
    "2854878e364d1f09": "backgrounds_13", // "ground7"
    "aeb6d60963478d0a": "backgrounds_14", // "par7"
    "0225d01841bb7841": "backgrounds_15", // "ground8"
    "811d95f699513f4f": "backgrounds_16", // "ground9"
    "3dbff278a2d24946": "backgrounds_17", // "par9"
    "b7f9762041dd2936": "backgrounds_18", // "ground10"
    "dbfc03bb8fe2d037": "backgrounds_19", // "par10"
    "f5307397750f3fe3": "backgrounds_20", // "ground11"
    "95990de3d07ecd53": "backgrounds_21", // "ground12"
    "8ef09c19f418ebe5": "backgrounds_22", // "par12"
    "bc71f43265e7a5aa": "backgrounds_23", // "ground13"
    "b3f0d0032a0bffb5": "backgrounds_24", // "ground14"
    "ed123b6f426b1130": "backgrounds_25", // "par14"
    "ae136b1a8a9c9260": "backgrounds_26", // "ground16"
    "0bd3fbd677797b85": "backgrounds_27", // "ground17"
    "cc53aff867fd494f": "backgrounds_28", // "par17"
    "bc910863ee07354d": "backgrounds_29", // "ground18"
    "9f843ec3377ef4fe": "backgrounds_30", // "par18"
    "8029b50924d441ef": "backgrounds_31", // "ground20"
    "b4d9ac928a79976a": "backgrounds_32", // "par20"
    "adc76bb1dcc11242": "backgrounds_33", // "ground21"
    "91b56e3551048c4f": "backgrounds_34", // "par21"
    "2d3e3aa9cbbed9c8": "backgrounds_35", // "ground22"
    "4fafe495faf336ed": "backgrounds_36", // "par22"
    "37122af8464c5512": "backgrounds_37", // "ground23"
    "190707c8a49c722a": "backgrounds_38", // "par23"
    "9e2dbcda46a5f8fc": "backgrounds_39", // "ground24"
    "9491e0d95e977927": "backgrounds_40", // "par24"
    "6eedeb504021a2d1": "backgrounds_41", // "ground25"
    "c5b806daa3f564a8": "backgrounds_42", // "par25"
    "c668c604c02be334": "backgrounds_43", // "ground26"
    "fa6635920597366d": "backgrounds_44", // "par26"
    "dfae681c4fe65989": "backgrounds_45", // "ground27"
    "8a0ace8df26f2256": "backgrounds_46", // "par27"
    "362ac9a3f52e16a8": "backgrounds_47", // "ground28"
    "a7a3654c9dfb83c3": "backgrounds_48", // "par28"
    "726f94691abe27e9": "backgrounds_49", // "par29"
    "890955f2702c45ef": "backgrounds_50", // "ground30"
    "bb6e19818331f35e": "backgrounds_51", // "par30"
    "7ee9fe2deda50e53": "backgrounds_52", // "par31"
    "5121fa18a6e6f0dc": "backgrounds_53", // "ground31"
    "fc4d6d81f5279c93": "backgrounds_54", // "ground32"
    "7cbcb9658a2c0d28": "backgrounds_55", // "par32"
    "bab183cf848588f3": "backgrounds_56", // "ground34"
    "6bfa4133bda1b1bd": "backgrounds_57", // "par34"
    "a724c3e11ff25763": "backgrounds_58", // "ground35"
    "86e51c32161f6113": "backgrounds_59", // "par35"
    "d7feed662c51e8d6": "backgrounds_60", // "ground36"
    "5056c20aa8498b3a": "backgrounds_61", // "par36"
    "1364c8180f2abfc0": "backgrounds_62", // "ground37"
    "4b3414a0204ac8eb": "backgrounds_63", // "par37"
    "f90c129f8d53f9fa": "backgrounds_64", // "ground38"
    "71e2e9224a09686f": "backgrounds_65", // "par38"
    "f446a74f27f43a54": "backgrounds_66", // "ground40"
    "59e5a3114ae4c713": "backgrounds_67", // "par40"
    "33d923ca78d31f02": "backgrounds_68", // "ground41"
    "11681dfd0616dca2": "backgrounds_69", // "par41"
    "7bad12b38a73b159": "backgrounds_70", // "ground42"
    "338675ee091d4ce5": "backgrounds_71",
    "2883caea3cce4cff": "backgrounds_72", // "ground43"
    "ccf6b73a23cf0953": "backgrounds_73", // "par43"
    "6daf84df79633012": "backgrounds_74", // "ground44"
    "bff36a0229498115": "backgrounds_75", // "par44"
    "aeb8fcbe2a41b0ee": "backgrounds_76", // "ground45"
    "5c0d625a675d5733": "backgrounds_77", // "par45"
    "8dbf3779d2da2a62": "backgrounds_78", // "ground46"
    "5134ba2a50b03994": "backgrounds_79", // "par46"
    "48752fa5021e572f": "backgrounds_80", // "ground47"
    "358fc333d6362f33": "backgrounds_81", // "ground48"
    "c93a6918b13dc0c1": "backgrounds_82", // "par48"
    "e98748428f1a9c85": "backgrounds_83", // "ground49"
    "cd4c4cc7fbc322ce": "backgrounds_84", // "par49"
    "b08a9bfca03b1ff0": "backgrounds_85", // "ground50"
    "18d16b86bfdd4b18": "backgrounds_86", // "par50"
    "8789b3405ae6ae11": "backgrounds_87", // "ground51"
    "a94737f875af0538": "backgrounds_88", // "par51"
    "8d3661dac79d6ed7": "backgrounds_89", // "ground52"
    "4d10dccfcf439cd1": "backgrounds_90", // "ground53"
    "1d7f4ede43732811": "backgrounds_91", // "ground54"
    "5ef8767edb6d8466": "backgrounds_92", // "par54"
    "969b3e7feaf36b8c": "backgrounds_93", // "ground55"
    "0f42142d358a32f8": "backgrounds_94", // "ground56"
    "26da93a9ad64caf4": "backgrounds_95", // "ground57"
    "c181f10fd6b40cf6": "backgrounds_96", // "ground59"
    "1ce8dddbe56c4d59": "backgrounds_97", // "ground60"
    "3571164f571c1fc6": "backgrounds_98", // "par60"
    "79bab0e3a6a98534": "backgrounds_99",
    "617f4dfad5731b91": "backgrounds_100", // "ground76"
    "d0b31d28bd66c1c4": "backgrounds_101", // "par76"
    "006a5be97e4ed515": "backgrounds_102",
    "a3582b52ef1d7e84": "backgrounds_103",
    "1e281264e3aee1f5": "backgrounds_104",
    "c2727f98f8f2364f": "backgrounds_105",
    "b55580848d87d99c": "backgrounds_106",
    "36bfbf9fff000aa4": "backgrounds_107",
    "cafacd60dd2cb935": "backgrounds_108",
    "2aee845dfa17fbc3": "backgrounds_109", // "ground90"
    "c4ea6d2b8a93873c": "backgrounds_110", // "par90"
    "ae5e1216c30b4a87": "backgrounds_111", // "ground91"
    "d4d61951a86f8070": "backgrounds_112", // "par91"
    "a7af2c55323736bd": "backgrounds_113", // "ground92"
    "51437577c0e1aec6": "backgrounds_114", // "par92"
    "f2debc90d12c41a4": "backgrounds_115", // "ground93"
    "a11a12b1ee2fc8dd": "backgrounds_116", // "par93"
    "3393beb5d1744cce": "backgrounds_117", // "ground94"
    "8eb36e01b9918f9f": "backgrounds_118", // "par94"
    "6ebfb2746b1a7bd6": "backgrounds_119", // "ground75"
    "7202e55ea855e68a": "backgrounds_120",
    "0b0940296f3b9135": "backgrounds_121",
    "d7e85591b98624a1": "backgrounds_122",
    "260e11252cd34d3f": "backgrounds_123",
    "b8fabfd1d26a9d63": "backgrounds_124",
    "ba4a22fb83bebd47": "backgrounds_125",
    "54ee0d6c342e5564": "backgrounds_126",
    "79d126ef01118c87": "backgrounds_127",
    "50ce174b2bbc2ed4": "backgrounds_128",
    "ca8a8b2a650d0059": "backgrounds_129",
    "42052f3bb8350934": "backgrounds_130",
    "e47ca7c41969c5a4": "backgrounds_131",
    "1fef8b663d00f1c8": "backgrounds_132",
    "739bb229c39e94a2": "backgrounds_133",
    "ea9056a2b38c115b": "backgrounds_134",
    "320b058fedd340be": "backgrounds_135",
    "ab152aa7e1e51a4a": "backgrounds_136",
    "0ccf59cba1df6eb8": "backgrounds_137",
    "fa712de7f3037c46": "backgrounds_138",
    "2eb2982b1dd88053": "backgrounds_139",
    "69fc8879659bccd6": "backgrounds_140",
    "ebe61742ae2f38f6": "backgrounds_141", // "ground29"
    "1199908f3eba2b25": "backgrounds_142",
    "0b696c41aa528e2a": "backgrounds_143",
    "8e6cd70b3a3932df": "backgrounds_144",
    "c3d7e63131b9c15c": "backgrounds_145",
    "308ad376ffba93e5": "backgrounds_146",
    "7b6a5330f8308e99": "backgrounds_147",
    "d115ec99407116e5": "backgrounds_148",
    "0f3d8f4637654d43": "backgrounds_149",
    "f1b952fb4560b6bd": "backgrounds_150",
    "810473e2647c153e": "backgrounds_151",
    "0e218f68f9b358a7": "backgrounds_152",
    "d3cb4274cbc2c455": "backgrounds_153",
    "c1121c031da41d85": "backgrounds_154",
    "e73b5d43d59a9136": "backgrounds_155",
    "e29859045b78e967": "backgrounds_156",
    "a1bda2fd170da2ba": "backgrounds_157",
    "c8875deae54a74f5": "backgrounds_158",
    "f5149599fc6ece93": "backgrounds_159",
    "626c9b3507cb8fab": "backgrounds_160",
    "6fc4bb3950b70655": "backgrounds_161",
    "d9ab99c4a0b445b7": "backgrounds_162",
    "4f029b0d7ee2379a": "backgrounds_163",
    "cd5f2f5768eb2435": "backgrounds_164",
    "655bc4157342a0ce": "backgrounds_165",
    "e5e3b404390006d9": "backgrounds_166",
    "c5deca78cf17339c": "backgrounds_167",
    "e65ec4ebc7bad1ea": "backgrounds_168",
    "f4dd08e6a2e78dbe": "backgrounds_169",
    "a222b5a195733a94": "backgrounds_170",
    "6bec5bb804fa9dfc": "backgrounds_171",
    "8f86b7cffc6ec5df": "backgrounds_172",
    "03d549e87c01e9a4": "backgrounds_173",
    "36bfca681eb0d0ac": "backgrounds_174",
    "8758ec4a092f8044": "backgrounds_175",
    "fe83db6c451f58b0": "backgrounds_176",
    "2fdc3a470662d72d": "backgrounds_177",
    "5e2b0186dcbfd67c": "backgrounds_178",
    "82d6d25cb956c511": "backgrounds_179",
    "383052cd6b038559": "backgrounds_180",
    "3f6f0d59ee1a8b3e": "backgrounds_181",
    "6fe0911a0d7f528d": "backgrounds_182",
    "8bce6ad7a4ac23cc": "backgrounds_183",
    "682e25b9fbc0f4a1": "backgrounds_184",
    "3e4e94b5315c82be": "backgrounds_185",
    "70fe48b49e67e68f": "backgrounds_186",
    "6bc0b4c5cf6603b4": "backgrounds_187",
    "a9115fdadc7996c1": "backgrounds_188",
    "b39e2a0517eaceee": "backgrounds_189",
    "9d592293ab36629b": "backgrounds_190",
    "97d6e9b8c6321b00": "backgrounds_191",
    "2ff7976013f3ae1b": "backgrounds_192",
    "90fd0441b7d3c497": "backgrounds_193",
    "76d5e859329ecbe6": "backgrounds_194",
    "5a3f169dc8b8a6df": "backgrounds_195",
    "171e043c9f92c13a": "backgrounds_196",
    "f227e72193002cf4": "backgrounds_197",
    "aa543bdaa2330363": "backgrounds_198",
    "9ff37cd3e5ce2be6": "backgrounds_199",
    "0051a569ab5bd317": "backgrounds_200",
    "4caa4e44088bacde": "backgrounds_201",
    "67dddb7d3c6202c9": "backgrounds_202",
    "6a28131f4493f933": "backgrounds_203",
    "9d533a68622afa8b": "backgrounds_204",
    "09c114e14f08f575": "backgrounds_205",
    "8e32fad85fa851a6": "backgrounds_206",
    "713893ef2686180a": "backgrounds_207",
    "af3027057016d272": "backgrounds_208",
    "223210e6d401be4f": "backgrounds_209",
    "76038dc9c12d4f78": "backgrounds_210",
    "f30bf63ab5644085": "backgrounds_211",
    "406ef2107cfe299c": "backgrounds_212",
    "069be965fd848514": "backgrounds_213",
    "a3d8ec8501b04343": "backgrounds_214",
    "b8738dfb8dbf6bb0": "backgrounds_215",
    "071fb4a710801c3f": "backgrounds_216",
    "ee9bb61fd8d1e643": "backgrounds_217",
    "2af5460a2b776455": "backgrounds_218",
    "2ee77811e908eabe": "backgrounds_219",
    "efabb641e706863c": "backgrounds_220",
    "8532577607490a0c": "backgrounds_221",
    "1005053800c2a284": "backgrounds_222",
    "8f22297b9a51765f": "backgrounds_223",
    "896af43370f0bd03": "backgrounds_224",
    "b1f35ba7e6f7f4b4": "backgrounds_225",
    "a7a50203746ae089": "backgrounds_226",
    "7d2d5f8df2c5d844": "backgrounds_227",
    "af56db281ac729ef": "backgrounds_228",
    "2c0f23752a897173": "backgrounds_229",
    "091caaaacf91e063": "backgrounds_230",
    "53f8d1a2178062c8": "backgrounds_231",
    "a2c57cecd311bedf": "backgrounds_232",
    "379c8c4165f303b4": "backgrounds_233",
    "c16317481e7fce0b": "backgrounds_234",
    "e006353a2c5b6cd2": "backgrounds_235",
    "c093a80522562225": "backgrounds_236",
    "893423431f8509d8": "backgrounds_237",
    "5f083a776fe71b53": "backgrounds_238",
    "ae6d2e0d936e03e1": "backgrounds_239",
    "abc6dd029559e792": "backgrounds_240",
    "decf2c12154ca6b2": "backgrounds_241",
    "cc5a1fb715b3bb8e": "backgrounds_242",
    "68c29afa7188c785": "backgrounds_243",
    "79cf24da24a8c650": "backgrounds_244",
    "16956918bbcaa9e7": "backgrounds_245",
    "2d71c350341b1d5f": "backgrounds_246",
    "87ca729d5edba77d": "backgrounds_247",
    "7d0477310dd02b02": "backgrounds_248",
    "4443ba6b23d36ec4": "backgrounds_249",
    "c889aba5306b5089": "backgrounds_250",
    "4c70b8c564d5bc11": "backgrounds_251",
    "b4c16f2ea6154725": "backgrounds_252",
    "46f0e17b2db0e899": "backgrounds_253",
    "cf2f03cf64ff5d98": "backgrounds_254",
    "aee2fe6fc55f77f1": "backgrounds_255",
    "b0c6d696d128adae": "backgrounds_256",
    "1bb853b19ad7b979": "backgrounds_257",
    "2ccaccbf53b2d7e2": "backgrounds_258",
    "e9ce83e2497de6cb": "backgrounds_259",
    "617b9121a5d14b2a": "backgrounds_260",
    "c1b8870ccd64666d": "backgrounds_261",
    "0f2212ccc654bcab": "backgrounds_262",
    "7575e813d7d66e71": "backgrounds_263",
    "0eca00ab78a1e130": "backgrounds_264",
    "fef1b27295eacaa1": "backgrounds_265",
    "4137a64d0451e0b2": "backgrounds_266",
    "dd0bde1055da5617": "backgrounds_267",
    "a0c9977ef2c28eff": "backgrounds_268",
    "59ca1cf8655a5d56": "backgrounds_269",
    "c5b7d256a35982cc": "backgrounds_270",
    "858e9ac1b37d82d8": "backgrounds_271",
    "b75639b5d75cb04c": "backgrounds_272",
    "869c4d8b9d14f6ca": "backgrounds_273",
    "2fe1b255351c9c01": "backgrounds_274",
    "fa9dd53687fb2efe": "backgrounds_275",
    "ef1fabe774be7c1a": "backgrounds_276",
    "22c1688f9e861974": "backgrounds_277",
    "763cee1dc47caa16": "backgrounds_278",
    "a645cadd9adc256c": "backgrounds_279",
    "db739969eedd1b2d": "backgrounds_280",
    "a9e75d0a1dc4ba49": "backgrounds_281",
    "4b7409f127289cba": "backgrounds_282",
    "7a32a391ce2341b2": "backgrounds_283",
    "aa2fb16665bb3067": "backgrounds_284",
    "ba8d17b339457b2f": "backgrounds_285", // "par42"

    // === Pictures ===
    "a79c3d2b67d5ab92": "pictures_1",
    "c94e61c5989187d2": "pictures_2",
    "3e22ff37cb58267d": "pictures_3", // "ground60_block"
    "3dbb9ec091468a0e": "pictures_4", // "duodinner"
    "5f4619f86d783300": "pictures_5", // "feed_1a"
    "b20d9b012d6476fd": "pictures_6", // "feed_1b"
    "bcd62b27274b7781": "pictures_7", // "feed_1c"
    "cf50c33324a2a03d": "pictures_8", // "feed_2a"
    "5c19b921a91bba36": "pictures_9", // "feed_2b"
    "a1259d7436b18c16": "pictures_10", // "feed_2c"
    "c9631215c7130c38": "pictures_11", // "floor_1a"
    "dad4070c721a72fc": "pictures_12", // "duofloor"
    "77d90f6e47ceaa8a": "pictures_13", // "floor_1b"
    "c80536efceec240c": "pictures_14", // "brocouch"
    "43f98b69ec10a48e": "pictures_15", // "duocouch"
    "d7e2183a3761aabe": "pictures_16", // "phone_a"
    "d2e03c302d89b51c": "pictures_17", // "phone_b"
    "6570aa3fc508a649": "pictures_18", // "drawing"
    "f5e4f25d43a370f9": "pictures_19", // "sisbed"
    "e1996c6201cf6a4c": "pictures_20", // "bed_1a"
    "d3ec21c0d3353ef3": "pictures_21", // "bed_1b"
    "2d6dc65205e1af37": "pictures_22", // "bed_1c"
    "3fe4c8cb1d18940b": "pictures_23", // "bed_1d"
    "5e9dd15a50e36b58": "pictures_24", // "duobed"
    "89a90848c81c27cd": "pictures_25", // "bed_aaandrew"
    "bec8e9c5746b522c": "pictures_26", // "bed_andrew"
    "609d141307c3c529": "pictures_27", // "bed_andy"
    "aa5c0e61b18349f0": "pictures_28", // "bed_bite"
    "bacd1f23643b67c3": "pictures_29", // "peek_1b"
    "4940f65d5d9641b7": "pictures_30", // "door_0"
    "0b496c2df72e9815": "pictures_31", // "door_1a"
    "898dfb89649ee746": "pictures_32", // "door_1b"
    "9a7eeda47205e438": "pictures_33", // "door_2a"
    "fb81ef6b2fdc7cfb": "pictures_34", // "door_2b"
    "6f760c3732d0fd82": "pictures_35", // "door_3a"
    "92513b85266edfd9": "pictures_36", // "door_3b"
    "fc1cb4d2ab450a11": "pictures_37", // "door_4a"
    "be0d7a30b60745e4": "pictures_38", // "door_4b"
    "168a70d2e89c2cd6": "pictures_39", // "kill_1a"
    "9cc1a75ad904db7b": "pictures_40", // "kill_1b"
    "e30f95b9c0b6a345": "pictures_41", // "kill_2a"
    "5d092c9d114cb0d8": "pictures_42", // "kill_2b"
    "71d2c44fd082c455": "pictures_43", // "kill_2c"
    "becdbae122fbb902": "pictures_44", // "kill_2d"
    "a392d6ec1277ca48": "pictures_45", // "kill_3a"
    "e39d90e3f45836d9": "pictures_46", // "kill_3b"
    "660f9bc4fb0fcdcb": "pictures_47", // "kill_3c"
    "f9294fbbb3ee4e16": "pictures_48", // "kill_4a"
    "604de9b977953588": "pictures_49", // "kill_4b"
    "8c5ce6501c63bbce": "pictures_50", // "torso_1a"
    "25563c1aec5bf3c1": "pictures_51", // "torso_1b"
    "4f555b9b83aa50ca": "pictures_52",
    "b62309a8e40fa7af": "pictures_53",
    "202c076ba68af1c6": "pictures_54", // "peek_1a"
    "fc16e2640958c57d": "pictures_55", // "knife"
    "fd7e0705f1472312": "pictures_56", // "taunt_a"
    "094767301ae65b85": "pictures_57", // "taunt_b"
    "848fde43c5c801cf": "pictures_58", // "grab_a"
    "27c855f75915e828": "pictures_59", // "grab_b"
    "1f5987a6eb24d509": "pictures_60", // "grab_c"
    "10a154d88e785213": "pictures_61", // "ca_talk"
    "8eaaf648a60e7cb3": "pictures_62", // "cl_mock"
    "a06209a1b3f3c37b": "pictures_63", // "ca_listen"
    "33b337eac7e28435": "pictures_64", // "cl_lol"
    "cd861c4984a264e7": "pictures_65", // "cl_grin"
    "6ab1334d180d7834": "pictures_66", // "cl_plead"
    "3af7d9eb29740ffe": "pictures_67", // "ca_ask"
    "fde793fdaab54476": "pictures_68", // "cl_mad"
    "17887cedb241b690": "pictures_69", // "ca_angry"
    "4a9eed4896ae3c23": "pictures_70", // "cl_yeah"
    "50329e80c420326d": "pictures_71", // "cl_meh"
    "2d769dd2277e8644": "pictures_72", // "ca_tired"
    "8ae9d4857713d91f": "pictures_73", // "letgo"
    "10f8f2491b0a555d": "pictures_74", // "latch_a"
    "9b9da01832c368c2": "pictures_75", // "latch_b"
    "6459a3eeb2f69688": "pictures_76", // "hug"
    "149c84690b3ca46d": "pictures_77", // "cameraview"
    "5972d18a4e7f34a8": "pictures_78", // "keys"
    "4bb0151c008236ca": "pictures_79", // "ch1"
    "e8986f2887e9f3ef": "pictures_80", // "op_a"
    "458431a83e2a9eb0": "pictures_81", // "op_b"
    "c9459be26cfecbf1": "pictures_82", // "wake_1a"
    "a7e512f0c019b996": "pictures_83", // "wake_1b"
    "069c58d691c54d4e": "pictures_84", // "memory_1a"
    "a9edeabc3078c25b": "pictures_85", // "memory_1b"
    "8711024bbb8eda54": "pictures_86", // "end_a"
    "19ad20c2e5175806": "pictures_87", // "end_b"
    "22157a03c95858af": "pictures_88", // "end_c"
    "9f2ccafdb1439a07": "pictures_89", // "end_d"
    "6082fc02be98102f": "pictures_90", // "end_e"
    "47b90b8577d12e80": "pictures_91", // "endcard"
    "3abe3cbb8a49bd40": "pictures_92", // "cry_a"
    "8d33b2baeec39474": "pictures_93", // "cry_b"
    "270dbe39a4977182": "pictures_94", // "crate_a"
    "8b58f0ddab904ce7": "pictures_95", // "crate_b"
    "1cbdd1313aa8bbd1": "pictures_96", // "crate_c"
    "6bd923293f4c3846": "pictures_97", // "crate2_a"
    "00090f8ebda9a535": "pictures_98", // "crate2_b"
    "aabe56b92d30d2d2": "pictures_99", // "crate2_c"
    "615c9ecc24a767a3": "pictures_100", // "crate_slam"
    "72d79d3064e37967": "pictures_101", // "fb_shock"
    "fc33d345746320c3": "pictures_102", // "fb_shock_b"
    "74bcb642e0e0903a": "pictures_103", // "fb_curlup_a"
    "6849bfd72e35fc3b": "pictures_104", // "fb_curlup_b"
    "8d4ddf01ad3baf83": "pictures_105", // "fb_curlup_c"
    "e3e2fe2d355ecdae": "pictures_106", // "fb_shake"
    "af2acd55795b1af2": "pictures_107", // "hide_a"
    "ba5d6a899cb84b5f": "pictures_108", // "hide_b"
    "66cd890a68dba484": "pictures_109", // "hide_c"
    "75a631468794f9c1": "pictures_110", // "hide_d"
    "ef629f640d847c8c": "pictures_111", // "hide2_a"
    "906a4c3333b1c816": "pictures_112", // "hide2_b"
    "057974b069d30654": "pictures_113", // "ch2"
    "0ac46efc3e1326a6": "pictures_114", // "duodiner"
    "bf2f03cdcfef91fa": "pictures_115", // "lighter_a"
    "c1d7e2b47fb6ee1e": "pictures_116", // "lighter_b"
    "eef0bbb24ffe955e": "pictures_117", // "pov_none"
    "b297744b06b161a0": "pictures_118", // "pov_ashley"
    "99151e814741c388": "pictures_119", // "tvad_frame"
    "90c89e42d0231360": "pictures_120", // "tvad_a"
    "99293c069863c881": "pictures_121", // "tvad_b"
    "8fa16b4ad16de470": "pictures_122", // "tvad_c"
    "c6f58ee1735b5e88": "pictures_123", // "tvad_d"
    "640911fda2b1133c": "pictures_124", // "tvad_e"
    "6b812df629e31826": "pictures_125", // "tvad_f"
    "ef5d18e2e8d2e126": "pictures_126", // "hitmanwins"
    "b27513849fd0ebe0": "pictures_127", // "couch_a"
    "2999437d372fdcb1": "pictures_128", // "couch_b"
    "22a6a53d73312f1d": "pictures_129", // "couch_c"
    "e777bfdb7790c4df": "pictures_130", // "couch_d"
    "dfac7b98f43f254e": "pictures_131", // "couch_e"
    "fd1783eede86a83f": "pictures_132", // "couch2_a"
    "1ff8f87ffc9ba37a": "pictures_133", // "couch2_b"
    "f6406b9906fbcfae": "pictures_134", // "couch2_c"
    "ea3d89ab6fbb468f": "pictures_135", // "couch2_d"
    "c99312934d4fc24c": "pictures_136", // "motel_sis"
    "0a5d6a6d65f3b870": "pictures_137", // "motel_bro"
    "985a9dfa36907f93": "pictures_138", // "blur_motel"
    "c6b6668a0a866b7b": "pictures_139", // "motel_bro_dead"
    "aae5c665889a8f35": "pictures_140", // "motel_sis_dead"
    "734723dde1ec6dc4": "pictures_141", // "wake_first_vision_a"
    "65bc2642b1807cb3": "pictures_142", // "wake_first_vision_b"
    "5dc3a7e830da4a63": "pictures_143", // "motel_bro_b"
    "581080edc31fbd04": "pictures_144", // "smokes_a"
    "b49c5190a54058b1": "pictures_145", // "smokes_b"
    "e3f7ef3e6254aaf5": "pictures_146", // "smokes_c"
    "284f60333a39fe39": "pictures_147", // "smokes_d"
    "7696ffc76a7dc458": "pictures_148", // "smokes2_a"
    "a1231f68d55bd33c": "pictures_149", // "smokes2_b"
    "c3950249e6675054": "pictures_150", // "smokes2_c"
    "54b9052d70e39f8b": "pictures_151", // "pov_andrew"
    "f7839005d935c93d": "pictures_152", // "give_gun"
    "d84324d3940773f6": "pictures_153", // "car_a1"
    "bdcd9fd4b9c5693d": "pictures_154", // "car_a2"
    "d16f949daf2cd3a4": "pictures_155", // "car_b1"
    "50445084a2cf21ac": "pictures_156", // "car_b2"
    "4cf88856108688ab": "pictures_157",
    "3a5f48bad5ea6f2b": "pictures_158",
    "586b619c0ea5a766": "pictures_159", // "car_c3"
    "254b44b3caf8ab20": "pictures_160", // "car_c4"
    "0f163ef582eddeba": "pictures_161",
    "70ec6ff81eee9a3e": "pictures_162", // "car_c5"
    "abb78483f9504f84": "pictures_163",
    "7bd6fe7cc31df9ef": "pictures_164", // "car_d1"
    "1fe7ed71fa71f916": "pictures_165", // "car_d2"
    "67e9b1317f33e263": "pictures_166", // "car_e1"
    "06b135020f98f199": "pictures_167", // "car_e2"
    "ad2cd94cca9617c2": "pictures_168", // "carwake1_a"
    "4fa1dab19269970e": "pictures_169", // "carwake1_b"
    "f3488edebd2c01ca": "pictures_170", // "duo_car"
    "334cac0c244c359f": "pictures_171", // "carwake1_c"
    "eac2b86f88928871": "pictures_172", // "carwake1_d"
    "2024c94008299c5c": "pictures_173", // "carwake2_a"
    "662db332d90afa6b": "pictures_174", // "carwake2_b"
    "42e3fcdfe6df7c8b": "pictures_175", // "carwake2_c"
    "c20a68f20235c3d2": "pictures_176", // "carwake2_d"
    "4d3fc205dc3378f6": "pictures_177", // "carwake2_e"
    "a7d561d0e35b25dc": "pictures_178", // "cart_a"
    "ecaf3d8a9a591f00": "pictures_179", // "cart_b"
    "55c5e05e00443768": "pictures_180", // "curtain"
    "d294007469270d86": "pictures_181", // "fb_lemoncake"
    "f2953fc6219c8b2d": "pictures_182", // "eye_puzzle_halo"
    "c35e0223f47e364e": "pictures_183", // "fb_ley_table"
    "8d0f07578e5fbaea": "pictures_184", // "fb_card"
    "6aed563a63479ef0": "pictures_185", // "fb_ley_a"
    "ecd165db3b4f5e9c": "pictures_186", // "fb_ley_b"
    "2b43bdf518c1d912": "pictures_187", // "fb_ley_c"
    "f1e9727e3a6be1b5": "pictures_188", // "fb_duo_tv"
    "242d2c943b7f956b": "pictures_189", // "fb_tv_a"
    "87bb08fbc56b3db3": "pictures_190", // "fb_tv_b"
    "db59f669ad36accd": "pictures_191", // "fb_hug_a"
    "a3771790183e6efc": "pictures_192", // "fb_hug_b"
    "efbd6b41ff1cd6ba": "pictures_193", // "milkcarton"
    "6b19b3992c070ea5": "pictures_194",
    "388b09ae68f7e3d3": "pictures_195", // "window_latch"
    "87f57ebec44382da": "pictures_196", // "window_latch_open"
    "2a2f7605fbb9e1a2": "pictures_197", // "door_bye"
    "579009fb34224613": "pictures_198", // "door_bye_alt"
    "4ca131e8b13037e0": "pictures_199", // "whisper_a"
    "d43605d80ee6a106": "pictures_200", // "whisper_b"
    "7be75fdb7265f12f": "pictures_201", // "sofa_c"
    "b2f80fc164e016a5": "pictures_202", // "sofa_d"
    "04100d9951896914": "pictures_203", // "sofa_e"
    "d18f4b4080926868": "pictures_204", // "sofa_f"
    "576ab60dd29db965": "pictures_205", // "sofa_g"
    "fe67047f96a248c0": "pictures_206", // "sofa2_h"
    "0c345b0b64e3d4aa": "pictures_207", // "sofa2_h2"
    "a755d40d8185f1e3": "pictures_208", // "gun_a"
    "fa4208bfe85d3878": "pictures_209", // "gun_b"
    "09b00beef6fb9c5c": "pictures_210", // "gun_c"
    "f815abd6b0d2e06b": "pictures_211", // "gun_c_bullets"
    "237d9c60c8f61a66": "pictures_212", // "sleeptrinket1_a"
    "4a2d34bb21966b4e": "pictures_213", // "sleeptrinket1_b"
    "45fa9459026964b3": "pictures_214", // "sleeptrinket1_c"
    "e07663a5a25baae1": "pictures_215", // "sleeptrinket2_a"
    "ac9abbdb56ad30c5": "pictures_216", // "sleeptrinket2_b"
    "b5364ee6c6175fe3": "pictures_217", // "sleeptrinket3"
    "9895fdb7cda5108a": "pictures_218", // "hv_5a"
    "428c2f70a00fae47": "pictures_219",
    "3c43d16833122b7d": "pictures_220", // "hv_6a"
    "d2e6a90b4991c968": "pictures_221", // "hv_6b"
    "63a67f25b034c85d": "pictures_222", // "rb_wake1b"
    "c23280307b30c555": "pictures_223", // "rb_wake1c"
    "4ce30dfac6bb9b05": "pictures_224", // "rb_chokeb_fb"
    "6f1b90b1031ceabb": "pictures_225", // "rb_choke_fb"
    "69f0a8fb4a4904ad": "pictures_226", // "dinner_dishes_a"
    "77f8de5eae49764e": "pictures_227", // "dinner_dishes_b"
    "e872d53336bc384c": "pictures_228", // "dinner_family"
    "1dad9f636255bad6": "pictures_229", // "dinner_duo"
    "5993f87e50a5852f": "pictures_230", // "feed_reprise"
    "b654b2e6dfab0b90": "pictures_231", // "noandy_a"
    "954c1e7cc26583e9": "pictures_232", // "noandy_b"
    "9005e6aa380cefa9": "pictures_233", // "noandy_c"
    "5bef10be2269bbea": "pictures_234", // "noandy_d"
    "6c4de407e516698a": "pictures_235", // "noandy_e"
    "230a59bcdd85ee12": "pictures_236", // "noandy_f_alt"
    "f732aeb277474c0d": "pictures_237", // "noandy_f"
    "6f766e0a47210b1f": "pictures_238", // "kitchen_a"
    "e2699947cf021b78": "pictures_239", // "kitchen_b"
    "bd971cd44e354e62": "pictures_240", // "kitchen_c"
    "7873715f1cae10d6": "pictures_241", // "kitchen_d"
    "e3abf15fb52d3f9c": "pictures_242", // "kitchen2_a"
    "7e14970ec52e3df0": "pictures_243", // "kitchen2_b"
    "952a2baee2f13422": "pictures_244", // "coffee"
    "b03274763ff93071": "pictures_245", // "coffee_kick"
    "5219e16207fa159b": "pictures_246", // "sever_a"
    "3f4265711087d03c": "pictures_247", // "sever_b"
    "e2cd398e72a890c5": "pictures_248", // "ra_butcher_1a"
    "6d526f023c6ca9c8": "pictures_249", // "ra_butcher_1b"
    "339f1f109fbcfb5a": "pictures_250", // "ra_butcher_1c"
    "544794daa2f79165": "pictures_251", // "ra_butcher_1d"
    "209a6c2dc98742f7": "pictures_252", // "ra_butcher_2c"
    "c746959e4997b5d0": "pictures_253", // "ra_butcher_3a"
    "9b45364fe869bf37": "pictures_254", // "ra_butcher_3b"
    "f0a94597f099fb2b": "pictures_255", // "ra_butcher_3c"
    "1e85cda522c885dd": "pictures_256", // "rb_butcher_1a"
    "efc7fe2f750926be": "pictures_257", // "rb_butcher_1b"
    "503eb2f4ddcc4282": "pictures_258", // "rb_butcher_1c"
    "c794672e861fdfd0": "pictures_259", // "rb_butcher_2b"
    "3eb4e353e371e504": "pictures_260", // "rb_butcher_3a"
    "ae5cd1ea16defc2d": "pictures_261", // "rb_butcher_3b"
    "841378aae9ed38e5": "pictures_262", // "rb_butcher_4a"
    "ba9ceaf98b12b582": "pictures_263", // "rb_butcher_4b"
    "000d21aa3d82d7ef": "pictures_264", // "rb_butcher_4c"
    "3c24c674eb39ed26": "pictures_265", // "rb_catch_1a"
    "46ceb8a03c4e502a": "pictures_266", // "ashley_final_warning"
    "8798c963d26e560b": "pictures_267", // "cut_mom"
    "656c6ae7133a54a6": "pictures_268", // "cut_dad_a"
    "be1e34f309e4bcc8": "pictures_269", // "cut_dad_b"
    "44f0ddc97a59772c": "pictures_270", // "shrug"
    "966666681eba35da": "pictures_271", // "stabmom_a_cut"
    "4007887e993e3f97": "pictures_272", // "stabmom_a"
    "43c99e6a91140117": "pictures_273", // "stabmom_b"
    "b023638a629816c0": "pictures_274", // "stabmom_c"
    "47db3073cb206e43": "pictures_275", // "knife_dad"
    "d6a961ab47a9c17a": "pictures_276",
    "32083b9be620c422": "pictures_277",
    "8bdd313d98829e46": "pictures_278", // "accept_a"
    "8657ac6d279cbe8d": "pictures_279", // "accept_b"
    "e1ba8c1d0420bd3c": "pictures_280", // "accept_c"
    "06a3cadd8c3249f5": "pictures_281", // "decline_a_cut"
    "a639dfbb4bad3334": "pictures_282", // "decline_a"
    "3c3a7389e2fc7efc": "pictures_283", // "decline2_a"
    "4414311e2ee8ce9c": "pictures_284", // "decline2_b"
    "00eed50cccf6d1b6": "pictures_285", // "decline2_c_cut"
    "3a8bfb66afcc8e2e": "pictures_286", // "decline2_c"
    "9056928e60358c44": "pictures_287", // "decline2_d"
    "11236ab2abad4167": "pictures_288", // "decline2_d_cut"
    "6aff87c1816e38d5": "pictures_289", // "decline3_a"
    "1a2c887c1143200f": "pictures_290", // "decline3_b"
    "3370e42062a16360": "pictures_291", // "decline3_c"
    "313694eb2f339940": "pictures_292", // "decline3_d"
    "3bc6c2e9b52e4903": "pictures_293", // "fauxcomfort_a"
    "f26a50e3656debea": "pictures_294", // "fauxcomfort_b"
    "4ac018799a1558f1": "pictures_295", // "fauxcomfort_c"
    "d5307123da9ff10b": "pictures_296", // "fauxcomfort_d"
    "d3e441652bc84cc8": "pictures_297", // "fauxcomfort_e"
    "f65177a973764818": "pictures_298", // "fb_bff_a"
    "8de678ad8482ba75": "pictures_299", // "fb_bff_b"
    "7b199166b3c4c1c7": "pictures_300", // "car_c1"
    "5d1d2001facd85b1": "pictures_301", // "andy_angst"
    "3a6612e8e7cfbf62": "pictures_302", // "andy_urghhhhhhhh_a"
    "247296309988ca20": "pictures_303", // "andy_urghhhhhhhh_b"
    "4b84ff6ce7a6f01f": "pictures_304", // "oath1_a"
    "84b1a77b81496e1b": "pictures_305", // "oath1_b"
    "eb385cf8f9b50f76": "pictures_306", // "oath1_c"
    "227d16a496463a1f": "pictures_307", // "oath1_d"
    "7a5873e53c2994a8": "pictures_308", // "oath2_a"
    "ac084ea2094e9824": "pictures_309", // "oath2_b"
    "af86ba44ab7da7ce": "pictures_310", // "oath2_c"
    "e6002192de482747": "pictures_311", // "oath2_d"
    "12e892e3c34436d5": "pictures_312", // "oath3_a"
    "7688ab0803e06058": "pictures_313", // "oath3_b"
    "da5de1c82cc90398": "pictures_314", // "car_c2"
    "4a027c45196ee196": "pictures_315", // "oath3_d"
    "44e364455f671809": "pictures_316",
    "19cf9fb37530a655": "pictures_317",
    "6d4c33738b795f26": "pictures_318",
    "bfb74685f1e0f85b": "pictures_319",
    "022a8ee874a35430": "pictures_320",
    "30ea054b0f74379a": "pictures_321",
    "87c917cd2e22cc7c": "pictures_322",
    "5e3aef2d5a914544": "pictures_323",
    "7ad296f6f06ec212": "pictures_324",
    "6816a06deb7cac89": "pictures_325", // "julia_a"
    "9227ef0f5846ed2d": "pictures_326", // "julia_b"
    "96e3e429a6644472": "pictures_327", // "julia_c"
    "2698ce32bbb20d9b": "pictures_328", // "island_b"
    "8294276439fc2e34": "pictures_329", // "island_c"
    "7b315c40c45a6dd9": "pictures_330", // "island_a"
    "3c813e43e423988a": "pictures_331", // "stalker"
    "411a1054f1ecd81b": "pictures_332", // "bridge_h1_a"
    "613d33abbc8c22c4": "pictures_333", // "bridge_h1_b"
    "cfaf812c8b0ecb65": "pictures_334", // "bridge_h_push"
    "e9e7d26b5316c9e5": "pictures_335", // "bridge_h_pf_a"
    "76b458655a41147d": "pictures_336", // "bridge_h_pf_b"
    "e8d78ce5e31742f5": "pictures_337", // "bridge_h_pf_c"
    "2b9eb1707d8053f9": "pictures_338", // "bridge_h_pf_d"
    "e87d3e7b8ff4fd8f": "pictures_339", // "bridge_h_pf_e"
    "948a94cec1f510cc": "pictures_340", // "bridge_h_mopea"
    "fe8e9d3bda3a77c9": "pictures_341", // "bridge_h_mopeb"
    "b76d8b426fd20038": "pictures_342", // "hex_a"
    "c178b05f20a956cf": "pictures_343", // "hex_b"
    "85ed0f95a6a7cd00": "pictures_344", // "hex_c"
    "a3b52381f668ac8b": "pictures_345", // "hex_d"
    "ba0256e29de431c3": "pictures_346", // "bridge_rb1_a"
    "48a210921fd8ce2e": "pictures_347", // "bridge_rb1_b"
    "136758b91d834896": "pictures_348", // "bridge_rb1_c"
    "4e1c2890e4ae1ccb": "pictures_349", // "bridge_rb1_d"
    "7b02093f1308aa86": "pictures_350", // "bridge_rb1_e"
    "b7be0f71948fc5c0": "pictures_351", // "bridge_rb3"
    "4df4fcf34924b581": "pictures_352", // "door_spotlight_a"
    "ea58231f404ca0c0": "pictures_353", // "door_spotlight_left"
    "b1081b01f534a2c6": "pictures_354", // "door_spotlight_right"
    "0999e1e635701bc3": "pictures_355", // "drawing_fix_classmates"
    "6ae3ade0e3428b1e": "pictures_356", // "drawing_fix_friends"
    "1a54d1acc9755608": "pictures_357", // "drawing_fix_parent"
    "b9af5ec9fec44fb3": "pictures_358", // "hv_1a"
    "86eca52b86ce9e8c": "pictures_359", // "hv_1b"
    "6976448650fed99a": "pictures_360", // "hv_2"
    "8b006b9aa65c6a39": "pictures_361", // "hv3a_1"
    "25303aac82d9515c": "pictures_362", // "hv3a_2"
    "1fd20320c2a8f5ea": "pictures_363", // "hv3b_1"
    "e20f8ca4f0ec7356": "pictures_364", // "hv3a_3"
    "465d290206f8e357": "pictures_365", // "hv3b_2"
    "ea19f233527f51c7": "pictures_366", // "hv3b_3"
    "bec3b3499844c59e": "pictures_367", // "hv_4"
    "7034efd9bc1c5315": "pictures_368",
    "0c8cae915acc2fd2": "pictures_369", // "hint_red"
    "8b8514d0e3417e54": "pictures_370", // "hint_green_blue"
    "fe81c2234c75d03d": "pictures_371",
    "4c3fc3e376774d0f": "pictures_372",
    "4eba2e1aacd04b0d": "pictures_373", // "LU_eyes_c"
    "66cb56211531cb91": "pictures_374", // "LU_eyes_a"
    "4c198c62430242f8": "pictures_375", // "LU_eyes_b"
    "cab5b910f15e951c": "pictures_376",
    "5b83cdc699d771cc": "pictures_377", // "tag"
    "142182d32f4a3615": "pictures_378",
    "6ca64f516c75587f": "pictures_379", // "rb_catch_1b"
    "91a310b44960aea8": "pictures_380", // "rb_catch_1c"
    "f54794233bdccbe9": "pictures_381", // "rb_catch_1d"
    "4371a01b45e06fb9": "pictures_382", // "rb_catch_2a"
    "ed09b799b56c6442": "pictures_383", // "guesswhat_a"
    "b5a10a6bfedd4e68": "pictures_384", // "guesswhat_b"
    "14378b843d4ff7f4": "pictures_385", // "guesswhat_c"
    "d50941826e3857f3": "pictures_386", // "kick"
    "de8ad42673acaf1d": "pictures_387", // "nokill_sis_a"
    "7cabee34991e6939": "pictures_388", // "nokill_sis_b"
    "1a5e1fc17af1a551": "pictures_389", // "nokill_sis_c"
    "1d07386a8391c7b6": "pictures_390", // "LU"
    "44a4398378d5c7f6": "pictures_391",
    "b80b6536ee95a483": "pictures_392",
    "1b29cbfd933db9d9": "pictures_393",
    "1eb3e6f74706b1f0": "pictures_394",
    "84cda5bde98988c2": "pictures_395",
    "2ae3a356f087b5a7": "pictures_396",
    "6e9856c2d6e5d4e6": "pictures_397",
    "8dbe450f40302061": "pictures_398",
    "a154f537a25dd1e2": "pictures_399",
    "576bbe53971e82f7": "pictures_400",
    "f06a1d176b3e1706": "pictures_401",
    "b05434ec6ae22f78": "pictures_402",
    "5114ab1dba1ed044": "pictures_403",
    "8d65692f31d543e8": "pictures_404",
    "39118af5fbf37f74": "pictures_405",
    "b492e6b376080d34": "pictures_406",
    "abaa1aee02cfa414": "pictures_407",
    "c04287f70b3f3f9a": "pictures_408",
    "e1422a39a993b541": "pictures_409",
    "3b9512758e2fdb92": "pictures_410",
    "7819341fb278fa29": "pictures_411",
    "470daff617d61456": "pictures_412",
    "d6f06e7e9a189af7": "pictures_413",
    "89a49ba20709e794": "pictures_414",
    "f22b3c5a342d9636": "pictures_415",
    "2c6f11eab3116b62": "pictures_416",
    "23f4a90b4b4b9c75": "pictures_417",
    "5e1001d7277e0b27": "pictures_418",
    "c6a5c8e043a16fab": "pictures_419",
    "e0fbc265cfa4613c": "pictures_420",
    "6ed5aef5fd7dc8a7": "pictures_421",
    "e755f75009de660e": "pictures_422",
    "99f053d7e3b7c21a": "pictures_423",
    "08348e2658c15d64": "pictures_424",
    "1cab08c53f3e762b": "pictures_425",
    "53d86b2fb35afdf5": "pictures_426",
    "4760b9414854c1ec": "pictures_427",
    "36345669be11761d": "pictures_428",
    "e7ab1b6183eae934": "pictures_429",
    "aaccd613ab968230": "pictures_430",
    "c932e525bed62f01": "pictures_431",
    "c832c73863fc6af6": "pictures_432",
    "d7d78760466af83c": "pictures_433",
    "cf47f21aff3f6040": "pictures_434",
    "5a06b8ff36fe1a31": "pictures_435",
    "e92795b829234b6e": "pictures_436",
    "a3769e76ccb4ed5e": "pictures_437",
    "d7369cb91b7a9099": "pictures_438",
    "b1a4708b0d924751": "pictures_439",
    "2eea5e5f99f23b40": "pictures_440",
    "0dc4d6e9aed111e8": "pictures_441",
    "972900d835825bdd": "pictures_442",
    "0ebb768c6ab206fd": "pictures_443", // "hv_5b"
    "886c8b3f63b9a0dc": "pictures_444",
    "aa650f4ee9426ec5": "pictures_445",
    "8ce085781a32694d": "pictures_446",
    "5535e4931b9cc61c": "pictures_447",
    "c34bc1efa7360f0f": "pictures_448",
    "81770648fc4dc632": "pictures_449",
    "0ebc377ecf3e6bfb": "pictures_450",
    "51cc1fe113b8f58d": "pictures_451",
    "d41fe2c66f664b51": "pictures_452",
    "1a50ea9eb0a6106c": "pictures_453",
    "289bb880ccca57b3": "pictures_454",
    "2f8e14999d69db13": "pictures_455",
    "2029b31e2bff87a7": "pictures_456",
    "9ecd968226340903": "pictures_457",
    "858be6403c682b79": "pictures_458",
    "8570057c9ba66781": "pictures_459",
    "c526fd3e61408963": "pictures_460",
    "1bd7a4c33f40ff8d": "pictures_461", // "black"
    "5e30161743b26cd0": "pictures_462",
    "ee7e05f55895fe2f": "pictures_463",
    "78c3f26d3aedb948": "pictures_464",
    "d8f00b3d97b16874": "pictures_465",
    "f1df6f2d506f4f87": "pictures_466",
    "59bef4f2f0e2aa38": "pictures_467",
    "046c2cc1af8bad6a": "pictures_468",
    "e1bf4896fb791654": "pictures_469",
    "3ed58b4aff4f4d48": "pictures_470",
    "3a7f235824cdb0b9": "pictures_471",
    "0ae4ccd567b26b4c": "pictures_472",
    "2517e482b897b92b": "pictures_473",
    "667e41d772bff204": "pictures_474",
    "93033cf520d2483a": "pictures_475",
    "f9658fa26d47dec8": "pictures_476",
    "a21df8ced286bc7b": "pictures_477",
    "6a708f2e26bbd19c": "pictures_478",
    "939ee486a5542d01": "pictures_479",
    "b6c360726d1f70fe": "pictures_480",
    "8302d4d7f2f994d0": "pictures_481",
    "3fb66293f18b9ce7": "pictures_482",
    "0da837083db973f2": "pictures_483",
    "a0e206cf11234649": "pictures_484",
    "e46cbaf9895be540": "pictures_485",
    "f501a7f4c1ed68cf": "pictures_486",
    "6e73bd41746fc810": "pictures_487",
    "954bcc80944dad1b": "pictures_488",
    "39b333b3fe5c4834": "pictures_489", // "car_c6"
    "9cc0be0d733916c2": "pictures_490", // "car_c7"
    "3172339a0fe63832": "pictures_491",
    "1872905bd40d3b9a": "pictures_492",
    "c1e1792d7491b4cd": "pictures_493",
    "6a45fd3dc40871ae": "pictures_494",
    "d4248643171d8622": "pictures_495",
    "2bac126499db13ff": "pictures_496",
    "e46d2ce9bb79cadb": "pictures_497",
    "20c0e40ebd8b5390": "pictures_498",
    "d3034c171430e6af": "pictures_499",
    "a01110fb88e2548d": "pictures_500",
    "59d1dc1456d3ce55": "pictures_501",
    "10ddda87b2b8f8c5": "pictures_502",
    "d056aab8a6bb3d5d": "pictures_503",
    "82f43c5701c3e8f6": "pictures_504",
    "a5c3e3c81bf41821": "pictures_505",
    "94e2cad3cd00b929": "pictures_506",
    "c1a326a5d5884e6a": "pictures_507",
    "fe72b9a262224d0e": "pictures_508",
    "db51a3d49e85c997": "pictures_509",
    "8810aad265b441c1": "pictures_510",
    "fb8414ed2505838f": "pictures_511",
    "a085619205cba56d": "pictures_512",
    "a4e1b56f58a2698e": "pictures_513",
    "8608eea61bffcacc": "pictures_514",
    "3f760e2735fe9bf0": "pictures_515", // "fb_bff_c"
    "5e36738214753749": "pictures_516",
    "359a7ef9692806b2": "pictures_517",
    "f2e1db203a4a0ee4": "pictures_518",
    "bded826f9d67cbe2": "pictures_519",
    "93548a52adb40294": "pictures_520",
    "6bb1140279007af0": "pictures_521",
    "70e75b4f429064d4": "pictures_522",
    "8c87700f3998c292": "pictures_523",
    "7c9518e8495cd401": "pictures_524",
    "932c38eb518c1df2": "pictures_525",
    "469c76966d386c3f": "pictures_526",
    "770ee53479eec58a": "pictures_527",
    "c01a64e26ba1a67d": "pictures_528",
    "44c728771db76371": "pictures_529",
    "41e4f16251ea945e": "pictures_530",
    "5e66bd45f3b1f756": "pictures_531",
    "f796b757ee49c79e": "pictures_532",
    "e15459468c871618": "pictures_533",
    "a7b0455d15fccb46": "pictures_534",
    "cad636ba17e5fcd8": "pictures_535",
    "ea8e894527904f45": "pictures_536",
    "9e24c3e386af8380": "pictures_537",
    "bb59f54a60c422ba": "pictures_538",
    "b1da1f7a1002c7b4": "pictures_539",
    "6d6f2e0c3629d024": "pictures_540",
    "c3e3535213e82e1a": "pictures_541",
    "6f09ca64bf7303ed": "pictures_542",
    "f6916a2cf3373d19": "pictures_543",
    "b4341f5ae7ea9e90": "pictures_544",
    "7e8e8ec69cc203aa": "pictures_545",
    "0e56c5656ce4b0f7": "pictures_546",
    "3648911b57796c39": "pictures_547",
    "f2b7f410b9b22678": "pictures_548",
    "8836bccab717f4c5": "pictures_549",
    "b1b188d914c05712": "pictures_550",
    "6099ad6fbce44278": "pictures_551",
    "2845481587e9bf25": "pictures_552",
    "8f89064c350f818b": "pictures_553",
    "a5267cc803afc9aa": "pictures_554",
    "be6c0e3a59796c0c": "pictures_555",
    "68636c4e23211d78": "pictures_556",
    "1ae56d8faf7a2eea": "pictures_557",
    "be5df80304524a6a": "pictures_558",
    "a945166feb0726f5": "pictures_559",
    "2ca0678b335045d1": "pictures_560",
    "8ba101081e7cc3ce": "pictures_561",
    "a9a10d97bd3b781f": "pictures_562",
    "a7b926982ed8ecc6": "pictures_563",
    "a290d8fbdd465965": "pictures_564",
    "d46371d3bcf68b35": "pictures_565",
    "b43a2de387c39265": "pictures_566",
    "133b34986f46ea5f": "pictures_567",
    "c0894aab5707d25d": "pictures_568",
    "f7f360d123972e94": "pictures_569",
    "4a6c21ac7b906727": "pictures_570",
    "dedfc88dfaea15ab": "pictures_571",
    "4fbef3d4a7782650": "pictures_572",
    "c935e930a817eb48": "pictures_573",
    "97b04210c16af0db": "pictures_574",
    "b290ce4442b4673f": "pictures_575",
    "1e1e42c6a2cb77e1": "pictures_576",
    "46bd49f239b7023f": "pictures_577",
    "14b40ec1ab0372eb": "pictures_578",
    "d5955a396e2d96bc": "pictures_579",
    "07e4c8a7c9958c60": "pictures_580",
    "4e3f72fd76e609df": "pictures_581",
    "469e3de621564363": "pictures_582",
    "daa7517520b1b6c1": "pictures_583",
    "ae5ef26f48f39716": "pictures_584",
    "89cf5155c8f2b3ab": "pictures_585",
    "4b8af617eb8691a7": "pictures_586",
    "2097d69c9c99de24": "pictures_587",
    "871df459c11b5b90": "pictures_588",
    "32cbae34e1ca651f": "pictures_589",
    "8cb760a5a29e700b": "pictures_590",
    "38f1f2cbf1d907cc": "pictures_591",
    "f9668058d51d9c58": "pictures_592",
    "61cb81a60a9b85eb": "pictures_593",
    "76ef4d4195e59e0d": "pictures_594",
    "50f7381e486179af": "pictures_595",
    "270c7a5414c4437c": "pictures_596",
    "f49db0af5b1779db": "pictures_597",
    "5bbe1c8484aac1ed": "pictures_598",
    "ee830722be8877f8": "pictures_599",
    "b3d746effad7f6bd": "pictures_600",
    "961b6967d71777d4": "pictures_601",
    "c105838886dcb10b": "pictures_602",
    "724cca4ea027e53a": "pictures_603",
    "0e8aae15a933b323": "pictures_604",
    "de05901cf0817795": "pictures_605",
    "57398fbf1e770db9": "pictures_606",
    "95ca39e8ac447ff4": "pictures_607",
    "ae2230e801fa22cd": "pictures_608",
    "ff9c6f02af2029dc": "pictures_609",
    "b76017cb157a78a6": "pictures_610",
    "bfc8402a424ecac6": "pictures_611",
    "cbf7a38736fe7e4d": "pictures_612",
    "ad00c114a1e96111": "pictures_613",
    "d044283d24034b48": "pictures_614",
    "468444d2f7474bc9": "pictures_615",
    "5f7daa9cb4b2df33": "pictures_616",
    "40083858671477e9": "pictures_617",
    "a741507d8f6f0cb3": "pictures_618",
    "0e91d5c926804522": "pictures_619",
    "08e2554c2e3479ca": "pictures_620",
    "86bd6933cf8593f3": "pictures_621",
    "17088426991b9c62": "pictures_622",
    "1bcaec8105c94607": "pictures_623",
    "6ea3a1710f95c19f": "pictures_624",
    "376f320a2e978eb5": "pictures_625",
    "e0106a8013e6a925": "pictures_626",
    "1387a3b0225978a4": "pictures_627",
    "d045145bc0331853": "pictures_628",
    "5e3c5f169fbd98de": "pictures_629",
    "72dc1eb93343dae8": "pictures_630",
    "972f912570578bd4": "pictures_631",
    "d5158f83452375fb": "pictures_632",
    "493d52ac8c9c4f0c": "pictures_633",
    "26b6cece70292a40": "pictures_634",
    "c8f4c0fcc28ad11b": "pictures_635",
    "fc70d2308afa8255": "pictures_636",
    "968d79596b89d190": "pictures_637",
    "a3008e891bb87f95": "pictures_638",
    "b1773742cf918b0a": "pictures_639",
    "e4eca22c26220fa2": "pictures_640",
    "5ac9e620f7243ffa": "pictures_641",
    "35c26643791b551d": "pictures_642",
    "2afe14fde8fdf9f7": "pictures_643",
    "e7fe304c866b3ce3": "pictures_644",
    "9d4a90cb2703e2a1": "pictures_645",
    "84218207ca24d9c8": "pictures_646",
    "13b9227b4e94f99d": "pictures_647",
    "5a6217172fdfd2fc": "pictures_648",
    "fb1c712440d57999": "pictures_649",
    "e239d1cb3f1bee26": "pictures_650",
    "b9da98ed01900c9c": "pictures_651",
    "71e9589c529773d8": "pictures_652",
    "8cd40ed6ff86b02b": "pictures_653",
    "47aa1a2bed7ed9c8": "pictures_654",
    "6cd894f8c07d00ca": "pictures_655",
    "b18ae0e1db561486": "pictures_656",
    "511d249492bdcba0": "pictures_657", // "uso"
    "9676095141671fb9": "pictures_658",
    "f56864790f471e33": "pictures_659",
    "0cb2683c2dc7875f": "pictures_660",
    "30555b16d296e45e": "pictures_661",
    "40f8b8db2e93a526": "pictures_662",
    "36198a59e8137383": "pictures_663",
    "94a664bf609cd014": "pictures_664",
    "3a1846b04eb31dd3": "pictures_665",
    "2bbd97aedcb30b7a": "pictures_666",
    "75669c361e383731": "pictures_667",
    "9f6874af154b710a": "pictures_668",
    "e97c40e4c6421d70": "pictures_669",
    "04fe4578fc2ddff6": "pictures_670",
    "bb259a91d9a99dbc": "pictures_671",
    "459688c24bd7907e": "pictures_672",
    "730b0592b2587aa8": "pictures_673",
    "3958ff15261e82e4": "pictures_674",
    "62935952e2224e66": "pictures_675",
    "f0b6e95f8d0da96c": "pictures_676",
    "d69590504e161d47": "pictures_677",
    "7821963155327d78": "pictures_678",
    "b1947c916f6bb0dc": "pictures_679",
    "0c1af31c27c9fc91": "pictures_680",
    "2495c094645cd3d4": "pictures_681",
    "164337e88955b1f9": "pictures_682",
    "03e9e81fb0cd19c7": "pictures_683",
    "2d24daf3a7b75d13": "pictures_684",
    "eb396fc114854149": "pictures_685",
    "38004fdb551e3ba3": "pictures_686",
    "571c7b3bca372b03": "pictures_687",
    "8e2a499e31d27f12": "pictures_688",
    "61fd66827ee2268c": "pictures_689",
    "b72f21cc68c6f35b": "pictures_690",
    "52fd3594076b938f": "pictures_691",
    "7711ac0c4a49b38d": "pictures_692",
    "3776452288779302": "pictures_693",
    "471d98501393d092": "pictures_694",
    "3c7f16bcdacff903": "pictures_695",
    "baec4d9b5c07d58a": "pictures_696",
    "4b2d0c6b25aa7a06": "pictures_697",
    "3de76ad7f5b8c591": "pictures_698",
    "0dc0094a562070ad": "pictures_699",
    "94e48ab81e46c370": "pictures_700",
    "b1fc28d82c26f94a": "pictures_701",
    "69cf99a108440fe1": "pictures_702",
    "7f775fde1bfbdd39": "pictures_703",
    "6d9275c3178a4787": "pictures_704",
    "0bbd7ba51136e1d2": "pictures_705",
    "1a2c2d894845dd2b": "pictures_706",
    "89bc4f7473ab7411": "pictures_707",
    "41d4e8c957ce2bef": "pictures_708",
    "6233eec21f4b69e9": "pictures_709",
    "da38cc126e9cf3f7": "pictures_710",
    "664dcc6b991533ba": "pictures_711",
    "ca9a3b4e49e0afc2": "pictures_712",
    "c416013eb71664a6": "pictures_713",
    "c3d41ba8dff3a607": "pictures_714",
    "52af2e2d241643db": "pictures_715",
    "4f93906f482777de": "pictures_716",
    "ce4c51913ffe6446": "pictures_717",
    "84e2c676e930dde7": "pictures_718",
    "7c4ac99bb690186a": "pictures_719",
    "80f5c37da92ebf8d": "pictures_720",
    "52c9e60c2d748514": "pictures_721",
    "b22d4e4c34d5a00a": "pictures_722",
    "493965e41389343f": "pictures_723",
    "400881946f8aa6dd": "pictures_724",
    "fd7712f9481aedbf": "pictures_725",
    "4da1e6bf70b95b40": "pictures_726",
    "bfd631b67d45a057": "pictures_727",
    "1b403b3573cb07d4": "pictures_728",
    "bb435d091d1faa4e": "pictures_729",
    "1135d34d416c444a": "pictures_730",
    "59cf28f34ae07d07": "pictures_731",
    "e2a3e8541b182daf": "pictures_732",
    "52d46ec33303d879": "pictures_733",
    "4140f54b45b9c7a3": "pictures_734",
    "269f6152cb2368c6": "pictures_735",
    "2ffc0cd9259d34bd": "pictures_736", // "oath3_c"
    "49962e6ac229ddc0": "pictures_737",
    "51d375ae05b7677a": "pictures_738",
    "5913370a1ddefa68": "pictures_739",
    "f26f6d4b5c8f75a0": "pictures_740",
    "a0405f3515ec029f": "pictures_741",
    "bf91d7fcf3d165a0": "pictures_742",
    "2e6ec7aa2f743ac0": "pictures_743",
    "4cc98e4b28fb09a7": "pictures_744",
    "4e7c852c38da367a": "pictures_745",
    "81aaf56bc6003f7d": "pictures_746",
    "0a8ca260f50fe1a8": "pictures_747",
    "ef11e96291f9fb81": "pictures_748",
    "12bdc3bcc0e0e447": "pictures_749",
    "348af1ccec8c495e": "pictures_750",
    "d34078e1558378b1": "pictures_751",
    "43b6302fc5d7ab95": "pictures_752",
    "8e70a750eef27628": "pictures_753",
    "8c4874394cbfae7f": "pictures_754",
    "4ca0290576f75804": "pictures_755",
    "99bf68850ffcb1fb": "pictures_756",
    "6503d411a4dfb115": "pictures_757",
    "df0b18b975cc0def": "pictures_758",
    "5865b8ebfeb86dcd": "pictures_759",
    "0f57b1acb01c38db": "pictures_760",
    "0b7e5663f4e461c4": "pictures_761",
    "ef43aa51befde5ac": "pictures_762",
    "8540df16e119c153": "pictures_763",
    "83d12f2520cd56c4": "pictures_764",
    "e6a21162be6f9f65": "pictures_765",
    "5dfc0d14855de318": "pictures_766",
    "3d2e74a58d06c05a": "pictures_767",
    "5f258273a75fbb56": "pictures_768",
    "81f128b093a804b2": "pictures_769",
    "36c6e23a7f58d3f4": "pictures_770",
    "9fce2fb4daa42e99": "pictures_771",
    "8d4d88320284aafe": "pictures_772",
    "eea085da9198f424": "pictures_773",
    "7878e6a9cf5e46d1": "pictures_774",
    "7cb9fd16359789c5": "pictures_775",
    "f302b066d4574287": "pictures_776",
    "94da301c382191ae": "pictures_777",
    "ccd85240c5c7f2c8": "pictures_778",
    "050288490094e7c8": "pictures_779",
    "0f23c91c075dc88b": "pictures_780",
    "9c344cbf5e3d7432": "pictures_781",
    "d2e419aa79776c3d": "pictures_782",
    "cd037cadce9f0be5": "pictures_783",
    "daea29bc8d20fc96": "pictures_784",
    "24567d11f0efaadf": "pictures_785",
    "ca00a30384ea82d4": "pictures_786",
    "b7aca4adf33167ca": "pictures_787",
    "956e741d35e94037": "pictures_788",
    "211954a0d55a3218": "pictures_789",
    "effdc09a78504114": "pictures_790",
    "91bec00c0058553c": "pictures_791",
    "9d7c98c86859c7a8": "pictures_792",
    "a6ff10f3b7a84205": "pictures_793",
    "15adeab7b95a5dab": "pictures_794",
    "da761b936a0eac3b": "pictures_795",
    "80adbf617d05a3bd": "pictures_796",
    "7db996625b3eaf8b": "pictures_797",
    "fb7daa394b8b3a4f": "pictures_798",
    "7d4cd49dcd6b3609": "pictures_799",
    "394d713123fde6fe": "pictures_800",
    "e8481730d27b5a25": "pictures_801",
    "e6af2bdeb189eb86": "pictures_802",
    "5bfc68a2d821ce13": "pictures_803",
    "bfa2d4f17f7f1413": "pictures_804",
    "63b5b7c07e439362": "pictures_805",
    "0dc09a3e066cf073": "pictures_806",
    "e04dfa7d430f71d9": "pictures_807",
    "0895bf13a7266930": "pictures_808",
    "dc5619e4728eee67": "pictures_809",
    "48073e57a0353d3a": "pictures_810",
    "cf0feaa6f5a4327e": "pictures_811",
    "f3d29e88a39ac816": "pictures_812",
    "da7e6492e13c25eb": "pictures_813",
    "7e15d4951fb20905": "pictures_814",
    "815a04a9ba66a264": "pictures_815",
    "93dd6b0dc9d3e300": "pictures_816",
    "4e9a197ef36ca77f": "pictures_817",
    "69d10c9429ef5b93": "pictures_818",
    "5f548105632ee3b7": "pictures_819",
    "4dddff1fd505d3b2": "pictures_820",
    "1613955a0a6392e0": "pictures_821",
    "ea596c65abae987a": "pictures_822",
    "d9b42dc62f8031f3": "pictures_823",
    "64bec0f3fe9c9065": "pictures_824",
    "6a68b829d8969a1b": "pictures_825",
    "50c4ba468dd8f2dd": "pictures_826",
    "56c6fd9a4ff02a2b": "pictures_827",
    "0351639b28317a11": "pictures_828",
    "dd2d179dd5a7a6d8": "pictures_829",
    "6b1fa52c858c026f": "pictures_830",
    "639b891c6527eb75": "pictures_831",
    "a8ded9ccc89eed66": "pictures_832",
    "bf1fc31cee8721be": "pictures_833",
    "71a12990a056bb58": "pictures_834",
    "a020be48d801983f": "pictures_835",
    "a3536073af4890d0": "pictures_836",
    "70a977b057031c96": "pictures_837",
    "71233fa5d86b0a9a": "pictures_838",
    "88be0d962d2c171b": "pictures_839",
    "dc7ca851461d4aa8": "pictures_840",
    "ef31e4fe5ca4117f": "pictures_841",
    "d2a69b80cd981f93": "pictures_842",
    "0a92412569d0839a": "pictures_843",
    "abc0c8c68806ad31": "pictures_844",
    "ae355b8f6a58bf99": "pictures_845",
    "bb245a46a111a1e5": "pictures_846",
    "3ea67c3c8cc54c9d": "pictures_847",
    "d676063fab458e9f": "pictures_848",
    "bfe29142dd5b853f": "pictures_849",
    "13d9d16131df7d29": "pictures_850",
    "da54b04ab089c06c": "pictures_851",
    "2dfba69d3b8dc755": "pictures_852",
    "3190f75a5e7080f6": "pictures_853",
    "615f06b85aae4eff": "pictures_854",
    "9b49a1b05ebd8d48": "pictures_855",
    "74815b50111e9728": "pictures_856",
    "c384aef0bb2ff58b": "pictures_857",
    "61ac4c751ba21402": "pictures_858",
    "1da9b0ab733a82c4": "pictures_859",
    "1420a5fd9f124e2e": "pictures_860",
    "17f293d610fb1f85": "pictures_861",
    "1bc7d2af711ed88c": "pictures_862",
    "88e247e77d1900af": "pictures_863",
    "75fe8f08075202e9": "pictures_864",
    "78679158388e247d": "pictures_865",
    "cf1bf3d19cfbd1fa": "pictures_866",
    "6b1bfd2d995c6f7b": "pictures_867",
    "3118f18b31f8c566": "pictures_868",
    "cf0da2bec0b3b612": "pictures_869",
    "e3668ef92be0b968": "pictures_870",
    "6809651146a3dc1c": "pictures_871",
    "36cd6d56fe5db7fd": "pictures_872",
    "5b25e69c9ed3dad8": "pictures_873",
    "17819f56417f58c0": "pictures_874",
    "b1ce9cd1ab054709": "pictures_875",
    "df8eb0aab5b6472c": "pictures_876", // "rb_butcher_4d"
    "693ff2fb0dbc2c8c": "pictures_877",
    "d2d5b2dcf1e1507d": "pictures_878",
    "112505a0c393995b": "pictures_879",
    "08e2e2c2cd8813d1": "pictures_880",
    "5e85d9b00e3f662d": "pictures_881",
    "b257ef4e7e50148c": "pictures_882",
    "4d6e83a2c874e656": "pictures_883",
    "077aa1c9211d1c37": "pictures_884",
    "acdb9e5789ef2ce7": "pictures_885",
    "139a915b0e2b28f0": "pictures_886",
    "4648962436fe5b8f": "pictures_887",
    "155db97b67cf113d": "pictures_888",
    "64b99e3412bab34f": "pictures_889",
    "01813d8429f05da6": "pictures_890",
    "09d84ad2dcff6b4b": "pictures_891",
    "0d844482a1fa5c53": "pictures_892",
    "5019133dbdbc0d10": "pictures_893",
    "348212b8159ff544": "pictures_894",
    "2dfffe4f9f32e753": "pictures_895",
    "bc0b4c804e75e7b7": "pictures_896",
    "3ca0c18ff77feaf4": "pictures_897",
    "ae23fbc0f9df2138": "pictures_898",
    "34248e30ad48fa5a": "pictures_899",
    "9f9fe98d69d7094e": "pictures_900",
    "eef36cba1a8ef066": "pictures_901",
    "4b1b3fabcbb27d32": "pictures_902",
    "6e0ab97c233b0429": "pictures_903",
    "d8e301c137f10c14": "pictures_904",
    "d8aaae99674ce8c5": "pictures_905",
    "f3099250faa1221d": "pictures_906",
    "5f7a17c96cc1eb32": "pictures_907",
    "42c88ae7dfa0aeab": "pictures_908",
    "538350c925843e20": "pictures_909",
    "f94d27a70f4a2037": "pictures_910",
    "49895405b8641cd0": "pictures_911",
    "f962ea11d81ed6f6": "pictures_912",
    "6b7e0fb4bae496c1": "pictures_913",
    "36468a0daabe0f9e": "pictures_914",
    "c0ba32a63d0643a6": "pictures_915",
    "65d1aefab08f4717": "pictures_916",
    "e232728742917042": "pictures_917",
    "f0f5cdfbd94825ff": "pictures_918",
    "5c4eb101f6bc5c65": "pictures_919",
    "7577ece842241501": "pictures_920",
    "7bd3c64a6df45742": "pictures_921",
    "411e0fa6bd9d1d6a": "pictures_922",
    "f43ef672cbd28227": "pictures_923",
    "624df530a2ec9ed3": "pictures_924",
    "640c96ed07ca6337": "pictures_925",
    "7232ca67ccc715a4": "pictures_926",
    "99db1a791120b996": "pictures_927",
    "2291a2e2dac4103c": "pictures_928",
    "47c69e6aaa63ff63": "pictures_929",
    "6123ff0ec715b485": "pictures_930",
    "e377c0dc6456096a": "pictures_931",
    "b7eca2bb6484d02c": "pictures_932",
    "49967e77d20deab5": "pictures_933",
    "3b664ac0ba846a59": "pictures_934",
    "92eee2ac1ba54548": "pictures_935",
    "3377c4b799bc079c": "pictures_936",
    "e74e3b7f04c103a9": "pictures_937",
    "81aaea6694a55548": "pictures_938",
    "66452e2d06757c2d": "pictures_939",
    "84e4fcd1a32bfa1e": "pictures_940",
    "a7edff5421756fe6": "pictures_941",
    "8eb301b404ca1e08": "pictures_942",
    "3e6110c19fc021a8": "pictures_943",
    "ae3802b5cfeb22a0": "pictures_944",
    "263f7fb50a1dd0e3": "pictures_945",
    "008fd66a8e8997b0": "pictures_946",
    "37af26a890beeebb": "pictures_947",
    "0d7aa80a33180118": "pictures_948",
    "4f804a565bce0e26": "pictures_949",
    "63d60273b888442e": "pictures_950",
    "5470291accda68e4": "pictures_951",
    "c0ae73b40a5f2e53": "pictures_952",
    "d6bb9fb199e4585f": "pictures_953",
    "b4967689ba75f0dd": "pictures_954",
    "434b2013afdefa82": "pictures_955",
    "16bc7430ff4d7658": "pictures_956",
    "135f8e983db86a30": "pictures_957",
    "5da66bc0b58e296d": "pictures_958",
    "7d074ce82028f680": "pictures_959",
    "cbb6623182a228ea": "pictures_960",
    "3520bb9412100529": "pictures_961",
    "288bcdf449b6d07c": "pictures_962",
    "01bc7721c89c9707": "pictures_963",
    "689403aa4485fabe": "pictures_964",
    "6c38310d6018a514": "pictures_965",
    "9b6a2a345d2cbc5a": "pictures_966",
    "bfbf4d03928e8eca": "pictures_967",
    "41f611655b897f91": "pictures_968",
    "2b1eb7d64325d8fc": "pictures_969",
    "d5b6bd6020035177": "pictures_970",
    "429afcbd88bf782b": "pictures_971", // "lg_beam"
    "067d92e67c32877e": "pictures_972",
    "3fe1e3a166282001": "pictures_973",
    "496c3b68e1409631": "pictures_974",
    "a81d6bf2b580ac31": "pictures_975",
    "ce46141a4c921781": "pictures_976",
    "70d93c3771db7f86": "pictures_977",
    "f099dd672c62f5ac": "pictures_978",
    "5034997f93b0ac8d": "pictures_979",
    "b2cc40ebf39bfa26": "pictures_980",
    "3f1ba617c3811a0c": "pictures_981",
    "9f28f2b1a6c83593": "pictures_982",
    "bc3f7c4ee927aaaa": "pictures_983",
    "e57bf7a7a93d2e74": "pictures_984",
    "7a5e4148067ca317": "pictures_985",
    "2cc2680e6d70a5b7": "pictures_986",
    "35cd83cf616854fc": "pictures_987",
    "176d339995cf9bec": "pictures_988",
    "4c60f531e5bee4c1": "pictures_989",
    "c8a4faddbc3c5d0d": "pictures_990",
    "e3dfe9b5860acb36": "pictures_991",
    "fe934b5dfefbf6f4": "pictures_992",
    "3c1dfb4b66365889": "pictures_993",
    "fa8b8c60a866bc65": "pictures_994",
    "f72a1630019ac37b": "pictures_995",
    "1a354d807a3c863b": "pictures_996",
    "ff52a03210b27c34": "pictures_997",
    "f3827670e1a0eab8": "pictures_998",
    "64f271c2a7dbaf63": "pictures_999",
    "58a511161137f0f2": "pictures_1000",
    "d0fdcf02c24f0a69": "pictures_1001",
    "c0d8f069184cb9a3": "pictures_1002",
    "b3d9d3ad883f2248": "pictures_1003",
    "366a1c141849b4e7": "pictures_1004",
    "3646262234e76d6b": "pictures_1005",
    "04d9d2f228cc0539": "pictures_1006", // "tv_1a"
    "a3bccb499e47b68e": "pictures_1007", // "tv_1b"
    "2bab77dfc3ca7d15": "pictures_1008", // "tv_2a"
    "91b682859f543183": "pictures_1009", // "Book"
    "357bc4b6fb86168e": "pictures_1010",
    "icon": "pictures_icon",

    // === Music (ME) ===
    "4fe5a3e14978bba6": "me_1",
    "d405da43ec0669c0": "me_2", // "kill_switch"

    // === Sound Effects (SE) ===
    "4927480862c30f3b": "se_1", // "item_got"
    "5aa70e50915bd7ad": "se_2", // "Wind5"
    "1d351c0ab5681031": "se_3", // "Key"
    "d0e18e78dc615508": "se_4", // "rustle"
    "41b1633ff75cba66": "se_5", // "Blow2"
    "46117eb2380afb81": "se_6", // "Door1"
    "cdf9ee20ed312175": "se_7", // "Crash"
    "3f55df3996a099e3": "se_8", // "statue"
    "20cb27ef60c8b250": "se_9", // "Open1"
    "1d869cca761d1f5b": "se_10", // "Sand"
    "dbe371e3fdd67bf4": "se_11",
    "7f6266a05d031a94": "se_12",
    "ec37304323499aab": "se_13", // "Water1"
    "c9d55115b9d0b6f9": "se_14", // "flush"
    "50ca3ee851312aa4": "se_15", // "Coin"
    "b3fc15b021e3c149": "se_16", // "Monster4"
    "735d49a50f0035d0": "se_17", // "Earth1"
    "62edfeeb6f00900e": "se_18", // "title_sting"
    "be5cde56452260ec": "se_19", // "Open4"
    "c1266f7aba56e843": "se_20", // "phone_disconnect"
    "9d86dfcb61613a37": "se_21", // "phone_clank"
    "3b7017b29acd17a2": "se_22", // "Switch2"
    "b12d6f9f4b9e1ca3": "se_23", // "knock"
    "90b3e9ebf8f919e5": "se_24", // "walkaway"
    "dc247e4f1a7a8f98": "se_25", // "Darkness3"
    "5982909527ac5860": "se_26",
    "03bcac3737f12e6b": "se_27", // "phone_ring"
    "74ea5e851fc15d23": "se_28", // "washingmachine"
    "c3a2ef1f7d840426": "se_29", // "blood_stab"
    "3b465a976e2823ee": "se_30", // "blood_b"
    "bcf151331223b851": "se_31", // "Close1"
    "fb7aee8c4eb079e3": "se_32", // "blingy_sp"
    "b97672d340e2da9c": "se_33", // "blood_a"
    "662e331644396903": "se_34", // "match"
    "ae7cc7dcfc1c1506": "se_35", // "ambulance"
    "75eda64e97d4c13a": "se_36", // "Transceiver"
    "c32c6a999dcc3fcf": "se_37", // "vinyl"
    "e4b12af62524a5fe": "se_38", // "confirm"
    "97bd49ca4170d542": "se_39", // "cardoor"
    "e3cd5a4b1a1e0890": "se_40", // "elevatordoor"
    "c44c4edbf7c90767": "se_41", // "bellding"
    "a5da3da2ae6ed664": "se_42",
    "e7ba7d67c89feb44": "se_43", // "carpull"
    "b1d996591fd54afe": "se_44", // "rustle_foliage"
    "5b3d77888976143e": "se_45", // "Run"
    "90ac01c5f49bde42": "se_46", // "bullet"
    "5a922ab0a1e52cad": "se_47", // "bullets"
    "8c2e9fe3db2227e6": "se_48", // "wood"
    "02b2ac88ec819d98": "se_49", // "curtain"
    "58e443f31a974fd0": "se_50", // "blade"
    "232221889c283071": "se_51", // "blender"
    "65c1e576d21efce7": "se_52", // "dig"
    "e9e21bdbb6892e29": "se_53",
    "1bf231bddc4a2083": "se_54",
    "34c4159bda097c78": "se_55", // "draw"
    "d6ed1157a201bd9e": "se_56",
    "4ef4c15bf90a0b1c": "se_57", // "axe"
    "64cf9328a37d37bd": "se_58", // "Heal2"
    "4eaf69352441868c": "se_59",
    "b5136fcb0987fd4d": "se_60",
    "7dd808ff989006e3": "se_61",
    "1b12df87d700b9de": "se_62",
    "2cc88d940d6f65df": "se_63",
    "65b8897cb0e998b2": "se_64", // "blingy"
    "201755faa2d12641": "se_65",
    "229ab081684616dc": "se_66",
    "b26e0849339bdaf0": "se_67",
    "5ce6fc5a596ddc3f": "se_68",
    "cb2a17c9188b66f0": "se_69",
    "73a2bdfa3b0feb0d": "se_70", // "spam"
    "6f74ae580cef73f5": "se_71",
    "74380a0d0e3c7c48": "se_72", // "curtain"
    "4cee1acde9c80ff6": "se_73",
    "c5c1bd2fb7a56bd5": "se_74",
    "e99b9a3350a587d3": "se_75",
    "45e50cc8a9de3bc3": "se_76", // "Fall"

    // === Character Faces ===
    // Andrew
    "aab510d75d377c95[BUST]": "andrew_1", // "b_rage"
    "fac0529f00ba4260[BUST]": "andrew_2", // "b_mad"
    "430dce743b60280b[BUST]": "andrew_3", // "b_neutral"
    "981f3499aa2de8cf[BUST]": "andrew_4", // "b_meh"
    "6e679186822ccbb6[BUST]": "andrew_5", // "b_ew"
    "c1db28987323d0ff[BUST]": "andrew_6", // "b_confused"
    "42f60877d70e2dc5[BUST]": "andrew_7", // "b_whatever"
    "e916b6077d0a55a7[BUST]": "andrew_8", // "b_happy"
    "ebb3e15de9e2290a[BUST]": "andrew_9", // "b_explainmad"
    "c3c06a25d0148015[BUST]": "andrew_10", // "b_explain"
    "0c3bc2b28fd40bd5[BUST]": "andrew_11", // "b_think"
    "59a369b906f40729[BUST]": "andrew_12", // "b_worry"
    "e661ee2b6c6d91bb[BUST]": "andrew_13", // "b_dafuq"
    "a07823d3c7c11d90[BUST]": "andrew_14", // "b_complain"
    "91f059f96fb4cfa5[BUST]": "andrew_15", // "b_jokey"
    "445e008172c38469[BUST]": "andrew_16", // "b_down"
    "8ddc89c3cb615d12[BUST]": "andrew_17", // "b_facepalm"
    "13f4016ef5adb049[BUST]": "andrew_18", // "b_miffed"
    "eeca6592570c9bc1[BUST]": "andrew_19", // "b_sad"
    "e0ccc3cbcc969e3d[BUST]": "andrew_20", // "b_hurt"
    "26ad954a3c682216[BUST]": "andrew_21", // "b_biteself"
    "497768a7223062f4[BUST]": "andrew_22", // "b_dunno"
    "055fadd1e988e294[BUST]": "andrew_23", // "b_laugh"
    "21cdec2bd5770afb[BUST]": "andrew_24", // "b_dontlaugh"
    "6e7f9eb8af298b49[BUST]": "andrew_25", // "b_sigh"
    "6c40e35fcdd385a9[BUST]": "andrew_26", // "b_talk"
    "c36e0d860f3b8181[BUST]": "andrew_27", // "b_smile"
    "7c09d7bc863abaa9[BUST]": "andrew_28", // "b_shrug"
    "1b066ce464b20bb9[BUST]": "andrew_29", // "b_ha"
    "e5801d39b1c69345[BUST]": "andrew_30", // "b_hideface"
    "81a5cbf17dd6188c[BUST]": "andrew_31", // "b_ohshit"
    "1769c57883615362[BUST]": "andrew_32", // "b_glad"
    "3d334c49651f5e06[BUST]": "andrew_33", // "b_flustered"
    "a06ed77c270e2ea9[BUST]": "andrew_34", // "b_content"
    "5d9091f104d61cc9[BUST]": "andrew_35", // "b_yikes"
    "e766d9f4addb4658[BUST]": "andrew_36", // "b_fakesmile"
    "753297ef0a284c16[BUST]": "andrew_37", // "b_proud"
    "c5e3a9e48fd1f935[BUST]": "andrew_38", // "b_no"
    "c009bc7a7dd26836[BUST]": "andrew_39", // "b_fakelaugh"
    "876bcf957d243047[BUST]": "andrew_40", // "b_awkward"
    "354e1ea88b10adcf[BUST]": "andrew_41", // "b_waver"
    "79e075379de28396[BUST]": "andrew_42", // "b_embarrassed"
    "b20793f18d045058[BUST]": "andrew_43",
    "4e784a5be4bdb88c[BUST]": "andrew_44",
    "ccf7227a5b03322e[BUST]": "andrew_45",
    "e8c20881c242e7f0[BUST]": "andrew_46", // "b_ahh"
    "e8f566fed4b4eb43[BUST]": "andrew_47", // "b_pleased"
    "8e2bc6b9fc424e94[BUST]": "andrew_48",
    "cfd3ddb745a3194d[BUST]": "andrew_49",
    "daa152645f4d50d2[BUST]": "andrew_50",
    "205f74322e5b9a00[BUST]": "andrew_51",
    "bca6a552a4bb9ed2[BUST]": "andrew_52",
    "a99875a51c9a745c[BUST]": "andrew_53",
    "604fed9d025e2283[BUST]": "andrew_54",
    "89b94fa93ec18a6f[BUST]": "andrew_55",
    "81dd853c60358d53[BUST]": "andrew_56",
    "9926e4981d898aa0[BUST]": "andrew_57",
    "53bc95b1392ab334[BUST]": "andrew_58",
    "31731470b57f4dff[BUST]": "andrew_59",
    "3cdcebeabfb8cbc1[BUST]": "andrew_60",
    "624c543d26b59444[BUST]": "andrew_61",
    // Andy
    "e420d45fcd6e1da8[BUST]": "andy_1", // "bk_oh"
    "a362bdabdb2c271c[BUST]": "andy_2", // "bk_ew"
    "4375a729ef4fb298[BUST]": "andy_3", // "bk_laugh"
    "bfc94df8736b590c[BUST]": "andy_4", // "bk_hm"
    "6350819bd94f808b[BUST]": "andy_5", // "bk_neutral"
    "461fe27b72aafc2d[BUST]": "andy_6", // "bk_lookaway"
    "811af155451a1de1[BUST]": "andy_7", // "bk_unsure"
    "bb9b26e24462d5ac[BUST]": "andy_8", // "bk_no"
    "509daea01f1551c3[BUST]": "andy_9", // "bk_sad"
    "67b516c5d0cd3bb2[BUST]": "andy_10", // "bk_sigh"
    "f1b5920634d60dd0[BUST]": "andy_11", // "bk_complain"
    "64c68af566b4171d[BUST]": "andy_12", // "bk_tch"
    "07c4d5e4f2b41ff9[BUST]": "andy_13", // "bk_ticked"
    "5e5f280b7837bff2[BUST]": "andy_14", // "bk_smile"
    "e90da16bf9bc9b57[BUST]": "andy_15", // "bk_hah"
    "16c6483381d9fd6c[BUST]": "andy_16", // "bk2_neutral"
    "6fdeca932545448b[BUST]": "andy_17", // "bk2_tch"
    "f0e4b300e65d1d88[BUST]": "andy_18", // "bk2_ticked"
    "2398bbc219babdae[BUST]": "andy_19", // "bk2_hah"
    "37fea558728d7e66[BUST]": "andy_20",
    "5e3af9d7a4a69a25[BUST]": "andy_21",
    "bb691307e2e16c20[BUST]": "andy_22",
    "9567c539d89b85c7[BUST]": "andy_23",
    "64016ec4e0c68f08[BUST]": "andy_24",
    // Andrew Teen
    "b085875ddb694717[BUST]": "andrew-teen_1",
    "cfb9af84e0b812df[BUST]": "andrew-teen_2",
    "ce990ac420765d93[BUST]": "andrew-teen_3",
    "46e7fa7d01d1393b[BUST]": "andrew-teen_4",
    "f68101a55666c7c9[BUST]": "andrew-teen_5",
    "23b36e5ad7b7af1e[BUST]": "andrew-teen_6",
    "25334c7fee1e5c7e[BUST]": "andrew-teen_7",
    "09793d32c3ffdf06[BUST]": "andrew-teen_8",
    "1608e6cb9e94f3d1[BUST]": "andrew-teen_9",
    "9b5ea46ee60eb512[BUST]": "andrew-teen_10",
    "716c5c8b3e8c290b[BUST]": "andrew-teen_11",
    "83024d4a8fb5dc47[BUST]": "andrew-teen_12",
    "bbaccc73d5ef59b2[BUST]": "andrew-teen_13",
    "282d4231c782db99[BUST]": "andrew-teen_14",
    "95f9ce689a6e95a5[BUST]": "andrew-teen_15",
    "2e3764986eccdc31[BUST]": "andrew-teen_16",
    "2a04cec0afb301c9[BUST]": "andrew-teen_17",
    "03ee0c0b40f09abf[BUST]": "andrew-teen_18",
    "485cc419c9afda34[BUST]": "andrew-teen_19",
    "d5b896500b0e7fc3[BUST]": "andrew-teen_20",
    "ed6eb9a5da1be90a[BUST]": "andrew-teen_21",
    "6dc12ed274ed5671[BUST]": "andrew-teen_22",
    "4cd2b96523e34e87[BUST]": "andrew-teen_23",
    "604b17a2703f37b3[BUST]": "andrew-teen_24",
    "4cbb58d081baab1f[BUST]": "andrew-teen_25",
    // Ashley
    "2c8a1aebfb8aaefd[BUST]": "ashley_1", // "s_pout"
    "fa9d6515f3420752[BUST]": "ashley_2",
    "44351a1098b789cf[BUST]": "ashley_3", // "s_hmm"
    "9923dea2f268e189[BUST]": "ashley_4",
    "5a9d0bfde3ef03ac[BUST]": "ashley_5", // "s_hurt"
    "8ddec347597efe19[BUST]": "ashley_6",
    "e2a83a6e23e670e2[BUST]": "ashley_7", // "s_curse"
    "9eae4abfe82d5cc2[BUST]": "ashley_8", // "s_cry"
    "9baea3a9ab3cbc09[BUST]": "ashley_9", // "s_weak"
    "f4ceb145497fdb82[BUST]": "ashley_10", // "s_ughh"
    "405c672f8a34f278[BUST]": "ashley_11", // "s_sigh"
    "a7950ad2d17854d6[BUST]": "ashley_12", // "s_fight"
    "b2c75e3097e9fdd4[BUST]": "ashley_13", // "s_sad"
    "38b82c55b3529488[BUST]": "ashley_14", // "s_meh"
    "d2aff806dd5f1315[BUST]": "ashley_15", // "s_irritated"
    "33b36b3ce42250e3[BUST]": "ashley_16", // "s_yell"
    "7bf9e1a7b3fc961a[BUST]": "ashley_17", // "s_tch"
    "00dfc02ea4ecdd77[BUST]": "ashley_18", // "s_chat"
    "bc3f6c4a78c37314[BUST]": "ashley_19", // "s_proud"
    "f8ccc4fd95bdf333[BUST]": "ashley_20", // "s_angry"
    "52ab7d6508f87817[BUST]": "ashley_21", // "s_challenge"
    "2980a89460122a18[BUST]": "ashley_22", // "s_terror"
    "d730436f2a2b31a5[BUST]": "ashley_23", // "s_think"
    "eea509ea4222d93c[BUST]": "ashley_24", // "s_ugh"
    "34b15f34f103954d[BUST]": "ashley_25", // "s_mock"
    "f3e25bcfc5cece64[BUST]": "ashley_26", // "s_heh"
    "c61a4be244711b5a[BUST]": "ashley_27", // "s_smile"
    "ad0e943304f54e8f[BUST]": "ashley_28", // "s_boo"
    "e220be5e529b4aa8[BUST]": "ashley_29", // "s_laugh"
    "203389fa11d5765b[BUST]": "ashley_30", // "s_hm"
    "d37472883faddde9[BUST]": "ashley_31", // "s_glad"
    "f4b314fa0ba665de[BUST]": "ashley_32", // "s_oops"
    "8437c57e159caae7[BUST]": "ashley_33", // "s_gentle"
    "e7c5a0a6db58c44d[BUST]": "ashley_34", // "s_excited"
    "66227cb1c01fc3ac[BUST]": "ashley_35", // "s_surprise"
    "f5a6c0be6d0d88cb[BUST]": "ashley_36", // "s_hmph"
    "386634445489561c[BUST]": "ashley_37", // "s_gasp"
    "3939c67fcca7d3cd[BUST]": "ashley_38", // "s_unsuresmile"
    "c11b453247f56d9b[BUST]": "ashley_39", // "s_scream"
    "1874d0a2239d9cce[BUST]": "ashley_40", // "s_huhu"
    "95f634c750ffbc3d[BUST]": "ashley_41", // "s_lol"
    "a550405ba339792e[BUST]": "ashley_42", // "s_content"
    "88ac88061d8c0a77[BUST]": "ashley_43", // "s_ooh"
    "ea3a2dd5fc64d746[BUST]": "ashley_44", // "s_lying"
    "763c013480a12595[BUST]": "ashley_45", // "s_fearful"
    "40a8c4ec2bed7afa[BUST]": "ashley_46",
    "e5054dfd398cce74[BUST]": "ashley_47",
    "06ac8752843ce979[BUST]": "ashley_48",
    "ad7252b84b245d6b[BUST]": "ashley_49",
    "f15673f84838d247[BUST]": "ashley_50",
    "342128b8b9453ee2[BUST]": "ashley_51", // "s_no"
    "f5d0b4d0d9c48cb5[BUST]": "ashley_52",
    "03db74dbd50e6c82[BUST]": "ashley_53",
    "edc59a797608e379[BUST]": "ashley_54",
    "727a2aba4b80b348[BUST]": "ashley_55",
    // Leyley
    "0ff2357cb019f30f[BUST]": "leyley_1", // "sk_meh"
    "d292115d110ba256[BUST]": "leyley_2", // "sk_miffed"
    "9b376d2c46d93600[BUST]": "leyley_3", // "sk_hmph"
    "92eba4bf2cf93504[BUST]": "leyley_4", // "sk_grin"
    "bc6066f175ccc4a8[BUST]": "leyley_5", // "sk_happy"
    "f77b18612c778153[BUST]": "leyley_6", // "sk_mad"
    "030f5a31d6b13bfe[BUST]": "leyley_7", // "sk_sure"
    "fc5f2b642f1b51fc[BUST]": "leyley_8", // "sk_heh"
    "fdde49dabf17aac3[BUST]": "leyley_9", // "sk_sad"
    "1e8f066521628861[BUST]": "leyley_10", // "sk_teary"
    "6c228cee76f5f8f3[BUST]": "leyley_11", // "sk_bawl"
    "6216bcbbc123fefb[BUST]": "leyley_12", // "sk_mock"
    "662bb85ea0fc55c7[BUST]": "leyley_13", // "sk_down"
    "ae79049cfef26bab[BUST]": "leyley_14", // "sk_surprise"
    "eb9a50fd8b6847f3[BUST]": "leyley_15",
    "63fc8e6752a45207[BUST]": "leyley_16",
    "cf4bed6921eb7961[BUST]": "leyley_17",
    // Ashley Teen
    "cec38f20835c0e69[BUST]": "ashley-teen_1",
    "6640749e62f598b6[BUST]": "ashley-teen_2",
    "c00bdb233a1b64f1[BUST]": "ashley-teen_3",
    "b0c3a30c76e75a6c[BUST]": "ashley-teen_4",
    "569e165d5768cbd5[BUST]": "ashley-teen_5",
    "6534077e7230481d[BUST]": "ashley-teen_6",
    "664d39c172dbee81[BUST]": "ashley-teen_7",
    "601b0d7fca049c35[BUST]": "ashley-teen_8",
    "ad75ed79e43315e0[BUST]": "ashley-teen_9",
    "a46f5838e1c6a19b[BUST]": "ashley-teen_10",
    "16f096ec8e06802a[BUST]": "ashley-teen_11",
    "bc20165e2c324dd8[BUST]": "ashley-teen_12",
    "298c7452f21be209[BUST]": "ashley-teen_13",
    "a71ddee6a980cefb[BUST]": "ashley-teen_14",
    "e72661b4fda524e2[BUST]": "ashley-teen_15",
    "5fb91740171a6c36[BUST]": "ashley-teen_16",
    "fc2d7013fe45e5e6[BUST]": "ashley-teen_17",
    "1432f1faf876896f[BUST]": "ashley-teen_18",
    "6a0ee1a1db866e82[BUST]": "ashley-teen_19",
    "79ccdd9b0a368d73[BUST]": "ashley-teen_20",
    "2d3bae977f86b7f9[BUST]": "ashley-teen_21",
    // Ashley Teen Dressed Like Julia
    "4c2db291666799fb[BUST]": "ashley-teen dressed like Julia_1",
    // Julia
    "1e3a51217b562269[BUST]": "julia_1", // "j_unsure"
    "cc89c8075ae4d373[BUST]": "julia_2", // "j_down"
    "34ea74005c0f204b[BUST]": "julia_3", // "j_worry"
    "af79315fac2779c5[BUST]": "julia_4", // "j_nervous"
    "b17739277151ed42[BUST]": "julia_5", // "j_hopeful"
    "5ece62cb9519ef22[BUST]": "julia_6", // "j_shy"
    "fe3b2d03972b9d09[BUST]": "julia_7", // "j_ack"
    "e6d48e341fedec6e[BUST]": "julia_8", // "j_upset"
    "529f4e751c008c83[BUST]": "julia_9", // "j_angry"
    "8041c50ad7e45723[BUST]": "julia_10", // "j_ha"
    "b5b240f53c5866dd[BUST]": "julia_11",
    "2aa4006a62c6e812[BUST]": "julia_12",
    "7c8e9c74d42220a4[BUST]": "julia_13",
    "7ae1f592777bfd79[BUST]": "julia_14",
    "6d1efb6836778f9e[BUST]": "julia_15",
    // Julia Teen
    "7948c59dea10a1ed[BUST]": "julia-teen_1",
    "1d8e44e184e71bc5[BUST]": "julia-teen_2",
    "340bde331a8582f9[BUST]": "julia-teen_3",
    "5b36009f3ad3a746[BUST]": "julia-teen_4",
    "c1f4f65881ce6704[BUST]": "julia-teen_5",
    "68e0bffba39c4091[BUST]": "julia-teen_6",
    "d792b1c2bae10577[BUST]": "julia-teen_7",
    "adc0bb14ca3a2e9f[BUST]": "julia-teen_8",
    "fa8dc338bf3f3238[BUST]": "julia-teen_9",
    "52f35504af77cd3e[BUST]": "julia-teen_10",
    "99409e387ecf0da1[BUST]": "julia-teen_11",
    "1e01be8b0d328cd4[BUST]": "julia-teen_12",
    "5636445087b9ec48[BUST]": "julia-teen_13",
    "27548fbdd5ae83aa[BUST]": "julia-teen_14",
    "8d7b21ba9d3b819f[BUST]": "julia-teen_15",
    "6f699ae0dd845ef4[BUST]": "julia-teen_16",
    "bf2313cfb0705987[BUST]": "julia-teen_17",
    // Renee
    "3f2489dd8ec5d66f[BUST]": "renee_1", // "m_surprise"
    "2ae48d0c43fdb6c4[BUST]": "renee_2", // "m_no"
    "7fc1078ba047c4ea[BUST]": "renee_3", // "m_unsure"
    "a93ff69f791aa5d6[BUST]": "renee_4", // "m_down"
    "e35383f4cdc7e871[BUST]": "renee_5", // "m_err"
    "b33bc03f2ad5e20b[BUST]": "renee_6", // "m_hmph"
    "0d2a6f655dd55623[BUST]": "renee_7", // "m_sigh"
    "5a158fcf146a6865[BUST]": "renee_8", // "m_meh"
    "2b1777991e8bb9e4[BUST]": "renee_9", // "m_um"
    "aa5fd8605df1ad76[BUST]": "renee_10", // "m_ticked"
    "2ba46025d0765d16[BUST]": "renee_11", // "m_angry"
    "2727e2aa2b4fb4e2[BUST]": "renee_12", // "m_yell"
    "67bb69763f5faa65[BUST]": "renee_13", // "m_oops"
    "cc2dba2870d017aa[BUST]": "renee_14", // "m_mock"
    "9befb3aae9db49f5[BUST]": "renee_15", // "m_smile"
    "bb383b4ee18466c0[BUST]": "renee_16", // "m_excited"
    "eab23757ff9b84f6[BUST]": "renee_17", // "m_laugh"
    "956af808485c6c9d[BUST]": "renee_18", // "m_proud"
    "74e30d16a2e8e181[BUST]": "renee_19", // "m_pain"
    "6ee8d46a57ea59bd[BUST]": "renee_20", // "m_reassure"
    // Renee Past
    "d96e4af55ed93307[BUST]": "renee-past_1",
    "934467ac44ed7a73[BUST]": "renee-past_2",
    "174c21dd27e5a948[BUST]": "renee-past_3",
    "ad4e3cae5fc1bd0e[BUST]": "renee-past_4",
    "ce1387450cd382e0[BUST]": "renee-past_5",
    "17ef37dd59d1b962[BUST]": "renee-past_6",
    "8c0d2c8a6b9284ec[BUST]": "renee-past_7",
    "bd26a98569fb1781[BUST]": "renee-past_8",
    "ff41cd62d71cece6[BUST]": "renee-past_9",
    // Renee Dark
    "ff132e604a36eb9b[BUST]": "renee-dark_1",
    "683da6143078f363[BUST]": "renee-dark_2",
    "64619a947edc6937[BUST]": "renee-dark_3",
    "ba7518e41232a49f[BUST]": "renee-dark_4",
    "f52813d6f256035a[BUST]": "renee-dark_5",
    "7262161d2fc74581[BUST]": "renee-dark_6",
    "c4bae99fbff38529[BUST]": "renee-dark_7",
    "97f65da36d837d12[BUST]": "renee-dark_8",
    // Lady
    "13e20e002213585a[BUST]": "lady_1", // "lady_yell"
    "88cb376695bcb4e4[BUST]": "lady_2", // "lady_miffed"
    "5ebe1753cdf53711[BUST]": "lady_3", // "lady_happy"
    "4cd6959a2d2a1cde[BUST]": "lady_4", // "lady_heh"
    "310c389045f271fa[BUST]": "lady_5", // "lady_worry"
    "6d8bb99f09d81fcf[BUST]": "lady_6", // "lady_nervous"
    "d5fc810c3e11abaa[BUST]": "lady_7", // "lady_fear"
    "1db0e19ceaf9336a[BUST]": "lady_8", // "lady_laugh"
    // Hag
    "7e825b94b6fa1aba[BUST]": "hag_1",
    "cd81070e4d7d8e73[BUST]": "hag_2",
    "8f6d1f8416384c55[BUST]": "hag_3",
    "d193832758750d96[BUST]": "hag_4",
    // Grandpa
    "711bd3e857e19397[BUST]": "grandpa_1",
    "4b7f8641389c59b1[BUST]": "grandpa_2",
    "39bc27a87dcd41da[BUST]": "grandpa_3",
    "4e84a6d68fb4246b[BUST]": "grandpa_4",
    "56ca9b09a2165970[BUST]": "grandpa_5",
    // Surgeon
    "9b83d67be56fe371[BUST]": "surgeon_1",
    "1f2bc74af712b1f5[BUST]": "surgeon_2",
    "bd3cd4ad4dac4646[BUST]": "surgeon_3",
    "f3cad8f30bb70a6e[BUST]": "surgeon_4",
    "5d879d360f11a6fc[BUST]": "surgeon_5",
    "63aa4701de7bcb14[BUST]": "surgeon_6",
    "65e0d6fda5bc6e55[BUST]": "surgeon_7",
    "6119cd53323c514d[BUST]": "surgeon_8",
    // Grandma
    "f7b4e9088a76aa59[BUST]": "grandma_1",
    "e819af01d97e07aa[BUST]": "grandma_2",
    "b1f5ad5ee7f5a3e1[BUST]": "grandma_3",
    "840fe983bd335aff[BUST]": "grandma_4",
    // Cultists
    "27b37c9e5260d10a[BUST]": "cultists_1",
    "312176cded7ea29a[BUST]": "cultists_2",
    "c15cedb1482a9322[BUST]": "cultists_3",
    "7cfd3e1e074ac100[BUST]": "cultists_4",
    "73296c5a9e48dbac[BUST]": "cultists_5",
    "5c0de546932196d7[BUST]": "cultists_6",
    "95a2d8956cd8bb0c[BUST]": "cultists_7",
    "b82f4b2496711d64[BUST]": "cultists_8",
    "a6d87c6c76e65728[BUST]": "cultists_9",
    "c35073b032a3c6d0[BUST]": "cultists_10", // "l_think.png"
    "1c0e4a32dc419f8f[BUST]": "cultists_11", // "l_joy"
    "3007f0661581f042[BUST]": "cultists_12", // "l_tch"
    "65f2e14e351b4a83[BUST]": "cultists_13", // "l_say"
    "e666313c86218fa9[BUST]": "cultists_14", // "l_talk"
    "547ad6e645df21e6[BUST]": "cultists_15", // "l_serious"
    "a458507afaad4a80[BUST]": "cultists_16",
    "4ad5c79308848404[BUST]": "cultists_17",
    "1851402ae776064f[BUST]": "cultists_18",
    "d6393d8110ad1baf[BUST]": "cultists_19",
    "faddb17374ff3fca[BUST]": "cultists_20",
    "de866fb82238a913[BUST]": "cultists_21",
    "2ce560475cc7a0eb[BUST]": "cultists_22",
    // Surgeon Past
    "855cb67c67b878ca[BUST]": "surgeon-past_1",
    "251ad35650e18afc[BUST]": "surgeon-past_2",
    "af44f998968e60ca[BUST]": "surgeon-past_3",
    "be4bde86728951de[BUST]": "surgeon-past_4",
    "430fa5527be5de36[BUST]": "surgeon-past_5",
    "b69bf8e460f62646[BUST]": "surgeon-past_6",
    // Nina
    "f6fd31df044c8cf2[BUST]": "nina_1", // "_surprise"
    "3632263d132ff793[BUST]": "nina_2", // "_smile"
    "21dadfaf3a04d110[BUST]": "nina_3", // "_unsure"
    "c8be5940c674f3ce[BUST]": "nina_4", // "_sad"
    "bdeff333a01dc5ac[BUST]": "nina_5", // "_happy"
    // Effects
    "ef6069d3eec1571e[BUST]": "effects_1",
    "d53f6b32ea8a5fd7[BUST]": "effects_2",
    "80e4f732721d90c5[BUST]": "effects_3",
    "cda139c6785260cb[BUST]": "effects_4",
    "3acff77b6ebd0ef6[BUST]": "effects_5",
    "e38496e526eb339c[BUST]": "effects_6",
    "6a4ee882cf09490d[BUST]": "effects_7",
    "d62aade4ab783891[BUST]": "effects_8",
    "ae7c04796aef9fe2[BUST]": "effects_9",
    "eaa3476967ad4fe7[BUST]": "effects_10",
    "2e9e80463252b2b3[BUST]": "effects_11",
    "5ceaa5f530967bba[BUST]": "effects_12",
    "85d55dd94eb20928[BUST]": "effects_13",
    "01abb8e1a27d953f[BUST]": "effects_14",
    // Douglas Past
    "f031204dce7d2bc8[BUST]": "douglas-past_1",
    "967327be50ce2306[BUST]": "douglas-past_2",
    "5449ddc9d0362811[BUST]": "douglas-past_3",
    "bf306e27c40aef4f[BUST]": "douglas-past_4",
    "19d3042f8f71615f[BUST]": "douglas-past_5",
    // Nurse
    "012da39538261341[BUST]": "nurse_1",
    "b7b5fcc6243285fc[BUST]": "nurse_2",

    // === Other (unchanged) ===
    "5adf3c7054e7a170": "phone_ringing_2",
    "2e9eb391c7d1e1d3": "neon_lights_buzz_2", // "buzz"
    "e8d807029008351e": "clock_ticking_2", // "ticktock"
    "baac72688d801cdc": "outside_noise_2", // "balcony"
    "80a2a8224d4844a6": "pastel_virus", // "pastelvirus"
    "c30bc7904f060edd": "after_school_sleeping",
    "2290fcbb4f40bd2b": "clock_ticking", // "ticktock"
    "47775190cf07bc35": "cloud_chiptune", // "03myuu_Cloud_Chiptune"
    "8fb50079baf1325c": "club", // "club"
    "Credits": "credits",
    "3cd2b03a72845cc1": "cultist_inside", // "cultist_inside"
    "5c41d5d8c96cc2c2": "cultist_outside", // "cultist_outside"
    "3664421a97b66ab8": "cupid", // "sh_cupid"
    "7c1ae5440068d7f5": "curiosity_capsule_girl",
    "5636a26654b27bd4": "dark_bells", // "bells_dark"
    "2aadb6490fe41eb3": "dream_dance", // "dream_dance"
    "5be310a5b00d2ed3": "dreaming_injection", // "dreaming_injection"
    "195abd8ff1ce3e0b": "end_story", // "musicbox_blingy"
    "57729d2c94559e55": "fire", // "fireplace"
    "7738131ecf913420": "forest", // "forest"
    "5c098cf75f7ad0a7": "guard_tree", // "guard tree"
    "6d566c93c74c14fc": "halloween_chiptune", // "08myuu_Halloween_Chiptune"
    "bd130be1fc2ae367": "hallucination_connect", // "hallucination_connect"
    "a69ceb49e11dedac": "jealous_doll", // "jealous_doll"
    "ecef72663ba32460": "jester's_pity", // "jesters_pity"
    "9c7050ae76645487": "labels",
    "a0c2b4248fd4b6cd": "melancholy_memory",
    "efbb528a5d3f4246": "neon_lights_buzz", // "buzz"
    "bcf67e40f150611d": "old_fairy_tales", // "oldfairytales"
    "a335333229af2006": "outside_noise",
    "6fe44b4ee048be76": "pandora_syndrome", // "pandorasyndrome"
    "5eaeeb56b517b4de": "snail_eyes", // "snaileyes"
    "31be20bb120f5c51": "phone_ringing",
    "25b43fbc90c1d97c": "picture_book", // "picture_book"
    "f4b41d4b05a86dec": "pictures_1011", // "black"
    "0f248cf67bab1f6c": "secret_rooms", // "secretrooms"
    "926c1f1ca58f0c1f": "sheep_sway", // "sheep_sway"
    "3b42c57a438aa80a": "silly_intro", // "silly_intro"
    "f2d2d91ea3077367": "small_magic_book", // "smallmagicbook"
    "3d2b3928e7b73822": "altar_lamb", // "altarlamb"
    "c257c15680b1ddee": "spooky_spells",
    "5aeca43b0d06d9df": "teddybear", // "teddybear"
    "bfe1f2ddce1fa1a8": "the_clock_is_ticking",
    "4f69d90a5fe15f23": "twisted_clowns", // "twisted_clowns"
    "313d5ade731cde57": "unlock", // "title_sting"
    "663fd1980316d25b": "wandering_wizard", // "wandering_wizard"
};

// Filenames in last unencrypted game version (before the Cry about it update)
const hashToFilename = {
    // audio/bgm (.ogg)
    "47775190cf07bc35": "03myuu_Cloud_Chiptune",
    "6d566c93c74c14fc": "08myuu_Halloween_Chiptune",
    "3d2b3928e7b73822": "altarlamb",
    "5636a26654b27bd4": "bells_dark",
    "efbb528a5d3f4246": "buzz",
    "8fb50079baf1325c": "club",
    "3cd2b03a72845cc1": "cultist_inside",
    "5c41d5d8c96cc2c2": "cultist_outside",
    "2aadb6490fe41eb3": "dream_dance",
    "5be310a5b00d2ed3": "dreaming_injection",
    "7738131ecf913420": "forest",
    "5c098cf75f7ad0a7": "guard tree",
    "bd130be1fc2ae367": "hallucination_connect",
    "a69ceb49e11dedac": "jealous_doll",
    "ecef72663ba32460": "jesters_pity",
    "bcf67e40f150611d": "oldfairytales",
    "6fe44b4ee048be76": "pandorasyndrome",
    "80a2a8224d4844a6": "pastelvirus",
    "25b43fbc90c1d97c": "picture_book",
    "0f248cf67bab1f6c": "secretrooms",
    "3664421a97b66ab8": "sh_cupid",
    "926c1f1ca58f0c1f": "sheep_sway",
    "f2d2d91ea3077367": "smallmagicbook",
    "4f69d90a5fe15f23": "twisted_clowns",
    "5aeca43b0d06d9df": "teddybear",
    "2290fcbb4f40bd2b": "ticktock",
    "5eaeeb56b517b4de": "snailseyes",
    "663fd1980316d25b": "wandering_wizard",

    // audio/bgs (.ogg)
    "baac72688d801cdc": "balcony",
    "2e9eb391c7d1e1d3": "buzz",
    "57729d2c94559e55": "fireplace",
    "e8d807029008351e": "ticktock",

    // audio/me (.ogg)
    "d405da43ec0669c0": "kill_switch",
    "195abd8ff1ce3e0b": "musicbox_blingy",
    "3b42c57a438aa80a": "silly_intro",
    "313d5ade731cde57": "title_sting",

    // audio/se (.ogg)
    "41b1633ff75cba66": "Blow2",
    "bcf151331223b851": "Close1",
    "50ca3ee851312aa4": "Coin",
    "cdf9ee20ed312175": "Crash",
    "dc247e4f1a7a8f98": "Darkness3",
    "46117eb2380afb81": "Door1",
    "735d49a50f0035d0": "Earth1",
    "45e50cc8a9de3bc3": "Fall",
    "64cf9328a37d37bd": "Heal2",
    "1d351c0ab5681031": "Key",
    "b3fc15b021e3c149": "Monster4",
    "20cb27ef60c8b250": "Open1",
    "be5cde56452260ec": "Open4",
    "5b3d77888976143e": "Run",
    "1d869cca761d1f5b": "Sand",
    "3b7017b29acd17a2": "Switch2",
    "75eda64e97d4c13a": "Transceiver",
    "ec37304323499aab": "Water1",
    "5aa70e50915bd7ad": "Wind5",
    "ae7cc7dcfc1c1506": "ambulance",
    "4ef4c15bf90a0b1c": "axe",
    "c44c4edbf7c90767": "bellding",
    "58e443f31a974fd0": "blade",
    "232221889c283071": "blender",
    "65b8897cb0e998b2": "blingy",
    "fb7aee8c4eb079e3": "blingy_sp",
    "b97672d340e2da9c": "blood_a",
    "3b465a976e2823ee": "blood_b",
    "c3a2ef1f7d840426": "blood_stab",
    "90ac01c5f49bde42": "bullet",
    "5a922ab0a1e52cad": "bullets",
    "97bd49ca4170d542": "cardoor",
    "e7ba7d67c89feb44": "carpull",
    "e4b12af62524a5fe": "confirm",
    "02b2ac88ec819d98": "curtain",
    "65c1e576d21efce7": "dig",
    "34c4159bda097c78": "draw",
    "e3cd5a4b1a1e0890": "elevatordoor",
    "c9d55115b9d0b6f9": "flush",
    "4927480862c30f3b": "item_got",
    "b12d6f9f4b9e1ca3": "knock",
    "662e331644396903": "match",
    "9d86dfcb61613a37": "phone_clank",
    "c1266f7aba56e843": "phone_disconnect",
    "03bcac3737f12e6b": "phone_ring",
    "d0e18e78dc615508": "rustle",
    "b1d996591fd54afe": "rustle_foliage",
    "73a2bdfa3b0feb0d": "spam",
    "3f55df3996a099e3": "statue",
    "62edfeeb6f00900e": "title_sting",
    "c32c6a999dcc3fcf": "vinyl",
    "90b3e9ebf8f919e5": "walkaway",
    "74ea5e851fc15d23": "washingmachine",
    "8c2e9fe3db2227e6": "wood",

    // img/characters (.png)
    "!2f9b8afe4feed70f": "!Other1",
    "!11544aa3c9d9c1d0": "!Other2",
    "!8dd72fe14c4dfc98": "!Other3",
    "!bb8d49d8f3d6ea56": "!Other4",
    "7d7d5b7fb68621e6": "Actor1",
    "05a60f9a9844fd78": "Actor2",
    "24b75a8f0c4d2590": "Actor3",
    "2a6a9ef435715ef2": "Actor4",
    "70aea8d2df30f33a": "Actor5",
    "!b0d3c1937367e615": "Actor6",

    // img/faces (.png)
    "bdeff333a01dc5ac[BUST]": "_happy",
    "c8be5940c674f3ce[BUST]": "_sad",
    "3632263d132ff793[BUST]": "_smile",
    "f6fd31df044c8cf2[BUST]": "_surprise",
    "21dadfaf3a04d110[BUST]": "_unsure",
    "e8c20881c242e7f0[BUST]": "b_ahh",
    "876bcf957d243047[BUST]": "b_awkward",
    "26ad954a3c682216[BUST]": "b_biteself",
    "a07823d3c7c11d90[BUST]": "b_complain",
    "c1db28987323d0ff[BUST]": "b_confused",
    "a06ed77c270e2ea9[BUST]": "b_content",
    "e661ee2b6c6d91bb[BUST]": "b_dafuq",
    "21cdec2bd5770afb[BUST]": "b_dontlaugh",
    "445e008172c38469[BUST]": "b_down",
    "497768a7223062f4[BUST]": "b_dunno",
    "79e075379de28396[BUST]": "b_embarrassed",
    "6e679186822ccbb6[BUST]": "b_ew",
    "c3c06a25d0148015[BUST]": "b_explain",
    "ebb3e15de9e2290a[BUST]": "b_explainmad",
    "8ddc89c3cb615d12[BUST]": "b_facepalm",
    "c009bc7a7dd26836[BUST]": "b_fakelaugh",
    "e766d9f4addb4658[BUST]": "b_fakesmile",
    "3d334c49651f5e06[BUST]": "b_flustered",
    "1769c57883615362[BUST]": "b_glad",
    "1b066ce464b20bb9[BUST]": "b_ha",
    "e916b6077d0a55a7[BUST]": "b_happy",
    "e5801d39b1c69345[BUST]": "b_hideface",
    "e0ccc3cbcc969e3d[BUST]": "b_hurt",
    "91f059f96fb4cfa5[BUST]": "b_jokey",
    "055fadd1e988e294[BUST]": "b_laugh",
    "fac0529f00ba4260[BUST]": "b_mad",
    "981f3499aa2de8cf[BUST]": "b_meh",
    "13f4016ef5adb049[BUST]": "b_miffed",
    "430dce743b60280b[BUST]": "b_neutral",
    "c5e3a9e48fd1f935[BUST]": "b_no",
    "81a5cbf17dd6188c[BUST]": "b_ohshit",
    "e8f566fed4b4eb43[BUST]": "b_pleased",
    "753297ef0a284c16[BUST]": "b_proud",
    "aab510d75d377c95[BUST]": "b_rage",
    "eeca6592570c9bc1[BUST]": "b_sad",
    "7c09d7bc863abaa9[BUST]": "b_shrug",
    "6e7f9eb8af298b49[BUST]": "b_sigh",
    "c36e0d860f3b8181[BUST]": "b_smile",
    "6c40e35fcdd385a9[BUST]": "b_talk",
    "0c3bc2b28fd40bd5[BUST]": "b_think",
    "354e1ea88b10adcf[BUST]": "b_waver",
    "42f60877d70e2dc5[BUST]": "b_whatever",
    "59a369b906f40729[BUST]": "b_worry",
    "5d9091f104d61cc9[BUST]": "b_yikes",
    "2398bbc219babdae[BUST]": "bk2_hah",
    "16c6483381d9fd6c[BUST]": "bk2_neutral",
    "6fdeca932545448b[BUST]": "bk2_tch",
    "f0e4b300e65d1d88[BUST]": "bk2_ticked",
    "f1b5920634d60dd0[BUST]": "bk_complain",
    "a362bdabdb2c271c[BUST]": "bk_ew",
    "e90da16bf9bc9b57[BUST]": "bk_hah",
    "bfc94df8736b590c[BUST]": "bk_hm",
    "4375a729ef4fb298[BUST]": "bk_laugh",
    "461fe27b72aafc2d[BUST]": "bk_lookaway",
    "6350819bd94f808b[BUST]": "bk_neutral",
    "bb9b26e24462d5ac[BUST]": "bk_no",
    "e420d45fcd6e1da8[BUST]": "bk_oh",
    "509daea01f1551c3[BUST]": "bk_sad",
    "67b516c5d0cd3bb2[BUST]": "bk_sigh",
    "5e5f280b7837bff2[BUST]": "bk_smile",
    "64c68af566b4171d[BUST]": "bk_tch",
    "07c4d5e4f2b41ff9[BUST]": "bk_ticked",
    "811af155451a1de1[BUST]": "bk_unsure",
    "fe3b2d03972b9d09[BUST]": "j_ack",
    "529f4e751c008c83[BUST]": "j_angry",
    "cc89c8075ae4d373[BUST]": "j_down",
    "8041c50ad7e45723[BUST]": "j_ha",
    "b17739277151ed42[BUST]": "j_hopeful",
    "af79315fac2779c5[BUST]": "j_nervous",
    "5ece62cb9519ef22[BUST]": "j_shy",
    "1e3a51217b562269[BUST]": "j_unsure",
    "e6d48e341fedec6e[BUST]": "j_upset",
    "34ea74005c0f204b[BUST]": "j_worry",
    "1c0e4a32dc419f8f[BUST]": "l_joy",
    "65f2e14e351b4a83[BUST]": "l_say",
    "547ad6e645df21e6[BUST]": "l_serious",
    "e666313c86218fa9[BUST]": "l_talk",
    "3007f0661581f042[BUST]": "l_tch",
    "c35073b032a3c6d0[BUST]": "l_think.png", // Note: in game files 'l_thinkBUST].png' (sic)
    "d5fc810c3e11abaa[BUST]": "lady_fear",
    "5ebe1753cdf53711[BUST]": "lady_happy",
    "4cd6959a2d2a1cde[BUST]": "lady_heh",
    "1db0e19ceaf9336a[BUST]": "lady_laugh",
    "88cb376695bcb4e4[BUST]": "lady_miffed",
    "6d8bb99f09d81fcf[BUST]": "lady_nervous",
    "310c389045f271fa[BUST]": "lady_worry",
    "13e20e002213585a[BUST]": "lady_yell",
    "2ba46025d0765d16[BUST]": "m_angry",
    "a93ff69f791aa5d6[BUST]": "m_down",
    "e35383f4cdc7e871[BUST]": "m_err",
    "bb383b4ee18466c0[BUST]": "m_excited",
    "b33bc03f2ad5e20b[BUST]": "m_hmph",
    "eab23757ff9b84f6[BUST]": "m_laugh",
    "5a158fcf146a6865[BUST]": "m_meh",
    "cc2dba2870d017aa[BUST]": "m_mock",
    "2ae48d0c43fdb6c4[BUST]": "m_no",
    "67bb69763f5faa65[BUST]": "m_oops",
    "74e30d16a2e8e181[BUST]": "m_pain",
    "956af808485c6c9d[BUST]": "m_proud",
    "6ee8d46a57ea59bd[BUST]": "m_reassure",
    "0d2a6f655dd55623[BUST]": "m_sigh",
    "9befb3aae9db49f5[BUST]": "m_smile",
    "3f2489dd8ec5d66f[BUST]": "m_surprise",
    "aa5fd8605df1ad76[BUST]": "m_ticked",
    "2b1777991e8bb9e4[BUST]": "m_um",
    "7fc1078ba047c4ea[BUST]": "m_unsure",
    "2727e2aa2b4fb4e2[BUST]": "m_yell",
    "f8ccc4fd95bdf333[BUST]": "s_angry",
    "ad0e943304f54e8f[BUST]": "s_boo",
    "52ab7d6508f87817[BUST]": "s_challenge",
    "00dfc02ea4ecdd77[BUST]": "s_chat",
    "a550405ba339792e[BUST]": "s_content",
    "9eae4abfe82d5cc2[BUST]": "s_cry",
    "e2a83a6e23e670e2[BUST]": "s_curse",
    "e7c5a0a6db58c44d[BUST]": "s_excited",
    "763c013480a12595[BUST]": "s_fearful",
    "a7950ad2d17854d6[BUST]": "s_fight",
    "386634445489561c[BUST]": "s_gasp",
    "8437c57e159caae7[BUST]": "s_gentle",
    "d37472883faddde9[BUST]": "s_glad",
    "f3e25bcfc5cece64[BUST]": "s_heh",
    "203389fa11d5765b[BUST]": "s_hm",
    "44351a1098b789cf[BUST]": "s_hmm",
    "f5a6c0be6d0d88cb[BUST]": "s_hmph",
    "1874d0a2239d9cce[BUST]": "s_huhu",
    "5a9d0bfde3ef03ac[BUST]": "s_hurt",
    "d2aff806dd5f1315[BUST]": "s_irritated",
    "e220be5e529b4aa8[BUST]": "s_laugh",
    "95f634c750ffbc3d[BUST]": "s_lol",
    "ea3a2dd5fc64d746[BUST]": "s_lying",
    "38b82c55b3529488[BUST]": "s_meh",
    "34b15f34f103954d[BUST]": "s_mock",
    "342128b8b9453ee2[BUST]": "s_no",
    "88ac88061d8c0a77[BUST]": "s_ooh",
    "f4b314fa0ba665de[BUST]": "s_oops",
    "2c8a1aebfb8aaefd[BUST]": "s_pout",
    "bc3f6c4a78c37314[BUST]": "s_proud",
    "b2c75e3097e9fdd4[BUST]": "s_sad",
    "c11b453247f56d9b[BUST]": "s_scream",
    "405c672f8a34f278[BUST]": "s_sigh",
    "c61a4be244711b5a[BUST]": "s_smile",
    "66227cb1c01fc3ac[BUST]": "s_surprise",
    "7bf9e1a7b3fc961a[BUST]": "s_tch",
    "2980a89460122a18[BUST]": "s_terror",
    "d730436f2a2b31a5[BUST]": "s_think",
    "eea509ea4222d93c[BUST]": "s_ugh",
    "f4ceb145497fdb82[BUST]": "s_ughh",
    "3939c67fcca7d3cd[BUST]": "s_unsuresmile",
    "9baea3a9ab3cbc09[BUST]": "s_weak",
    "33b36b3ce42250e3[BUST]": "s_yell",
    "6c228cee76f5f8f3[BUST]": "sk_bawl",
    "662bb85ea0fc55c7[BUST]": "sk_down",
    "92eba4bf2cf93504[BUST]": "sk_grin",
    "bc6066f175ccc4a8[BUST]": "sk_happy",
    "fc5f2b642f1b51fc[BUST]": "sk_heh",
    "9b376d2c46d93600[BUST]": "sk_hmph",
    "f77b18612c778153[BUST]": "sk_mad",
    "0ff2357cb019f30f[BUST]": "sk_meh",
    "d292115d110ba256[BUST]": "sk_miffed",
    "6216bcbbc123fefb[BUST]": "sk_mock",
    "fdde49dabf17aac3[BUST]": "sk_sad",
    "030f5a31d6b13bfe[BUST]": "sk_sure",
    "ae79049cfef26bab[BUST]": "sk_surprise",
    "1e8f066521628861[BUST]": "sk_teary",

    // img/parallaxes (.png)
    "93fa9d26cc777f57": "ground2",
    "d90f1f28b74c386f": "ground3",
    "26472d7da1885ca9": "ground4",
    "d67196f29a0669bd": "ground5",
    "0e4b049e654adcc2": "ground6",
    "2854878e364d1f09": "ground7",
    "0225d01841bb7841": "ground8",
    "811d95f699513f4f": "ground9",
    "b7f9762041dd2936": "ground10",
    "f5307397750f3fe3": "ground11",
    "95990de3d07ecd53": "ground12",
    "bc71f43265e7a5aa": "ground13",
    "b3f0d0032a0bffb5": "ground14",
    "ae136b1a8a9c9260": "ground16",
    "0bd3fbd677797b85": "ground17",
    "bc910863ee07354d": "ground18",
    "8029b50924d441ef": "ground20",
    "adc76bb1dcc11242": "ground21",
    "2d3e3aa9cbbed9c8": "ground22",
    "37122af8464c5512": "ground23",
    "9e2dbcda46a5f8fc": "ground24",
    "6eedeb504021a2d1": "ground25",
    "c668c604c02be334": "ground26",
    "dfae681c4fe65989": "ground27",
    "362ac9a3f52e16a8": "ground28",
    "ebe61742ae2f38f6": "ground29",
    "890955f2702c45ef": "ground30",
    "5121fa18a6e6f0dc": "ground31",
    "fc4d6d81f5279c93": "ground32",
    "bab183cf848588f3": "ground34",
    "a724c3e11ff25763": "ground35",
    "d7feed662c51e8d6": "ground36",
    "1364c8180f2abfc0": "ground37",
    "f90c129f8d53f9fa": "ground38",
    "f446a74f27f43a54": "ground40",
    "33d923ca78d31f02": "ground41",
    "7bad12b38a73b159": "ground42",
    "2883caea3cce4cff": "ground43",
    "6daf84df79633012": "ground44",
    "aeb8fcbe2a41b0ee": "ground45",
    "8dbf3779d2da2a62": "ground46",
    "48752fa5021e572f": "ground47",
    "358fc333d6362f33": "ground48",
    "e98748428f1a9c85": "ground49",
    "b08a9bfca03b1ff0": "ground50",
    "8789b3405ae6ae11": "ground51",
    "8d3661dac79d6ed7": "ground52",
    "4d10dccfcf439cd1": "ground53",
    "1d7f4ede43732811": "ground54",
    "969b3e7feaf36b8c": "ground55",
    "0f42142d358a32f8": "ground56",
    "26da93a9ad64caf4": "ground57",
    "c181f10fd6b40cf6": "ground59",
    "1ce8dddbe56c4d59": "ground60",
    "6ebfb2746b1a7bd6": "ground75",
    "617f4dfad5731b91": "ground76",
    "2aee845dfa17fbc3": "ground90",
    "ae5e1216c30b4a87": "ground91",
    "a7af2c55323736bd": "ground92",
    "f2debc90d12c41a4": "ground93",
    "3393beb5d1744cce": "ground94",
    "c440ee2023de1a4b": "par2",
    "49e70c913c970d96": "par3",
    "413628f4e3942051": "par4",
    "2abe22319ff01828": "par5",
    "54ab0a7e383cea05": "par6",
    "aeb6d60963478d0a": "par7",
    "3dbff278a2d24946": "par9",
    "dbfc03bb8fe2d037": "par10",
    "8ef09c19f418ebe5": "par12",
    "ed123b6f426b1130": "par14",
    "cc53aff867fd494f": "par17",
    "9f843ec3377ef4fe": "par18",
    "b4d9ac928a79976a": "par20",
    "91b56e3551048c4f": "par21",
    "4fafe495faf336ed": "par22",
    "190707c8a49c722a": "par23",
    "9491e0d95e977927": "par24",
    "c5b806daa3f564a8": "par25",
    "fa6635920597366d": "par26",
    "8a0ace8df26f2256": "par27",
    "a7a3654c9dfb83c3": "par28",
    "726f94691abe27e9": "par29",
    "bb6e19818331f35e": "par30",
    "7ee9fe2deda50e53": "par31",
    "7cbcb9658a2c0d28": "par32",
    "6bfa4133bda1b1bd": "par34",
    "86e51c32161f6113": "par35",
    "5056c20aa8498b3a": "par36",
    "4b3414a0204ac8eb": "par37",
    "71e2e9224a09686f": "par38",
    "59e5a3114ae4c713": "par40",
    "11681dfd0616dca2": "par41",
    "ba8d17b339457b2f": "par42",
    "ccf6b73a23cf0953": "par43",
    "bff36a0229498115": "par44",
    "5c0d625a675d5733": "par45",
    "5134ba2a50b03994": "par46",
    "c93a6918b13dc0c1": "par48",
    "cd4c4cc7fbc322ce": "par49",
    "18d16b86bfdd4b18": "par50",
    "a94737f875af0538": "par51",
    "5ef8767edb6d8466": "par54",
    "3571164f571c1fc6": "par60",
    "d0b31d28bd66c1c4": "par76",
    "c4ea6d2b8a93873c": "par90",
    "d4d61951a86f8070": "par91",
    "51437577c0e1aec6": "par92",
    "a11a12b1ee2fc8dd": "par93",
    "8eb36e01b9918f9f": "par94",

    // img/pictures (.png)
    "1d07386a8391c7b6": "LU",
    "66cb56211531cb91": "LU_eyes_a",
    "4c198c62430242f8": "LU_eyes_b",
    "4eba2e1aacd04b0d": "LU_eyes_c",
    "8bdd313d98829e46": "accept_a",
    "8657ac6d279cbe8d": "accept_b",
    "e1ba8c1d0420bd3c": "accept_c",
    "5d1d2001facd85b1": "andy_angst",
    "3a6612e8e7cfbf62": "andy_urghhhhhhhh_a",
    "247296309988ca20": "andy_urghhhhhhhh_b",
    "46ceb8a03c4e502a": "ashley_final_warning",
    "e1996c6201cf6a4c": "bed_1a",
    "d3ec21c0d3353ef3": "bed_1b",
    "2d6dc65205e1af37": "bed_1c",
    "3fe4c8cb1d18940b": "bed_1d",
    "89a90848c81c27cd": "bed_aaandrew",
    "bec8e9c5746b522c": "bed_andrew",
    "609d141307c3c529": "bed_andy",
    "aa5c0e61b18349f0": "bed_bite",
    "985a9dfa36907f93": "blur_motel",
    "411a1054f1ecd81b": "bridge_h1_a",
    "613d33abbc8c22c4": "bridge_h1_b",
    "948a94cec1f510cc": "bridge_h_mopea",
    "fe8e9d3bda3a77c9": "bridge_h_mopeb",
    "e9e7d26b5316c9e5": "bridge_h_pf_a",
    "76b458655a41147d": "bridge_h_pf_b",
    "e8d78ce5e31742f5": "bridge_h_pf_c",
    "2b9eb1707d8053f9": "bridge_h_pf_d",
    "e87d3e7b8ff4fd8f": "bridge_h_pf_e",
    "cfaf812c8b0ecb65": "bridge_h_push",
    "ba0256e29de431c3": "bridge_rb1_a",
    "48a210921fd8ce2e": "bridge_rb1_b",
    "136758b91d834896": "bridge_rb1_c",
    "4e1c2890e4ae1ccb": "bridge_rb1_d",
    "7b02093f1308aa86": "bridge_rb1_e",
    "b7be0f71948fc5c0": "bridge_rb3",
    "c80536efceec240c": "brocouch",
    "17887cedb241b690": "ca_angry",
    "3af7d9eb29740ffe": "ca_ask",
    "a06209a1b3f3c37b": "ca_listen",
    "10a154d88e785213": "ca_talk",
    "2d769dd2277e8644": "ca_tired",
    "149c84690b3ca46d": "cameraview",
    "d84324d3940773f6": "car_a1",
    "bdcd9fd4b9c5693d": "car_a2",
    "d16f949daf2cd3a4": "car_b1",
    "50445084a2cf21ac": "car_b2",
    "7b199166b3c4c1c7": "car_c1",
    "da5de1c82cc90398": "car_c2",
    "586b619c0ea5a766": "car_c3",
    "254b44b3caf8ab20": "car_c4",
    "70ec6ff81eee9a3e": "car_c5",
    "39b333b3fe5c4834": "car_c6",
    "9cc0be0d733916c2": "car_c7",
    "7bd6fe7cc31df9ef": "car_d1",
    "1fe7ed71fa71f916": "car_d2",
    "67e9b1317f33e263": "car_e1",
    "06b135020f98f199": "car_e2",
    "a7d561d0e35b25dc": "cart_a",
    "ecaf3d8a9a591f00": "cart_b",
    "ad2cd94cca9617c2": "carwake1_a",
    "4fa1dab19269970e": "carwake1_b",
    "334cac0c244c359f": "carwake1_c",
    "eac2b86f88928871": "carwake1_d",
    "2024c94008299c5c": "carwake2_a",
    "662db332d90afa6b": "carwake2_b",
    "42e3fcdfe6df7c8b": "carwake2_c",
    "c20a68f20235c3d2": "carwake2_d",
    "4d3fc205dc3378f6": "carwake2_e",
    "4bb0151c008236ca": "ch1",
    "057974b069d30654": "ch2",
    "cd861c4984a264e7": "cl_grin",
    "33b337eac7e28435": "cl_lol",
    "fde793fdaab54476": "cl_mad",
    "50329e80c420326d": "cl_meh",
    "8eaaf648a60e7cb3": "cl_mock",
    "6ab1334d180d7834": "cl_plead",
    "4a9eed4896ae3c23": "cl_yeah",
    "952a2baee2f13422": "coffee",
    "b03274763ff93071": "coffee_kick",
    "fd1783eede86a83f": "couch2_a",
    "1ff8f87ffc9ba37a": "couch2_b",
    "f6406b9906fbcfae": "couch2_c",
    "ea3d89ab6fbb468f": "couch2_d",
    "b27513849fd0ebe0": "couch_a",
    "2999437d372fdcb1": "couch_b",
    "22a6a53d73312f1d": "couch_c",
    "e777bfdb7790c4df": "couch_d",
    "dfac7b98f43f254e": "couch_e",
    "6bd923293f4c3846": "crate2_a",
    "00090f8ebda9a535": "crate2_b",
    "aabe56b92d30d2d2": "crate2_c",
    "270dbe39a4977182": "crate_a",
    "8b58f0ddab904ce7": "crate_b",
    "1cbdd1313aa8bbd1": "crate_c",
    "615c9ecc24a767a3": "crate_slam",
    "3abe3cbb8a49bd40": "cry_a",
    "8d33b2baeec39474": "cry_b",
    "74380a0d0e3c7c48": "curtain",
    "55c5e05e00443768": "curtain",
    "656c6ae7133a54a6": "cut_dad_a",
    "be1e34f309e4bcc8": "cut_dad_b",
    "8798c963d26e560b": "cut_mom",
    "3c3a7389e2fc7efc": "decline2_a",
    "4414311e2ee8ce9c": "decline2_b",
    "3a8bfb66afcc8e2e": "decline2_c",
    "00eed50cccf6d1b6": "decline2_c_cut",
    "9056928e60358c44": "decline2_d",
    "11236ab2abad4167": "decline2_d_cut",
    "6aff87c1816e38d5": "decline3_a",
    "1a2c887c1143200f": "decline3_b",
    "3370e42062a16360": "decline3_c",
    "313694eb2f339940": "decline3_d",
    "a639dfbb4bad3334": "decline_a",
    "06a3cadd8c3249f5": "decline_a_cut",
    "69f0a8fb4a4904ad": "dinner_dishes_a",
    "77f8de5eae49764e": "dinner_dishes_b",
    "1dad9f636255bad6": "dinner_duo",
    "e872d53336bc384c": "dinner_family",
    "4940f65d5d9641b7": "door_0",
    "0b496c2df72e9815": "door_1a",
    "898dfb89649ee746": "door_1b",
    "9a7eeda47205e438": "door_2a",
    "fb81ef6b2fdc7cfb": "door_2b",
    "6f760c3732d0fd82": "door_3a",
    "92513b85266edfd9": "door_3b",
    "fc1cb4d2ab450a11": "door_4a",
    "be0d7a30b60745e4": "door_4b",
    "2a2f7605fbb9e1a2": "door_bye",
    "579009fb34224613": "door_bye_alt",
    "4df4fcf34924b581": "door_spotlight_a",
    "ea58231f404ca0c0": "door_spotlight_left",
    "b1081b01f534a2c6": "door_spotlight_right",
    "6570aa3fc508a649": "drawing",
    "0999e1e635701bc3": "drawing_fix_classmates",
    "6ae3ade0e3428b1e": "drawing_fix_friends",
    "1a54d1acc9755608": "drawing_fix_parent",
    "f3488edebd2c01ca": "duo_car",
    "5e9dd15a50e36b58": "duobed",
    "43f98b69ec10a48e": "duocouch",
    "0ac46efc3e1326a6": "duodiner",
    "3dbb9ec091468a0e": "duodinner",
    "dad4070c721a72fc": "duofloor",
    "8711024bbb8eda54": "end_a",
    "19ad20c2e5175806": "end_b",
    "22157a03c95858af": "end_c",
    "9f2ccafdb1439a07": "end_d",
    "6082fc02be98102f": "end_e",
    "47b90b8577d12e80": "endcard",
    "f2953fc6219c8b2d": "eye_puzzle_halo",
    "3bc6c2e9b52e4903": "fauxcomfort_a",
    "f26a50e3656debea": "fauxcomfort_b",
    "4ac018799a1558f1": "fauxcomfort_c",
    "d5307123da9ff10b": "fauxcomfort_d",
    "d3e441652bc84cc8": "fauxcomfort_e",
    "f65177a973764818": "fb_bff_a",
    "8de678ad8482ba75": "fb_bff_b",
    "3f760e2735fe9bf0": "fb_bff_c",
    "8d0f07578e5fbaea": "fb_card",
    "74bcb642e0e0903a": "fb_curlup_a",
    "6849bfd72e35fc3b": "fb_curlup_b",
    "8d4ddf01ad3baf83": "fb_curlup_c",
    "f1e9727e3a6be1b5": "fb_duo_tv",
    "db59f669ad36accd": "fb_hug_a",
    "a3771790183e6efc": "fb_hug_b",
    "d294007469270d86": "fb_lemoncake",
    "6aed563a63479ef0": "fb_ley_a",
    "ecd165db3b4f5e9c": "fb_ley_b",
    "2b43bdf518c1d912": "fb_ley_c",
    "c35e0223f47e364e": "fb_ley_table",
    "e3e2fe2d355ecdae": "fb_shake",
    "72d79d3064e37967": "fb_shock",
    "fc33d345746320c3": "fb_shock_b",
    "242d2c943b7f956b": "fb_tv_a",
    "87bb08fbc56b3db3": "fb_tv_b",
    "5f4619f86d783300": "feed_1a",
    "b20d9b012d6476fd": "feed_1b",
    "bcd62b27274b7781": "feed_1c",
    "cf50c33324a2a03d": "feed_2a",
    "5c19b921a91bba36": "feed_2b",
    "a1259d7436b18c16": "feed_2c",
    "5993f87e50a5852f": "feed_reprise",
    "c9631215c7130c38": "floor_1a",
    "77d90f6e47ceaa8a": "floor_1b",
    "f7839005d935c93d": "give_gun",
    "848fde43c5c801cf": "grab_a",
    "27c855f75915e828": "grab_b",
    "1f5987a6eb24d509": "grab_c",
    "3e22ff37cb58267d": "ground60_block",
    "ed09b799b56c6442": "guesswhat_a",
    "b5a10a6bfedd4e68": "guesswhat_b",
    "14378b843d4ff7f4": "guesswhat_c",
    "a755d40d8185f1e3": "gun_a",
    "fa4208bfe85d3878": "gun_b",
    "09b00beef6fb9c5c": "gun_c",
    "f815abd6b0d2e06b": "gun_c_bullets",
    "b76d8b426fd20038": "hex_a",
    "c178b05f20a956cf": "hex_b",
    "85ed0f95a6a7cd00": "hex_c",
    "a3b52381f668ac8b": "hex_d",
    "ef629f640d847c8c": "hide2_a",
    "906a4c3333b1c816": "hide2_b",
    "af2acd55795b1af2": "hide_a",
    "ba5d6a899cb84b5f": "hide_b",
    "66cd890a68dba484": "hide_c",
    "75a631468794f9c1": "hide_d",
    "8b8514d0e3417e54": "hint_green_blue",
    "0c8cae915acc2fd2": "hint_red",
    "ef5d18e2e8d2e126": "hitmanwins",
    "6459a3eeb2f69688": "hug",
    "8b006b9aa65c6a39": "hv3a_1",
    "25303aac82d9515c": "hv3a_2",
    "e20f8ca4f0ec7356": "hv3a_3",
    "1fd20320c2a8f5ea": "hv3b_1",
    "465d290206f8e357": "hv3b_2",
    "ea19f233527f51c7": "hv3b_3",
    "b9af5ec9fec44fb3": "hv_1a",
    "86eca52b86ce9e8c": "hv_1b",
    "6976448650fed99a": "hv_2",
    "bec3b3499844c59e": "hv_4",
    "9895fdb7cda5108a": "hv_5a",
    "0ebb768c6ab206fd": "hv_5b",
    "3c43d16833122b7d": "hv_6a",
    "d2e6a90b4991c968": "hv_6b",
    "7b315c40c45a6dd9": "island_a",
    "2698ce32bbb20d9b": "island_b",
    "8294276439fc2e34": "island_c",
    "6816a06deb7cac89": "julia_a",
    "9227ef0f5846ed2d": "julia_b",
    "96e3e429a6644472": "julia_c",
    "5972d18a4e7f34a8": "keys",
    "d50941826e3857f3": "kick",
    "168a70d2e89c2cd6": "kill_1a",
    "9cc1a75ad904db7b": "kill_1b",
    "e30f95b9c0b6a345": "kill_2a",
    "5d092c9d114cb0d8": "kill_2b",
    "71d2c44fd082c455": "kill_2c",
    "becdbae122fbb902": "kill_2d",
    "a392d6ec1277ca48": "kill_3a",
    "e39d90e3f45836d9": "kill_3b",
    "660f9bc4fb0fcdcb": "kill_3c",
    "f9294fbbb3ee4e16": "kill_4a",
    "604de9b977953588": "kill_4b",
    "e3abf15fb52d3f9c": "kitchen2_a",
    "7e14970ec52e3df0": "kitchen2_b",
    "6f766e0a47210b1f": "kitchen_a",
    "e2699947cf021b78": "kitchen_b",
    "bd971cd44e354e62": "kitchen_c",
    "7873715f1cae10d6": "kitchen_d",
    "fc16e2640958c57d": "knife",
    "47db3073cb206e43": "knife_dad",
    "10f8f2491b0a555d": "latch_a",
    "9b9da01832c368c2": "latch_b",
    "8ae9d4857713d91f": "letgo",
    "429afcbd88bf782b": "lg_beam",
    "bf2f03cdcfef91fa": "lighter_a",
    "c1d7e2b47fb6ee1e": "lighter_b",
    "069c58d691c54d4e": "memory_1a",
    "a9edeabc3078c25b": "memory_1b",
    "efbd6b41ff1cd6ba": "milkcarton",
    "0a5d6a6d65f3b870": "motel_bro",
    "5dc3a7e830da4a63": "motel_bro_b",
    "c6b6668a0a866b7b": "motel_bro_dead",
    "c99312934d4fc24c": "motel_sis",
    "aae5c665889a8f35": "motel_sis_dead",
    "b654b2e6dfab0b90": "noandy_a",
    "954c1e7cc26583e9": "noandy_b",
    "9005e6aa380cefa9": "noandy_c",
    "5bef10be2269bbea": "noandy_d",
    "6c4de407e516698a": "noandy_e",
    "f732aeb277474c0d": "noandy_f",
    "230a59bcdd85ee12": "noandy_f_alt",
    "de8ad42673acaf1d": "nokill_sis_a",
    "7cabee34991e6939": "nokill_sis_b",
    "1a5e1fc17af1a551": "nokill_sis_c",
    "4b84ff6ce7a6f01f": "oath1_a",
    "84b1a77b81496e1b": "oath1_b",
    "eb385cf8f9b50f76": "oath1_c",
    "227d16a496463a1f": "oath1_d",
    "7a5873e53c2994a8": "oath2_a",
    "ac084ea2094e9824": "oath2_b",
    "af86ba44ab7da7ce": "oath2_c",
    "e6002192de482747": "oath2_d",
    "12e892e3c34436d5": "oath3_a",
    "7688ab0803e06058": "oath3_b",
    "2ffc0cd9259d34bd": "oath3_c",
    "4a027c45196ee196": "oath3_d",
    "e8986f2887e9f3ef": "op_a",
    "458431a83e2a9eb0": "op_b",
    "202c076ba68af1c6": "peek_1a",
    "bacd1f23643b67c3": "peek_1b",
    "d7e2183a3761aabe": "phone_a",
    "d2e03c302d89b51c": "phone_b",
    "54b9052d70e39f8b": "pov_andrew",
    "b297744b06b161a0": "pov_ashley",
    "eef0bbb24ffe955e": "pov_none",
    "e2cd398e72a890c5": "ra_butcher_1a",
    "6d526f023c6ca9c8": "ra_butcher_1b",
    "339f1f109fbcfb5a": "ra_butcher_1c",
    "544794daa2f79165": "ra_butcher_1d",
    "209a6c2dc98742f7": "ra_butcher_2c",
    "c746959e4997b5d0": "ra_butcher_3a",
    "9b45364fe869bf37": "ra_butcher_3b",
    "f0a94597f099fb2b": "ra_butcher_3c",
    "1e85cda522c885dd": "rb_butcher_1a",
    "efc7fe2f750926be": "rb_butcher_1b",
    "503eb2f4ddcc4282": "rb_butcher_1c",
    "c794672e861fdfd0": "rb_butcher_2b",
    "3eb4e353e371e504": "rb_butcher_3a",
    "ae5cd1ea16defc2d": "rb_butcher_3b",
    "841378aae9ed38e5": "rb_butcher_4a",
    "ba9ceaf98b12b582": "rb_butcher_4b",
    "000d21aa3d82d7ef": "rb_butcher_4c",
    "df8eb0aab5b6472c": "rb_butcher_4d",
    "3c24c674eb39ed26": "rb_catch_1a",
    "6ca64f516c75587f": "rb_catch_1b",
    "91a310b44960aea8": "rb_catch_1c",
    "f54794233bdccbe9": "rb_catch_1d",
    "4371a01b45e06fb9": "rb_catch_2a",
    "6f1b90b1031ceabb": "rb_choke_fb",
    "4ce30dfac6bb9b05": "rb_chokeb_fb",
    "63a67f25b034c85d": "rb_wake1b",
    "c23280307b30c555": "rb_wake1c",
    "5219e16207fa159b": "sever_a",
    "3f4265711087d03c": "sever_b",
    "44f0ddc97a59772c": "shrug",
    "f5e4f25d43a370f9": "sisbed",
    "237d9c60c8f61a66": "sleeptrinket1_a",
    "4a2d34bb21966b4e": "sleeptrinket1_b",
    "45fa9459026964b3": "sleeptrinket1_c",
    "e07663a5a25baae1": "sleeptrinket2_a",
    "ac9abbdb56ad30c5": "sleeptrinket2_b",
    "b5364ee6c6175fe3": "sleeptrinket3",
    "7696ffc76a7dc458": "smokes2_a",
    "a1231f68d55bd33c": "smokes2_b",
    "c3950249e6675054": "smokes2_c",
    "581080edc31fbd04": "smokes_a",
    "b49c5190a54058b1": "smokes_b",
    "e3f7ef3e6254aaf5": "smokes_c",
    "284f60333a39fe39": "smokes_d",
    "fe67047f96a248c0": "sofa2_h",
    "0c345b0b64e3d4aa": "sofa2_h2",
    "7be75fdb7265f12f": "sofa_c",
    "b2f80fc164e016a5": "sofa_d",
    "04100d9951896914": "sofa_e",
    "d18f4b4080926868": "sofa_f",
    "576ab60dd29db965": "sofa_g",
    "4007887e993e3f97": "stabmom_a",
    "966666681eba35da": "stabmom_a_cut",
    "43c99e6a91140117": "stabmom_b",
    "b023638a629816c0": "stabmom_c",
    "3c813e43e423988a": "stalker",
    "5b83cdc699d771cc": "tag",
    "fd7e0705f1472312": "taunt_a",
    "094767301ae65b85": "taunt_b",
    "8c5ce6501c63bbce": "torso_1a",
    "25563c1aec5bf3c1": "torso_1b",
    "04d9d2f228cc0539": "tv_1a",
    "a3bccb499e47b68e": "tv_1b",
    "2bab77dfc3ca7d15": "tv_2a",
    "90c89e42d0231360": "tvad_a",
    "99293c069863c881": "tvad_b",
    "8fa16b4ad16de470": "tvad_c",
    "c6f58ee1735b5e88": "tvad_d",
    "640911fda2b1133c": "tvad_e",
    "6b812df629e31826": "tvad_f",
    "99151e814741c388": "tvad_frame",
    "511d249492bdcba0": "uso",
    "c9459be26cfecbf1": "wake_1a",
    "a7e512f0c019b996": "wake_1b",
    "734723dde1ec6dc4": "wake_first_vision_a",
    "65bc2642b1807cb3": "wake_first_vision_b",
    "4ca131e8b13037e0": "whisper_a",
    "d43605d80ee6a106": "whisper_b",
    "388b09ae68f7e3d3": "window_latch",
    "87f57ebec44382da": "window_latch_open",

    // img/system (.png)
    "f8410e597b074776": "Balloon",
    "ad1c62514586e83b": "ButtonSet",
    "b35a172f174d8653": "Damage",
    "ddf9cdd7da11cc2a": "GameOver",
    "766d372c84f1dac0": "IconSet",
    "eed4022786be328d": "Loading",
    "e5230bf37c4fabb0": "Shadow1",
    "1311d51e1765316b": "Shadow2",
    "3be2dd83cc8de939": "States",
    "7264681f0ab11b47": "VNButtons",
    "7d6f1e67e074a178": "Weapons1",
    "ddd8237f2d4b4360": "Weapons2",
    "30f14a2c7734a492": "Weapons3",
    "ffacabd73f8529e9": "Window",
    "8b8bdf10b5c3bc7b": "continue",
    "5c380e0964eed8e4": "credits",
    "f633ab2ca861decf": "language",
    "65a05ab7b4f18191": "msgimg_0",
    "73b473e346224cb1": "new_game",
    "7c493e2658ac87cb": "options",
    "f9248bf25001c910": "quit",
    "42f813e66a22d1ca": "stamp",
    "547ae1cf2d9eecf9": "vision",

    // img/tilesets (.png)
    "c2ccf2930ff9deb6": "Outside_A5",

    // img/titles1 (.png)
    "91b682859f543183": "Book",
    "1bd7a4c33f40ff8d": "black",
    "f4b41d4b05a86dec": "black",

    // data
    "f548a33ef014a2a9": "Actors",
    "6c2761ba70863900": "Animations",
    "1578c9babaee50aa": "Armors",
    "7aa4f7e2b748a9b1": "Classes",
    "93165b65a9ecda9b": "CommonEvents",
    "b0cfe5f195d0d61b": "Enemies",
    "fca9ba82c2e9907e": "Items",
    "e2179bd0c2dc98da": "MapInfos",
    "d4882f67829cb7a8": "Skills",
    "8e0412b9817913ed": "States",
    "be1a37535e921f91": "System",
    "ac711434613b8c64": "Tilesets",
    "08ef2224f07a731e": "Troops",
    "5281c3e6b5a90e7f": "Weapons",
    "26d47de73a40bdad": "Map001",
    "701ca312447feeff": "Map002",
    "eb08202b408f34a7": "Map003",
    "3a0ad431671e9969": "Map004",
    "a6508bd215624838": "Map005",
    "7b62476c532a63b2": "Map006",
    "59844f4ba628a616": "Map007",
    "054cb6c0fb3a4287": "Map008",
    "db27ad902d95af45": "Map009",
    "bed6b049e84e7992": "Map010",
    "c1d0913db015a7f9": "Map011",
    "06a5c2c0040a37fe": "Map012",
    "7061ce2052cc93e0": "Map013",
    "ce75f846f12ff0cc": "Map014",
    "41994b52078001c6": "Map015",
    "1e29e5b2ac8b5ab1": "Map016",
    "d94cd2768932c06a": "Map017",
    "41d31c139a8afeb9": "Map018",
    "4f072360c6b94567": "Map019",
    "3d604cacb48ef965": "Map020",
    "8af5d121f7003916": "Map021",
    "06d1650812c92d1f": "Map022",
    "ae760b41908472ae": "Map023",
    "8b7dabc172728c30": "Map024",
    "800344a950e65187": "Map025",
    "2b18d7dc081dc62b": "Map026",
    "225f3ab08bef402d": "Map027",
    "df8a857eec8680c5": "Map028",
    "56c6157c0cef0d71": "Map029",
    "43ff8d1358484703": "Map030",
    "eb464b634bb21262": "Map031",
    "2ffa3bb51859a242": "Map032",
    "79590c22f5c0128d": "Map033",
    "6655c6127544e5fd": "Map034",
    "326ca006a81bb4b5": "Map035",
    "1124eee982150e41": "Map036",
    "8da10d2f34eaa36d": "Map037",
    "2db29042af447095": "Map038",
    "de33dea8dbf590d7": "Map039",
    "ee83399e9c8467e1": "Map040",
    "d4b687332dfd6546": "Map041",
    "154629d325c17b8d": "Map042",
    "0fa2aa7bcdba1978": "Map043",
    "dbaf035d6a7daa70": "Map044",
    "f7abc2ea09dd1dc1": "Map045",
    "5e3ee90558cf8b9c": "Map046",
    "f4700abf0cc09876": "Map047",
    "d88e5ac3a06a9e41": "Map048",
    "95d5dc1e16e7599a": "Map049",
    "8f7e0f347ee2d96c": "Map050",
    "30e8cd7cb027b77c": "Map051",
    "8ef62552742bfaeb": "Map052",
    "fc234c9e5ea398a7": "Map053",
    "880702f4bef60e2b": "Map054",
    "57f3411f6dfb1cc0": "Map055",
    "2478e47ea38d116d": "Map056",
    "93193f433c078e67": "Map057",
    "a6df8a4fc070572c": "Map058",
    "2d63e9a6b22d5754": "Map059",
    "d775a2847901ae30": "Map060",
    "cb6b79b53dcf9cce": "Map062",
    "5e3c54603e0a02fe": "Map076",
    "552de4b3c2a6e722": "Map090",
    "b1a34d2ccc9ccf36": "Map091",
    "b7ab29068ab79381": "Map092",
    "5cd593dc35c7271e": "Map093",
    "b0ba735a85dd34b1": "Map094",
    "3920efa60e948c36": "Map095",
    "5b05a158b9e6b13e": "Map096",
};

// Filenames in last unencrypted game version (before the Cry about it update)
const hashToName = {
    // === Map Files ===
    "f548a33ef014a2a9": "Actors",
    "6c2761ba70863900": "Animations",
    "1578c9babaee50aa": "Armors",
    "7aa4f7e2b748a9b1": "Classes",
    "93165b65a9ecda9b": "CommonEvents",
    "b0cfe5f195d0d61b": "Enemies",
    "fca9ba82c2e9907e": "Items",
    "e2179bd0c2dc98da": "MapInfos",
    "d4882f67829cb7a8": "Skills",
    "8e0412b9817913ed": "States",
    "be1a37535e921f91": "System",
    "ac711434613b8c64": "Tilesets",
    "08ef2224f07a731e": "Troops",
    "5281c3e6b5a90e7f": "Weapons",
    "26d47de73a40bdad": "Map001",
    "701ca312447feeff": "Map002",
    "eb08202b408f34a7": "Map003",
    "3a0ad431671e9969": "Map004",
    "a6508bd215624838": "Map005",
    "7b62476c532a63b2": "Map006",
    "59844f4ba628a616": "Map007",
    "054cb6c0fb3a4287": "Map008",
    "db27ad902d95af45": "Map009",
    "bed6b049e84e7992": "Map010",
    "c1d0913db015a7f9": "Map011",
    "06a5c2c0040a37fe": "Map012",
    "7061ce2052cc93e0": "Map013",
    "ce75f846f12ff0cc": "Map014",
    "41994b52078001c6": "Map015",
    "1e29e5b2ac8b5ab1": "Map016",
    "d94cd2768932c06a": "Map017",
    "41d31c139a8afeb9": "Map018",
    "4f072360c6b94567": "Map019",
    "3d604cacb48ef965": "Map020",
    "8af5d121f7003916": "Map021",
    "06d1650812c92d1f": "Map022",
    "ae760b41908472ae": "Map023",
    "8b7dabc172728c30": "Map024",
    "800344a950e65187": "Map025",
    "2b18d7dc081dc62b": "Map026",
    "225f3ab08bef402d": "Map027",
    "df8a857eec8680c5": "Map028",
    "56c6157c0cef0d71": "Map029",
    "43ff8d1358484703": "Map030",
    "eb464b634bb21262": "Map031",
    "2ffa3bb51859a242": "Map032",
    "79590c22f5c0128d": "Map033",
    "6655c6127544e5fd": "Map034",
    "326ca006a81bb4b5": "Map035",
    "1124eee982150e41": "Map036",
    "8da10d2f34eaa36d": "Map037",
    "2db29042af447095": "Map038",
    "de33dea8dbf590d7": "Map039",
    "ee83399e9c8467e1": "Map040",
    "d4b687332dfd6546": "Map041",
    "154629d325c17b8d": "Map042",
    "0fa2aa7bcdba1978": "Map043",
    "dbaf035d6a7daa70": "Map044",
    "f7abc2ea09dd1dc1": "Map045",
    "5e3ee90558cf8b9c": "Map046",
    "f4700abf0cc09876": "Map047",
    "d88e5ac3a06a9e41": "Map048",
    "95d5dc1e16e7599a": "Map049",
    "8f7e0f347ee2d96c": "Map050",
    "30e8cd7cb027b77c": "Map051",
    "8ef62552742bfaeb": "Map052",
    "fc234c9e5ea398a7": "Map053",
    "880702f4bef60e2b": "Map054",
    "57f3411f6dfb1cc0": "Map055",
    "2478e47ea38d116d": "Map056",
    "93193f433c078e67": "Map057",
    "a6df8a4fc070572c": "Map058",
    "2d63e9a6b22d5754": "Map059",
    "d775a2847901ae30": "Map060",
    "41157d8209e24b13": "map_61",
    "cb6b79b53dcf9cce": "Map062",
    "5e3c54603e0a02fe": "Map076",
    "02edb9e9dbed9ed1": "map_78",
    "9c0da7f6ee1baba0": "map_79",
    "eeac9206c6ef8544": "map_80",
    "c012ed0db9e740e4": "map_81",
    "98e0aaf1267b51b5": "map_82",
    "65ae51f77f180001": "map_83",
    "9230edb275fedc56": "map_86",
    "552de4b3c2a6e722": "Map090",
    "b1a34d2ccc9ccf36": "Map091",
    "b7ab29068ab79381": "Map092",
    "5cd593dc35c7271e": "Map093",
    "b0ba735a85dd34b1": "Map094",
    "3920efa60e948c36": "Map095",
    "5b05a158b9e6b13e": "Map096",
    "ff41c61f0e584afb": "map_98",
    "536c41c6b1cbcb4b": "map_99",
    "2eea0cd657ee09db": "map_100",
    "d1b3c829c523e20c": "map_101",
    "09d5de6bc7c29508": "map_102",
    "939225260c04d3dc": "map_103",
    "fb711a2e828e683d": "map_104",
    "d3251e089176aa21": "map_105",
    "2bac73a56ff7d020": "map_106",
    "4aa48799359b8079": "map_108",
    "45d98573e3c57308": "map_109",
    "5aeaf820111dc18c": "map_110",
    "5f31206517ed14d0": "map_111",
    "6dff3167d92aa584": "map_112",
    "da8da5b9c97de240": "map_113",
    "572beaa6867766dd": "map_114",
    "8f5ec0988f02d975": "map_115",
    "3473568ba9dae8b5": "map_116",
    "ae48e05b4e79bf56": "map_117",
    "cf4dec666df6ae5b": "map_118",
    "f8444f09c7e01c6e": "map_120",
    "21641b615775303b": "map_121",
    "e166acc928b4d969": "map_122",
    "8130fc508e83a715": "map_123",
    "1b2f3042111d109c": "map_125",
    "9dfa772b276dc184": "map_128",
    "b471003ffdcf7950": "map_129",
    "1620515bccc66c95": "map_130",
    "9bcf3a89d1a2423b": "map_131",
    "f760ae3058a29adb": "map_138",
    "e96cd4ebbe1256ae": "map_142",
    "3c760a523df2793a": "map_143",
    "3650431aaab1d232": "map_144",
    "311108257038b81b": "map_145",
    "b45eb7eaf1229405": "map_146",
    "9e1dc561d06953fc": "map_147",
    "0b9acdb076dcd45d": "map_148",
    "d744a18452d3dfbd": "map_152",
    "a2b977b4d98205d1": "map_158",
    "283249c270778ae1": "map_159",
    "e3e707a94164a91e": "map_160",
    "48abc987622778cd": "map_161",
    "140f035936ca2cc0": "map_162",
    "371689aec2b32427": "map_163",
    "360554f3641df924": "map_164",
    "ff7eac5471eb740f": "map_165",
    "63cf102e58e9dfc8": "map_166",
    "9734693e5e20ccf8": "map_167",
    "4f6cff2377563d16": "map_168",
    "16a91350fa571fc6": "map_169",
    "4723de0f3a64f88e": "map_170",
    "f00c1fb9a0e4cd37": "map_171",
    "9462653e1b8ae4dc": "map_172",
    "d2c49021f405dedd": "map_173",
    "08928aa93a9e6f6d": "map_174",
    "00d652e9341d5d14": "map_176",
    "d4a47b2f99e704f3": "map_177",
    "4cf94c80f6323e7f": "map_179",
    "fb09f02229efe21d": "map_180",
    "102f4f880c43a659": "map_181",
    "35fa0bfbd305bf00": "map_182",
    "6417dd61583e3596": "map_183",
    "8c580a506bc1bbc2": "map_184",
    "ce2cfc01680c5e40": "map_185",
    "4b91f011ed4c052a": "map_187",
    "fbb46286d5677e9c": "map_188",
    "01a229379d11ae7a": "map_189",
    "807d903a8fa3d3bb": "map_190",
    "eb50be30675a1338": "map_191",
    "6f1debed4cd6c977": "map_192",
    "ffb410dd7b475318": "map_193",
    "bf056204745a9799": "map_196",
    "dbf06bdc1d8b5c1d": "map_197",
    "c6da2fac2d31c99d": "map_198",
    "7bbce7caa03e0c50": "map_199",
    "1d05bd2a5f417902": "map_201",
    "2ed0077f6bb521af": "map_202",
    "48352a31db06b515": "map_203",
    "8950949860d6ac78": "map_204",
    "7b6e18c1910d7c36": "map_206",
    "0cd902c879bb1992": "map_207",
    "f462830b0e8ed3d1": "map_208",
    "36369c6e3f5c70b4": "map_209",
    "92c48575c0f90412": "map_211",
    "d309b9adda500c07": "map_213",
    "b5e77bd370058447": "map_214",
    "62ad6dae864492b9": "map_215",
    "553a9328ca7ad696": "map_216",
    "ce51667cc62e4ba9": "map_218",
    "b9a425898788be50": "map_220",
    "a56bdd7bdd1d47a7": "map_221",
    "d8da2e80548655a7": "map_222",
    "7960f4f28a7e3afa": "map_223",
    "ce78a15537198f93": "map_224",
    "e60e2ae5e1f0142b": "map_225",
    "253d9b554530e34e": "map_226",
    "45791b4524a60de2": "map_227",
    "8851a9e8f2cca99c": "map_228",
    "4824cdd8133e0ba1": "map_229",
    "9212d331901e61a2": "map_230",
    "df026a179c978862": "map_231",
    "a762f08edadf182c": "map_232",
    "c2d15a736f0362cc": "map_233",
    "59a51009213c4d14": "map_234",
    "560085437919b3ae": "map_235",
    "0d5c29db0acf1dfb": "map_236",
    "f16b0b8ac870030f": "map_237",
    "daefa4f82e8c29a8": "map_238",
    "ef67e4e229519e25": "map_239",
    "93c43d4cbf4336ac": "map_241",
    "10f24ea2f4194e69": "map_242",
    "af6084c63a35ed62": "map_243",
    "be4ea0427c554cd9": "map_unknown_1",
    "0f0ddf1441b3f3f9": "map_unknown_2",
    "f49c0ae25167ed55": "map_unknown_3",
    "19f6ccb456f42e7f": "map_unknown_4",
    "380ac8da56af340d": "map_unknown_5",
    "39538e98b604697a": "map_unknown_6",
    "3d2050b7f6a05304": "map_unknown_7",
    "3e09b2d7ff4d577b": "map_unknown_8",
    "cf331dd3d89de0ce": "map_unknown_9",
    "45475481eebe059c": "map_unknown_10",
    "13195526e1e78f1c": "map_unknown_11",
    "03d23b256c30ee7f": "map_unknown_12",
    "6faf1c02e530f786": "map_unknown_13",
    "76ef1d27e887074e": "map_unknown_14",
    "3d71012efc9032a3": "map_unknown_15",
    "9185501964bb45be": "map_unknown_16",
    "9581eaef313284c0": "map_unknown_17",
    "9fce3adda53a3a0b": "map_unknown_18",
    "ab430e27123ff9c7": "map_unknown_19",
    "adb9d777182b38c4": "map_unknown_20",
    "af6d71c8d47db1cf": "map_unknown_21",
    "b5ea7150036f2049": "map_unknown_22",
    "c30a6f45f3118b03": "map_unknown_23",
    "cd64a52988a871c9": "map_unknown_24",
    "d008bb79be0f5d70": "map_unknown_25",
    "e3453d1d6d4231bd": "map_unknown_26",
    "e4f88b8e366fd60d": "map_unknown_27",
    "eab176917ac6057a": "map_unknown_28",
    "f3a481a4b3309457": "map_unknown_29",
    "f4fce3b5b60b3c5b": "map_unknown_30",
    "f7049de2b41b8c72": "map_unknown_31",

    // === Spritesheets ===
    "29de30eb871e6a80": "spritessheet_12x8_characters_1",
    "!5f2c6f7eccc9ce7c": "spritessheet_12x8_characters_2",
    "e6edcaf432253196": "spritessheet_12x8_characters_3",
    "!11544aa3c9d9c1d0": "spritessheet_12x8_characters_4", // "!Other2"
    "!b0d3c1937367e615": "spritessheet_12x8_characters_5", // "Actor6"
    "9f4926bf71ea081e": "spritessheet_12x8_characters_6",
    "!8dd72fe14c4dfc98": "spritessheet_12x8_characters_7", // "!Other3"
    "7d7d5b7fb68621e6": "spritessheet_12x8_characters_8", // "Actor1"
    "05a60f9a9844fd78": "spritessheet_12x8_characters_9", // "Actor2"
    "!2f9b8afe4feed70f": "spritessheet_12x8_characters_10", // "!Other1"
    "24b75a8f0c4d2590": "spritessheet_12x8_characters_11", // "Actor3"
    "947be83cc3cd63db": "spritessheet_12x8_characters_12",
    "!33ff3cdc5d1becfe": "spritessheet_12x8_characters_13",
    "9a0d0a3b36aaea9f": "spritessheet_12x8_characters_14",
    "!bb8d49d8f3d6ea56": "spritessheet_12x8_characters_15", // "!Other4"
    "6125287f520bf9d4": "spritessheet_12x8_characters_16",
    "2a6a9ef435715ef2": "spritessheet_12x8_characters_17", // "Actor4"
    "70aea8d2df30f33a": "spritessheet_12x8_characters_18", // "Actor5"
    "42f813e66a22d1ca": "stamp", // "stamp"
    "7264681f0ab11b47": "vn_buttons", // "VNButtons"
    "3be2dd83cc8de939": "states", // "States"
    "7c493e2658ac87cb": "options", // "options"
    "3ef8c87532694e08": "spritessheet_1x1_system_5",
    "e5230bf37c4fabb0": "loading", // "Loading"
    "7d6f1e67e074a178": "weapons_1", // "Weapons1"
    "ddd8237f2d4b4360": "weapons_2", // "Weapons2"
    "1311d51e1765316b": "shadow_2", // "Shadow2"
    "ddf9cdd7da11cc2a": "game_over", // "GameOver"
    "8b8bdf10b5c3bc7b": "continue", // "continue"
    "ffacabd73f8529e9": "window", // "Window"
    "547ae1cf2d9eecf9": "vision", // "vision"
    "766d372c84f1dac0": "icon_set", // "IconSet"
    "73b473e346224cb1": "new_game", // "new_game"
    "b35a172f174d8653": "damage", // "Damage"
    "5c380e0964eed8e4": "credits", // "credits"
    "eed4022786be328d": "shadow_1", // "Shadow1"
    "ad1c62514586e83b": "button_set", // "ButtonSet"
    "f633ab2ca861decf": "language", // "language"
    "65a05ab7b4f18191": "msgimg_0", // "msgimg_0"
    "f9248bf25001c910": "quit", // "quit"
    "30f14a2c7734a492": "weapons_3", // "Weapons3"
    "f8410e597b074776": "balloon", // "balloon"

    // Tilesets
    "c2ccf2930ff9deb6": "outside_a5", // "Outside_A5"

    // === Backgrounds ===
    "93fa9d26cc777f57": "ground_2",
    "c440ee2023de1a4b": "parallax_2",
    "d90f1f28b74c386f": "ground_3",
    "49e70c913c970d96": "parallax_3",
    "26472d7da1885ca9": "ground_4",
    "413628f4e3942051": "parallax_4",
    "d67196f29a0669bd": "ground_5",
    "2abe22319ff01828": "parallax_5",
    "0e4b049e654adcc2": "ground_6",
    "54ab0a7e383cea05": "parallax_6",
    "2854878e364d1f09": "ground_7",
    "aeb6d60963478d0a": "parallax_7",
    "0225d01841bb7841": "ground_8",
    "811d95f699513f4f": "ground_9",
    "3dbff278a2d24946": "parallax_9",
    "b7f9762041dd2936": "ground_10",
    "dbfc03bb8fe2d037": "parallax_10",
    "f5307397750f3fe3": "ground_11",
    "95990de3d07ecd53": "ground_12",
    "8ef09c19f418ebe5": "parallax_12",
    "bc71f43265e7a5aa": "ground_13",
    "b3f0d0032a0bffb5": "ground_14",
    "ed123b6f426b1130": "parallax_14",
    "ae136b1a8a9c9260": "ground_16",
    "0bd3fbd677797b85": "ground_17",
    "cc53aff867fd494f": "parallax_17",
    "bc910863ee07354d": "ground_18",
    "9f843ec3377ef4fe": "parallax_18",
    "8029b50924d441ef": "ground_20",
    "b4d9ac928a79976a": "parallax_20",
    "adc76bb1dcc11242": "ground_21",
    "91b56e3551048c4f": "parallax_21",
    "2d3e3aa9cbbed9c8": "ground_22",
    "4fafe495faf336ed": "parallax_22",
    "37122af8464c5512": "ground_23",
    "190707c8a49c722a": "parallax_23",
    "9e2dbcda46a5f8fc": "ground_24",
    "9491e0d95e977927": "parallax_24",
    "6eedeb504021a2d1": "ground_25",
    "c5b806daa3f564a8": "parallax_25",
    "c668c604c02be334": "ground_26",
    "fa6635920597366d": "parallax_26",
    "dfae681c4fe65989": "ground_27",
    "8a0ace8df26f2256": "parallax_27",
    "362ac9a3f52e16a8": "ground_28",
    "a7a3654c9dfb83c3": "parallax_28",
    "726f94691abe27e9": "parallax_29",
    "890955f2702c45ef": "ground_30",
    "bb6e19818331f35e": "parallax_30",
    "7ee9fe2deda50e53": "parallax_31",
    "5121fa18a6e6f0dc": "ground_31",
    "fc4d6d81f5279c93": "ground_32",
    "7cbcb9658a2c0d28": "parallax_32",
    "bab183cf848588f3": "ground_34",
    "6bfa4133bda1b1bd": "parallax_34",
    "a724c3e11ff25763": "ground_35",
    "86e51c32161f6113": "parallax_35",
    "d7feed662c51e8d6": "ground_36",
    "5056c20aa8498b3a": "parallax_36",
    "1364c8180f2abfc0": "ground_37",
    "4b3414a0204ac8eb": "parallax_37",
    "f90c129f8d53f9fa": "ground_38",
    "71e2e9224a09686f": "parallax_38",
    "f446a74f27f43a54": "ground_40",
    "59e5a3114ae4c713": "parallax_40",
    "33d923ca78d31f02": "ground_41",
    "11681dfd0616dca2": "parallax_41",
    "7bad12b38a73b159": "ground_42",
    "2883caea3cce4cff": "ground_43",
    "ccf6b73a23cf0953": "parallax_43",
    "6daf84df79633012": "ground_44",
    "bff36a0229498115": "parallax_44",
    "aeb8fcbe2a41b0ee": "ground_45",
    "5c0d625a675d5733": "parallax_45",
    "8dbf3779d2da2a62": "ground_46",
    "5134ba2a50b03994": "parallax_46",
    "48752fa5021e572f": "ground_47",
    "358fc333d6362f33": "ground_48",
    "c93a6918b13dc0c1": "parallax_48",
    "e98748428f1a9c85": "ground_49",
    "cd4c4cc7fbc322ce": "parallax_49",
    "b08a9bfca03b1ff0": "ground_50",
    "18d16b86bfdd4b18": "parallax_50",
    "8789b3405ae6ae11": "ground_51",
    "a94737f875af0538": "parallax_51",
    "8d3661dac79d6ed7": "ground_52",
    "4d10dccfcf439cd1": "ground_53",
    "1d7f4ede43732811": "ground_54",
    "5ef8767edb6d8466": "parallax_54",
    "969b3e7feaf36b8c": "ground_55",
    "0f42142d358a32f8": "ground_56",
    "26da93a9ad64caf4": "ground_57",
    "c181f10fd6b40cf6": "ground_59",
    "1ce8dddbe56c4d59": "ground_60",
    "3571164f571c1fc6": "parallax_60",
    "617f4dfad5731b91": "ground_76",
    "d0b31d28bd66c1c4": "parallax_76",
    "2aee845dfa17fbc3": "ground_90",
    "c4ea6d2b8a93873c": "parallax_90",
    "ae5e1216c30b4a87": "ground_91",
    "d4d61951a86f8070": "parallax_91",
    "a7af2c55323736bd": "ground_92",
    "51437577c0e1aec6": "parallax_92",
    "f2debc90d12c41a4": "ground_93",
    "a11a12b1ee2fc8dd": "parallax_93",
    "3393beb5d1744cce": "ground_94",
    "8eb36e01b9918f9f": "parallax_94",
    "6ebfb2746b1a7bd6": "ground_75",
    "ebe61742ae2f38f6": "ground_29",
    "ba8d17b339457b2f": "parallax_42",

    // === Pictures ===
    "a79c3d2b67d5ab92": "pictures_1",
    "c94e61c5989187d2": "pictures_2",
    "3e22ff37cb58267d": "pictures_3", // "ground60_block"
    "3dbb9ec091468a0e": "pictures_4", // "duodinner"
    "5f4619f86d783300": "pictures_5", // "feed_1a"
    "b20d9b012d6476fd": "pictures_6", // "feed_1b"
    "bcd62b27274b7781": "pictures_7", // "feed_1c"
    "cf50c33324a2a03d": "pictures_8", // "feed_2a"
    "5c19b921a91bba36": "pictures_9", // "feed_2b"
    "a1259d7436b18c16": "pictures_10", // "feed_2c"
    "c9631215c7130c38": "pictures_11", // "floor_1a"
    "dad4070c721a72fc": "pictures_12", // "duofloor"
    "77d90f6e47ceaa8a": "pictures_13", // "floor_1b"
    "c80536efceec240c": "pictures_14", // "brocouch"
    "43f98b69ec10a48e": "pictures_15", // "duocouch"
    "d7e2183a3761aabe": "pictures_16", // "phone_a"
    "d2e03c302d89b51c": "pictures_17", // "phone_b"
    "6570aa3fc508a649": "pictures_18", // "drawing"
    "f5e4f25d43a370f9": "pictures_19", // "sisbed"
    "e1996c6201cf6a4c": "pictures_20", // "bed_1a"
    "d3ec21c0d3353ef3": "pictures_21", // "bed_1b"
    "2d6dc65205e1af37": "pictures_22", // "bed_1c"
    "3fe4c8cb1d18940b": "pictures_23", // "bed_1d"
    "5e9dd15a50e36b58": "pictures_24", // "duobed"
    "89a90848c81c27cd": "pictures_25", // "bed_aaandrew"
    "bec8e9c5746b522c": "pictures_26", // "bed_andrew"
    "609d141307c3c529": "pictures_27", // "bed_andy"
    "aa5c0e61b18349f0": "pictures_28", // "bed_bite"
    "bacd1f23643b67c3": "pictures_29", // "peek_1b"
    "4940f65d5d9641b7": "pictures_30", // "door_0"
    "0b496c2df72e9815": "pictures_31", // "door_1a"
    "898dfb89649ee746": "pictures_32", // "door_1b"
    "9a7eeda47205e438": "pictures_33", // "door_2a"
    "fb81ef6b2fdc7cfb": "pictures_34", // "door_2b"
    "6f760c3732d0fd82": "pictures_35", // "door_3a"
    "92513b85266edfd9": "pictures_36", // "door_3b"
    "fc1cb4d2ab450a11": "pictures_37", // "door_4a"
    "be0d7a30b60745e4": "pictures_38", // "door_4b"
    "168a70d2e89c2cd6": "pictures_39", // "kill_1a"
    "9cc1a75ad904db7b": "pictures_40", // "kill_1b"
    "e30f95b9c0b6a345": "pictures_41", // "kill_2a"
    "5d092c9d114cb0d8": "pictures_42", // "kill_2b"
    "71d2c44fd082c455": "pictures_43", // "kill_2c"
    "becdbae122fbb902": "pictures_44", // "kill_2d"
    "a392d6ec1277ca48": "pictures_45", // "kill_3a"
    "e39d90e3f45836d9": "pictures_46", // "kill_3b"
    "660f9bc4fb0fcdcb": "pictures_47", // "kill_3c"
    "f9294fbbb3ee4e16": "pictures_48", // "kill_4a"
    "604de9b977953588": "pictures_49", // "kill_4b"
    "8c5ce6501c63bbce": "pictures_50", // "torso_1a"
    "25563c1aec5bf3c1": "pictures_51", // "torso_1b"
    "4f555b9b83aa50ca": "pictures_52",
    "b62309a8e40fa7af": "pictures_53",
    "202c076ba68af1c6": "pictures_54", // "peek_1a"
    "fc16e2640958c57d": "pictures_55", // "knife"
    "fd7e0705f1472312": "pictures_56", // "taunt_a"
    "094767301ae65b85": "pictures_57", // "taunt_b"
    "848fde43c5c801cf": "pictures_58", // "grab_a"
    "27c855f75915e828": "pictures_59", // "grab_b"
    "1f5987a6eb24d509": "pictures_60", // "grab_c"
    "10a154d88e785213": "pictures_61", // "ca_talk"
    "8eaaf648a60e7cb3": "pictures_62", // "cl_mock"
    "a06209a1b3f3c37b": "pictures_63", // "ca_listen"
    "33b337eac7e28435": "pictures_64", // "cl_lol"
    "cd861c4984a264e7": "pictures_65", // "cl_grin"
    "6ab1334d180d7834": "pictures_66", // "cl_plead"
    "3af7d9eb29740ffe": "pictures_67", // "ca_ask"
    "fde793fdaab54476": "pictures_68", // "cl_mad"
    "17887cedb241b690": "pictures_69", // "ca_angry"
    "4a9eed4896ae3c23": "pictures_70", // "cl_yeah"
    "50329e80c420326d": "pictures_71", // "cl_meh"
    "2d769dd2277e8644": "pictures_72", // "ca_tired"
    "8ae9d4857713d91f": "pictures_73", // "letgo"
    "10f8f2491b0a555d": "pictures_74", // "latch_a"
    "9b9da01832c368c2": "pictures_75", // "latch_b"
    "6459a3eeb2f69688": "pictures_76", // "hug"
    "149c84690b3ca46d": "pictures_77", // "cameraview"
    "5972d18a4e7f34a8": "pictures_78", // "keys"
    "4bb0151c008236ca": "pictures_79", // "ch1"
    "e8986f2887e9f3ef": "pictures_80", // "op_a"
    "458431a83e2a9eb0": "pictures_81", // "op_b"
    "c9459be26cfecbf1": "pictures_82", // "wake_1a"
    "a7e512f0c019b996": "pictures_83", // "wake_1b"
    "069c58d691c54d4e": "pictures_84", // "memory_1a"
    "a9edeabc3078c25b": "pictures_85", // "memory_1b"
    "8711024bbb8eda54": "pictures_86", // "end_a"
    "19ad20c2e5175806": "pictures_87", // "end_b"
    "22157a03c95858af": "pictures_88", // "end_c"
    "9f2ccafdb1439a07": "pictures_89", // "end_d"
    "6082fc02be98102f": "pictures_90", // "end_e"
    "47b90b8577d12e80": "pictures_91", // "endcard"
    "3abe3cbb8a49bd40": "pictures_92", // "cry_a"
    "8d33b2baeec39474": "pictures_93", // "cry_b"
    "270dbe39a4977182": "pictures_94", // "crate_a"
    "8b58f0ddab904ce7": "pictures_95", // "crate_b"
    "1cbdd1313aa8bbd1": "pictures_96", // "crate_c"
    "6bd923293f4c3846": "pictures_97", // "crate2_a"
    "00090f8ebda9a535": "pictures_98", // "crate2_b"
    "aabe56b92d30d2d2": "pictures_99", // "crate2_c"
    "615c9ecc24a767a3": "pictures_100", // "crate_slam"
    "72d79d3064e37967": "pictures_101", // "fb_shock"
    "fc33d345746320c3": "pictures_102", // "fb_shock_b"
    "74bcb642e0e0903a": "pictures_103", // "fb_curlup_a"
    "6849bfd72e35fc3b": "pictures_104", // "fb_curlup_b"
    "8d4ddf01ad3baf83": "pictures_105", // "fb_curlup_c"
    "e3e2fe2d355ecdae": "pictures_106", // "fb_shake"
    "af2acd55795b1af2": "pictures_107", // "hide_a"
    "ba5d6a899cb84b5f": "pictures_108", // "hide_b"
    "66cd890a68dba484": "pictures_109", // "hide_c"
    "75a631468794f9c1": "pictures_110", // "hide_d"
    "ef629f640d847c8c": "pictures_111", // "hide2_a"
    "906a4c3333b1c816": "pictures_112", // "hide2_b"
    "057974b069d30654": "pictures_113", // "ch2"
    "0ac46efc3e1326a6": "pictures_114", // "duodiner"
    "bf2f03cdcfef91fa": "pictures_115", // "lighter_a"
    "c1d7e2b47fb6ee1e": "pictures_116", // "lighter_b"
    "eef0bbb24ffe955e": "pictures_117", // "pov_none"
    "b297744b06b161a0": "pictures_118", // "pov_ashley"
    "99151e814741c388": "pictures_119", // "tvad_frame"
    "90c89e42d0231360": "pictures_120", // "tvad_a"
    "99293c069863c881": "pictures_121", // "tvad_b"
    "8fa16b4ad16de470": "pictures_122", // "tvad_c"
    "c6f58ee1735b5e88": "pictures_123", // "tvad_d"
    "640911fda2b1133c": "pictures_124", // "tvad_e"
    "6b812df629e31826": "pictures_125", // "tvad_f"
    "ef5d18e2e8d2e126": "pictures_126", // "hitmanwins"
    "b27513849fd0ebe0": "pictures_127", // "couch_a"
    "2999437d372fdcb1": "pictures_128", // "couch_b"
    "22a6a53d73312f1d": "pictures_129", // "couch_c"
    "e777bfdb7790c4df": "pictures_130", // "couch_d"
    "dfac7b98f43f254e": "pictures_131", // "couch_e"
    "fd1783eede86a83f": "pictures_132", // "couch2_a"
    "1ff8f87ffc9ba37a": "pictures_133", // "couch2_b"
    "f6406b9906fbcfae": "pictures_134", // "couch2_c"
    "ea3d89ab6fbb468f": "pictures_135", // "couch2_d"
    "c99312934d4fc24c": "pictures_136", // "motel_sis"
    "0a5d6a6d65f3b870": "pictures_137", // "motel_bro"
    "985a9dfa36907f93": "pictures_138", // "blur_motel"
    "c6b6668a0a866b7b": "pictures_139", // "motel_bro_dead"
    "aae5c665889a8f35": "pictures_140", // "motel_sis_dead"
    "734723dde1ec6dc4": "pictures_141", // "wake_first_vision_a"
    "65bc2642b1807cb3": "pictures_142", // "wake_first_vision_b"
    "5dc3a7e830da4a63": "pictures_143", // "motel_bro_b"
    "581080edc31fbd04": "pictures_144", // "smokes_a"
    "b49c5190a54058b1": "pictures_145", // "smokes_b"
    "e3f7ef3e6254aaf5": "pictures_146", // "smokes_c"
    "284f60333a39fe39": "pictures_147", // "smokes_d"
    "7696ffc76a7dc458": "pictures_148", // "smokes2_a"
    "a1231f68d55bd33c": "pictures_149", // "smokes2_b"
    "c3950249e6675054": "pictures_150", // "smokes2_c"
    "54b9052d70e39f8b": "pictures_151", // "pov_andrew"
    "f7839005d935c93d": "pictures_152", // "give_gun"
    "d84324d3940773f6": "pictures_153", // "car_a1"
    "bdcd9fd4b9c5693d": "pictures_154", // "car_a2"
    "d16f949daf2cd3a4": "pictures_155", // "car_b1"
    "50445084a2cf21ac": "pictures_156", // "car_b2"
    "4cf88856108688ab": "pictures_157",
    "3a5f48bad5ea6f2b": "pictures_158",
    "586b619c0ea5a766": "pictures_159", // "car_c3"
    "254b44b3caf8ab20": "pictures_160", // "car_c4"
    "0f163ef582eddeba": "pictures_161",
    "70ec6ff81eee9a3e": "pictures_162", // "car_c5"
    "abb78483f9504f84": "pictures_163",
    "7bd6fe7cc31df9ef": "pictures_164", // "car_d1"
    "1fe7ed71fa71f916": "pictures_165", // "car_d2"
    "67e9b1317f33e263": "pictures_166", // "car_e1"
    "06b135020f98f199": "pictures_167", // "car_e2"
    "ad2cd94cca9617c2": "pictures_168", // "carwake1_a"
    "4fa1dab19269970e": "pictures_169", // "carwake1_b"
    "f3488edebd2c01ca": "pictures_170", // "duo_car"
    "334cac0c244c359f": "pictures_171", // "carwake1_c"
    "eac2b86f88928871": "pictures_172", // "carwake1_d"
    "2024c94008299c5c": "pictures_173", // "carwake2_a"
    "662db332d90afa6b": "pictures_174", // "carwake2_b"
    "42e3fcdfe6df7c8b": "pictures_175", // "carwake2_c"
    "c20a68f20235c3d2": "pictures_176", // "carwake2_d"
    "4d3fc205dc3378f6": "pictures_177", // "carwake2_e"
    "a7d561d0e35b25dc": "pictures_178", // "cart_a"
    "ecaf3d8a9a591f00": "pictures_179", // "cart_b"
    "55c5e05e00443768": "pictures_180", // "curtain"
    "d294007469270d86": "pictures_181", // "fb_lemoncake"
    "f2953fc6219c8b2d": "pictures_182", // "eye_puzzle_halo"
    "c35e0223f47e364e": "pictures_183", // "fb_ley_table"
    "8d0f07578e5fbaea": "pictures_184", // "fb_card"
    "6aed563a63479ef0": "pictures_185", // "fb_ley_a"
    "ecd165db3b4f5e9c": "pictures_186", // "fb_ley_b"
    "2b43bdf518c1d912": "pictures_187", // "fb_ley_c"
    "f1e9727e3a6be1b5": "pictures_188", // "fb_duo_tv"
    "242d2c943b7f956b": "pictures_189", // "fb_tv_a"
    "87bb08fbc56b3db3": "pictures_190", // "fb_tv_b"
    "db59f669ad36accd": "pictures_191", // "fb_hug_a"
    "a3771790183e6efc": "pictures_192", // "fb_hug_b"
    "efbd6b41ff1cd6ba": "pictures_193", // "milkcarton"
    "6b19b3992c070ea5": "pictures_194",
    "388b09ae68f7e3d3": "pictures_195", // "window_latch"
    "87f57ebec44382da": "pictures_196", // "window_latch_open"
    "2a2f7605fbb9e1a2": "pictures_197", // "door_bye"
    "579009fb34224613": "pictures_198", // "door_bye_alt"
    "4ca131e8b13037e0": "pictures_199", // "whisper_a"
    "d43605d80ee6a106": "pictures_200", // "whisper_b"
    "7be75fdb7265f12f": "pictures_201", // "sofa_c"
    "b2f80fc164e016a5": "pictures_202", // "sofa_d"
    "04100d9951896914": "pictures_203", // "sofa_e"
    "d18f4b4080926868": "pictures_204", // "sofa_f"
    "576ab60dd29db965": "pictures_205", // "sofa_g"
    "fe67047f96a248c0": "pictures_206", // "sofa2_h"
    "0c345b0b64e3d4aa": "pictures_207", // "sofa2_h2"
    "a755d40d8185f1e3": "pictures_208", // "gun_a"
    "fa4208bfe85d3878": "pictures_209", // "gun_b"
    "09b00beef6fb9c5c": "pictures_210", // "gun_c"
    "f815abd6b0d2e06b": "pictures_211", // "gun_c_bullets"
    "237d9c60c8f61a66": "pictures_212", // "sleeptrinket1_a"
    "4a2d34bb21966b4e": "pictures_213", // "sleeptrinket1_b"
    "45fa9459026964b3": "pictures_214", // "sleeptrinket1_c"
    "e07663a5a25baae1": "pictures_215", // "sleeptrinket2_a"
    "ac9abbdb56ad30c5": "pictures_216", // "sleeptrinket2_b"
    "b5364ee6c6175fe3": "pictures_217", // "sleeptrinket3"
    "9895fdb7cda5108a": "pictures_218", // "hv_5a"
    "428c2f70a00fae47": "pictures_219",
    "3c43d16833122b7d": "pictures_220", // "hv_6a"
    "d2e6a90b4991c968": "pictures_221", // "hv_6b"
    "63a67f25b034c85d": "pictures_222", // "rb_wake1b"
    "c23280307b30c555": "pictures_223", // "rb_wake1c"
    "4ce30dfac6bb9b05": "pictures_224", // "rb_chokeb_fb"
    "6f1b90b1031ceabb": "pictures_225", // "rb_choke_fb"
    "69f0a8fb4a4904ad": "pictures_226", // "dinner_dishes_a"
    "77f8de5eae49764e": "pictures_227", // "dinner_dishes_b"
    "e872d53336bc384c": "pictures_228", // "dinner_family"
    "1dad9f636255bad6": "pictures_229", // "dinner_duo"
    "5993f87e50a5852f": "pictures_230", // "feed_reprise"
    "b654b2e6dfab0b90": "pictures_231", // "noandy_a"
    "954c1e7cc26583e9": "pictures_232", // "noandy_b"
    "9005e6aa380cefa9": "pictures_233", // "noandy_c"
    "5bef10be2269bbea": "pictures_234", // "noandy_d"
    "6c4de407e516698a": "pictures_235", // "noandy_e"
    "230a59bcdd85ee12": "pictures_236", // "noandy_f_alt"
    "f732aeb277474c0d": "pictures_237", // "noandy_f"
    "6f766e0a47210b1f": "pictures_238", // "kitchen_a"
    "e2699947cf021b78": "pictures_239", // "kitchen_b"
    "bd971cd44e354e62": "pictures_240", // "kitchen_c"
    "7873715f1cae10d6": "pictures_241", // "kitchen_d"
    "e3abf15fb52d3f9c": "pictures_242", // "kitchen2_a"
    "7e14970ec52e3df0": "pictures_243", // "kitchen2_b"
    "952a2baee2f13422": "pictures_244", // "coffee"
    "b03274763ff93071": "pictures_245", // "coffee_kick"
    "5219e16207fa159b": "pictures_246", // "sever_a"
    "3f4265711087d03c": "pictures_247", // "sever_b"
    "e2cd398e72a890c5": "pictures_248", // "ra_butcher_1a"
    "6d526f023c6ca9c8": "pictures_249", // "ra_butcher_1b"
    "339f1f109fbcfb5a": "pictures_250", // "ra_butcher_1c"
    "544794daa2f79165": "pictures_251", // "ra_butcher_1d"
    "209a6c2dc98742f7": "pictures_252", // "ra_butcher_2c"
    "c746959e4997b5d0": "pictures_253", // "ra_butcher_3a"
    "9b45364fe869bf37": "pictures_254", // "ra_butcher_3b"
    "f0a94597f099fb2b": "pictures_255", // "ra_butcher_3c"
    "1e85cda522c885dd": "pictures_256", // "rb_butcher_1a"
    "efc7fe2f750926be": "pictures_257", // "rb_butcher_1b"
    "503eb2f4ddcc4282": "pictures_258", // "rb_butcher_1c"
    "c794672e861fdfd0": "pictures_259", // "rb_butcher_2b"
    "3eb4e353e371e504": "pictures_260", // "rb_butcher_3a"
    "ae5cd1ea16defc2d": "pictures_261", // "rb_butcher_3b"
    "841378aae9ed38e5": "pictures_262", // "rb_butcher_4a"
    "ba9ceaf98b12b582": "pictures_263", // "rb_butcher_4b"
    "000d21aa3d82d7ef": "pictures_264", // "rb_butcher_4c"
    "3c24c674eb39ed26": "pictures_265", // "rb_catch_1a"
    "46ceb8a03c4e502a": "pictures_266", // "ashley_final_warning"
    "8798c963d26e560b": "pictures_267", // "cut_mom"
    "656c6ae7133a54a6": "pictures_268", // "cut_dad_a"
    "be1e34f309e4bcc8": "pictures_269", // "cut_dad_b"
    "44f0ddc97a59772c": "pictures_270", // "shrug"
    "966666681eba35da": "pictures_271", // "stabmom_a_cut"
    "4007887e993e3f97": "pictures_272", // "stabmom_a"
    "43c99e6a91140117": "pictures_273", // "stabmom_b"
    "b023638a629816c0": "pictures_274", // "stabmom_c"
    "47db3073cb206e43": "pictures_275", // "knife_dad"
    "d6a961ab47a9c17a": "pictures_276",
    "32083b9be620c422": "pictures_277",
    "8bdd313d98829e46": "pictures_278", // "accept_a"
    "8657ac6d279cbe8d": "pictures_279", // "accept_b"
    "e1ba8c1d0420bd3c": "pictures_280", // "accept_c"
    "06a3cadd8c3249f5": "pictures_281", // "decline_a_cut"
    "a639dfbb4bad3334": "pictures_282", // "decline_a"
    "3c3a7389e2fc7efc": "pictures_283", // "decline2_a"
    "4414311e2ee8ce9c": "pictures_284", // "decline2_b"
    "00eed50cccf6d1b6": "pictures_285", // "decline2_c_cut"
    "3a8bfb66afcc8e2e": "pictures_286", // "decline2_c"
    "9056928e60358c44": "pictures_287", // "decline2_d"
    "11236ab2abad4167": "pictures_288", // "decline2_d_cut"
    "6aff87c1816e38d5": "pictures_289", // "decline3_a"
    "1a2c887c1143200f": "pictures_290", // "decline3_b"
    "3370e42062a16360": "pictures_291", // "decline3_c"
    "313694eb2f339940": "pictures_292", // "decline3_d"
    "3bc6c2e9b52e4903": "pictures_293", // "fauxcomfort_a"
    "f26a50e3656debea": "pictures_294", // "fauxcomfort_b"
    "4ac018799a1558f1": "pictures_295", // "fauxcomfort_c"
    "d5307123da9ff10b": "pictures_296", // "fauxcomfort_d"
    "d3e441652bc84cc8": "pictures_297", // "fauxcomfort_e"
    "f65177a973764818": "pictures_298", // "fb_bff_a"
    "8de678ad8482ba75": "pictures_299", // "fb_bff_b"
    "7b199166b3c4c1c7": "pictures_300", // "car_c1"
    "5d1d2001facd85b1": "pictures_301", // "andy_angst"
    "3a6612e8e7cfbf62": "pictures_302", // "andy_urghhhhhhhh_a"
    "247296309988ca20": "pictures_303", // "andy_urghhhhhhhh_b"
    "4b84ff6ce7a6f01f": "pictures_304", // "oath1_a"
    "84b1a77b81496e1b": "pictures_305", // "oath1_b"
    "eb385cf8f9b50f76": "pictures_306", // "oath1_c"
    "227d16a496463a1f": "pictures_307", // "oath1_d"
    "7a5873e53c2994a8": "pictures_308", // "oath2_a"
    "ac084ea2094e9824": "pictures_309", // "oath2_b"
    "af86ba44ab7da7ce": "pictures_310", // "oath2_c"
    "e6002192de482747": "pictures_311", // "oath2_d"
    "12e892e3c34436d5": "pictures_312", // "oath3_a"
    "7688ab0803e06058": "pictures_313", // "oath3_b"
    "da5de1c82cc90398": "pictures_314", // "car_c2"
    "4a027c45196ee196": "pictures_315", // "oath3_d"
    "44e364455f671809": "pictures_316",
    "19cf9fb37530a655": "pictures_317",
    "6d4c33738b795f26": "pictures_318",
    "bfb74685f1e0f85b": "pictures_319",
    "022a8ee874a35430": "pictures_320",
    "30ea054b0f74379a": "pictures_321",
    "87c917cd2e22cc7c": "pictures_322",
    "5e3aef2d5a914544": "pictures_323",
    "7ad296f6f06ec212": "pictures_324",
    "6816a06deb7cac89": "pictures_325", // "julia_a"
    "9227ef0f5846ed2d": "pictures_326", // "julia_b"
    "96e3e429a6644472": "pictures_327", // "julia_c"
    "2698ce32bbb20d9b": "pictures_328", // "island_b"
    "8294276439fc2e34": "pictures_329", // "island_c"
    "7b315c40c45a6dd9": "pictures_330", // "island_a"
    "3c813e43e423988a": "pictures_331", // "stalker"
    "411a1054f1ecd81b": "pictures_332", // "bridge_h1_a"
    "613d33abbc8c22c4": "pictures_333", // "bridge_h1_b"
    "cfaf812c8b0ecb65": "pictures_334", // "bridge_h_push"
    "e9e7d26b5316c9e5": "pictures_335", // "bridge_h_pf_a"
    "76b458655a41147d": "pictures_336", // "bridge_h_pf_b"
    "e8d78ce5e31742f5": "pictures_337", // "bridge_h_pf_c"
    "2b9eb1707d8053f9": "pictures_338", // "bridge_h_pf_d"
    "e87d3e7b8ff4fd8f": "pictures_339", // "bridge_h_pf_e"
    "948a94cec1f510cc": "pictures_340", // "bridge_h_mopea"
    "fe8e9d3bda3a77c9": "pictures_341", // "bridge_h_mopeb"
    "b76d8b426fd20038": "pictures_342", // "hex_a"
    "c178b05f20a956cf": "pictures_343", // "hex_b"
    "85ed0f95a6a7cd00": "pictures_344", // "hex_c"
    "a3b52381f668ac8b": "pictures_345", // "hex_d"
    "ba0256e29de431c3": "pictures_346", // "bridge_rb1_a"
    "48a210921fd8ce2e": "pictures_347", // "bridge_rb1_b"
    "136758b91d834896": "pictures_348", // "bridge_rb1_c"
    "4e1c2890e4ae1ccb": "pictures_349", // "bridge_rb1_d"
    "7b02093f1308aa86": "pictures_350", // "bridge_rb1_e"
    "b7be0f71948fc5c0": "pictures_351", // "bridge_rb3"
    "4df4fcf34924b581": "pictures_352", // "door_spotlight_a"
    "ea58231f404ca0c0": "pictures_353", // "door_spotlight_left"
    "b1081b01f534a2c6": "pictures_354", // "door_spotlight_right"
    "0999e1e635701bc3": "pictures_355", // "drawing_fix_classmates"
    "6ae3ade0e3428b1e": "pictures_356", // "drawing_fix_friends"
    "1a54d1acc9755608": "pictures_357", // "drawing_fix_parent"
    "b9af5ec9fec44fb3": "pictures_358", // "hv_1a"
    "86eca52b86ce9e8c": "pictures_359", // "hv_1b"
    "6976448650fed99a": "pictures_360", // "hv_2"
    "8b006b9aa65c6a39": "pictures_361", // "hv3a_1"
    "25303aac82d9515c": "pictures_362", // "hv3a_2"
    "1fd20320c2a8f5ea": "pictures_363", // "hv3b_1"
    "e20f8ca4f0ec7356": "pictures_364", // "hv3a_3"
    "465d290206f8e357": "pictures_365", // "hv3b_2"
    "ea19f233527f51c7": "pictures_366", // "hv3b_3"
    "bec3b3499844c59e": "pictures_367", // "hv_4"
    "7034efd9bc1c5315": "pictures_368",
    "0c8cae915acc2fd2": "pictures_369", // "hint_red"
    "8b8514d0e3417e54": "pictures_370", // "hint_green_blue"
    "fe81c2234c75d03d": "pictures_371",
    "4c3fc3e376774d0f": "pictures_372",
    "4eba2e1aacd04b0d": "pictures_373", // "LU_eyes_c"
    "66cb56211531cb91": "pictures_374", // "LU_eyes_a"
    "4c198c62430242f8": "pictures_375", // "LU_eyes_b"
    "cab5b910f15e951c": "pictures_376",
    "5b83cdc699d771cc": "pictures_377", // "tag"
    "142182d32f4a3615": "pictures_378",
    "6ca64f516c75587f": "pictures_379", // "rb_catch_1b"
    "91a310b44960aea8": "pictures_380", // "rb_catch_1c"
    "f54794233bdccbe9": "pictures_381", // "rb_catch_1d"
    "4371a01b45e06fb9": "pictures_382", // "rb_catch_2a"
    "ed09b799b56c6442": "pictures_383", // "guesswhat_a"
    "b5a10a6bfedd4e68": "pictures_384", // "guesswhat_b"
    "14378b843d4ff7f4": "pictures_385", // "guesswhat_c"
    "d50941826e3857f3": "pictures_386", // "kick"
    "de8ad42673acaf1d": "pictures_387", // "nokill_sis_a"
    "7cabee34991e6939": "pictures_388", // "nokill_sis_b"
    "1a5e1fc17af1a551": "pictures_389", // "nokill_sis_c"
    "1d07386a8391c7b6": "pictures_390", // "LU"
    "44a4398378d5c7f6": "pictures_391",
    "b80b6536ee95a483": "pictures_392",
    "1b29cbfd933db9d9": "pictures_393",
    "1eb3e6f74706b1f0": "pictures_394",
    "84cda5bde98988c2": "pictures_395",
    "2ae3a356f087b5a7": "pictures_396",
    "6e9856c2d6e5d4e6": "pictures_397",
    "8dbe450f40302061": "pictures_398",
    "a154f537a25dd1e2": "pictures_399",
    "576bbe53971e82f7": "pictures_400",
    "f06a1d176b3e1706": "pictures_401",
    "b05434ec6ae22f78": "pictures_402",
    "5114ab1dba1ed044": "pictures_403",
    "8d65692f31d543e8": "pictures_404",
    "39118af5fbf37f74": "pictures_405",
    "b492e6b376080d34": "pictures_406",
    "abaa1aee02cfa414": "pictures_407",
    "c04287f70b3f3f9a": "pictures_408",
    "e1422a39a993b541": "pictures_409",
    "3b9512758e2fdb92": "pictures_410",
    "7819341fb278fa29": "pictures_411",
    "470daff617d61456": "pictures_412",
    "d6f06e7e9a189af7": "pictures_413",
    "89a49ba20709e794": "pictures_414",
    "f22b3c5a342d9636": "pictures_415",
    "2c6f11eab3116b62": "pictures_416",
    "23f4a90b4b4b9c75": "pictures_417",
    "5e1001d7277e0b27": "pictures_418",
    "c6a5c8e043a16fab": "pictures_419",
    "e0fbc265cfa4613c": "pictures_420",
    "6ed5aef5fd7dc8a7": "pictures_421",
    "e755f75009de660e": "pictures_422",
    "99f053d7e3b7c21a": "pictures_423",
    "08348e2658c15d64": "pictures_424",
    "1cab08c53f3e762b": "pictures_425",
    "53d86b2fb35afdf5": "pictures_426",
    "4760b9414854c1ec": "pictures_427",
    "36345669be11761d": "pictures_428",
    "e7ab1b6183eae934": "pictures_429",
    "aaccd613ab968230": "pictures_430",
    "c932e525bed62f01": "pictures_431",
    "c832c73863fc6af6": "pictures_432",
    "d7d78760466af83c": "pictures_433",
    "cf47f21aff3f6040": "pictures_434",
    "5a06b8ff36fe1a31": "pictures_435",
    "e92795b829234b6e": "pictures_436",
    "a3769e76ccb4ed5e": "pictures_437",
    "d7369cb91b7a9099": "pictures_438",
    "b1a4708b0d924751": "pictures_439",
    "2eea5e5f99f23b40": "pictures_440",
    "0dc4d6e9aed111e8": "pictures_441",
    "972900d835825bdd": "pictures_442",
    "0ebb768c6ab206fd": "pictures_443", // "hv_5b"
    "886c8b3f63b9a0dc": "pictures_444",
    "aa650f4ee9426ec5": "pictures_445",
    "8ce085781a32694d": "pictures_446",
    "5535e4931b9cc61c": "pictures_447",
    "c34bc1efa7360f0f": "pictures_448",
    "81770648fc4dc632": "pictures_449",
    "0ebc377ecf3e6bfb": "pictures_450",
    "51cc1fe113b8f58d": "pictures_451",
    "d41fe2c66f664b51": "pictures_452",
    "1a50ea9eb0a6106c": "pictures_453",
    "289bb880ccca57b3": "pictures_454",
    "2f8e14999d69db13": "pictures_455",
    "2029b31e2bff87a7": "pictures_456",
    "9ecd968226340903": "pictures_457",
    "858be6403c682b79": "pictures_458",
    "8570057c9ba66781": "pictures_459",
    "c526fd3e61408963": "pictures_460",
    "1bd7a4c33f40ff8d": "pictures_461", // "black"
    "5e30161743b26cd0": "pictures_462",
    "ee7e05f55895fe2f": "pictures_463",
    "78c3f26d3aedb948": "pictures_464",
    "d8f00b3d97b16874": "pictures_465",
    "f1df6f2d506f4f87": "pictures_466",
    "59bef4f2f0e2aa38": "pictures_467",
    "046c2cc1af8bad6a": "pictures_468",
    "e1bf4896fb791654": "pictures_469",
    "3ed58b4aff4f4d48": "pictures_470",
    "3a7f235824cdb0b9": "pictures_471",
    "0ae4ccd567b26b4c": "pictures_472",
    "2517e482b897b92b": "pictures_473",
    "667e41d772bff204": "pictures_474",
    "93033cf520d2483a": "pictures_475",
    "f9658fa26d47dec8": "pictures_476",
    "a21df8ced286bc7b": "pictures_477",
    "6a708f2e26bbd19c": "pictures_478",
    "939ee486a5542d01": "pictures_479",
    "b6c360726d1f70fe": "pictures_480",
    "8302d4d7f2f994d0": "pictures_481",
    "3fb66293f18b9ce7": "pictures_482",
    "0da837083db973f2": "pictures_483",
    "a0e206cf11234649": "pictures_484",
    "e46cbaf9895be540": "pictures_485",
    "f501a7f4c1ed68cf": "pictures_486",
    "6e73bd41746fc810": "pictures_487",
    "954bcc80944dad1b": "pictures_488",
    "39b333b3fe5c4834": "pictures_489", // "car_c6"
    "9cc0be0d733916c2": "pictures_490", // "car_c7"
    "3172339a0fe63832": "pictures_491",
    "1872905bd40d3b9a": "pictures_492",
    "c1e1792d7491b4cd": "pictures_493",
    "6a45fd3dc40871ae": "pictures_494",
    "d4248643171d8622": "pictures_495",
    "2bac126499db13ff": "pictures_496",
    "e46d2ce9bb79cadb": "pictures_497",
    "20c0e40ebd8b5390": "pictures_498",
    "d3034c171430e6af": "pictures_499",
    "a01110fb88e2548d": "pictures_500",
    "59d1dc1456d3ce55": "pictures_501",
    "10ddda87b2b8f8c5": "pictures_502",
    "d056aab8a6bb3d5d": "pictures_503",
    "82f43c5701c3e8f6": "pictures_504",
    "a5c3e3c81bf41821": "pictures_505",
    "94e2cad3cd00b929": "pictures_506",
    "c1a326a5d5884e6a": "pictures_507",
    "fe72b9a262224d0e": "pictures_508",
    "db51a3d49e85c997": "pictures_509",
    "8810aad265b441c1": "pictures_510",
    "fb8414ed2505838f": "pictures_511",
    "a085619205cba56d": "pictures_512",
    "a4e1b56f58a2698e": "pictures_513",
    "8608eea61bffcacc": "pictures_514",
    "3f760e2735fe9bf0": "pictures_515", // "fb_bff_c"
    "5e36738214753749": "pictures_516",
    "359a7ef9692806b2": "pictures_517",
    "f2e1db203a4a0ee4": "pictures_518",
    "bded826f9d67cbe2": "pictures_519",
    "93548a52adb40294": "pictures_520",
    "6bb1140279007af0": "pictures_521",
    "70e75b4f429064d4": "pictures_522",
    "8c87700f3998c292": "pictures_523",
    "7c9518e8495cd401": "pictures_524",
    "932c38eb518c1df2": "pictures_525",
    "469c76966d386c3f": "pictures_526",
    "770ee53479eec58a": "pictures_527",
    "c01a64e26ba1a67d": "pictures_528",
    "44c728771db76371": "pictures_529",
    "41e4f16251ea945e": "pictures_530",
    "5e66bd45f3b1f756": "pictures_531",
    "f796b757ee49c79e": "pictures_532",
    "e15459468c871618": "pictures_533",
    "a7b0455d15fccb46": "pictures_534",
    "cad636ba17e5fcd8": "pictures_535",
    "ea8e894527904f45": "pictures_536",
    "9e24c3e386af8380": "pictures_537",
    "bb59f54a60c422ba": "pictures_538",
    "b1da1f7a1002c7b4": "pictures_539",
    "6d6f2e0c3629d024": "pictures_540",
    "c3e3535213e82e1a": "pictures_541",
    "6f09ca64bf7303ed": "pictures_542",
    "f6916a2cf3373d19": "pictures_543",
    "b4341f5ae7ea9e90": "pictures_544",
    "7e8e8ec69cc203aa": "pictures_545",
    "0e56c5656ce4b0f7": "pictures_546",
    "3648911b57796c39": "pictures_547",
    "f2b7f410b9b22678": "pictures_548",
    "8836bccab717f4c5": "pictures_549",
    "b1b188d914c05712": "pictures_550",
    "6099ad6fbce44278": "pictures_551",
    "2845481587e9bf25": "pictures_552",
    "8f89064c350f818b": "pictures_553",
    "a5267cc803afc9aa": "pictures_554",
    "be6c0e3a59796c0c": "pictures_555",
    "68636c4e23211d78": "pictures_556",
    "1ae56d8faf7a2eea": "pictures_557",
    "be5df80304524a6a": "pictures_558",
    "a945166feb0726f5": "pictures_559",
    "2ca0678b335045d1": "pictures_560",
    "8ba101081e7cc3ce": "pictures_561",
    "a9a10d97bd3b781f": "pictures_562",
    "a7b926982ed8ecc6": "pictures_563",
    "a290d8fbdd465965": "pictures_564",
    "d46371d3bcf68b35": "pictures_565",
    "b43a2de387c39265": "pictures_566",
    "133b34986f46ea5f": "pictures_567",
    "c0894aab5707d25d": "pictures_568",
    "f7f360d123972e94": "pictures_569",
    "4a6c21ac7b906727": "pictures_570",
    "dedfc88dfaea15ab": "pictures_571",
    "4fbef3d4a7782650": "pictures_572",
    "c935e930a817eb48": "pictures_573",
    "97b04210c16af0db": "pictures_574",
    "b290ce4442b4673f": "pictures_575",
    "1e1e42c6a2cb77e1": "pictures_576",
    "46bd49f239b7023f": "pictures_577",
    "14b40ec1ab0372eb": "pictures_578",
    "d5955a396e2d96bc": "pictures_579",
    "07e4c8a7c9958c60": "pictures_580",
    "4e3f72fd76e609df": "pictures_581",
    "469e3de621564363": "pictures_582",
    "daa7517520b1b6c1": "pictures_583",
    "ae5ef26f48f39716": "pictures_584",
    "89cf5155c8f2b3ab": "pictures_585",
    "4b8af617eb8691a7": "pictures_586",
    "2097d69c9c99de24": "pictures_587",
    "871df459c11b5b90": "pictures_588",
    "32cbae34e1ca651f": "pictures_589",
    "8cb760a5a29e700b": "pictures_590",
    "38f1f2cbf1d907cc": "pictures_591",
    "f9668058d51d9c58": "pictures_592",
    "61cb81a60a9b85eb": "pictures_593",
    "76ef4d4195e59e0d": "pictures_594",
    "50f7381e486179af": "pictures_595",
    "270c7a5414c4437c": "pictures_596",
    "f49db0af5b1779db": "pictures_597",
    "5bbe1c8484aac1ed": "pictures_598",
    "ee830722be8877f8": "pictures_599",
    "b3d746effad7f6bd": "pictures_600",
    "961b6967d71777d4": "pictures_601",
    "c105838886dcb10b": "pictures_602",
    "724cca4ea027e53a": "pictures_603",
    "0e8aae15a933b323": "pictures_604",
    "de05901cf0817795": "pictures_605",
    "57398fbf1e770db9": "pictures_606",
    "95ca39e8ac447ff4": "pictures_607",
    "ae2230e801fa22cd": "pictures_608",
    "ff9c6f02af2029dc": "pictures_609",
    "b76017cb157a78a6": "pictures_610",
    "bfc8402a424ecac6": "pictures_611",
    "cbf7a38736fe7e4d": "pictures_612",
    "ad00c114a1e96111": "pictures_613",
    "d044283d24034b48": "pictures_614",
    "468444d2f7474bc9": "pictures_615",
    "5f7daa9cb4b2df33": "pictures_616",
    "40083858671477e9": "pictures_617",
    "a741507d8f6f0cb3": "pictures_618",
    "0e91d5c926804522": "pictures_619",
    "08e2554c2e3479ca": "pictures_620",
    "86bd6933cf8593f3": "pictures_621",
    "17088426991b9c62": "pictures_622",
    "1bcaec8105c94607": "pictures_623",
    "6ea3a1710f95c19f": "pictures_624",
    "376f320a2e978eb5": "pictures_625",
    "e0106a8013e6a925": "pictures_626",
    "1387a3b0225978a4": "pictures_627",
    "d045145bc0331853": "pictures_628",
    "5e3c5f169fbd98de": "pictures_629",
    "72dc1eb93343dae8": "pictures_630",
    "972f912570578bd4": "pictures_631",
    "d5158f83452375fb": "pictures_632",
    "493d52ac8c9c4f0c": "pictures_633",
    "26b6cece70292a40": "pictures_634",
    "c8f4c0fcc28ad11b": "pictures_635",
    "fc70d2308afa8255": "pictures_636",
    "968d79596b89d190": "pictures_637",
    "a3008e891bb87f95": "pictures_638",
    "b1773742cf918b0a": "pictures_639",
    "e4eca22c26220fa2": "pictures_640",
    "5ac9e620f7243ffa": "pictures_641",
    "35c26643791b551d": "pictures_642",
    "2afe14fde8fdf9f7": "pictures_643",
    "e7fe304c866b3ce3": "pictures_644",
    "9d4a90cb2703e2a1": "pictures_645",
    "84218207ca24d9c8": "pictures_646",
    "13b9227b4e94f99d": "pictures_647",
    "5a6217172fdfd2fc": "pictures_648",
    "fb1c712440d57999": "pictures_649",
    "e239d1cb3f1bee26": "pictures_650",
    "b9da98ed01900c9c": "pictures_651",
    "71e9589c529773d8": "pictures_652",
    "8cd40ed6ff86b02b": "pictures_653",
    "47aa1a2bed7ed9c8": "pictures_654",
    "6cd894f8c07d00ca": "pictures_655",
    "b18ae0e1db561486": "pictures_656",
    "511d249492bdcba0": "pictures_657", // "uso"
    "9676095141671fb9": "pictures_658",
    "f56864790f471e33": "pictures_659",
    "0cb2683c2dc7875f": "pictures_660",
    "30555b16d296e45e": "pictures_661",
    "40f8b8db2e93a526": "pictures_662",
    "36198a59e8137383": "pictures_663",
    "94a664bf609cd014": "pictures_664",
    "3a1846b04eb31dd3": "pictures_665",
    "2bbd97aedcb30b7a": "pictures_666",
    "75669c361e383731": "pictures_667",
    "9f6874af154b710a": "pictures_668",
    "e97c40e4c6421d70": "pictures_669",
    "04fe4578fc2ddff6": "pictures_670",
    "bb259a91d9a99dbc": "pictures_671",
    "459688c24bd7907e": "pictures_672",
    "730b0592b2587aa8": "pictures_673",
    "3958ff15261e82e4": "pictures_674",
    "62935952e2224e66": "pictures_675",
    "f0b6e95f8d0da96c": "pictures_676",
    "d69590504e161d47": "pictures_677",
    "7821963155327d78": "pictures_678",
    "b1947c916f6bb0dc": "pictures_679",
    "0c1af31c27c9fc91": "pictures_680",
    "2495c094645cd3d4": "pictures_681",
    "164337e88955b1f9": "pictures_682",
    "03e9e81fb0cd19c7": "pictures_683",
    "2d24daf3a7b75d13": "pictures_684",
    "eb396fc114854149": "pictures_685",
    "38004fdb551e3ba3": "pictures_686",
    "571c7b3bca372b03": "pictures_687",
    "8e2a499e31d27f12": "pictures_688",
    "61fd66827ee2268c": "pictures_689",
    "b72f21cc68c6f35b": "pictures_690",
    "52fd3594076b938f": "pictures_691",
    "7711ac0c4a49b38d": "pictures_692",
    "3776452288779302": "pictures_693",
    "471d98501393d092": "pictures_694",
    "3c7f16bcdacff903": "pictures_695",
    "baec4d9b5c07d58a": "pictures_696",
    "4b2d0c6b25aa7a06": "pictures_697",
    "3de76ad7f5b8c591": "pictures_698",
    "0dc0094a562070ad": "pictures_699",
    "94e48ab81e46c370": "pictures_700",
    "b1fc28d82c26f94a": "pictures_701",
    "69cf99a108440fe1": "pictures_702",
    "7f775fde1bfbdd39": "pictures_703",
    "6d9275c3178a4787": "pictures_704",
    "0bbd7ba51136e1d2": "pictures_705",
    "1a2c2d894845dd2b": "pictures_706",
    "89bc4f7473ab7411": "pictures_707",
    "41d4e8c957ce2bef": "pictures_708",
    "6233eec21f4b69e9": "pictures_709",
    "da38cc126e9cf3f7": "pictures_710",
    "664dcc6b991533ba": "pictures_711",
    "ca9a3b4e49e0afc2": "pictures_712",
    "c416013eb71664a6": "pictures_713",
    "c3d41ba8dff3a607": "pictures_714",
    "52af2e2d241643db": "pictures_715",
    "4f93906f482777de": "pictures_716",
    "ce4c51913ffe6446": "pictures_717",
    "84e2c676e930dde7": "pictures_718",
    "7c4ac99bb690186a": "pictures_719",
    "80f5c37da92ebf8d": "pictures_720",
    "52c9e60c2d748514": "pictures_721",
    "b22d4e4c34d5a00a": "pictures_722",
    "493965e41389343f": "pictures_723",
    "400881946f8aa6dd": "pictures_724",
    "fd7712f9481aedbf": "pictures_725",
    "4da1e6bf70b95b40": "pictures_726",
    "bfd631b67d45a057": "pictures_727",
    "1b403b3573cb07d4": "pictures_728",
    "bb435d091d1faa4e": "pictures_729",
    "1135d34d416c444a": "pictures_730",
    "59cf28f34ae07d07": "pictures_731",
    "e2a3e8541b182daf": "pictures_732",
    "52d46ec33303d879": "pictures_733",
    "4140f54b45b9c7a3": "pictures_734",
    "269f6152cb2368c6": "pictures_735",
    "2ffc0cd9259d34bd": "pictures_736", // "oath3_c"
    "49962e6ac229ddc0": "pictures_737",
    "51d375ae05b7677a": "pictures_738",
    "5913370a1ddefa68": "pictures_739",
    "f26f6d4b5c8f75a0": "pictures_740",
    "a0405f3515ec029f": "pictures_741",
    "bf91d7fcf3d165a0": "pictures_742",
    "2e6ec7aa2f743ac0": "pictures_743",
    "4cc98e4b28fb09a7": "pictures_744",
    "4e7c852c38da367a": "pictures_745",
    "81aaf56bc6003f7d": "pictures_746",
    "0a8ca260f50fe1a8": "pictures_747",
    "ef11e96291f9fb81": "pictures_748",
    "12bdc3bcc0e0e447": "pictures_749",
    "348af1ccec8c495e": "pictures_750",
    "d34078e1558378b1": "pictures_751",
    "43b6302fc5d7ab95": "pictures_752",
    "8e70a750eef27628": "pictures_753",
    "8c4874394cbfae7f": "pictures_754",
    "4ca0290576f75804": "pictures_755",
    "99bf68850ffcb1fb": "pictures_756",
    "6503d411a4dfb115": "pictures_757",
    "df0b18b975cc0def": "pictures_758",
    "5865b8ebfeb86dcd": "pictures_759",
    "0f57b1acb01c38db": "pictures_760",
    "0b7e5663f4e461c4": "pictures_761",
    "ef43aa51befde5ac": "pictures_762",
    "8540df16e119c153": "pictures_763",
    "83d12f2520cd56c4": "pictures_764",
    "e6a21162be6f9f65": "pictures_765",
    "5dfc0d14855de318": "pictures_766",
    "3d2e74a58d06c05a": "pictures_767",
    "5f258273a75fbb56": "pictures_768",
    "81f128b093a804b2": "pictures_769",
    "36c6e23a7f58d3f4": "pictures_770",
    "9fce2fb4daa42e99": "pictures_771",
    "8d4d88320284aafe": "pictures_772",
    "eea085da9198f424": "pictures_773",
    "7878e6a9cf5e46d1": "pictures_774",
    "7cb9fd16359789c5": "pictures_775",
    "f302b066d4574287": "pictures_776",
    "94da301c382191ae": "pictures_777",
    "ccd85240c5c7f2c8": "pictures_778",
    "050288490094e7c8": "pictures_779",
    "0f23c91c075dc88b": "pictures_780",
    "9c344cbf5e3d7432": "pictures_781",
    "d2e419aa79776c3d": "pictures_782",
    "cd037cadce9f0be5": "pictures_783",
    "daea29bc8d20fc96": "pictures_784",
    "24567d11f0efaadf": "pictures_785",
    "ca00a30384ea82d4": "pictures_786",
    "b7aca4adf33167ca": "pictures_787",
    "956e741d35e94037": "pictures_788",
    "211954a0d55a3218": "pictures_789",
    "effdc09a78504114": "pictures_790",
    "91bec00c0058553c": "pictures_791",
    "9d7c98c86859c7a8": "pictures_792",
    "a6ff10f3b7a84205": "pictures_793",
    "15adeab7b95a5dab": "pictures_794",
    "da761b936a0eac3b": "pictures_795",
    "80adbf617d05a3bd": "pictures_796",
    "7db996625b3eaf8b": "pictures_797",
    "fb7daa394b8b3a4f": "pictures_798",
    "7d4cd49dcd6b3609": "pictures_799",
    "394d713123fde6fe": "pictures_800",
    "e8481730d27b5a25": "pictures_801",
    "e6af2bdeb189eb86": "pictures_802",
    "5bfc68a2d821ce13": "pictures_803",
    "bfa2d4f17f7f1413": "pictures_804",
    "63b5b7c07e439362": "pictures_805",
    "0dc09a3e066cf073": "pictures_806",
    "e04dfa7d430f71d9": "pictures_807",
    "0895bf13a7266930": "pictures_808",
    "dc5619e4728eee67": "pictures_809",
    "48073e57a0353d3a": "pictures_810",
    "cf0feaa6f5a4327e": "pictures_811",
    "f3d29e88a39ac816": "pictures_812",
    "da7e6492e13c25eb": "pictures_813",
    "7e15d4951fb20905": "pictures_814",
    "815a04a9ba66a264": "pictures_815",
    "93dd6b0dc9d3e300": "pictures_816",
    "4e9a197ef36ca77f": "pictures_817",
    "69d10c9429ef5b93": "pictures_818",
    "5f548105632ee3b7": "pictures_819",
    "4dddff1fd505d3b2": "pictures_820",
    "1613955a0a6392e0": "pictures_821",
    "ea596c65abae987a": "pictures_822",
    "d9b42dc62f8031f3": "pictures_823",
    "64bec0f3fe9c9065": "pictures_824",
    "6a68b829d8969a1b": "pictures_825",
    "50c4ba468dd8f2dd": "pictures_826",
    "56c6fd9a4ff02a2b": "pictures_827",
    "0351639b28317a11": "pictures_828",
    "dd2d179dd5a7a6d8": "pictures_829",
    "6b1fa52c858c026f": "pictures_830",
    "639b891c6527eb75": "pictures_831",
    "a8ded9ccc89eed66": "pictures_832",
    "bf1fc31cee8721be": "pictures_833",
    "71a12990a056bb58": "pictures_834",
    "a020be48d801983f": "pictures_835",
    "a3536073af4890d0": "pictures_836",
    "70a977b057031c96": "pictures_837",
    "71233fa5d86b0a9a": "pictures_838",
    "88be0d962d2c171b": "pictures_839",
    "dc7ca851461d4aa8": "pictures_840",
    "ef31e4fe5ca4117f": "pictures_841",
    "d2a69b80cd981f93": "pictures_842",
    "0a92412569d0839a": "pictures_843",
    "abc0c8c68806ad31": "pictures_844",
    "ae355b8f6a58bf99": "pictures_845",
    "bb245a46a111a1e5": "pictures_846",
    "3ea67c3c8cc54c9d": "pictures_847",
    "d676063fab458e9f": "pictures_848",
    "bfe29142dd5b853f": "pictures_849",
    "13d9d16131df7d29": "pictures_850",
    "da54b04ab089c06c": "pictures_851",
    "2dfba69d3b8dc755": "pictures_852",
    "3190f75a5e7080f6": "pictures_853",
    "615f06b85aae4eff": "pictures_854",
    "9b49a1b05ebd8d48": "pictures_855",
    "74815b50111e9728": "pictures_856",
    "c384aef0bb2ff58b": "pictures_857",
    "61ac4c751ba21402": "pictures_858",
    "1da9b0ab733a82c4": "pictures_859",
    "1420a5fd9f124e2e": "pictures_860",
    "17f293d610fb1f85": "pictures_861",
    "1bc7d2af711ed88c": "pictures_862",
    "88e247e77d1900af": "pictures_863",
    "75fe8f08075202e9": "pictures_864",
    "78679158388e247d": "pictures_865",
    "cf1bf3d19cfbd1fa": "pictures_866",
    "6b1bfd2d995c6f7b": "pictures_867",
    "3118f18b31f8c566": "pictures_868",
    "cf0da2bec0b3b612": "pictures_869",
    "e3668ef92be0b968": "pictures_870",
    "6809651146a3dc1c": "pictures_871",
    "36cd6d56fe5db7fd": "pictures_872",
    "5b25e69c9ed3dad8": "pictures_873",
    "17819f56417f58c0": "pictures_874",
    "b1ce9cd1ab054709": "pictures_875",
    "df8eb0aab5b6472c": "pictures_876", // "rb_butcher_4d"
    "693ff2fb0dbc2c8c": "pictures_877",
    "d2d5b2dcf1e1507d": "pictures_878",
    "112505a0c393995b": "pictures_879",
    "08e2e2c2cd8813d1": "pictures_880",
    "5e85d9b00e3f662d": "pictures_881",
    "b257ef4e7e50148c": "pictures_882",
    "4d6e83a2c874e656": "pictures_883",
    "077aa1c9211d1c37": "pictures_884",
    "acdb9e5789ef2ce7": "pictures_885",
    "139a915b0e2b28f0": "pictures_886",
    "4648962436fe5b8f": "pictures_887",
    "155db97b67cf113d": "pictures_888",
    "64b99e3412bab34f": "pictures_889",
    "01813d8429f05da6": "pictures_890",
    "09d84ad2dcff6b4b": "pictures_891",
    "0d844482a1fa5c53": "pictures_892",
    "5019133dbdbc0d10": "pictures_893",
    "348212b8159ff544": "pictures_894",
    "2dfffe4f9f32e753": "pictures_895",
    "bc0b4c804e75e7b7": "pictures_896",
    "3ca0c18ff77feaf4": "pictures_897",
    "ae23fbc0f9df2138": "pictures_898",
    "34248e30ad48fa5a": "pictures_899",
    "9f9fe98d69d7094e": "pictures_900",
    "eef36cba1a8ef066": "pictures_901",
    "4b1b3fabcbb27d32": "pictures_902",
    "6e0ab97c233b0429": "pictures_903",
    "d8e301c137f10c14": "pictures_904",
    "d8aaae99674ce8c5": "pictures_905",
    "f3099250faa1221d": "pictures_906",
    "5f7a17c96cc1eb32": "pictures_907",
    "42c88ae7dfa0aeab": "pictures_908",
    "538350c925843e20": "pictures_909",
    "f94d27a70f4a2037": "pictures_910",
    "49895405b8641cd0": "pictures_911",
    "f962ea11d81ed6f6": "pictures_912",
    "6b7e0fb4bae496c1": "pictures_913",
    "36468a0daabe0f9e": "pictures_914",
    "c0ba32a63d0643a6": "pictures_915",
    "65d1aefab08f4717": "pictures_916",
    "e232728742917042": "pictures_917",
    "f0f5cdfbd94825ff": "pictures_918",
    "5c4eb101f6bc5c65": "pictures_919",
    "7577ece842241501": "pictures_920",
    "7bd3c64a6df45742": "pictures_921",
    "411e0fa6bd9d1d6a": "pictures_922",
    "f43ef672cbd28227": "pictures_923",
    "624df530a2ec9ed3": "pictures_924",
    "640c96ed07ca6337": "pictures_925",
    "7232ca67ccc715a4": "pictures_926",
    "99db1a791120b996": "pictures_927",
    "2291a2e2dac4103c": "pictures_928",
    "47c69e6aaa63ff63": "pictures_929",
    "6123ff0ec715b485": "pictures_930",
    "e377c0dc6456096a": "pictures_931",
    "b7eca2bb6484d02c": "pictures_932",
    "49967e77d20deab5": "pictures_933",
    "3b664ac0ba846a59": "pictures_934",
    "92eee2ac1ba54548": "pictures_935",
    "3377c4b799bc079c": "pictures_936",
    "e74e3b7f04c103a9": "pictures_937",
    "81aaea6694a55548": "pictures_938",
    "66452e2d06757c2d": "pictures_939",
    "84e4fcd1a32bfa1e": "pictures_940",
    "a7edff5421756fe6": "pictures_941",
    "8eb301b404ca1e08": "pictures_942",
    "3e6110c19fc021a8": "pictures_943",
    "ae3802b5cfeb22a0": "pictures_944",
    "263f7fb50a1dd0e3": "pictures_945",
    "008fd66a8e8997b0": "pictures_946",
    "37af26a890beeebb": "pictures_947",
    "0d7aa80a33180118": "pictures_948",
    "4f804a565bce0e26": "pictures_949",
    "63d60273b888442e": "pictures_950",
    "5470291accda68e4": "pictures_951",
    "c0ae73b40a5f2e53": "pictures_952",
    "d6bb9fb199e4585f": "pictures_953",
    "b4967689ba75f0dd": "pictures_954",
    "434b2013afdefa82": "pictures_955",
    "16bc7430ff4d7658": "pictures_956",
    "135f8e983db86a30": "pictures_957",
    "5da66bc0b58e296d": "pictures_958",
    "7d074ce82028f680": "pictures_959",
    "cbb6623182a228ea": "pictures_960",
    "3520bb9412100529": "pictures_961",
    "288bcdf449b6d07c": "pictures_962",
    "01bc7721c89c9707": "pictures_963",
    "689403aa4485fabe": "pictures_964",
    "6c38310d6018a514": "pictures_965",
    "9b6a2a345d2cbc5a": "pictures_966",
    "bfbf4d03928e8eca": "pictures_967",
    "41f611655b897f91": "pictures_968",
    "2b1eb7d64325d8fc": "pictures_969",
    "d5b6bd6020035177": "pictures_970",
    "429afcbd88bf782b": "pictures_971", // "lg_beam"
    "067d92e67c32877e": "pictures_972",
    "3fe1e3a166282001": "pictures_973",
    "496c3b68e1409631": "pictures_974",
    "a81d6bf2b580ac31": "pictures_975",
    "ce46141a4c921781": "pictures_976",
    "70d93c3771db7f86": "pictures_977",
    "f099dd672c62f5ac": "pictures_978",
    "5034997f93b0ac8d": "pictures_979",
    "b2cc40ebf39bfa26": "pictures_980",
    "3f1ba617c3811a0c": "pictures_981",
    "9f28f2b1a6c83593": "pictures_982",
    "bc3f7c4ee927aaaa": "pictures_983",
    "e57bf7a7a93d2e74": "pictures_984",
    "7a5e4148067ca317": "pictures_985",
    "2cc2680e6d70a5b7": "pictures_986",
    "35cd83cf616854fc": "pictures_987",
    "176d339995cf9bec": "pictures_988",
    "4c60f531e5bee4c1": "pictures_989",
    "c8a4faddbc3c5d0d": "pictures_990",
    "e3dfe9b5860acb36": "pictures_991",
    "fe934b5dfefbf6f4": "pictures_992",
    "3c1dfb4b66365889": "pictures_993",
    "fa8b8c60a866bc65": "pictures_994",
    "f72a1630019ac37b": "pictures_995",
    "1a354d807a3c863b": "pictures_996",
    "ff52a03210b27c34": "pictures_997",
    "f3827670e1a0eab8": "pictures_998",
    "64f271c2a7dbaf63": "pictures_999",
    "58a511161137f0f2": "pictures_1000",
    "d0fdcf02c24f0a69": "pictures_1001",
    "c0d8f069184cb9a3": "pictures_1002",
    "b3d9d3ad883f2248": "pictures_1003",
    "366a1c141849b4e7": "pictures_1004",
    "3646262234e76d6b": "pictures_1005",
    "04d9d2f228cc0539": "pictures_1006", // "tv_1a"
    "a3bccb499e47b68e": "pictures_1007", // "tv_1b"
    "2bab77dfc3ca7d15": "pictures_1008", // "tv_2a"
    "91b682859f543183": "pictures_1009", // "Book"
    "357bc4b6fb86168e": "pictures_1010",
    "icon": "pictures_icon",

    // === Music (ME) ===
    "4fe5a3e14978bba6": "balcony",
    "d405da43ec0669c0": "kill_switch", // "kill_switch"

    // === Sound Effects (SE) ===
    "4927480862c30f3b": "got_item", // "item_got"
    "5aa70e50915bd7ad": "wind_5", // "Wind5"
    "1d351c0ab5681031": "key", // "Key"
    "d0e18e78dc615508": "rustle", // "rustle"
    "41b1633ff75cba66": "blow_2", // "Blow2"
    "46117eb2380afb81": "door_1", // "Door1"
    "cdf9ee20ed312175": "crash", // "Crash"
    "3f55df3996a099e3": "statue", // "statue"
    "20cb27ef60c8b250": "open_1", // "Open1"
    "1d869cca761d1f5b": "sand", // "Sand"
    "dbe371e3fdd67bf4": "Water1",
    "7f6266a05d031a94": "se_12",
    "ec37304323499aab": "water_1", // "Water1"
    "c9d55115b9d0b6f9": "flush", // "flush"
    "50ca3ee851312aa4": "coin", // "Coin"
    "b3fc15b021e3c149": "monster_4", // "Monster4"
    "735d49a50f0035d0": "earth_1", // "Earth1"
    "62edfeeb6f00900e": "title_sting", // "title_sting"
    "be5cde56452260ec": "open_4", // "Open4"
    "c1266f7aba56e843": "phone_disconnect", // "phone_disconnect"
    "9d86dfcb61613a37": "phone_clank", // "phone_clank"
    "3b7017b29acd17a2": "switch_2", // "Switch2"
    "b12d6f9f4b9e1ca3": "knock", // "knock"
    "90b3e9ebf8f919e5": "walk_away", // "walkaway"
    "dc247e4f1a7a8f98": "darkness_3", // "Darkness3"
    "5982909527ac5860": "Key",
    "03bcac3737f12e6b": "phone_ring", // "phone_ring"
    "74ea5e851fc15d23": "washing_machine", // "washingmachine"
    "c3a2ef1f7d840426": "blood_stab", // "blood_stab"
    "3b465a976e2823ee": "blood_b", // "blood_b"
    "bcf151331223b851": "close1", // "Close1"
    "fb7aee8c4eb079e3": "blingy_sp", // "blingy_sp"
    "b97672d340e2da9c": "blood_a", // "blood_a"
    "662e331644396903": "match", // "match"
    "ae7cc7dcfc1c1506": "ambulance", // "ambulance"
    "75eda64e97d4c13a": "transceiver", // "Transceiver"
    "c32c6a999dcc3fcf": "vinyl", // "vinyl"
    "e4b12af62524a5fe": "confirm", // "confirm"
    "97bd49ca4170d542": "car_door", // "cardoor"
    "e3cd5a4b1a1e0890": "elevator_door", // "elevatordoor"
    "c44c4edbf7c90767": "bellding", // "bellding"
    "a5da3da2ae6ed664": "coin", // coin
    "e7ba7d67c89feb44": "carpull", // "carpull"
    "b1d996591fd54afe": "rustle_foliage", // "rustle_foliage"
    "5b3d77888976143e": "run", // "Run"
    "90ac01c5f49bde42": "bullet", // "bullet"
    "5a922ab0a1e52cad": "bullets", // "bullets"
    "8c2e9fe3db2227e6": "wood", // "wood"
    "02b2ac88ec819d98": "curtain", // "curtain"
    "58e443f31a974fd0": "blade", // "blade"
    "232221889c283071": "blender", // "blender"
    "65c1e576d21efce7": "dig", // "dig"
    "e9e21bdbb6892e29": "confirm",
    "1bf231bddc4a2083": "se_54",
    "34c4159bda097c78": "draw", // "draw"
    "d6ed1157a201bd9e": "56",
    "4ef4c15bf90a0b1c": "axe", // "axe"
    "64cf9328a37d37bd": "heal_2", // "Heal2"
    "4eaf69352441868c": "se_59",
    "b5136fcb0987fd4d": "se_60",
    "7dd808ff989006e3": "se_61",
    "1b12df87d700b9de": "blood_stab",
    "2cc88d940d6f65df": "se_63",
    "65b8897cb0e998b2": "blingy", // "blingy"
    "201755faa2d12641": "se_65",
    "229ab081684616dc": "se_66",
    "b26e0849339bdaf0": "se_67",
    "5ce6fc5a596ddc3f": "se_68",
    "cb2a17c9188b66f0": "se_69",
    "73a2bdfa3b0feb0d": "spam", // "spam"
    "6f74ae580cef73f5": "se_71",
    "74380a0d0e3c7c48": "curtain_alt", // "curtain"
    "4cee1acde9c80ff6": "se_73", // Darkness3
    "c5c1bd2fb7a56bd5": "se_74", // bellding
    "e99b9a3350a587d3": "se_75",
    "45e50cc8a9de3bc3": "fall", // "Fall"

    // "b5136fcb0987fd4d": "Water1", // .ogg
    // "5adf3c7054e7a170": "balcony", // .ogg
    // "dbe371e3fdd67bf4": "blingy", // .ogg
    // "1b12df87d700b9de": "blood_stab", // .ogg
    // "e9e21bdbb6892e29": "confirm", // .ogg
    // "6f74ae580cef73f5": "draw", // .ogg
    // "7c1ae5440068d7f5": "forest", // .ogg
    // "7dd808ff989006e3": "match", // .ogg
    // "4fe5a3e14978bba6": "musicbox_blingy", // .ogg
    // "b26e0849339bdaf0": "phone_ring", // .ogg
    // "bfe1f2ddce1fa1a8": "sheep_sway", // .ogg
    // "c30bc7904f060edd": "snailseyes", // .ogg
    // "d6ed1157a201bd9e": "spam", // .ogg
    // "c257c15680b1ddee": "teddybear", // .ogg
    // "a0c2b4248fd4b6cd": "ticktock", // .ogg
    // "4eaf69352441868c": "title_sting", // .ogg
    // "5ce6fc5a596ddc3f": "washingmachine", // .ogg

    // === Character Faces ===
    // Andrew
    "aab510d75d377c95[BUST]": "andrew_(rage)", // "b_rage"
    "fac0529f00ba4260[BUST]": "andrew_(mad)", // "b_mad"
    "430dce743b60280b[BUST]": "andrew_(neutral)", // "b_neutral"
    "981f3499aa2de8cf[BUST]": "andrew_(meh)", // "b_meh"
    "6e679186822ccbb6[BUST]": "andrew_(ew)", // "b_ew"
    "c1db28987323d0ff[BUST]": "andrew_(confused)", // "b_confused"
    "42f60877d70e2dc5[BUST]": "andrew_(whatever)", // "b_whatever"
    "e916b6077d0a55a7[BUST]": "andrew_(happy)", // "b_happy"
    "ebb3e15de9e2290a[BUST]": "andrew_(explain_mad)", // "b_explainmad"
    "c3c06a25d0148015[BUST]": "andrew_(explain)", // "b_explain"
    "0c3bc2b28fd40bd5[BUST]": "andrew_(think)", // "b_think"
    "59a369b906f40729[BUST]": "andrew_(worry)", // "b_worry"
    "e661ee2b6c6d91bb[BUST]": "andrew_(dafuq)", // "b_dafuq"
    "a07823d3c7c11d90[BUST]": "andrew_(complain)", // "b_complain"
    "91f059f96fb4cfa5[BUST]": "andrew_(jokey)", // "b_jokey"
    "445e008172c38469[BUST]": "andrew_(down)", // "b_down"
    "8ddc89c3cb615d12[BUST]": "andrew_(facepalm)", // "b_facepalm"
    "13f4016ef5adb049[BUST]": "andrew_(miffed)", // "b_miffed"
    "eeca6592570c9bc1[BUST]": "andrew_(sad)", // "b_sad"
    "e0ccc3cbcc969e3d[BUST]": "andrew_(hurt)", // "b_hurt"
    "26ad954a3c682216[BUST]": "andrew_(bite_self)", // "b_biteself"
    "497768a7223062f4[BUST]": "andrew_(dunno)", // "b_dunno"
    "055fadd1e988e294[BUST]": "andrew_(laugh)", // "b_laugh"
    "21cdec2bd5770afb[BUST]": "andrew_(dont_laugh)", // "b_dontlaugh"
    "6e7f9eb8af298b49[BUST]": "andrew_(sigh)", // "b_sigh"
    "6c40e35fcdd385a9[BUST]": "andrew_(talk)", // "b_talk"
    "c36e0d860f3b8181[BUST]": "andrew_(smile)", // "b_smile"
    "7c09d7bc863abaa9[BUST]": "andrew_(shrug)", // "b_shrug"
    "1b066ce464b20bb9[BUST]": "andrew_(ha)", // "b_ha"
    "e5801d39b1c69345[BUST]": "andrew_(hide_face)", // "b_hideface"
    "81a5cbf17dd6188c[BUST]": "andrew_(oh_shit)", // "b_ohshit"
    "1769c57883615362[BUST]": "andrew_(glad)", // "b_glad"
    "3d334c49651f5e06[BUST]": "andrew_(flustered)", // "b_flustered"
    "a06ed77c270e2ea9[BUST]": "andrew_(content)", // "b_content"
    "5d9091f104d61cc9[BUST]": "andrew_(yikes)", // "b_yikes"
    "e766d9f4addb4658[BUST]": "andrew_(fake_smile)", // "b_fakesmile"
    "753297ef0a284c16[BUST]": "andrew_(proud)", // "b_proud"
    "c5e3a9e48fd1f935[BUST]": "andrew_(no)", // "b_no"
    "c009bc7a7dd26836[BUST]": "andrew_(fake_laugh)", // "b_fakelaugh"
    "876bcf957d243047[BUST]": "andrew_(awkawrd)", // "b_awkward"
    "354e1ea88b10adcf[BUST]": "andrew_(waver)", // "b_waver"
    "79e075379de28396[BUST]": "andrew_(embarrassed)", // "b_embarrassed"
    "b20793f18d045058[BUST]": "andrew_43",
    "4e784a5be4bdb88c[BUST]": "andrew_44",
    "ccf7227a5b03322e[BUST]": "andrew_45",
    "e8c20881c242e7f0[BUST]": "andrew_(ahh)", // "b_ahh"
    "e8f566fed4b4eb43[BUST]": "andrew_(pleased)", // "b_pleased"
    "8e2bc6b9fc424e94[BUST]": "andrew_48",
    "cfd3ddb745a3194d[BUST]": "andrew_49",
    "daa152645f4d50d2[BUST]": "andrew_50",
    "205f74322e5b9a00[BUST]": "andrew_51",
    "bca6a552a4bb9ed2[BUST]": "andrew_52",
    "a99875a51c9a745c[BUST]": "andrew_53",
    "604fed9d025e2283[BUST]": "andrew_54",
    "89b94fa93ec18a6f[BUST]": "andrew_55",
    "81dd853c60358d53[BUST]": "andrew_56",
    "9926e4981d898aa0[BUST]": "andrew_57",
    "53bc95b1392ab334[BUST]": "andrew_58",
    "31731470b57f4dff[BUST]": "andrew_59",
    "3cdcebeabfb8cbc1[BUST]": "andrew_60",
    "624c543d26b59444[BUST]": "andrew_61",
    // Andy
    "e420d45fcd6e1da8[BUST]": "andy_(oh)", // "bk_oh"
    "a362bdabdb2c271c[BUST]": "andy_(ew)", // "bk_ew"
    "4375a729ef4fb298[BUST]": "andy_(laugh)", // "bk_laugh"
    "bfc94df8736b590c[BUST]": "andy_(hm)", // "bk_hm"
    "6350819bd94f808b[BUST]": "andy_(neutral)", // "bk_neutral"
    "461fe27b72aafc2d[BUST]": "andy_(look_away)", // "bk_lookaway"
    "811af155451a1de1[BUST]": "andy_(unsure)", // "bk_unsure"
    "bb9b26e24462d5ac[BUST]": "andy_(no)", // "bk_no"
    "509daea01f1551c3[BUST]": "andy_(sad)", // "bk_sad"
    "67b516c5d0cd3bb2[BUST]": "andy_(sigh)", // "bk_sigh"
    "f1b5920634d60dd0[BUST]": "andy_(complain)", // "bk_complain"
    "64c68af566b4171d[BUST]": "andy_(tch)", // "bk_tch"
    "07c4d5e4f2b41ff9[BUST]": "andy_(ticked)", // "bk_ticked"
    "5e5f280b7837bff2[BUST]": "andy_(smile)", // "bk_smile"
    "e90da16bf9bc9b57[BUST]": "andy_(hah)", // "bk_hah"
    "16c6483381d9fd6c[BUST]": "andy_(neutral_no_hands)", // "bk2_neutral"
    "6fdeca932545448b[BUST]": "andy_(tch_no_hands)", // "bk2_tch"
    "f0e4b300e65d1d88[BUST]": "andy_(ticked_no_hands)", // "bk2_ticked"
    "2398bbc219babdae[BUST]": "andy_(hah_no_hands)", // "bk2_hah"
    "37fea558728d7e66[BUST]": "andy_20",
    "5e3af9d7a4a69a25[BUST]": "andy_21",
    "bb691307e2e16c20[BUST]": "andy_22",
    "9567c539d89b85c7[BUST]": "andy_23",
    "64016ec4e0c68f08[BUST]": "andy_24",
    // Andrew Teen
    "b085875ddb694717[BUST]": "andrew-teen_1",
    "cfb9af84e0b812df[BUST]": "andrew-teen_2",
    "ce990ac420765d93[BUST]": "andrew-teen_3",
    "46e7fa7d01d1393b[BUST]": "andrew-teen_4",
    "f68101a55666c7c9[BUST]": "andrew-teen_5",
    "23b36e5ad7b7af1e[BUST]": "andrew-teen_6",
    "25334c7fee1e5c7e[BUST]": "andrew-teen_7",
    "09793d32c3ffdf06[BUST]": "andrew-teen_8",
    "1608e6cb9e94f3d1[BUST]": "andrew-teen_9",
    "9b5ea46ee60eb512[BUST]": "andrew-teen_10",
    "716c5c8b3e8c290b[BUST]": "andrew-teen_11",
    "83024d4a8fb5dc47[BUST]": "andrew-teen_12",
    "bbaccc73d5ef59b2[BUST]": "andrew-teen_13",
    "282d4231c782db99[BUST]": "andrew-teen_14",
    "95f9ce689a6e95a5[BUST]": "andrew-teen_15",
    "2e3764986eccdc31[BUST]": "andrew-teen_16",
    "2a04cec0afb301c9[BUST]": "andrew-teen_17",
    "03ee0c0b40f09abf[BUST]": "andrew-teen_18",
    "485cc419c9afda34[BUST]": "andrew-teen_19",
    "d5b896500b0e7fc3[BUST]": "andrew-teen_20",
    "ed6eb9a5da1be90a[BUST]": "andrew-teen_21",
    "6dc12ed274ed5671[BUST]": "andrew-teen_22",
    "4cd2b96523e34e87[BUST]": "andrew-teen_23",
    "604b17a2703f37b3[BUST]": "andrew-teen_24",
    "4cbb58d081baab1f[BUST]": "andrew-teen_25",
    // Ashley
    "2c8a1aebfb8aaefd[BUST]": "ashley_(pout)", // "s_pout"
    "fa9d6515f3420752[BUST]": "ashley_2",
    "44351a1098b789cf[BUST]": "ashley_(hmm)", // "s_hmm"
    "9923dea2f268e189[BUST]": "ashley_4",
    "5a9d0bfde3ef03ac[BUST]": "ashley_(hurt)", // "s_hurt"
    "8ddec347597efe19[BUST]": "ashley_6",
    "e2a83a6e23e670e2[BUST]": "ashley_(curse)", // "s_curse"
    "9eae4abfe82d5cc2[BUST]": "ashley_(cry)", // "s_cry"
    "9baea3a9ab3cbc09[BUST]": "ashley_(weak)", // "s_weak"
    "f4ceb145497fdb82[BUST]": "ashley_(ughh)", // "s_ughh"
    "405c672f8a34f278[BUST]": "ashley_(sigh)", // "s_sigh"
    "a7950ad2d17854d6[BUST]": "ashley_(fight)", // "s_fight"
    "b2c75e3097e9fdd4[BUST]": "ashley_(sad)", // "s_sad"
    "38b82c55b3529488[BUST]": "ashley_(meh)", // "s_meh"
    "d2aff806dd5f1315[BUST]": "ashley_(irritated)", // "s_irritated"
    "33b36b3ce42250e3[BUST]": "ashley_(yell)", // "s_yell"
    "7bf9e1a7b3fc961a[BUST]": "ashley_(tch)", // "s_tch"
    "00dfc02ea4ecdd77[BUST]": "ashley_(chat)", // "s_chat"
    "bc3f6c4a78c37314[BUST]": "ashley_(proud)", // "s_proud"
    "f8ccc4fd95bdf333[BUST]": "ashley_(angry)", // "s_angry"
    "52ab7d6508f87817[BUST]": "ashley_(challenge)", // "s_challenge"
    "2980a89460122a18[BUST]": "ashley_(terror)", // "s_terror"
    "d730436f2a2b31a5[BUST]": "ashley_(think)", // "s_think"
    "eea509ea4222d93c[BUST]": "ashley_(ugh)", // "s_ugh"
    "34b15f34f103954d[BUST]": "ashley_(mock)", // "s_mock"
    "f3e25bcfc5cece64[BUST]": "ashley_(heh)", // "s_heh"
    "c61a4be244711b5a[BUST]": "ashley_(smile)", // "s_smile"
    "ad0e943304f54e8f[BUST]": "ashley_(boo)", // "s_boo"
    "e220be5e529b4aa8[BUST]": "ashley_(laugh)", // "s_laugh"
    "203389fa11d5765b[BUST]": "ashley_(hm)", // "s_hm"
    "d37472883faddde9[BUST]": "ashley_(glad)", // "s_glad"
    "f4b314fa0ba665de[BUST]": "ashley_(oops)", // "s_oops"
    "8437c57e159caae7[BUST]": "ashley_(gentle)", // "s_gentle"
    "e7c5a0a6db58c44d[BUST]": "ashley_(excited)", // "s_excited"
    "66227cb1c01fc3ac[BUST]": "ashley_(surprise)", // "s_surprise"
    "f5a6c0be6d0d88cb[BUST]": "ashley_(hmph)", // "s_hmph"
    "386634445489561c[BUST]": "ashley_(gasp)", // "s_gasp"
    "3939c67fcca7d3cd[BUST]": "ashley_(unsure_smile)", // "s_unsuresmile"
    "c11b453247f56d9b[BUST]": "ashley_(scream)", // "s_scream"
    "1874d0a2239d9cce[BUST]": "ashley_(huhu)", // "s_huhu"
    "95f634c750ffbc3d[BUST]": "ashley_(lol)", // "s_lol"
    "a550405ba339792e[BUST]": "ashley_(content)", // "s_content"
    "88ac88061d8c0a77[BUST]": "ashley_(ooh)", // "s_ooh"
    "ea3a2dd5fc64d746[BUST]": "ashley_(lying)", // "s_lying"
    "763c013480a12595[BUST]": "ashley_(fearful)", // "s_fearful"
    "40a8c4ec2bed7afa[BUST]": "ashley_46",
    "e5054dfd398cce74[BUST]": "ashley_47",
    "06ac8752843ce979[BUST]": "ashley_48",
    "ad7252b84b245d6b[BUST]": "ashley_49",
    "f15673f84838d247[BUST]": "ashley_50",
    "342128b8b9453ee2[BUST]": "ashley_(no)", // "s_no"
    "f5d0b4d0d9c48cb5[BUST]": "ashley_52",
    "03db74dbd50e6c82[BUST]": "ashley_53",
    "edc59a797608e379[BUST]": "ashley_54",
    "727a2aba4b80b348[BUST]": "ashley_55",
    // Leyley
    "0ff2357cb019f30f[BUST]": "leyley_(meh)", // "sk_meh"
    "d292115d110ba256[BUST]": "leyley_(miffed)", // "sk_miffed"
    "9b376d2c46d93600[BUST]": "leyley_(hmph)", // "sk_hmph"
    "92eba4bf2cf93504[BUST]": "leyley_(grin)", // "sk_grin"
    "bc6066f175ccc4a8[BUST]": "leyley_(happy)", // "sk_happy"
    "f77b18612c778153[BUST]": "leyley_(mad)", // "sk_mad"
    "030f5a31d6b13bfe[BUST]": "leyley_(sure)", // "sk_sure"
    "fc5f2b642f1b51fc[BUST]": "leyley_(heh)", // "sk_heh"
    "fdde49dabf17aac3[BUST]": "leyley_(sad)", // "sk_sad"
    "1e8f066521628861[BUST]": "leyley_(teary)", // "sk_teary"
    "6c228cee76f5f8f3[BUST]": "leyley_(bawl)", // "sk_bawl"
    "6216bcbbc123fefb[BUST]": "leyley_(mock)", // "sk_mock"
    "662bb85ea0fc55c7[BUST]": "leyley_(down)", // "sk_down"
    "ae79049cfef26bab[BUST]": "leyley_(surprise)", // "sk_surprise"
    "eb9a50fd8b6847f3[BUST]": "leyley_15",
    "63fc8e6752a45207[BUST]": "leyley_16",
    "cf4bed6921eb7961[BUST]": "leyley_17",
    // Ashley Teen
    "cec38f20835c0e69[BUST]": "ashley-teen_1",
    "6640749e62f598b6[BUST]": "ashley-teen_2",
    "c00bdb233a1b64f1[BUST]": "ashley-teen_3",
    "b0c3a30c76e75a6c[BUST]": "ashley-teen_4",
    "569e165d5768cbd5[BUST]": "ashley-teen_5",
    "6534077e7230481d[BUST]": "ashley-teen_6",
    "664d39c172dbee81[BUST]": "ashley-teen_7",
    "601b0d7fca049c35[BUST]": "ashley-teen_8",
    "ad75ed79e43315e0[BUST]": "ashley-teen_9",
    "a46f5838e1c6a19b[BUST]": "ashley-teen_10",
    "16f096ec8e06802a[BUST]": "ashley-teen_11",
    "bc20165e2c324dd8[BUST]": "ashley-teen_12",
    "298c7452f21be209[BUST]": "ashley-teen_13",
    "a71ddee6a980cefb[BUST]": "ashley-teen_14",
    "e72661b4fda524e2[BUST]": "ashley-teen_15",
    "5fb91740171a6c36[BUST]": "ashley-teen_16",
    "fc2d7013fe45e5e6[BUST]": "ashley-teen_17",
    "1432f1faf876896f[BUST]": "ashley-teen_18",
    "6a0ee1a1db866e82[BUST]": "ashley-teen_19",
    "79ccdd9b0a368d73[BUST]": "ashley-teen_20",
    "2d3bae977f86b7f9[BUST]": "ashley-teen_21",
    // Ashley Teen Dressed Like Julia
    "4c2db291666799fb[BUST]": "ashley-teen dressed like Julia_1",
    // Julia
    "1e3a51217b562269[BUST]": "julia_(unsure)", // "j_unsure"
    "cc89c8075ae4d373[BUST]": "julia_(down)", // "j_down"
    "34ea74005c0f204b[BUST]": "julia_(worry)", // "j_worry"
    "af79315fac2779c5[BUST]": "julia_(nervous)", // "j_nervous"
    "b17739277151ed42[BUST]": "julia_(hopeful)", // "j_hopeful"
    "5ece62cb9519ef22[BUST]": "julia_(shy)", // "j_shy"
    "fe3b2d03972b9d09[BUST]": "julia_(ack)", // "j_ack"
    "e6d48e341fedec6e[BUST]": "julia_(upset)", // "j_upset"
    "529f4e751c008c83[BUST]": "julia_(angry)", // "j_angry"
    "8041c50ad7e45723[BUST]": "julia_(ha)", // "j_ha"
    "b5b240f53c5866dd[BUST]": "julia_11",
    "2aa4006a62c6e812[BUST]": "julia_12",
    "7c8e9c74d42220a4[BUST]": "julia_13",
    "7ae1f592777bfd79[BUST]": "julia_14",
    "6d1efb6836778f9e[BUST]": "julia_15",
    // Julia Teen
    "7948c59dea10a1ed[BUST]": "julia-teen_1",
    "1d8e44e184e71bc5[BUST]": "julia-teen_2",
    "340bde331a8582f9[BUST]": "julia-teen_3",
    "5b36009f3ad3a746[BUST]": "julia-teen_4",
    "c1f4f65881ce6704[BUST]": "julia-teen_5",
    "68e0bffba39c4091[BUST]": "julia-teen_6",
    "d792b1c2bae10577[BUST]": "julia-teen_7",
    "adc0bb14ca3a2e9f[BUST]": "julia-teen_8",
    "fa8dc338bf3f3238[BUST]": "julia-teen_9",
    "52f35504af77cd3e[BUST]": "julia-teen_10",
    "99409e387ecf0da1[BUST]": "julia-teen_11",
    "1e01be8b0d328cd4[BUST]": "julia-teen_12",
    "5636445087b9ec48[BUST]": "julia-teen_13",
    "27548fbdd5ae83aa[BUST]": "julia-teen_14",
    "8d7b21ba9d3b819f[BUST]": "julia-teen_15",
    "6f699ae0dd845ef4[BUST]": "julia-teen_16",
    "bf2313cfb0705987[BUST]": "julia-teen_17",
    // Renee
    "3f2489dd8ec5d66f[BUST]": "renee_(surprise)", // "m_surprise"
    "2ae48d0c43fdb6c4[BUST]": "renee_(no)", // "m_no"
    "7fc1078ba047c4ea[BUST]": "renee_(unsure)", // "m_unsure"
    "a93ff69f791aa5d6[BUST]": "renee_(down)", // "m_down"
    "e35383f4cdc7e871[BUST]": "renee_(err)", // "m_err"
    "b33bc03f2ad5e20b[BUST]": "renee_(hmph)", // "m_hmph"
    "0d2a6f655dd55623[BUST]": "renee_(sigh)", // "m_sigh"
    "5a158fcf146a6865[BUST]": "renee_(meh)", // "m_meh"
    "2b1777991e8bb9e4[BUST]": "renee_(um)", // "m_um"
    "aa5fd8605df1ad76[BUST]": "renee_(ticked)", // "m_ticked"
    "2ba46025d0765d16[BUST]": "renee_(angry)", // "m_angry"
    "2727e2aa2b4fb4e2[BUST]": "renee_(yell)", // "m_yell"
    "67bb69763f5faa65[BUST]": "renee_(oops)", // "m_oops"
    "cc2dba2870d017aa[BUST]": "renee_(mock)", // "m_mock"
    "9befb3aae9db49f5[BUST]": "renee_(smile)", // "m_smile"
    "bb383b4ee18466c0[BUST]": "renee_(excited)", // "m_excited"
    "eab23757ff9b84f6[BUST]": "renee_(laugh)", // "m_laugh"
    "956af808485c6c9d[BUST]": "renee_(proud)", // "m_proud"
    "74e30d16a2e8e181[BUST]": "renee_(pain)", // "m_pain"
    "6ee8d46a57ea59bd[BUST]": "renee_(reassure)", // "m_reassure"
    // Renee Past
    "d96e4af55ed93307[BUST]": "renee-past_1",
    "934467ac44ed7a73[BUST]": "renee-past_2",
    "174c21dd27e5a948[BUST]": "renee-past_3",
    "ad4e3cae5fc1bd0e[BUST]": "renee-past_4",
    "ce1387450cd382e0[BUST]": "renee-past_5",
    "17ef37dd59d1b962[BUST]": "renee-past_6",
    "8c0d2c8a6b9284ec[BUST]": "renee-past_7",
    "bd26a98569fb1781[BUST]": "renee-past_8",
    "ff41cd62d71cece6[BUST]": "renee-past_9",
    // Renee Dark
    "ff132e604a36eb9b[BUST]": "renee-dark_1",
    "683da6143078f363[BUST]": "renee-dark_2",
    "64619a947edc6937[BUST]": "renee-dark_3",
    "ba7518e41232a49f[BUST]": "renee-dark_4",
    "f52813d6f256035a[BUST]": "renee-dark_5",
    "7262161d2fc74581[BUST]": "renee-dark_6",
    "c4bae99fbff38529[BUST]": "renee-dark_7",
    "97f65da36d837d12[BUST]": "renee-dark_8",
    // Lady
    "13e20e002213585a[BUST]": "lady_(yell)",
    "88cb376695bcb4e4[BUST]": "lady_(miffed)",
    "5ebe1753cdf53711[BUST]": "lady_(happy)",
    "4cd6959a2d2a1cde[BUST]": "lady_(heh)",
    "310c389045f271fa[BUST]": "lady_(worry)",
    "6d8bb99f09d81fcf[BUST]": "lady_(nervous)",
    "d5fc810c3e11abaa[BUST]": "lady_(fear)",
    "1db0e19ceaf9336a[BUST]": "lady_(laugh)",
    // Hag
    "7e825b94b6fa1aba[BUST]": "hag_1",
    "cd81070e4d7d8e73[BUST]": "hag_2",
    "8f6d1f8416384c55[BUST]": "hag_3",
    "d193832758750d96[BUST]": "hag_4",
    // Grandpa
    "711bd3e857e19397[BUST]": "grandpa_1",
    "4b7f8641389c59b1[BUST]": "grandpa_2",
    "39bc27a87dcd41da[BUST]": "grandpa_3",
    "4e84a6d68fb4246b[BUST]": "grandpa_4",
    "56ca9b09a2165970[BUST]": "grandpa_5",
    // Surgeon
    "9b83d67be56fe371[BUST]": "surgeon_1",
    "1f2bc74af712b1f5[BUST]": "surgeon_2",
    "bd3cd4ad4dac4646[BUST]": "surgeon_3",
    "f3cad8f30bb70a6e[BUST]": "surgeon_4",
    "5d879d360f11a6fc[BUST]": "surgeon_5",
    "63aa4701de7bcb14[BUST]": "surgeon_6",
    "65e0d6fda5bc6e55[BUST]": "surgeon_7",
    "6119cd53323c514d[BUST]": "surgeon_8",
    // Grandma
    "f7b4e9088a76aa59[BUST]": "grandma_1",
    "e819af01d97e07aa[BUST]": "grandma_2",
    "b1f5ad5ee7f5a3e1[BUST]": "grandma_3",
    "840fe983bd335aff[BUST]": "grandma_4",
    // Cultists
    "27b37c9e5260d10a[BUST]": "cultists_1",
    "312176cded7ea29a[BUST]": "cultists_2",
    "c15cedb1482a9322[BUST]": "cultists_3",
    "7cfd3e1e074ac100[BUST]": "cultists_4",
    "73296c5a9e48dbac[BUST]": "cultists_5",
    "5c0de546932196d7[BUST]": "cultists_6",
    "95a2d8956cd8bb0c[BUST]": "cultists_7",
    "b82f4b2496711d64[BUST]": "cultists_8",
    "a6d87c6c76e65728[BUST]": "cultists_9",
    "c35073b032a3c6d0[BUST]": "cultists_(think)", // "l_think.png"
    "1c0e4a32dc419f8f[BUST]": "cultists_(joy)", // "l_joy"
    "3007f0661581f042[BUST]": "cultists_(tch)", // "l_tch"
    "65f2e14e351b4a83[BUST]": "cultists_(say)", // "l_say"
    "e666313c86218fa9[BUST]": "cultists_(talk)", // "l_talk"
    "547ad6e645df21e6[BUST]": "cultists_(serious)", // "l_serious"
    "a458507afaad4a80[BUST]": "cultists_16",
    "4ad5c79308848404[BUST]": "cultists_17",
    "1851402ae776064f[BUST]": "cultists_18",
    "d6393d8110ad1baf[BUST]": "cultists_19",
    "faddb17374ff3fca[BUST]": "cultists_20",
    "de866fb82238a913[BUST]": "cultists_21",
    "2ce560475cc7a0eb[BUST]": "cultists_22",
    // Surgeon Past
    "855cb67c67b878ca[BUST]": "surgeon-past_1",
    "251ad35650e18afc[BUST]": "surgeon-past_2",
    "af44f998968e60ca[BUST]": "surgeon-past_3",
    "be4bde86728951de[BUST]": "surgeon-past_4",
    "430fa5527be5de36[BUST]": "surgeon-past_5",
    "b69bf8e460f62646[BUST]": "surgeon-past_6",
    // Nina
    "f6fd31df044c8cf2[BUST]": "nina_(surprise)", // "_surprise"
    "3632263d132ff793[BUST]": "nina_(smile)", // "_smile"
    "21dadfaf3a04d110[BUST]": "nina_(unsure)", // "_unsure"
    "c8be5940c674f3ce[BUST]": "nina_(sad)", // "_sad"
    "bdeff333a01dc5ac[BUST]": "nina_(happy)", // "_happy"
    // Effects
    "ef6069d3eec1571e[BUST]": "effects_1",
    "d53f6b32ea8a5fd7[BUST]": "effects_2",
    "80e4f732721d90c5[BUST]": "effects_3",
    "cda139c6785260cb[BUST]": "effects_4",
    "3acff77b6ebd0ef6[BUST]": "effects_5",
    "e38496e526eb339c[BUST]": "effects_6",
    "6a4ee882cf09490d[BUST]": "effects_7",
    "d62aade4ab783891[BUST]": "effects_8",
    "ae7c04796aef9fe2[BUST]": "effects_9",
    "eaa3476967ad4fe7[BUST]": "effects_10",
    "2e9e80463252b2b3[BUST]": "effects_11",
    "5ceaa5f530967bba[BUST]": "effects_12",
    "85d55dd94eb20928[BUST]": "effects_13",
    "01abb8e1a27d953f[BUST]": "effects_14",
    // Douglas Past
    "f031204dce7d2bc8[BUST]": "douglas-past_1",
    "967327be50ce2306[BUST]": "douglas-past_2",
    "5449ddc9d0362811[BUST]": "douglas-past_3",
    "bf306e27c40aef4f[BUST]": "douglas-past_4",
    "19d3042f8f71615f[BUST]": "douglas-past_5",
    // Nurse
    "012da39538261341[BUST]": "nurse_1",
    "b7b5fcc6243285fc[BUST]": "nurse_2",

    // === Other (unchanged) ===
    "5adf3c7054e7a170": "phone_ringing_2",
    "2e9eb391c7d1e1d3": "neon_lights_buzz_2", // "buzz"
    "e8d807029008351e": "clock_ticking_2", // "ticktock"
    "baac72688d801cdc": "outside_noise_2", // "balcony"
    "80a2a8224d4844a6": "pastel_virus", // "pastelvirus"
    "c30bc7904f060edd": "after_school_sleeping",
    "2290fcbb4f40bd2b": "clock_ticking", // "ticktock"
    "47775190cf07bc35": "cloud_chiptune", // "03myuu_Cloud_Chiptune"
    "8fb50079baf1325c": "club", // "club"
    "Credits": "credits",
    "3cd2b03a72845cc1": "cultist_inside", // "cultist_inside"
    "5c41d5d8c96cc2c2": "cultist_outside", // "cultist_outside"
    "3664421a97b66ab8": "cupid", // "sh_cupid"
    "7c1ae5440068d7f5": "curiosity_capsule_girl",
    "5636a26654b27bd4": "dark_bells", // "bells_dark"
    "2aadb6490fe41eb3": "dream_dance", // "dream_dance"
    "5be310a5b00d2ed3": "dreaming_injection", // "dreaming_injection"
    "195abd8ff1ce3e0b": "end_story", // "musicbox_blingy"
    "57729d2c94559e55": "fire", // "fireplace"
    "7738131ecf913420": "forest", // "forest"
    "5c098cf75f7ad0a7": "guard_tree", // "guard tree"
    "6d566c93c74c14fc": "halloween_chiptune", // "08myuu_Halloween_Chiptune"
    "bd130be1fc2ae367": "hallucination_connect", // "hallucination_connect"
    "a69ceb49e11dedac": "jealous_doll", // "jealous_doll"
    "ecef72663ba32460": "jester's_pity", // "jesters_pity"
    "9c7050ae76645487": "labels",
    "a0c2b4248fd4b6cd": "melancholy_memory",
    "efbb528a5d3f4246": "neon_lights_buzz", // "buzz"
    "bcf67e40f150611d": "old_fairy_tales", // "oldfairytales"
    "a335333229af2006": "outside_noise",
    "6fe44b4ee048be76": "pandora_syndrome", // "pandorasyndrome"
    "5eaeeb56b517b4de": "snail_eyes", // "snaileyes"
    "31be20bb120f5c51": "phone_ringing",
    "25b43fbc90c1d97c": "picture_book", // "picture_book"
    "f4b41d4b05a86dec": "pictures_1011", // "black"
    "0f248cf67bab1f6c": "secret_rooms", // "secretrooms"
    "926c1f1ca58f0c1f": "sheep_sway", // "sheep_sway"
    "3b42c57a438aa80a": "silly_intro", // "silly_intro"
    "f2d2d91ea3077367": "small_magic_book", // "smallmagicbook"
    "3d2b3928e7b73822": "altar_lamb", // "altarlamb"
    "c257c15680b1ddee": "spooky_spells",
    "5aeca43b0d06d9df": "teddybear", // "teddybear"
    "bfe1f2ddce1fa1a8": "the_clock_is_ticking",
    "4f69d90a5fe15f23": "twisted_clowns", // "twistedclowns"
    "313d5ade731cde57": "unlock", // "title_sting"
    "663fd1980316d25b": "wandering_wizard", // "wandering_wizard"
};

// List of asset hashes that should not be displayed in galleries
const ignoreAssets = [
    "7d6f1e67e074a178", // "Weapons1"
    "ddd8237f2d4b4360", // "Weapons2"
    "ddf9cdd7da11cc2a", // "GameOver"
    "766d372c84f1dac0", // "IconSet"
    "b35a172f174d8653", // "Damage"
    "ad1c62514586e83b", // "ButtonSet"
    "30f14a2c7734a492", // "Weapons3"
];
