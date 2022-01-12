'use strict';
/* jshint esversion: 6 */
/* jshint node: true */

const { Data } = require("./types/Data.cjs");

function initialize(parameter, storage) {
    return new Data("pair",
                    [new Data(parameter.prim,
                              parameter.args || [],
                              parameter.annots || []
                             ),
                     new Data(storage.prim,
                              storage.args || [],
                              storage.annots || []
                             )
                    ],
                    []);
}

function processInstruction(instruction, stack, steps, states) {

}

function instructionRequirement(instruction) {
    const output = [];
    switch(instruction) {
        case 'ABS':
            output.push(false, 'int');
            break;
        case 'ADD':
            output.push(true, ['nat', 'nat'], ['nat', 'int'], ['int', 'nat'],
                              ['int', 'int'], ['timestamp', 'int'], ['int', 'timestamp'],
                              ['mutez', 'mutez'], ['bls12_381_g1', 'bls12_381_g1'],
                              ['bls12_381_g2', 'bls12_381_g2'], ['bls12_381_fr', 'bls12_381_fr']);
            break;
        case 'ADDRESS':
            output.push(false, 'contract');
            break;
        case 'AMOUNT':
            output.push(false, null);
            break;
        case 'AND':
            output.push(true, ['bool', 'bool'], ['nat', 'nat'], ['int', 'nat']);
            break;
        case 'APPLY':
            // TODO: how to figure out ty1, ty2 and ty3?
            output.push(false, null);
            break;
        case 'BALANCE':
            output.push(false, null);
            break;
        case 'BLAKE2B':
            output.push(false, 'bytes');
            break;
        case 'CAR':
            output.push(false, 'pair');
            break;
        default:
            throw ('unknown instruction type '.concat(instruction));
    }
    return output;
}

exports.initialize = initialize;
exports.processInstruction = processInstruction;