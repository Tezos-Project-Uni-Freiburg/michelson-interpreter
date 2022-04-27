'use strict';
/* jshint esversion: 11 */
/* jshint node: true */
const nearley = require("nearley");
const fs = require("fs");
const process = require('process');

const { Data, Delta, State, Step, CustomError } = require('./types.cjs');
const { initialize, processInstruction } = require("./functions.cjs");

process.on('uncaughtException', (err, origin) => {
    console.log('Got exception, details below:');
    console.log(err.message);
    console.log('-------------------------------');
    console.log('Content of the exception:');
    console.log(JSON.stringify(err.errorExtraParams));
    console.log('-------------------------------');
    console.log('State at the time of exception:');
    console.log(JSON.stringify(global.currentState));
    console.log('-------------------------------');
    console.log('Stack at the time of exception:');
    console.log(JSON.stringify(global.stack));
    console.log('-------------------------------');
    console.log('Recorded steps at the time of exception:');
    console.log(JSON.stringify(global.steps));
    console.log('-------------------------------');
    // fs.writeSync(
    //   process.stderr.fd,
    //   `Caught exception: ${err}\n` +
    //   `Exception origin: ${err.errorExtraParams}`
    // );
});

const Grammar = require("./michelson-parser/grammar.cjs");

const parser = new nearley.Parser(nearley.Grammar.fromCompiled(Grammar));

function main(state, script, parameter, storage) {
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

// test run:
// const script = fs.readFileSync(process.argv[2], 'utf8');
// const script = fs.readFileSync('/Users/berkay/opcodes_list_iter.tz', 'utf8');
const script = fs.readFileSync('/Users/berkay/test.tz', 'utf8');
// const script = fs.readFileSync('/Users/berkay/opcodes_packunpack.tz', 'utf8');
const state = new State(200000, 2000000, 0, "tz1KqTpEZ7Yob7QbPE4Hy4Wo8fHG8LhKxZSx", "default", "2022-01-01T00:00:00.000Z", "KT1QuofAgnsWffHzLA7D78rxytJruGHDe7XG");
var parameter = 'Unit';
var storage = '{"Unit"; "a"}';
// const args = require('minimist')(process.argv.slice(2));
// console.log(args);
main(state, script, parameter, storage);
