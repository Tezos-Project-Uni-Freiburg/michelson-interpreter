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
        case 'EQ':
        case 'GE':
        case 'GT':
        case 'ISNAT':
        case 'LE':
        case 'LT':
        case 'NEQ':
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
        case 'APPLY': // TODO: how to figure out ty1, ty2 and ty3?
        case 'BALANCE':
        case 'CHAIN_ID':
        case 'COMPARE': // TODO: how to figure out that both types are comparable?
        case 'CONS': // TODO: how to figure out that the ty1 and type of list is the same?
        case 'CONTRACT': // TODO: how to figure out the type of contract & address?
        case 'CREATE_CONTRACT': // TODO
        case 'DIG':
        case 'DIP':
        case 'DROP':
        case 'DUG':
        case 'DUP':
        case 'EMPTY_BIG_MAP':
        case 'EMPTY_MAP':
        case 'EMPTY_SET':
        case 'LAMBDA':
        case 'LEFT':
        case 'LEVEL':
        case 'NIL':
        case 'NONE':
        case 'NOW':
        case 'PUSH':
        case 'SAPLING_EMPTY_STATE':
        case 'SELF':
        case 'SELF_ADDRESS':
        case 'SENDER':
        case 'TOTAL_VOTING_POWER':
        case 'UNIT':
            output.push(false, null);
            break;
        case 'AND':
            output.push(true, ['bool', 'bool'], ['nat', 'nat'], ['int', 'nat']);
            break;
        case 'BLAKE2B':
        case 'KECCAK':
        case 'SHA256':
        case 'SHA3':
        case 'SHA512':
            output.push(false, 'bytes');
            break;
        case 'CAR':
        case 'CDR':
        case 'JOIN_TICKETS':
            output.push(false, 'pair');
            break;
        case 'CHECK_SIGNATURE':
            output.push(false, 'key', 'signature', 'bytes');
            break;
        case 'CONCAT':
            // TODO: how to figure out that the type of list is either string or bytes?
            output.push(true, ['string', 'string'], ['bytes', 'bytes'], ['list']);
            break;
        case 'EDIV':
            output.push(true, ['nat', 'nat'], ['nat', 'int'], ['int', 'nat'],
                              ['int', 'int'], ['mutez', 'nat'], ['mutez', 'mutez']);
            break;
        case 'EXEC':
            // TODO: how to determine ty1 and lambda's type match?
            output.push(false, '', 'lambda');
            break;
        case 'FAILWITH':
            // TODO: actually FAILWITH takes any type that's packable, need to figure out
            output.push(false, 'unit');
            break;
        case 'GET':
            output.push(true, ['', 'map'], ['', 'big_map']);
            break;
        case 'GET_AND_UPDATE':
            output.push(true, ['', 'option', 'map'], ['', 'option', 'big_map']);
            break;
        case 'HASH_KEY':
            output.push(false, 'key');
            break;
        case 'IF':
        case 'LOOP':
            output.push(false, 'bool');
            break;
        case 'IF_CONS':
        case 'PAIRING_CHECK':
            output.push(false, 'list');
            break;
        case 'IF_LEFT':
        case 'LOOP_LEFT':
            output.push(false, 'or');
            break;
        case 'IF_NONE':
        case 'SET_DELEGATE':
            output.push(false, 'option');
            break;
        case 'IMPLICIT_ACCOUNT':
        case 'VOTING_POWER':
            output.push(false, 'key_hash');
            break;
        case 'INT':
            output.push(true, ['nat'], ['bls12_381_fr']);
            break;
        case 'ITER':
            output.push(true, ['list'], ['set'], ['map']);
            break;
        case 'LSL':
        case 'LSR':
            output.push(false, 'nat', 'nat');
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
        case 'NEG':
            output.push(true, ['nat'], ['int'], ['bls12_381_g1'], ['bls12_381_g2'], ['bls12_381_fr']);
            break;
        case 'NEVER':
            output.push(false, 'never');
            break;
        case 'NOT':
            output.push(true, ['bool'], ['nat'], ['int']);
            break;
        case 'OR':
        case 'XOR':
            output.push(true, ['bool', 'bool'], ['nat', 'nat']);
            break;
        case 'PACK': // TODO: how to determine ty1?
        case 'RIGHT':
        case 'SOME':
        case 'SOURCE':
            output.push(false, '');
            break;
        case 'PAIR': // TODO: how to determine ty1 & ty2? && there's a PAIR n version now that's not represented here
        case 'SWAP':
        case 'UNPAIR': // TODO: how to implement UNPAIR n version?
            output.push(false, '', '');
            break;
        case 'READ_TICKET':
            output.push(false, 'ticket');
            break;
        case 'SAPLING_VERIFY_UPDATE':
            output.push(false, 'sapling_transaction', 'sapling_state');
            break;
        case 'SIZE':
            output.push(true, ['set'], ['map'], ['list'], ['string'], ['bytes']);
            break;
        case 'SLICE':
            output.push(true, ['nat', 'nat', 'string'], ['nat', 'nat', 'bytes']);
            break;
        case 'SPLIT_TICKET':
            output.push(false, 'ticket', 'pair');
            break;
        case 'SUB':
            output.push(true, ['nat', 'nat'], ['nat', 'int'], ['int', 'nat'],
                              ['int', 'int'], ['timestamp', 'int'],
                              ['timestamp', 'timestamp'], ['mutez', 'mutez']);
            break;
        case 'TICKET':
            output.push(false, '', 'nat');
            break;
        case 'TRANSFER_TOKENS':
            output.push(false, '', 'mutez', 'contract');
            break;
        case 'UNPACK':
            output.push(false, '', 'bytes');
            break;
        case 'UPDATE':
            // TODO: how to implement UPDATE n version?
            output.push(true, ['', 'bool', 'set'], ['', 'option', 'map'],
                              ['', 'option', 'big_map']);
            break;
        default:
            throw ('unknown instruction type '.concat(instruction));
    }
    return output;
}

exports.initialize = initialize;
exports.processInstruction = processInstruction;