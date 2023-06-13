function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
import * as dictPtBr from "../../dicts/pt_BR.json";
import { Op } from "sequelize";
var spellingDictionary = dictPtBr;
function fixText(text) {
    var words = text.toLowerCase().split(" ");
    var fixedWords = words.map(function(word) {
        if (spellingDictionary[word]) {
            return spellingDictionary[word];
        } else {
            return word;
        }
    });
    return fixedWords;
}
var formaCondition = function(searchTerm) {
    return _define_property({}, Op.iLike, "%".concat(searchTerm, "%"));
};
var addTerm = function(target, fullTarget) {
    var history = [
        fullTarget
    ];
    target.push(formaCondition(fullTarget));
    var targetSplit = fullTarget.split(" ");
    if (targetSplit.length > 1) {
        targetSplit.forEach(function(word) {
            var formated = formaCondition(word);
            if (history.indexOf("%".concat(word, "%")) === -1) {
                history.push("%".concat(word, "%"));
                target.push(formated);
            }
        });
    }
    return target;
};
var superFiler = function(fields, searchTerm) {
    var term = addTerm([], searchTerm);
    var textFixed = fixText(searchTerm);
    var textFixedJoin = textFixed.join(" ");
    if (searchTerm !== textFixedJoin) {
        term = addTerm(term, textFixedJoin);
    }
    var termNotAccents = removeAccents(searchTerm);
    if (searchTerm !== termNotAccents && textFixedJoin !== termNotAccents) {
        term = addTerm(term, termNotAccents);
    }
    var termFields = [];
    fields.forEach(function(field) {
        term.forEach(function(item) {
            termFields.push(_define_property({}, field, item));
        });
    });
    return _define_property({}, Op.or, termFields);
};
function removeAccents(text) {
    var accentMap = {
        a: "[a\xe0\xe1\xe2\xe3\xe4\xe5]",
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
export { superFiler };
