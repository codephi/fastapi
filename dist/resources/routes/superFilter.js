"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.superFilter = void 0;
var dictPtBr = require("../../dicts/pt_BR.json");
var sequelize_1 = require("sequelize");
var iLike = sequelize_1.Op.iLike, or = sequelize_1.Op.or;
var spellingDictionary = dictPtBr;
function fixText(text) {
    var words = text.toLowerCase().split(' ');
    var fixedWords = words.map(function (word) {
        if (spellingDictionary[word]) {
            return spellingDictionary[word];
        }
        else {
            return word;
        }
    });
    return fixedWords;
}
var formaCondition = function (searchTerm) {
    var _a;
    return _a = {},
        _a[iLike] = "%".concat(searchTerm, "%"),
        _a;
};
var addTerm = function (target, fullTarget) {
    var history = [fullTarget];
    target.push(formaCondition(fullTarget));
    var targetSplit = fullTarget.split(' ');
    if (targetSplit.length > 1) {
        targetSplit.forEach(function (word) {
            var formated = formaCondition(word);
            if (history.indexOf("%".concat(word, "%")) === -1) {
                history.push("%".concat(word, "%"));
                target.push(formated);
            }
        });
    }
    return target;
};
var superFilter = function (fields, searchTerm) {
    var _a;
    var term = addTerm([], searchTerm);
    var textFixed = fixText(searchTerm);
    var textFixedJoin = textFixed.join(' ');
    if (searchTerm !== textFixedJoin) {
        term = addTerm(term, textFixedJoin);
    }
    var termNotAccents = removeAccents(searchTerm);
    if (searchTerm !== termNotAccents && textFixedJoin !== termNotAccents) {
        term = addTerm(term, termNotAccents);
    }
    var termFields = [];
    fields.forEach(function (field) {
        term.forEach(function (item) {
            var _a;
            termFields.push((_a = {},
                _a[field] = item,
                _a));
        });
    });
    return _a = {},
        _a[or] = termFields,
        _a;
};
exports.superFilter = superFilter;
function removeAccents(text) {
    var accentMap = {
        a: '[aàáâãäå]',
        ae: 'æ',
        c: 'ç',
        e: '[eèéêë]',
        i: '[iìíîï]',
        n: 'ñ',
        o: '[oòóôõö]',
        oe: 'œ',
        u: '[uùúûűü]',
        y: '[yÿ]'
    };
    for (var letter in accentMap) {
        var regex = new RegExp(accentMap[letter], 'gi');
        text = text.replace(regex, letter);
    }
    return text;
}
