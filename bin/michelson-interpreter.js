#!/usr/bin/env node

'use strict';
const process = require('process');
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

const nearley = require("nearley");
const fs = require("fs");
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const { State } = require('../lib/types.js');
const { initialize, processInstruction } = require("../lib/functions.js");

const Grammar = require("../michelson-parser/grammar.js");
const parser = new nearley.Parser(nearley.Grammar.fromCompiled(Grammar));

const michelsonInterpreter = require("../lib/michelson-interpreter-function.js");

const argv = yargs(hideBin(process.argv))
    .usage("Usage: $0 [options]")
    .options({
            'file': {
                alias: 'f',
                type: 'string',
                description: 'Path of the file to interpret',
                demandOption: true
            },
            'parameter': {
                alias: 'p',
                type: 'string',
                description: 'Parameter value for the script',
                demandOption: true
            },
            'storage' :{
                alias: 's',
                type: 'string',
                description: 'Storage value for the script',
                demandOption: true
            },
            'account': {
                type: 'string',
                description: 'Account as a string'
            },
            'address': {
                type: 'string',
                description: 'Address as a string'
            },
            'amount': {
                type: 'number',
                description: 'Amount as an int'
            },
            'entrypoint': {
                type: 'string',
                description: 'Entrypoint as a string'
            },
            'gas_limit': {
                type: 'number',
                description: 'Gas limit as an int'
            },
            'id': {
                type: 'number',
                description: 'id as an int'
            },
            'timestamp': {
                description: 'Timestamp as a string in RFC3339 notation or an int as an Unix time'
            }
    })
    .locale('en')
    .check(argv => fs.existsSync(argv.f) ? true : 'ERROR: Specified file does not exist')
    .argv;

const script = fs.readFileSync(argv.file, 'utf8');
const state = new State(argv.account || '',
                        argv.address || '',
                        argv.amount || 0,
                        argv.entrypoint || 'default',
                        argv.gas_limit || 0,
                        argv.id || 0,
                        argv.timestamp || 0);
michelsonInterpreter(script, argv.parameter, argv.storage, state);
