'use strict';
/* jshint esversion: 6 */
/* jshint node: true */

const nearley = require("nearley");
const fs = require("fs");

const { Data, Delta, State, Step } = require('./types.cjs');
const { initialize, processInstruction } = require("./functions.cjs");
const Grammar = require("./grammar.cjs");

const parser = new nearley.Parser(nearley.Grammar.fromCompiled(Grammar));

function main(state, script) {
    parser.feed(script);
    if (parser.results.length > 1) {
        console.log("Multiple parsings!");
        return;
    }
    const result = JSON.parse(parser.results[0]);
    const parameter = result.shift();
    const storage = result.shift();
    const code = result.shift();
    const instructions = JSON.parse(JSON.stringify(code.args)).flat();

    // our storage
    const stack = [];
    const steps = [];
    const states = [];

    // incl
    stack.push(initialize(parameter.args[0], storage.args[0]));

    // save state
    states.push(JSON.parse(JSON.stringify(state)));
    // save stack
    steps.push(new Step(new Delta([], [stack[0]]), [parameter, storage]));

    // start iterating
    for (const i of instructions) {
        processInstruction(i, stack, steps, states);
    }

    // examine parameter
    console.dir(stack, { depth: null });
}

// test run:
const script = fs.readFileSync('/Users/berkay/test.tz', 'utf8');
const state = new State(200000, 300, 0, "tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx", "default", "2022-01-01T00:00:00.000Z", "KT1QuofAgnsWffHzLA7D78rxytJruGHDe7XG");
main(state, script);