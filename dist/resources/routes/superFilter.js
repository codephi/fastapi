"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.superFilter = void 0;
const pt_BR_1 = __importDefault(require("../../dicts/pt_BR"));
const sequelize_1 = require("sequelize");
const { iLike, or } = sequelize_1.Op;
const spellingDictionary = pt_BR_1.default;
function fixText(text) {
    const words = text.toLowerCase().split(' ');
    const fixedWords = words.map((word) => {
        if (spellingDictionary[word]) {
            return spellingDictionary[word];
        }
        else {
            return word;
        }
    });
    return fixedWords;
}
const formaCondition = (searchTerm) => {
    return {
        [iLike]: `%${searchTerm}%`
    };
};
const addTerm = (target, fullTarget) => {
    const history = [fullTarget];
    target.push(formaCondition(fullTarget));
    const targetSplit = fullTarget.split(' ');
    if (targetSplit.length > 1) {
        targetSplit.forEach((word) => {
            const formated = formaCondition(word);
            if (history.indexOf(`%${word}%`) === -1) {
                history.push(`%${word}%`);
                target.push(formated);
            }
        });
    }
    return target;
};
const superFilter = (fields, searchTerm) => {
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
    fields.forEach((field) => {
        term.forEach((item) => {
            termFields.push({
                [field]: item
            });
        });
    });
    return {
        [or]: termFields
    };
};
exports.superFilter = superFilter;
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
    for (let letter in accentMap) {
        const regex = new RegExp(accentMap[letter], 'gi');
        text = text.replace(regex, letter);
    }
    return text;
}
