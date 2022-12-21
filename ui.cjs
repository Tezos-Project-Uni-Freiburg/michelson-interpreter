
const myModule = require('./index.cjs');
const fs = require("fs");

const script = fs.readFileSync("./testFile.tz", 'utf8');
const state = new myModule.State('', '', 0, 'default', 0, 0, 0);

console.log((myModule.theMichelsonInterpreterFunction(script, 5, 5, state)))