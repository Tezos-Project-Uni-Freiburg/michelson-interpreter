'use strict';
/* jshint esversion: 6 */
/* jshint node: true */
// const { unstable } = require("jshint/src/options");


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
        case 'CDR':
            output.push(false, 'pair');
            break;
        case 'CHAIN_ID':
            output.push(false, null);
            break;
        case 'CHECK_SIGNATURE':
            output.push(false, 'key', 'signature', 'bytes');
            break;
        case 'COMPARE':
            // TODO: how to figure out that both types are comparable?
            output.push(false, null);
            break;
        case 'CONCAT':
            // TODO: how to figure out that the type of list is either string or bytes?
            output.push(true, ['string', 'string'], ['bytes', 'bytes'], ['list']);
            break;
        case 'CONS':
            // TODO: how to figure out that the ty1 and type of list is the same?
            output.push(false, null);
            break;
        case 'CONTRACT':
            // TODO: how to figure out the type of contract & address?
            output.push(false, null);
            break;
        case 'CREATE_CONTRACT':
            // TODO
            output.push(false, null);
            break;
        case 'DIG':
            output.push(false, null);
            break;
        case 'DIP':
            output.push(false, null);
            break;
        case 'DROP':
            output.push(false, null);
            break;
        case 'DUG':
            output.push(false, null);
            break;
        case 'DUP':
            output.push(false, null);
            break;
        case 'EDIV':
            output.push(true, ['nat', 'nat'], ['nat', 'int'], ['int', 'nat'],
                              ['int', 'int'], ['mutez', 'nat'], ['mutez', 'mutez']);
            break;
        case 'EMPTY_BIG_MAP':
            output.push(false, null);
            break;
        case 'EMPTY_MAP':
            output.push(false, null);
            break;
        case 'EMPTY_SET':
            output.push(false, null);
            break;
        case 'EQ':
            output.push(false, 'int');
            break;
        case 'EXEC':
            // TODO: how to determine ty1 and lambda's type match?
            output.push(false, '', 'lambda');
            break;
        case 'FAILWITH':
            // TODO: actually FAILWITH takes any type that's packable, need to figure out
            output.push(false, 'unit');
            break;
        case 'GE':
            output.push(false, 'int');
            break;
        case 'GET':
            output.push(true, ['', 'map'], ['', 'big_map']);
            break;
        case 'GET_AND_UPDATE':
            output.push(true, ['', 'option', 'map'], ['', 'option', 'big_map']);
            break;
        case 'GT':
            output.push(false, 'int');
            break;
        case 'HASH_KEY':
            output.push(false, 'key');
            break;
        case 'IF':
            output.push(false, 'bool');
            break;
        case 'IF_CONS':
            output.push(false, 'list');
            break;
        case 'IF_LEFT':
            output.push(false, 'or');
            break;
        case 'IF_NONE':
            output.push(false, 'option');
            break;
        case 'IMPLICIT_ACCOUNT':
            output.push(false, 'key_hash');
            break;
        case 'INT':
            output.push(true, ['nat'], ['bls12_381_fr']);
            break;
        case 'ISNAT':
            output.push(false, 'int');
            break;
        case 'ITER':
            output.push(true, ['list'], ['set'], ['map']);
            break;
        case 'JOIN_TICKETS':
            output.push(false, 'pair');
            break;
        case 'KECCAK':
            output.push(false, 'bytes');
            break;
        case 'LAMBDA':
            output.push(false, null);
            break;
        case 'LE':
            output.push(false, 'int');
            break;
        case 'LEFT':
            output.push(false, null);
            break;
        case 'LEVEL':
            output.push(false, null);
            break;
        case 'LOOP':
            output.push(false, 'bool');
            break;
        case 'LOOP_LEFT':
            output.push(false, 'or');
            break;
        case 'LSL':
            output.push(false, 'nat', 'nat');
            break;
        case 'LSR':
            output.push(false, 'nat', 'nat');
            break;
        case 'LT':
            output.push(false, 'int');
            break;
        case 'MAP':
            output.push(true, ['list'], ['map']);
            break;
        case 'MEM':
            output.push(true, ['', 'set'], ['', 'map'], ['', 'big_map']);
            break;
        case 'MUL':
            output.push(true, ['nat', 'nat'], ['nat', 'int'], ['int', 'nat'],
                              ['int', 'int'], ['mutez', 'nat'], ['nat', 'mutez'],
                              ['bls12_381_g1', 'bls12_381_fr'], ['bls12_381_g2', 'bls12_381_fr'],
                              ['bls12_381_fr', 'bls12_381_fr'], ['nat', 'bls12_381_fr'],
                              ['int', 'bls12_381_fr'], ['bls12_381_fr', 'nat'], ['bls12_381_fr', 'int']);
            break;
        default:
            throw ('unknown instruction type '.concat(instruction));
    }
    return output;
}

exports.initialize = initialize;
exports.processInstruction = processInstruction;