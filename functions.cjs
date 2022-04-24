'use strict';
/* jshint esversion: 11 */
/* jshint node: true */
// const { unstable } = require("jshint/src/options");
const assert = require('assert').strict;
const { serialize, deserialize } = require('@ungap/structured-clone');
const { Data, Delta, State, Step } = require('./types.cjs');
const base58check = require('base58check');
const sha256 = require('js-sha256').sha256;
const sha512 = require('js-sha512').sha512;

function initialize(parameterType, parameter, storageType, storage) {
    const parameterResult = global["parse" + parameterType.prim.toUpperCase()].call(null, parameterType.args, parameter);
    const storageResult = global["parse" + storageType.prim.toUpperCase()].call(null, storageType.args, storage);
    return new Data('pair', [parameterResult, storageResult]);
}

// returns [null or >= 1 strings]
function getInstructionParameters(requirements, stack) {
    let flag = false;
    if (requirements[0]) {
        const reqSize = requirements[1].reduce((previousValue, currentValue) =>
                                       previousValue > currentValue.length ? previousValue
                                       : currentValue.length, 0);
        if (reqSize > stack.length) {
            throw ('not enough elements in the stack');
        }
        const reqElems = stack.slice(-reqSize).reverse();
        for (let i = 0; i < requirements[1].length; i++) {
            if (reqElems.slice(0, requirements[1][i].length).map(x => x.prim).every((e, index) => (e === requirements[1][i][index] || !!e))) {
                flag = true;
                return reqElems.slice(0, requirements[1][i].length);
            }
        }
        if (!flag) {
            throw ('stack elements and opcode req does not match');
        }
    } else if (requirements.length == 2 && requirements[1][0] === null) {
        return [null];
    } else {
        let reqSize = requirements[1].length;
        if (reqSize > stack.length) {
            throw ('not enough elements in the stack');
        }
        const reqElems = stack.slice(-reqSize).reverse();
        if (requirements[1].every(e => e === "SAME")) {
            const types = new Set();
            reqElems.forEach(e => types.add(e.prim));
            if (types.size != 1) {
                throw('top elements are not of same type');
            }
        } else if (requirements[1].every(x => x.length > 0) && !requirements[1].every((x, i) => x == reqElems[i].prim)) {
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
                              ['mutez', 'mutez']]);
            break;
        case 'ADDRESS':
            requirements.push(false, ['contract']);
            break;
        case 'AMOUNT':
        case 'APPLY': // TODO: how to figure out ty1, ty2 and ty3?
        case 'BALANCE':
        case 'CHAIN_ID':
        case 'CONS': // TODO: how to figure out that the ty1 and type of list is the same?
        case 'CREATE_CONTRACT': // TODO
        case 'DIG':
        case 'DIP':
        case 'DROP':
        case 'DUG':
        case 'DUP':
        case 'EMPTY_BIG_MAP':
        case 'EMPTY_MAP':
        case 'EMPTY_SET':
        case 'FAILWITH': // TODO: actually FAILWITH takes any type that's packable, need to figure out
        case 'LAMBDA':
        case 'NIL':
        case 'NONE':
        case 'NOW':
        case 'PUSH':
        case 'SELF':
        case 'SENDER':
        case 'UNIT':
            requirements.push(false, [null]);
            break;
        case 'AND':
            requirements.push(true, [['bool', 'bool'], ['nat', 'nat'], ['int', 'nat']]);
            break;
        case 'BLAKE2B':
        case 'SHA256':
        case 'SHA512':
            requirements.push(false, ['bytes']);
            break;
        case 'CAR':
        case 'CDR':
            requirements.push(false, ['pair']);
            break;
        case 'CHECK_SIGNATURE':
            requirements.push(false, ['key', 'signature', 'bytes']);
            break;
        case 'CONCAT':
            // TODO: how to figure out that the type of list is either string or bytes?
            requirements.push(true, [['string', 'string'], ['bytes', 'bytes'], ['list']]);
            break;
        case 'CONTRACT':
            requirements.push(false, ['address']);
        case 'EDIV':
            requirements.push(true, [['nat', 'nat'], ['nat', 'int'], ['int', 'nat'],
                              ['int', 'int'], ['mutez', 'nat'], ['mutez', 'mutez']]);
            break;
        case 'EXEC':
            // TODO: how to determine ty1 and lambda's type match?
            requirements.push(false, ['', 'lambda']);
            break;
        case 'GET':
            requirements.push(true, [['', 'map'], ['', 'big_map']]);
            break;
        case 'HASH_KEY':
            requirements.push(false, ['key']);
            break;
        case 'IF':
        case 'LOOP':
            requirements.push(false, ['bool']);
            break;
        case 'IF_CONS':
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
            requirements.push(false, ['key_hash']);
            break;
        case 'INT':
            requirements.push(true, [['nat']]);
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
                              ['int', 'int'], ['mutez', 'nat'], ['nat', 'mutez'],]);
            break;
        case 'NEG':
            requirements.push(true, [['nat'], ['int']]);
            break;
        case 'NOT':
            requirements.push(true, [['bool'], ['nat'], ['int']]);
            break;
        case 'OR':
        case 'XOR':
            requirements.push(true, [['bool', 'bool'], ['nat', 'nat']]);
            break;
        case 'PACK': // TODO: how to determine ty1?
        case 'LEFT':
        case 'RIGHT':
        case 'SOME':
        case 'SOURCE':
            requirements.push(false, ['']);
            break;
        case 'COMPARE':
            requirements.push(false, ['SAME', 'SAME']);
            break;
        case 'PAIR': // TODO: how to determine ty1 & ty2? && there's a PAIR n version now that's not represented here
        case 'SWAP':
            requirements.push(false, ['', '']);
            break;
        case 'SIZE':
            requirements.push(true, [['set'], ['map'], ['list'], ['string'], ['bytes']]);
            break;
        case 'SLICE':
            requirements.push(true, [['nat', 'nat', 'string'], ['nat', 'nat', 'bytes']]);
            break;
        case 'SUB':
            requirements.push(true, [['nat', 'nat'], ['nat', 'int'], ['int', 'nat'],
                              ['int', 'int'], ['timestamp', 'int'],
                              ['timestamp', 'timestamp'], ['mutez', 'mutez']]);
            break;
        case 'TRANSFER_TOKENS':
            requirements.push(false, ['', 'mutez', 'contract']);
            break;
        case 'UNPACK':
            requirements.push(false, ['', 'bytes']);
            break;
        case 'UPDATE':
            requirements.push(true, [['', 'bool', 'set'], ['', 'option', 'map'],
                              ['', 'option', 'big_map']]);
            break;
        default:
            throw ('unknown instruction type '.concat(instruction));
    }
    return requirements;
}

