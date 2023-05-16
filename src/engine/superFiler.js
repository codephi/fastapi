const dictPtBr = require('../dicts/pt_BR.json');
const { Op } = require('sequelize');

const spellingDictionary = dictPtBr;

function fixText(text) {
  const words = text.toLowerCase().split(' ');
  const fixedWords = words.map((word) => {
    if (spellingDictionary[word]) {
      return spellingDictionary[word];
    } else {
      return word;
    }
  });
  return fixedWords;
}

const formaCondition = (searchTerm) => {
  return {
    [Op.iLike]: `%${searchTerm}%`,
  };
};

const addTerm = (target, fullTarget) => {
  const history = [fullTarget];
  target.push(formaCondition(fullTarget));
  const targetSplit = fullTarget.split(' ');

  if (targetSplit.length > 1) {
    targetSplit.forEach((word) => {
      const formated = formaCondition(word);

      if (history.indexOf(formated) === -1) {
        history.push(fullTarget);
        target.push(formated);
      }
    });
  }

  return target;
};

const superFiler = (fields, searchTerm) => {
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
        [field]: item,
      });
    });
  });

  return {
    [Op.or]: termFields,
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
    y: '[yÿ]',
  };

  for (let letter in accentMap) {
    const regex = new RegExp(accentMap[letter], 'gi');
    text = text.replace(regex, letter);
  }

  return text;
}

module.exports.superFiler = superFiler;
