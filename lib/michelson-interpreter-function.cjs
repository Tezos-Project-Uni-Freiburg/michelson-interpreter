
const Grammar = require("../michelson-parser/grammar.cjs");
const nearley = require("nearley");
const parser = new nearley.Parser(nearley.Grammar.fromCompiled(Grammar));

const { Delta, Step } = require('./types.cjs');
const { initialize, processInstruction } = require("./functions.cjs");

function michelsonInterpreter(script, parameter, storage, state) {
    parser.feed(script);
    if (parser.results.length > 1) {
        console.log("Multiple parsings!");
        return;
    }
    const result = JSON.parse(parser.results[0]);
    const parameterType = result.shift();
    const storageType = result.shift();
    const code = result.shift();
    const instructions = JSON.parse(JSON.stringify(code.args)).flat(2);
    global.currentState = state;

    // our storage
    global.stack = [];
    global.steps = [];
    global.states = [];

    // incl
    global.stack.push(initialize(parameterType.args[0], parameter, storageType.args[0], storage));

    // save state
    global.states.push(JSON.parse(JSON.stringify(global.currentState)));
    // save stack
    global.steps.push(new Step(new Delta([], [global.stack[0]]), [parameterType, storageType], global.stack));

    // start iterating
    for (const i of instructions) {
        const step = processInstruction(i, global.stack);
        if (!i.prim.includes('IF')) {
            global.steps.push(step);
        }
    }

    // examine parameter
    console.log(JSON.stringify(global.steps));
}

module.exports = michelsonInterpreter;