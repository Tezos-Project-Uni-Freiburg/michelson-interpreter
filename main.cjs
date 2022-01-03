'use strict';
/* jshint esversion: 6 */
/* jshint node: true */

const nearley = require("nearley");
const fs = require("fs");

const { Data } = require("./types/Data.cjs");
const { Delta } = require("./types/Delta.cjs");
const { State } = require("./types/State.cjs");
const { Step } = require("./types/Step.cjs");
const Functions = require("./functions.cjs");
const Grammar = require("./grammar.cjs");

const parser = new nearley.Parser(nearley.Grammar.fromCompiled(Grammar));

function main(state, script) {
    parser.feed(data);
    if (parser.results.length > 1) {
        console.log("Multiple parsings!");
        return;
    }
    const result = JSON.parse(parser.results[0]);

    // our storage
    const stack = [];

    // incl
    stack.push(Functions.initialize(result.slice(0, 1)[0].args[0], result.slice(1, 2)[0].args[0]));

    // examine parameter
    console.dir(stack, { depth: null });
}

// test run:
const data = fs.readFileSync('/Users/berkay/GitHub/michelson-parser/test/old_auction.tz', 'utf8');
const state = {};
main(state, data);