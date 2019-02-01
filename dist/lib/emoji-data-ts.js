"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var currentVersion = '4.1.0';
var emoji_json_1 = require("./emoji/4.1.0/emoji.json");
var emojiData = emoji_json_1.default;
if (emoji_json_1.default == null) {
    emojiData = require('./emoji/4.1.0/emoji.json');
}
var skinToneUnicodeMap = {
    '\uD83C\uDFFB': 'skin-tone-2',
    '\uD83C\uDFFC': 'skin-tone-3',
    '\uD83C\uDFFD': 'skin-tone-4',
    '\uD83C\uDFFE': 'skin-tone-5',
    '\uD83C\uDFFF': 'skin-tone-6'
};
var categoriesData = [
    'Smileys & People',
    'Animals & Nature',
    'Food & Drink',
    'Activities',
    'Travel & Places',
    'Objects',
    'Symbols',
    'Flags'
];
var sheetColumns = 52;
var sheetRows = 52;
var EmojiData = /** @class */ (function () {
    function EmojiData(opts) {
        this.opts = opts;
        this.emojiValMap = new Map();
        this.emojiUnifiedValMap = new Map();
        this.emojiCategoryLookUp = new Map();
        this.emojiUnicodeRegex = this.initUnified();
        this.findImage = function (actual, variation) {
            var sheetSizeX = 100 * sheetColumns;
            var sheetSizeY = 100 * sheetRows;
            var multiplyX = 100 / (sheetColumns - 1);
            var multiplyY = 100 / (sheetRows - 1);
            if (actual.skin_variations != null && variation != null) {
                var a = actual.skin_variations[variation.unified];
                return {
                    x: a.sheet_x * multiplyX,
                    y: a.sheet_y * multiplyY,
                    sheetSizeX: sheetSizeX,
                    sheetSizeY: sheetSizeY,
                    imageUrl: a.image_url
                };
            }
            return {
                x: actual.sheet_x * multiplyX,
                y: actual.sheet_y * multiplyY,
                sheetSizeX: sheetSizeX,
                sheetSizeY: sheetSizeY,
                imageUrl: actual.image_url
            };
        };
        this.initEnv();
    }
    EmojiData.prototype.getImageDataWithColon = function (emojiStrWithColon) {
        var emojiStr = emojiStrWithColon.substr(1, emojiStrWithColon.length - 2);
        return this.getImageData(emojiStr);
    };
    EmojiData.prototype.getImageData = function (emojiStr) {
        if (emojiStr.indexOf('::skin-tone-') === -1) {
            var emojiVal_1 = this.emojiValMap.get(emojiStr);
            if (emojiVal_1 != null && emojiVal_1.category !== 'Skin Tones') {
                return this.findImage(emojiVal_1);
            }
            return null;
        }
        var skinTone = emojiStr.substr(-1, 1);
        var skinVal = this.emojiValMap.get("skin-tone-" + skinTone);
        var emojiIdx = emojiStr.substr(0, emojiStr.length - 13);
        var emojiVal = this.emojiValMap.get(emojiIdx);
        if (emojiVal != null) {
            return this.findImage(emojiVal, skinVal);
        }
        return null;
    };
    EmojiData.prototype.getEmojiByName = function (emojiStr) {
        return this.emojiValMap.get(emojiStr);
    };
    EmojiData.prototype.isSkinTone = function (skinTone) {
        return skinTone != null && skinTone.indexOf('skin-tone-') > -1;
    };
    EmojiData.prototype.replaceEmojiToStr = function (text) {
        var _this = this;
        return text.replace(this.emojiUnicodeRegex, function (m, p1, p2) {
            return _this.convertUniToStr(m, p1, p2);
        });
    };
    EmojiData.prototype.convertUniToStr = function (emojiUni, withoutSkinToneUni, skinToneUni) {
        var emoji = this.emojiUnifiedValMap.get(withoutSkinToneUni);
        if (emoji != null) {
            if (skinToneUni != null && skinToneUnicodeMap[skinToneUni] != null) {
                return ":" + emoji.short_name + "::" + skinToneUnicodeMap[skinToneUni] + ":";
            }
            return ":" + emoji.short_name + ":";
        }
        return emojiUni;
    };
    EmojiData.prototype.initEnv = function () {
        this.initEmojiMap();
    };
    EmojiData.prototype.initEmojiMap = function () {
        for (var _i = 0, emojiData_1 = emojiData; _i < emojiData_1.length; _i++) {
            var e_1 = emojiData_1[_i];
            if (e_1.skin_variations != null) {
                for (var _a = 0, _b = Object.values(e_1.skin_variations); _a < _b.length; _a++) {
                    var skin = _b[_a];
                    skin.image_url = this.getEmojiImgPath(skin.image);
                }
            }
            e_1.image_url = this.getEmojiImgPath(e_1.image);
            for (var _c = 0, _d = e_1.short_names; _c < _d.length; _c++) {
                var name_1 = _d[_c];
                this.emojiValMap.set(name_1, e_1);
            }
            this.emojiUnifiedValMap.set(e_1.char, e_1);
        }
        var modifierCategory = 'Skin Tones';
        var _loop_1 = function (c) {
            if (c !== modifierCategory) {
                var emojis = emojiData.filter(function (a) { return a.category === c; });
                this_1.emojiCategoryLookUp.set(c, emojis);
            }
        };
        var this_1 = this;
        for (var _e = 0, categoriesData_1 = categoriesData; _e < categoriesData_1.length; _e++) {
            var c = categoriesData_1[_e];
            _loop_1(c);
        }
    };
    EmojiData.prototype.getEmojiImgPath = function (imageName) {
        if (this.opts == null)
            return '';
        if (this.opts.cdnPath == null)
            return '';
        return this.opts.cdnPath + "/" + currentVersion + "/" + imageName;
    };
    EmojiData.prototype.initUnified = function () {
        var a = [];
        for (var _i = 0, emojiData_2 = emojiData; _i < emojiData_2.length; _i++) {
            var e_2 = emojiData_2[_i];
            a.push(e_2.char.replace('*', '\\*'));
        }
        a.sort(function (a, b) {
            return b.length - a.length;
        });
        return new RegExp("(" + a.join('|') + ")(\uD83C[\uDFFB-\uDFFF])?", 'g');
    };
    return EmojiData;
}());
exports.EmojiData = EmojiData;
//# sourceMappingURL=emoji-data-ts.js.map