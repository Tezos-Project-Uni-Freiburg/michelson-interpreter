'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const nearley = require('nearley');
const grammar = require('./grammar');
const fs = require('fs');

const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
const data = fs.readFileSync('/home/berkay/Nextcloud/Proje/Michelson/old/auction.tz', 'utf8');

parser.feed(data);
const result = JSON.parse(parser.results[0])
console.log(result)