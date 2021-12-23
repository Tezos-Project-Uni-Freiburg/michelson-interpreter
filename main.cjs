'use strict';
/* jshint esversion: 6 */
/* jshint node: true */

const State = require("./types/State.cjs");
const Step = require("./types/Step.cjs");
const Data = require("./types/Data.cjs");
const functions = require("./functions.cjs");
const nearley = require("nearley");

const grammar = require("./grammar.cjs");
const fs = require("fs");

const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
const data = fs.readFileSync('/Users/berkay/GitHub/michelson-parser/test/old_auction.tz', 'utf8');

parser.feed(data);
var result = JSON.parse(parser.results[0]);

// our storage
var stack = [];

// incl
stack.push(functions.initialize(result.slice(0, 1)[0], result.slice(1, 2)[0]));

// examine parameter
console.dir(stack, { depth: null });