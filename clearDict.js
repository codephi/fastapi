const dict = require('./dict.json');
const newDict = {};

Object.entries(dict).forEach(([key, value]) => {
  if (key !== value) {
    newDict[key] = value;
  }
});

console.log(newDict);
