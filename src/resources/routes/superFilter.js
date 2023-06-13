"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "superFiler", {
    enumerable: true,
    get: function() {
        return superFiler;
    }
});
const _pt_BRjson = /*#__PURE__*/ _interop_require_wildcard(require("../../dicts/pt_BR.json"));
const _sequelize = require("sequelize");
function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = new WeakMap();
    var cacheNodeInterop = new WeakMap();
    return (_getRequireWildcardCache = function(nodeInterop) {
        return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
}
function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return {
            default: obj
        };
    }
    var cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {};
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for(var key in obj){
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}
const spellingDictionary = _pt_BRjson;
function fixText(text) {
    const words = text.toLowerCase().split(' ');
    const fixedWords = words.map((word)=>{
        if (spellingDictionary[word]) {
            return spellingDictionary[word];
        } else {
            return word;
        }
    });
    return fixedWords;
}
const formaCondition = (searchTerm)=>{
    return {
        [_sequelize.Op.iLike]: `%${searchTerm}%`
    };
};
const addTerm = (target, fullTarget)=>{
    const history = [
        fullTarget
    ];
    target.push(formaCondition(fullTarget));
    const targetSplit = fullTarget.split(' ');
    if (targetSplit.length > 1) {
        targetSplit.forEach((word)=>{
            const formated = formaCondition(word);
            if (history.indexOf(`%${word}%`) === -1) {
                history.push(`%${word}%`);
                target.push(formated);
            }
        });
    }
    return target;
};
const superFiler = (fields, searchTerm)=>{
    let term = addTerm([], searchTerm);
    const textFixed = fixText(searchTerm);
    const textFixedJoin = textFixed.join(' ');
    if (searchTerm !== textFixedJoin) {
        term = addTerm(term, textFixedJoin);
    }
    const termNotAccents = removeAccents(searchTerm);
    if (searchTerm !== termNotAccents && textFixedJoin !== termNotAccents) {
        term = addTerm(term, termNotAccents);
    }
    const termFields = [];
    fields.forEach((field)=>{
        term.forEach((item)=>{
            termFields.push({
                [field]: item
            });
        });
    });
    return {
        [_sequelize.Op.or]: termFields
    };
};
function removeAccents(text) {
    const accentMap = {
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
    for(let letter in accentMap){
        const regex = new RegExp(accentMap[letter], 'gi');
        text = text.replace(regex, letter);
    }
    return text;
}
ae: "\xe6",
        c: "\xe7",
        e: "[e\xe8\xe9\xea\xeb]",
        i: "[i\xec\xed\xee\xef]",
        n: "\xf1",
        o: "[o\xf2\xf3\xf4\xf5\xf6]",
        oe: "œ",
        u: "[u\xf9\xfa\xfbű\xfc]",
        y: "[y\xff]"
    };
    for(var letter in accentMap){
        var regex = new RegExp(accentMap[letter], "gi");
        text = text.replace(regex, letter);
    }
    return text;
}
