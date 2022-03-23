'use strict';
/* jshint esversion: 6 */
/* jshint node: true */
// const { unstable } = require("jshint/src/options");


const { Data, Delta, State, Step } = require('./types.cjs');

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

// returns [null or >= 1 strings]
function getInstructionParameters(requirements, stack) {
    if (requirements[0]) {
        const reqSize = requirements[1].reduce((previousValue, currentValue) =>
                                       previousValue > currentValue.length ? previousValue
                                       : currentValue.length, 0);
        if (reqSize > stack.length) {
            throw ('not enough elements in the stack');
        }
        const reqElems = stack.slice(0, reqSize);
        for (let i = 0; i < requirements[1].length; i++) {
            if (reqElems.slice(0, requirements[1][i].length).map(x => x.prim).every((e, index) => e === requirements[1][i][index])) {
                return reqElems.slice(0, requirements[1][i].length);
            }
        }
    } else if (requirements.length == 2 && requirements[1][0] === null) {
        return [null];
    } else {
        let reqSize = requirements[1].length;
        if (reqSize > stack.length) {
            throw ('not enough elements in the stack');
        }
        const reqElems = stack.slice(0, reqSize);
        if (!requirements[1].every((x, i) => x == reqElems[i].prim)) {
            throw ('stack elements and opcode req does not match');
        }
        return reqElems;
    }
}

