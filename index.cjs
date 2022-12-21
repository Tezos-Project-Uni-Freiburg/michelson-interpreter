// @create-index

console.log("Importing michelson");

var theMichelsonInterpreterFunction = require("./lib/michelson-interpreter-function.cjs");
const { State } = require('./lib/types.cjs');

module.exports = {
    theMichelsonInterpreterFunction,
    State
}