function processInstruction(instruction, stack) {
    const parameters = getInstructionParameters(getInstructionRequirements(instruction.prim), stack);
    if (parameters.length != 1 || parameters[0] != null) {
        assert.deepEqual(stack.splice(-parameters.length).reverse(), parameters);
    }
    // We get the required elements of the stack with this.

    // We need to do the actual operation here. But how?
    const result = global["apply" + instruction.prim].call(null, instruction, parameters, stack);

    // We need to add whatever we removed or added from the stack into a Step and add it to steps.
    if (result != null) {
        if (!Array.isArray(result)) {
            if (result.hasOwnProperty('args') && !result.hasOwnProperty('value')) {
                Object.defineProperty(result, "value", Object.getOwnPropertyDescriptor(result, "args"));
                delete result.args;
            }
            stack.push(result);
        } else {
            for (const i of result.reverse()) {
                if (i.hasOwnProperty('args') && !i.hasOwnProperty('value')) {
                    Object.defineProperty(i, "value", Object.getOwnPropertyDescriptor(i, "args"));
                    delete i.args;
                }
                stack.push(i);
            }
        }
    }

    // We need to update our state(s)?
}

// ---------------------------

// instruction functions start
global.applyABS = (instruction, parameters, stack) => {
    return new Data("nat", [Math.abs(parseInt(parameters[0].value[0])).toString()]);
};
global.applyADD = (instruction, parameters, stack) => {
    switch (parameters[0].prim) {
        case "nat":
            return new Data(parameters[1].prim == "nat" ? "nat" : "int", [
                                (parseInt(parameters[0].value[0]) + 
                                parseInt(parameters[1].value[0])).toString()
                            ]);
        case "int":
            // Case when timestamp is a string hasn't been implemented
            return new Data(parameters[1].prim == "timestamp" ? "timestamp" : "int", [
                                (parseInt(parameters[0].value[0]) + 
                                 parseInt(parameters[1].value[0])).toString()
                            ]);
        case "timestamp":
            // Case when timestamp is a string hasn't been implemented
            return new Data("timestamp", [
                                (parseInt(parameters[0].value[0]) + 
                                 parseInt(parameters[1].value[0])).toString()
                            ]);
        case "mutez":
            return new Data("mutez", [
                                (parseInt(parameters[0].value[0]) + 
                                 parseInt(parameters[1].value[0])).toString()
                            ]);
    }
};
global.applyADDRESS = (instruction, parameters, stack) => {
    // Not implemented
    return new Data("address", [
                        "some_address_value"
                    ]);
};
global.applyAMOUNT = (instruction, parameters, stack) => {
    return new Data("mutez", [global.currentState.amount.toString()]);
};
global.applyAND = (instruction, parameters, stack) => {
    switch (parameters[0].prim) {
        case "bool":
            const v = (JSON.parse(parameters[0].value[0].toLowerCase()) &&
                       JSON.parse(parameters[1].value[0].toLowerCase())).toString();
            return new Data("bool", [v[0].toUpperCase() + v.slice(1)]);
        case "nat":
        case "int":
            return new Data("nat", [(parseInt(parameters[0].value[0]) & parseInt(parameters[1].value[0])).toString()]);        
    }
};
global.applyAPPLY = (instruction, parameters, stack) => {
    // Not implemented
    return new Data("lambda", [""]);
};
global.applyBALANCE = (instruction, parameters, stack) => {
    // Not implemented, should be taken from state?
    return new Data("mutez", ["0"]);
};
global.applyBLAKE2B = (instruction, parameters, stack) => {
    // Not implemented
    return new Data("bytes", ["0x"]);
};
global.applyCAR = (instruction, parameters, stack) => {
    return parameters[0].value[0];
};
global.applyCDR = (instruction, parameters, stack) => {
    return parameters[0].value[1];
};
global.applyCHAIN_ID = (instruction, parameters, stack) => {
    // Not implemented
    return new Data("chain_id", [""]);
};
global.applyCHECK_SIGNATURE = (instruction, parameters, stack) => {
    // Not implemented
    return new Data("bool", ["False"]);
};
global.applyCOMPARE = (instruction, parameters, stack) => {
    // console.dir(instruction, { depth: null });
    // console.dir(parameters, { depth: null });
    if (!parameters[0].attributes.includes("C") || !parameters[1].attributes.includes("C")) {
        throw("can't compare non-Comparable types");
    }
    switch (parameters[0].prim) {
        case "nat":
        case "int":
        case "mutez":
        case "timestamp":
            const r = new Data("int", []);
            const z1 = parseInt(parameters[0].value[0]);
            const z2 = parseInt(parameters[1].value[0]);
            if (z1 < z2) {
                r.value.push("-1");
            } else if (z1 > z2) {
                r.value.push("1");
            } else {
                r.value.push("0");
            }
            return r;
        default:
            throw("COMPARE not implemented for non-numerical types");
    }
};
global.applyCONCAT = (instruction, parameters, stack) => {
    if (parameters[0].prim != "list") {
        return new Data(parameters[0].prim == "string" ? "string" : "bytes", [
                            parameters[0].value[0] + parameters[1].value[0]
                        ]);
    } else {
        // Not implemented
    }
};
global.applyCONS = (instruction, parameters, stack) => {
    // Not implemented for the moment
    return new Data("list", []);
};
global.applyCONTRACT = (instruction, parameters, stack) => {
    // Not implemented completely
    const output = new Data("option", [parameters[0].value[0]]);
    output.optionValue = "Some";
    output.optionType = ["contract"];
    return output;
};
global.applyCREATE_CONTRACT = (instruction, parameters, stack) => {
    // Not implemented
    return new Data("pair", []);
};
global.applyDIG = (instruction, parameters, stack) => {
    if (instruction.args[0].int != 0) {
        if (instruction.args[0].int > stack.length - 1) {
            throw('not enough elements in the stack');
        }
        arrayMoveMutable(stack, stack.length - 1 - instruction.args[0].int, stack.length - 1);
    }
    return null;
};
global.applyDIP = (instruction, parameters, stack) => {
    const n = instruction.args.length > 1 ? parseInt(instruction.args[0].int) : 1;
    if (n + 1 > stack.length) {
        throw('not enough elements in stack');
    }
    const p = stack.splice(stack.length - n);
    processInstruction(instruction.args[0], stack);
    p.forEach(e => stack.push(e));
};
global.applyDROP = (instruction, parameters, stack) => {
    const n = instruction.hasOwnProperty('args') ? parseInt(instruction.args[0].int) : 1;
    if (n > stack.length) {
        throw('not enough elements in stack');
    }
    if (n != 0) {
        stack.splice(stack.length - n);
    } 
    return null;
};
global.applyDUG = (instruction, parameters, stack) => {
    const n = parseInt(instruction.args[0].int);
    if (n == 0) {
        return null;
    }
    if (n >= stack.length) {
        throw('not enough elements in stack');
    }
    stack.splice(stack.length - 1 - n, 0, stack[stack.length - 1]);
    stack.pop();
    return null;
};
global.applyDUP = (instruction, parameters, stack) => {
    // Working for now but doesn't deep clone as Data
    const n = instruction.hasOwnProperty('args') ? parseInt(instruction.args[0].int) : 1;
    if (n === 0) {
        throw("non-allowed value for " + instruction.prim + ": " + instruction.args);
    }
    if (n > stack.length) {
        throw("not enough elements in the stack");
    }
    return deserialize(serialize(stack[stack.length - n]));
};
global.applyEDIV = (instruction, parameters, stack) => {
    const output = new Data("option", []);
    output.optionType = ['pair'];
    const z1 = parseInt(parameters[0].value[0]);
    const z2 = parseInt(parameters[1].value[0]);

    if (z2 === 0) {
        output.optionValue = 'None';
        return output;
    } else {
        output.optionValue = 'Some';
    }

    const q = Math.trunc(z1/z2);
    const r = z1 % z2;
    var t1 = "";
    var t2 = "";

    switch (parameters[0].prim) {
        case "nat":
            if (parameters[1].prim === "nat") {
                t1 = "nat";
                t2 = "nat";
            } else {
                t1 = "int";
                t2 = "nat";
            }
            break;
        case "int":
            t1 = "int";
            t2 = "nat";
            break;
        case "mutez":
            if (parameters[1].prim === "nat") {
                t1 = "mutez";
            } else {
                t1 = "nat";
            }
            t2 = "mutez";
            break;
    }
    output.optionType.push(t1);
    output.optionType.push(t2);
    output.push(new Data("pair", [new Data(t1, [q.toString()]), new Data(t2, [r.toString()])]));
    return output;
};
global.applyEMPTY_BIG_MAP = (instruction, parameters, stack) => {
    if (!new Data(instruction.args[0].prim).attributes.includes("C")) {
        throw("kty is not comparable");
    } else if (["operation", "big_map"].includes(instruction.args[1].prim)) {
        throw("vty is " + instruction.args[1].prim);
    }
    return new Data("big_map", [instruction.args[0].prim, instruction.args[1].prim]);
};
global.applyEMPTY_MAP = (instruction, parameters, stack) => {
    if (!new Data(instruction.args[0].prim).attributes.includes("C")) {
        throw("kty is not comparable");
    }
    return new Data("map", [instruction.args[0].prim, instruction.args[1].prim]);
};
global.applyEMPTY_SET = (instruction, parameters, stack) => {
    if (!new Data(instruction.args[0].prim).attributes.includes("C")) {
        throw("kty is not comparable");
    }
    return new Data("set", [instruction.args[0].prim]);
};
global.applyEQ = (instruction, parameters, stack) => {
    const result = new Data("bool", []);
    if (parseInt(parameters[0].value[0]) === 0) {
        result.value.push("True");
    } else {
        result.value.push("False");
    }
    return result;
};
global.applyEXEC = (instruction, parameters, stack) => {
    // Not implemented
    return new Data("unit", []);
};
global.applyFAILWITH = (instruction, parameters, stack) => {
    if (!stack[stack.length - 1].attributes.includes("PA")) {
        throw("FAILWITH got non-packable top element");
    } else {
        throw("got FAILWITH, top element of the stack: " + stack[stack.length - 1].value);
    }
};
global.applyGE = (instruction, parameters, stack) => {
    const result = new Data("bool", []);
    if (parseInt(parameters[0].value[0]) >= 0) {
        result.value.push("True");
    } else {
        result.value.push("False");
    }
    return result;
};
global.applyGET = (instruction, parameters, stack) => {
    const output = new Data("option", []);
    output.optionType = [parameters[1].keyType.prim];
    if (parameters[1].value[0].has(parameters[0].value[0])) {
        output.optionValue = 'Some';
        output.value.push(parameters[1].value[0].get(parameters[0].value[0]));
    } else {
        output.optionValue = 'None';
    }
    return output;
};
global.applyGT = (instruction, parameters, stack) => {
    const result = new Data("bool", []);
    if (parseInt(parameters[0].value[0]) > 0) {
        result.value.push("True");
    } else {
        result.value.push("False");
    }
    return result;
};
global.applyHASH_KEY = (instruction, parameters, stack) => {
    return new Data("key_hash", [base58check.encode(parameters[0].value[0])]);
};
global.applyIF = (instruction, parameters, stack) => {
    const v = JSON.parse(parameters[0].value[0].toLowerCase());
    if (v) {
        for (const i of instruction.args[0].flat()) {
            processInstruction(i, stack);
        }
    } else {
        for (const i of instruction.args[1].flat()) {
            processInstruction(i, stack);
        }
    }
    return null;
};
global.applyIF_CONS = (instruction, parameters, stack) => {
    // Not implemented yet
    return null;
};
global.applyIF_LEFT = (instruction, parameters, stack) => {
    // Not implemented yet
    return null;
};
global.applyIF_NONE = (instruction, parameters, stack) => {
    // Not implemented yet
    return null;
};
global.applyIMPLICIT_ACCOUNT = (instruction, parameters, stack) => {
    // Not implemented
    return new Data("contract", [new Data("unit", [])]);
};
global.applyINT = (instruction, parameters, stack) => {
    return new Data("int", [parameters[0].value[0]]);
};
global.applyISNAT = (instruction, parameters, stack) => {
    const output = new Data("option", []);
    output.optionType = ["nat"];
    const v = parseInt(parameters[0].value[0]);
    if (v < 0) {
        output.optionValue = "None";
        } else {
        output.optionValue = "Some";
        output.value.push(new Data("nat", [parameters[0].value[0]]));
    }
    return output;
};
global.applyITER = (instruction, parameters, stack) => {
    // Not implemented
    return null;
};
global.applyLAMBDA = (instruction, parameters, stack) => {
    // Not implemented
    return null;
};
global.applyLE = (instruction, parameters, stack) => {
    const result = new Data("bool", []);
    if (parseInt(parameters[0].value[0]) <= 0) {
        result.value.push("True");
    } else {
        result.value.push("False");
    }
    return result;
};
global.applyLEFT = (instruction, parameters, stack) => {
    if (instruction.args[0].prim !== parameters[0].prim) {
        throw("given type and stack elements type doesn't match");
    } else {
        return new Data("or", ["Left", parameters[0]]);
    }
};
global.applyLOOP = (instruction, parameters, stack) => {
    // Not implemented yet
    return null;
};
global.applyLOOP_LEFT = (instruction, parameters, stack) => {
    // Not implemented yet
    return null;
};
global.applyLSL = (instruction, parameters, stack) => {
    const f = parseInt(parameters[0].value[0]);
    const s = parseInt(parameters[1].value[0]);
    if (s > 256) {
        throw('s is larger than 256');
    }
    return new Data("nat", [(f << s).toString()]);
};
global.applyLSR = (instruction, parameters, stack) => {
    const f = parseInt(parameters[0].value[0]);
    const s = parseInt(parameters[1].value[0]);
    if (s > 256) {
        throw('s is larger than 256');
    }
    return new Data("nat", [(f >> s).toString()]);
};
global.applyLT = (instruction, parameters, stack) => {
    const result = new Data("bool", []);
    if (parseInt(parameters[0].value[0]) < 0) {
        result.value.push("True");
    } else {
        result.value.push("False");
    }
    return result;
};
global.applyMAP = (instruction, parameters, stack) => {
    // Not implemented yet
    return null;
};
global.applyMEM = (instruction, parameters, stack) => {
    // Not implemented yet
    return null;
};
global.applyMUL = (instruction, parameters, stack) => {
    const z1 = parseInt(parameters[0].value[0]);
    const z2 = parseInt(parameters[1].value[0]);
    var t = "";

    switch (parameters[0].prim) {
        case "nat":
            t = parameters[1].prim;
            break;
        case "int":
            t = "int";
            break;
        case "mutez":
            t = "mutez";
            break;
    }
    return new Data(t, [(z1 * z2).toString()]);
};
global.applyNEG = (instruction, parameters, stack) => {
    return new Data("int", [(-parseInt(parameters[0].value[0])).toString()]);
};
global.applyNEQ = (instruction, parameters, stack) => {
    const result = new Data("bool", []);
    if (parseInt(parameters[0].value[0]) !== 0) {
        result.value.push("True");
    } else {
        result.value.push("False");
    }
    return result;
};
global.applyNIL = (instruction, parameters, stack) => {
    if (!instruction.hasOwnProperty('args')) {
        throw('type of list is not declared');
    }
    return new Data('list', [instruction.args[0].prim]);
};
global.applyNONE = (instruction, parameters, stack) => {
    if (!instruction.hasOwnProperty('args')) {
        throw('type of option is not declared');
    }
    const output = new Data('option', [instruction.args[0].prim]);
    output.optionValue = "None";
    output.optionType = instruction.args;
    return output;
};
global.applyNOT = (instruction, parameters, stack) => {
    switch(parameters[0].prim) {
        case 'int':
        case 'nat':
            return new Data("int", [(~parseInt(parameters[0].value[0])).toString()]);
        case 'bool':
            const v = (!JSON.parse(parameters[0].value[0].toLowerCase())).toString();
            return new Data("bool", [v[0].toUpperCase() + v.slice(1)]);
    }
};
global.applyNOW = (instruction, parameters, stack) => {
    return new Data('timestamp', [Date.now().toString()]);
};
global.applyOR = (instruction, parameters, stack) => {
    if (parameters[0].prim === 'bool') {
        const v = (JSON.parse(parameters[0].value[0].toLowerCase()) ||
                   JSON.parse(parameters[1].value[0].toLowerCase())).toString();
            return new Data("bool", [v[0].toUpperCase() + v.slice(1)]);
    } else {
        return new Data('nat', [((parseInt(parameters[0].value[0])) | (parseInt(parameters[1].value[0]))).toString()]);
    }
};
global.applyPACK = (instruction, parameters, stack) => {
    // Not implemented
    return new Data('bytes', []);
};
global.applyPAIR = (instruction, parameters, stack) => {
    if (instruction.hasOwnProperty('args')) {
        throw("PAIR 'n' case hasn't been implemented");
    }
    return new Data('pair', [parameters[0], parameters[1]]);
};
global.applyPUSH = (instruction, parameters, stack) => {
    if (instruction.args[0].prim === 'option') {
        const output = new Data('option', []);
        output.optionValue = instruction.args[1].prim;
        output.optionType = [instruction.args[0].args[0].prim];
        output.value.push(instruction.args[1].args[0].int || instruction.args[1].args[0].string || instruction.args[1].args[0].bytes || instruction.args[1].args[0].prim);
        return output;
    } else {
        const value = instruction.args[1].int || instruction.args[1].string || instruction.args[1].bytes || instruction.args[1].prim;
        return new Data(instruction.args[0].prim, [value]);
    }
};
global.applyRIGHT = (instruction, parameters, stack) => {
    if (instruction.args[0].prim !== parameters[0].prim) {
        throw("given type and stack elements type doesn't match");
    } else {
        return new Data("or", ["Right", parameters[0]]);
    }
};
global.applySELF = (instruction, parameters, stack) => {
    // Not implemented
    return new Data("contract", []);
};
global.applySENDER = (instruction, parameters, stack) => {
    // Not implemented correctly/completely
    return new Data("address", [global.currentState.address]);
};
global.applySET_DELEGATE = (instruction, parameters, stack) => {
    // Not implemented
    return new Data('operation', []);
};
global.applySHA256 = (instruction, parameters, stack) => {
    return new Data("bytes", [sha256(parameters[0].value[0]).toString('hex')]);
};
global.applySHA512 = (instruction, parameters, stack) => {
    return new Data("bytes", [sha512(parameters[0].value[0]).toString('hex')]);
};
global.applySIZE = (instruction, parameters, stack) => {
    if (['list', 'set', 'map'].includes(parameters[0].prim)) {
        throw('SIZE not implemented for list, set, map');
    }
    return new Data('nat', [parameters[0].value[0].length.toString()]);
};
global.applySLICE = (instruction, parameters, stack) => {
    // Not implemented for bytes
    const offset = parseInt(parameters[0].value[0]);
    const len = parseInt(parameters[1].value[0]);
    const str = parameters[2].value[0];
    const output = new Data('option', []);
    output.optionType = ['string'];
    if (str.length == 0 || offset >= str.length || offset + len > str.length) {
        output.optionValue = 'None';
    } else if (offset < str.length && offset + len <= str.length) {
        output.optionValue = 'Some';
        output.value.push(new Data('string', [str.slice(offset, offset + len)]));
    }
    return output;
};
global.applySOME = (instruction, parameters, stack) => {
    if (!instruction.hasOwnProperty('args')) {
        throw('type of option is not declared');
    } else if (instruction.args[0].prim !== parameters[0].prim) {
        throw("stack value and option type doesn't match");
    }
    const output = new Data('option', [parameters[0]]);
    output.optionValue = 'Some';
    output.optionType = [instruction.args[0].prim];
    return output;
};
global.applySOURCE = (instruction, parameters, stack) => {
    // Not implemented
    return new Data("address", []);
};
global.applySUB = (instruction, parameters, stack) => {
    if ([parameters[0].prim, parameters[1].prim].includes("timestamp") &&
        (/[a-z]/i.test(parameters[0].value[0]) || /[a-z]/i.test(parameters[1].value[0]))) {
        throw('SUB not implemented for timestamps in RFC3339 notation');
    }

    const z1 = parseInt(parameters[0].value[0]);
    const z2 = parseInt(parameters[1].value[0]);
    var t = "";

    switch (parameters[0].prim) {
        case "nat":
        case "int":
            t = "int";
            break;
        case "timestamp":
            if (parameters[1].prim === "int") {
                t = "timestamp";
            } else {
                t = "int";
            }
            break;
        case "mutez":
            t = "mutez";
            break;
    }
    return new Data(t, [(z1 - z2).toString()]);
};
global.applySWAP = (instruction, parameters, stack) => {
    return deserialize(serialize(parameters)).reverse();
};
global.applyTRANSFER_TOKENS = (instruction, parameters, stack) => {
    // Not implemented
    return new Data("operation", []);
};
global.applyUNIT = (instruction, parameters, stack) => {
    return new Data("unit", ["Unit"]);
};
global.applyUNPACK = (instruction, parameters, stack) => {
    // Not implemented
    const output = new Data('option', []);
    output.optionValue = 'None';
    output.optionType = [instruction.args[0].prim];
    return output;
};
global.applyUPDATE = (instruction, parameters, stack) => {
    if (parameters[1].prim === "bool") {
        if (JSON.parse(parameters[1].value[0].toLowerCase())) {
            parameters[2].value[0].add(parameters[2].value);
        } else {
            parameters[2].value[0].delete(parameters[2].value);
        }
    } else {
        if (parameters[1].optionValue === 'Some') {
            parameters[2].value[0].set(parameters[0].value[0], parameters[1]);
        } else if (parameters[2].value[0].has(parameters[0].value[0])) {
            parameters[2].value[0].delete(parameters[0].value[0]);
        }
    }
    return parameters[2];
};
global.applyXOR = (instruction, parameters, stack) => {
    if (parameters[0].prim === 'bool') {
        const v = (JSON.parse(parameters[0].value[0].toLowerCase()) !=
                   JSON.parse(parameters[1].value[0].toLowerCase())).toString();
        return new Data("bool", [v[0].toUpperCase() + v.slice(1)]);
    } else {
        return new Data('nat', [(parseInt(parameters[0].value[0]) ^ parseInt(parameters[1].value[0])).toString()]);
    }
};
// instruction functions end