// returns [true/false, [>= 1 strings]... if true else >= 1 strings]
function getInstructionRequirements(instruction) {
    const requirements = [];
    switch(instruction) {
        case 'ABS':
        case 'EQ':
        case 'GE':
        case 'GT':
        case 'ISNAT':
        case 'LE':
        case 'LT':
        case 'NEQ':
            requirements.push(false, ['int']);
            break;
        case 'ADD':
            requirements.push(true, [['nat', 'nat'], ['nat', 'int'], ['int', 'nat'],
                              ['int', 'int'], ['timestamp', 'int'], ['int', 'timestamp'],
                              ['mutez', 'mutez'], ['bls12_381_g1', 'bls12_381_g1'],
                              ['bls12_381_g2', 'bls12_381_g2'], ['bls12_381_fr', 'bls12_381_fr']]);
            break;
        case 'ADDRESS':
            requirements.push(false, ['contract']);
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
            requirements.push(false, [null]);
            break;
        case 'AND':
            requirements.push(true, [['bool', 'bool'], ['nat', 'nat'], ['int', 'nat']]);
            break;
        case 'BLAKE2B':
        case 'KECCAK':
        case 'SHA256':
        case 'SHA3':
        case 'SHA512':
            requirements.push(false, ['bytes']);
            break;
        case 'CAR':
        case 'CDR':
        case 'JOIN_TICKETS':
            requirements.push(false, ['pair']);
            break;
        case 'CHECK_SIGNATURE':
            requirements.push(false, ['key', 'signature', 'bytes']);
            break;
        case 'CONCAT':
            // TODO: how to figure out that the type of list is either string or bytes?
            requirements.push(true, [['string', 'string'], ['bytes', 'bytes'], ['list']]);
            break;
        case 'EDIV':
            requirements.push(true, [['nat', 'nat'], ['nat', 'int'], ['int', 'nat'],
                              ['int', 'int'], ['mutez', 'nat'], ['mutez', 'mutez']]);
            break;
        case 'EXEC':
            // TODO: how to determine ty1 and lambda's type match?
            requirements.push(false, ['', 'lambda']);
            break;
        case 'FAILWITH':
            // TODO: actually FAILWITH takes any type that's packable, need to figure out
            requirements.push(false, ['unit']);
            break;
        case 'GET':
            requirements.push(true, [['', 'map'], ['', 'big_map']]);
            break;
        case 'GET_AND_UPDATE':
            requirements.push(true, [['', 'option', 'map'], ['', 'option', 'big_map']]);
            break;
        case 'HASH_KEY':
            requirements.push(false, ['key']);
            break;
        case 'IF':
        case 'LOOP':
            requirements.push(false, ['bool']);
            break;
        case 'IF_CONS':
        case 'PAIRING_CHECK':
            requirements.push(false, ['list']);
            break;
        case 'IF_LEFT':
        case 'LOOP_LEFT':
            requirements.push(false, ['or']);
            break;
        case 'IF_NONE':
        case 'SET_DELEGATE':
            requirements.push(false, ['option']);
            break;
        case 'IMPLICIT_ACCOUNT':
        case 'VOTING_POWER':
            requirements.push(false, ['key_hash']);
            break;
        case 'INT':
            requirements.push(true, [['nat'], ['bls12_381_fr']]);
            break;
        case 'ITER':
            requirements.push(true, [['list'], ['set'], ['map']]);
            break;
        case 'LSL':
        case 'LSR':
            requirements.push(false, ['nat', 'nat']);
            break;
        case 'MAP':
            requirements.push(true, [['list'], ['map']]);
            break;
        case 'MEM':
            requirements.push(true, [['', 'set'], ['', 'map'], ['', 'big_map']]);
            break;
        case 'MUL':
            requirements.push(true, [['nat', 'nat'], ['nat', 'int'], ['int', 'nat'],
                              ['int', 'int'], ['mutez', 'nat'], ['nat', 'mutez'],
                              ['bls12_381_g1', 'bls12_381_fr'], ['bls12_381_g2', 'bls12_381_fr'],
                              ['bls12_381_fr', 'bls12_381_fr'], ['nat', 'bls12_381_fr'],
                              ['int', 'bls12_381_fr'], ['bls12_381_fr', 'nat'], ['bls12_381_fr', 'int']]);
            break;
        case 'NEG':
            requirements.push(true, [['nat'], ['int'], ['bls12_381_g1'], ['bls12_381_g2'], ['bls12_381_fr']]);
            break;
        case 'NEVER':
            requirements.push(false, ['never']);
            break;
        case 'NOT':
            requirements.push(true, [['bool'], ['nat'], ['int']]);
            break;
        case 'OR':
        case 'XOR':
            requirements.push(true, [['bool', 'bool'], ['nat', 'nat']]);
            break;
        case 'PACK': // TODO: how to determine ty1?
        case 'RIGHT':
        case 'SOME':
        case 'SOURCE':
            requirements.push(false, ['']);
            break;
        case 'PAIR': // TODO: how to determine ty1 & ty2? && there's a PAIR n version now that's not represented here
        case 'SWAP':
        case 'UNPAIR': // TODO: how to implement UNPAIR n version?
            requirements.push(false, ['', '']);
            break;
        case 'READ_TICKET':
            requirements.push(false, ['ticket']);
            break;
        case 'SAPLING_VERIFY_UPDATE':
            requirements.push(false, ['sapling_transaction', 'sapling_state']);
            break;
        case 'SIZE':
            requirements.push(true, [['set'], ['map'], ['list'], ['string'], ['bytes']]);
            break;
        case 'SLICE':
            requirements.push(true, [['nat', 'nat', 'string'], ['nat', 'nat', 'bytes']]);
            break;
        case 'SPLIT_TICKET':
            requirements.push(false, ['ticket', 'pair']);
            break;
        case 'SUB':
            requirements.push(true, [['nat', 'nat'], ['nat', 'int'], ['int', 'nat'],
                              ['int', 'int'], ['timestamp', 'int'],
                              ['timestamp', 'timestamp'], ['mutez', 'mutez']]);
            break;
        case 'TICKET':
            requirements.push(false, ['', 'nat']);
            break;
        case 'TRANSFER_TOKENS':
            requirements.push(false, ['', 'mutez', 'contract']);
            break;
        case 'UNPACK':
            requirements.push(false, ['', 'bytes']);
            break;
        case 'UPDATE':
            // TODO: how to implement UPDATE n version?
            requirements.push(true, [['', 'bool', 'set'], ['', 'option', 'map'],
                              ['', 'option', 'big_map']]);
            break;
        default:
            throw ('unknown instruction type '.concat(instruction));
    }
    return requirements;
}

function processInstruction(instruction, stack, steps, states) {
    const parameters = getInstructionParameters(getInstructionRequirements(instruction.prim), stack);
    // We get the required elements of the stack with this.

    // We need to do the actual operation here. But how?
    const result = global["apply" + instruction.prim].call(null, parameters, stack);

    // We need to add whatever we removed or added from the stack into a Step and add it to steps.

    // We need to update our state(s)?
}



// instruction functions start
function applyABS(parameter, stack) {

}
// instruction functions end

exports.initialize = initialize;
exports.processInstruction = processInstruction;