// parsing functions start
global.parseADDRESS = (args, value) => {
    return new Data('address', [value.replace(/^"(.+(?="$))"$/, '$1')]);
};
global.parseBIG_MAP = (args, value) => {
    const re1 = /\s*\{\s*((?:Elt\s+.+\s+.+\s*;\s*)+(?:Elt\s+.+\s+.+\s*)?)\}\s*/;
    const re2 = /Elt\s+([a-zA-Z0-9"_ ]+)\s+(.+)/;
    const output = new Data('big_map', [new Map()]);
    output.keyType = args[0];
    output.valueType = args[1];

    const params = value.match(re1);
    if (params === null) {
        throw("input doesn't match with the specified types");
    }
    const kv = [];
    params[1].split(';').forEach(e => kv.push(e.trim()));
    if (kv[kv.length - 1] === "") {
        kv.pop();
    }
    for (const i of kv) {
        const r = i.match(re2);
        if (r === null) {
            throw("input doesn't match with the specified types");
        }
        // r[1] is the key, and r[2] is the value
        switch(output.keyType.prim) {
            case 'int':
            case 'mutez':
            case 'nat':
            case 'timestamp':
            case 'bytes':
            case 'signature':
            case 'bool':
                if (output.value[0].has(r[1])) {
                    throw('key already present in map');
                }
                break;
            case 'string':
            case 'address':
            case 'key':
            case 'key_hash':
                r[1] = r[1].replace(/^"(.+(?="$))"$/, '$1');
                if (output.value[0].has(r[1])) {
                    throw('key already present in map');
                }
                break;
            default:
                throw('not implemented');
        }
        const value = global["parse" + output.valueType.prim.toUpperCase()].call(null, args[1].args, r[2]);
        output.value[0].set(r[1], value);
    }
    return output;
};
global.parseBOOL = (args, value) => {
    return new Data('bool', [value]);
};
global.parseBYTES = (args, value) => {
    const re = /0x([a-fA-F0-9]+)/;
    const r = value.match(re);
    if (r === null) {
        throw("can't parse");
    }
    return new Data('bytes', [r[1]]);
};
global.parseINT = (args, value) => {
    return new Data('int', [value]);
};
global.parseKEY = (args, value) => {
    return new Data('key', [value.replace(/^"(.+(?="$))"$/, '$1')]);
};
global.parseKEY_HASH = (args, value) => {
    return new Data('key_hash', [value.replace(/^"(.+(?="$))"$/, '$1')]);
};
global.parseLIST = (args, value) => {
    const re1 = /\s*\{\s*((?:Elt\s+.+\s*;\s*)+(?:Elt\s+.+\s*)?)\}\s*/;
    const re2 = /Elt\s+(.*)/;
    const output = new Data('list', [[]]);
    output.value.listType = args[0];

    const params = value.match(re1);
    if (params === null) {
        throw("input doesn't match with the specified types");
    }
    const elements = [];
    params[1].split(';').forEach(e => elements.push(e.trim()));
    if (elements[elements.length - 1] === "") {
        elements.pop();
    }
    for (const i of elements) {
        const r = i.match(re2);
        if (r === null) {
            throw("input doesn't match with the specified types");
        }
        if (['string', 'address', 'key', 'key_hash'].includes(output.value.listType.prim)) {
            r[1] = r[1].replace(/^"(.+(?="$))"$/, '$1');
        }
        output.value[1].push(r[1]);
    }
    return output;
};
global.parseMAP = (args, value) => {
    const re1 = /\s*\{\s*((?:Elt\s+.+\s+.+\s*;\s*)+(?:Elt\s+.+\s+.+\s*)?)\}\s*/;
    const re2 = /Elt\s+([a-zA-Z0-9"_ ]+)\s+(.+)/;
    const output = new Data('map', [new Map()]);
    output.keyType = args[0];
    output.valueType = args[1];

    const params = value.match(re1);
    if (params === null) {
        throw("input doesn't match with the specified types");
    }
    const kv = [];
    params[1].split(';').forEach(e => kv.push(e.trim()));
    if (kv[kv.length - 1] === "") {
        kv.pop();
    }
    for (const i of kv) {
        const r = i.match(re2);
        if (r === null) {
            throw("input doesn't match with the specified types");
        }
        // r[1] is the key, and r[2] is the value
        switch(output.keyType.prim) {
            case 'int':
            case 'mutez':
            case 'nat':
            case 'timestamp':
            case 'bytes':
            case 'signature':
            case 'bool':
                if (output.value[0].has(r[1])) {
                    throw('key already present in map');
                }
                break;
            case 'string':
            case 'address':
            case 'key':
            case 'key_hash':
                r[1] = r[1].replace(/^"(.+(?="$))"$/, '$1');
                if (output.value[0].has(r[1])) {
                    throw('key already present in map');
                }
                break;
            default:
                throw('not implemented');
        }
        const value = global["parse" + output.valueType.prim.toUpperCase()].call(null, args[1].args, r[2]);
        output.value[0].set(r[1], value);
    }
    return output;
};
global.parseMUTEZ = (args, value) => {
    return new Data('mutez', [value]);
};
global.parseNAT = (args, value) => {
    return new Data('nat', [value]);
};
global.parseOPTION = (args, value) => {
    // Currently no parameter type check is being done
    const re = /\s*\(\s*(?:(?:Some)\s+([^\s]+)|(?:None)\s*)\s*\)\s*/;
    const output = new Data('option', []);
    output.optionType = [args[0].prim];
    const params = value.match(re);
    if (params === null) {
        throw("input doesn't match with the specified types");
    }
    if (params[1] === undefined && params[0].includes("None")) {
        output.optionValue = 'None';
    } else {
        output.optionValue = 'Some';
        output.value.push(global["parse" + output.optionType[0].toUpperCase()].call(null, args, params[1]));
    }
    return output;
};
global.parseOR = (args, value) => {
    // Currently no parameter type check is being done
    const re = /\s*\(\s*(?:(Left|Right)\s+([^\s]+))\s*\)\s*/;
    const params = value.match(re);
    if (params === null) {
        throw("input doesn't match with the specified types");
    }
    return new Data('or', [params[1], params[2]]);
};
global.parsePAIR = (args, value) => {
    const re = /\s*\(\s*Pair\s+((?:\(.+\))|(?:.+))\s+((?:\(.+\))|(?:.+))\s*\)\s*/;
    const output = new Data('pair', []);
    const params = value.match(re);
    if (params === null) {
        throw("input doesn't match with the specified types");
    }
    output.value.push(global["parse" + args[0].prim.toUpperCase()].call(null, args[0].args, params[1]));
    output.value.push(global["parse" + args[1].prim.toUpperCase()].call(null, args[1].args, params[2]));
    return output;
};
global.parseSET = (args, value) => {
    const re = /\s*\{((?:.+\s*;)+(?:.+\s*)?)\s*\}\s*/;
    const output = new Data('set', [new Set()]);
    output.value.setType = args[0];

    const params = value.match(re);
    if (params === null) {
        throw("input doesn't match with the specified types");
    }
    const elements = [];
    params[1].split(';').forEach(e => elements.push(e.trim()));
    if (elements[elements.length - 1] === "") {
        elements.pop();
    }
    for (let i = 0; i < elements.length; i++) {
        switch(output.value.setType.prim) {
            case 'int':
            case 'mutez':
            case 'nat':
            case 'timestamp':
            case 'bytes':
            case 'signature':
            case 'bool':
                if (output.value[1].has(elements[i])) {
                    throw('key already present in map');
                }
                break;
            case 'string':
            case 'address':
            case 'key':
            case 'key_hash':
                elements[i] = elements[i].replace(/^"(.+(?="$))"$/, '$1');
                if (output.value[1].has(elements[i])) {
                    throw('key already present in map');
                }
                break;
            default:
                throw('not implemented');
        }
        output.value[1].add(elements[i]);
    }
    return output;
};
global.parseSIGNATURE = (args, value) => {
    // unfortunately no validation as of now
    return new Data('signature', [value]);
};
global.parseSTRING = (args, value) => {
    return new Data('string', [value.replace(/^"(.+(?="$))"$/, '$1')]);
};
global.parseTIMESTAMP = (args, value) => {
    const output = new Data('timestamp', []);
    if (/[a-z]/i.test(value)) {
        output.value.push((new Date(value.replace(/^"(.+(?="$))"$/, '$1'))).getTime().toString());
    } else {
        output.value.push(value.toString());
    }
    return output;
};
global.parseUNIT = (args, value) => {
    return new Data('unit', ['Unit']);
};
// parsing functions end

// boilerplate instruction function start
global.apply = (instruction, parameters, stack) => {
    console.dir(instruction, { depth: null });
    console.dir(parameters, { depth: null });
};
// boilerplate instruction function end

// boilerplate parsing function start
global.parse = (args, value) => {
    console.dir(args, { depth: null });
    console.dir(value, { depth: null });
};
// boilerplate parsing function end

// from https://github.com/sindresorhus/array-move, because somehow I couldn't import it
function arrayMoveMutable(array, fromIndex, toIndex) {
	const startIndex = fromIndex < 0 ? array.length + fromIndex : fromIndex;

	if (startIndex >= 0 && startIndex < array.length) {
		const endIndex = toIndex < 0 ? array.length + toIndex : toIndex;

		const [item] = array.splice(fromIndex, 1);
		array.splice(endIndex, 0, item);
	}
}
//
exports.initialize = initialize;
exports.processInstruction = processInstruction;
