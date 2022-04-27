'use strict';
/* jshint esversion: 11 */
/* jshint node: true */
// const { unstable } = require("jshint/src/options");
const assert = require('assert').strict;
const { serialize, deserialize } = require('@ungap/structured-clone');
const { Data, Delta, State, Step, CustomError } = require('./types.cjs');
const base58check = require('base58check');
const { sha256 } = require("ethereum-cryptography/sha256");
const { sha512 } = require("ethereum-cryptography/sha512");
const { blake2b } = require("ethereum-cryptography/blake2b");
const { toHex, utf8ToBytes, hexToBytes, bytesToHex, bytesToUtf8 } = require("ethereum-cryptography/utils");

function initialize(parameterType, parameter, storageType, storage) {
    const parameterResult = global["parse" + parameterType.prim.toUpperCase()].call(null, parameterType.args, parameter);
    const storageResult = global["parse" + storageType.prim.toUpperCase()].call(null, storageType.args, storage);
    return new Data('pair', [parameterResult, storageResult]);
}

// returns [null or >= 1 strings]
function getInstructionParameters(requirements, stack) {
    let flag = false;
    if (requirements[0]) {
        const reqSize = requirements[1].reduce((prev, cur) => prev.length > cur.length ? prev.length : cur.length);
        if (reqSize > stack.length) {
            throw new CustomError('not enough elements in the stack', {requirements});
        }
        const reqElems = stack.slice(-reqSize).reverse();
        for (let i = 0; i < requirements[1].length; i++) {
            if (reqElems.slice(0, requirements[1][i].length).map(x => x.prim).every((e, index) => (e === requirements[1][i][index] || !!e))) {
                flag = true;
                return reqElems.slice(0, requirements[1][i].length);
            }
        }
        if (!flag) {
            throw new CustomError('stack elements and opcode req does not match', {requirements});
        }
    } else if (requirements.length == 2 && requirements[1][0] === null) {
        return [null];
    } else {
        let reqSize = requirements[1].length;
        if (reqSize > stack.length) {
            throw new CustomError('not enough elements in the stack', {requirements});
        }
        const reqElems = stack.slice(-reqSize).reverse();
        if (requirements[1].every(e => e === "SAME")) {
            const types = new Set();
            reqElems.forEach(e => types.add(e.prim));
            if (types.size != 1) {
                throw new CustomError('top elements are not of same type', {requirements});
            }
        } else if (requirements[1].every(x => x.length > 0) && !requirements[1].every((x, i) => x == reqElems[i].prim)) {
            throw new CustomError('stack elements and opcode req does not match', {requirements});
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
        case 'LOOP':
        case 'LOOP_LEFT':
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
        case 'UNPACK':
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
        case 'CONS':
            requirements.push(false, ['', 'list']);
            break;
        case 'CONTRACT':
            requirements.push(false, ['address']);
            break;
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
            requirements.push(false, ['bool']);
            break;
        case 'IF_CONS':
            requirements.push(false, ['list']);
            break;
        case 'IF_LEFT':
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
        case 'UPDATE':
            requirements.push(true, [['', 'bool', 'set'], ['', 'option', 'map'],
                              ['', 'option', 'big_map']]);
            break;
        default:
            throw new CustomError('unknown instruction type '.concat(instruction), {});
    }
    return requirements;
}

function processInstruction(instruction, stack) {
    if (instruction.prim.includes('IF')) {
        global.steps.push(new Step(new Delta([], []), instruction, stack));
    }
    let removed = [];
    let added = [];
    const parameters = getInstructionParameters(getInstructionRequirements(instruction.prim), stack);
    if (parameters.length != 1 || parameters[0] != null) {
        removed = stack.splice(-parameters.length).reverse();
        assert.deepEqual(removed, parameters);
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
            added.push(result);
        } else {
            for (const i of result.reverse()) {
                if (i.hasOwnProperty('args') && !i.hasOwnProperty('value')) {
                    Object.defineProperty(i, "value", Object.getOwnPropertyDescriptor(i, "args"));
                    delete i.args;
                }
                stack.push(i);
                added.push(i);
            }
        }
    }
    // We need to update our state(s)?
    return new Step(new Delta(removed, added), [instruction], stack);
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
    return parameters[0].value[0];
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
    return new Data("mutez", [global.currentState.amount.toString()]);
};
global.applyBLAKE2B = (instruction, parameters, stack) => {
    return new Data("bytes", [toHex(blake2b(utf8ToBytes(parameters[0].value[0])))]);
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
        throw new CustomError("can't compare non-Comparable types", {instruction, parameters});
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
            throw new CustomError("COMPARE not implemented for non-numerical types", {instruction, parameters});
    }
};
global.applyCONCAT = (instruction, parameters, stack) => {
    var value = '';
    if (parameters[0].prim != "list") {
        value = parameters[0].value[0] + parameters[1].value[0];
        return new Data(parameters[0].prim == "string" ? "string" : "bytes", [value]);
    } else {
        for (const i of parameters[0].value[0]) {
            value += i.value[0];
        }
        return new Data(parameters[0].listType.prim == "string" ? "string" : "bytes", [value]);
    }
};
global.applyCONS = (instruction, parameters, stack) => {
    if (parameters[0].prim !== parameters[1].listType.prim) {
        throw new CustomError("list type and element type are not same", {instruction, parameters});
    } else {
        parameters[1].value[0].unshift(parameters[0]);
        return parameters[1];
    }
};
global.applyCONTRACT = (instruction, parameters, stack) => {
    // Not implemented completely
    const c = new Data("contract", [parameters[0]]);
    c.contractType = instruction.args[0];
    const output = new Data("option", [c]);
    output.optionValue = "Some";
    output.optionType = ["contract"];
    return output;
};
global.applyCREATE_CONTRACT = (instruction, parameters, stack) => {
    // Not implemented
    return [new Data('operation', []), new Data('address', [])];
};
global.applyDIG = (instruction, parameters, stack) => {
    if (instruction.args[0].int != 0) {
        if (instruction.args[0].int > stack.length - 1) {
            throw new CustomError('not enough elements in the stack', {instruction, parameters});
        }
        arrayMoveMutable(stack, stack.length - 1 - instruction.args[0].int, stack.length - 1);
    }
    return null;
};
global.applyDIP = (instruction, parameters, stack) => {
    const n = instruction.args.length > 1 ? parseInt(instruction.args[0].int) : 1;
    if (n + 1 > stack.length) {
        throw new CustomError('not enough elements in stack', {instruction, parameters});
    }
    const p = stack.splice(stack.length - n);
    processInstruction(instruction.args[0], stack);
    p.forEach(e => stack.push(e));
};
global.applyDROP = (instruction, parameters, stack) => {
    const n = instruction.hasOwnProperty('args') ? parseInt(instruction.args[0].int) : 1;
    if (n > stack.length) {
        throw new CustomError('not enough elements in stack', {instruction, parameters});
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
        throw new CustomError('not enough elements in stack', {instruction, parameters});
    }
    stack.splice(stack.length - 1 - n, 0, stack[stack.length - 1]);
    stack.pop();
    return null;
};
global.applyDUP = (instruction, parameters, stack) => {
    // Working for now but doesn't deep clone as Data
    const n = instruction.hasOwnProperty('args') ? parseInt(instruction.args[0].int) : 1;
    if (n === 0) {
        throw new CustomError("non-allowed value for " + instruction.prim + ": " + instruction.args, {instruction, parameters});
    }
    if (n > stack.length) {
        throw new CustomError("not enough elements in the stack", {instruction, parameters});
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
        throw new CustomError("kty is not comparable", {instruction, parameters});
    } else if (["operation", "big_map"].includes(instruction.args[1].prim)) {
        throw new CustomError("vty is " + instruction.args[1].prim, {instruction, parameters});
    }
    const output = new Data("big_map", [new Map()]);
    output.keyType = instruction.args[0];
    output.valueType = instruction.args[1];
    return output;
};
global.applyEMPTY_MAP = (instruction, parameters, stack) => {
    if (!new Data(instruction.args[0].prim).attributes.includes("C")) {
        throw new CustomError("kty is not comparable", {instruction, parameters});
    }
    return new Data("map", [instruction.args[0].prim, instruction.args[1].prim]);
};
global.applyEMPTY_SET = (instruction, parameters, stack) => {
    if (!new Data(instruction.args[0].prim).attributes.includes("C")) {
        throw new CustomError("kty is not comparable", {instruction, parameters});
    }
    const output = new Data("set", [new Set()]);
    output.setType = instruction.args[0];
    return output;
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
        throw new CustomError("FAILWITH got non-packable top element", {instruction, parameters});
    } else {
        throw new CustomError("got FAILWITH, top element of the stack: " + stack[stack.length - 1].value, {instruction, parameters});
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
            const step = processInstruction(i, stack);
            if (!i.prim.includes('IF')) {
                global.steps.push(step);
            }
        }
    } else {
        for (const i of instruction.args[1].flat()) {
            const step = processInstruction(i, stack);
            if (!i.prim.includes('IF')) {
                global.steps.push(step);
            }
        }
    }
    return null;
};
global.applyIF_CONS = (instruction, parameters, stack) => {
    var branch = -1;
    if (parameters[0].value[0].length > 0) {
        const d = parameters[0].value[0].shift();
        stack.push(parameters[0], d);
        branch = 0;
    } else {
        branch = 1;
    }
    for (const i of instruction.args[branch].flat()) {
        const step = processInstruction(i, stack);
        if (!i.prim.includes('IF')) {
            global.steps.push(step);
        }
    }
};
global.applyIF_LEFT = (instruction, parameters, stack) => {
    var branch = -1;
    stack.push(parameters[0].value[0]);
    if (parameters[0].orValue === 'Left') {
        branch = 0;
    } else {
        branch = 1;
    }
    for (const i of instruction.args[branch].flat()) {
        const step = processInstruction(i, stack);
        if (!i.prim.includes('IF')) {
            global.steps.push(step);
        }
    }
};
global.applyIF_NONE = (instruction, parameters, stack) => {
    var branch = -1;
    if (parameters[0].optionValue === 'None') {
        branch = 0;
    } else {
        branch = 1;
        stack.push(parameters[0].value[0]);
    }
    for (const i of instruction.args[branch].flat()) {
        const step = processInstruction(i, stack);
        if (!i.prim.includes('IF')) {
            global.steps.push(step);
        }
    }
};
global.applyIMPLICIT_ACCOUNT = (instruction, parameters, stack) => {
    const output = new Data("contract", [parameters[0]]);
    output.contractType = new Data("unit", ["Unit"]);
    return output;
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
    const output = new Data("or", [parameters[0]]);
    output.orValue = "Left";
    output.orType = [parameters[0].prim, instruction.args[0].prim];
    return output;
};
global.applyLOOP = (instruction, parameters, stack) => {
    var top = stack.pop();
    var v = false;
    if (top.prim !== 'bool') {
        throw new CustomError('top element of stack is not bool', {instruction, parameters});
    } else {
        v = JSON.parse(top.value[0].toLowerCase());
    }
    while (v) {
        for (const i of instruction.args.flat()) {
            const step = processInstruction(i, stack);
            if (!i.prim.includes('IF')) {
                global.steps.push(step);
            }
        }
        top = stack.pop();
        if (top.prim !== 'bool') {
            throw new CustomError('top element of stack is not bool', {instruction, parameters});
        } else {
            v = JSON.parse(top.value[0].toLowerCase());
        }
    }
    return null;
};
global.applyLOOP_LEFT = (instruction, parameters, stack) => {
    var top = stack.pop();
    var v = false;
    if (top.prim !== 'or') {
        throw new CustomError('top element of stack is not or', {instruction, parameters});
    } else if (top.orValue === 'Right') {
        stack.push(top);
        return null;
    } else {
        v = true;
    }
    while (v) {
        for (const i of instruction.args.flat()) {
            const step = processInstruction(i, stack);
            if (!i.prim.includes('IF')) {
                global.steps.push(step);
            }
        }
        top = stack.pop();
        v = false;
        if (top.prim !== 'or') {
            throw new CustomError('top element of stack is not or', {instruction, parameters});
        } else if (top.orValue === 'Right') {
            stack.push(top);
            return null;
        } else {
            v = true;
        }
    }
};
global.applyLSL = (instruction, parameters, stack) => {
    const f = parseInt(parameters[0].value[0]);
    const s = parseInt(parameters[1].value[0]);
    if (s > 256) {
        throw new CustomError('s is larger than 256', {instruction, parameters});
    }
    return new Data("nat", [(f << s).toString()]);
};
global.applyLSR = (instruction, parameters, stack) => {
    const f = parseInt(parameters[0].value[0]);
    const s = parseInt(parameters[1].value[0]);
    if (s > 256) {
        throw new CustomError('s is larger than 256', {instruction, parameters});
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
    const len = parameters[0].value[0].length;
    const newList = [];
    for (let i = 0; i < len; i++) {
        stack.push(parameters[0].value[0].shift());
        for (const j of instruction.args.flat()) {
            const step = processInstruction(j, stack);
            if (!j.prim.includes('IF')) {
                global.steps.push(step);
            }
        }
        newList.push(stack.pop());
    }
    parameters[0].value[0] = newList;
    return parameters[0];
};
global.applyMEM = (instruction, parameters, stack) => {
    const output = new Data("bool", []);
    if ((['big_map', 'map'].includes(parameters[1].prim) && parameters[1].keyType !== parameters[0].prim) ||
        parameters[1].setType !== parameters[0].prim) {
        throw new CustomError('key or element type does not match', {instruction, parameters});
    }
    if (parameters[1].value[0].has(parameters[0].value[0])) {
        output.value.push("True");
    } else {
        output.value.push("False");
    }
    return output;
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
        throw new CustomError('type of list is not declared', {instruction, parameters});
    }
    const output = new Data('list', [[]]);
    output.listType = instruction.args[0];
    return output;
};
global.applyNONE = (instruction, parameters, stack) => {
    if (!instruction.hasOwnProperty('args')) {
        throw new CustomError('type of option is not declared', {instruction, parameters});
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
    if (!parameters[0].attributes.includes('PA')) {
        throw new CustomError("can't PACK non-packable type", {instruction, parameters});
    }
    return new Data('bytes', [toHex(utf8ToBytes(JSON.stringify(serialize(parameters[0].value))))]);
};
global.applyPAIR = (instruction, parameters, stack) => {
    if (instruction.hasOwnProperty('args')) {
        throw new CustomError("PAIR 'n' case hasn't been implemented", {instruction, parameters});
    }
    return new Data('pair', [parameters[0], parameters[1]]);
};
global.applyPUSH = (instruction, parameters, stack) => {
    const output = new Data(instruction.args[0].prim, []);
    switch (instruction.args[0].prim) {
        case 'list':
            output.value.push([]);
            output.listType = instruction.args[0].args[0];
            for (let i = 1; i < instruction.args.length; i++) {
                const v0 = new Data(output.listType.prim, [instruction.args[i].int ||
                                                              instruction.args[i].string ||
                                                              instruction.args[i].bytes ||
                                                              instruction.args[i].prim]);
                output.value[0].push(v0);
            }
            break;
        case 'option':
            output.optionValue = instruction.args[1].prim;
            output.optionType = [instruction.args[0].args[0]];
            if (output.optionValue !== 'None') {
                const v1 = new Data(output.optionType[0].prim, [instruction.args[1].args[0].int ||
                                                            instruction.args[1].args[0].string ||
                                                            instruction.args[1].args[0].bytes ||
                                                            instruction.args[1].args[0].prim]);
                output.value.push(v1);
            }
            break;
        case 'or':
            output.orValue = instruction.args[1].prim;
            output.orType = instruction.args[0].args;
            const v2 = new Data(output.orValue === 'Left' ? output.orType[0].prim :
                                                           output.orType[1].prim, [instruction.args[1].args[0].int ||
                                                                                   instruction.args[1].args[0].string ||
                                                                                   instruction.args[1].args[0].bytes ||
                                                                                   instruction.args[1].args[0].prim]);
            output.value.push(v2);
            break;
        default:
            const value = instruction.args[1].int || instruction.args[1].string || instruction.args[1].bytes || instruction.args[1].prim;
            output.value.push(value);
            break;
    }
    return output;
};
global.applyRIGHT = (instruction, parameters, stack) => {
    const output = new Data("or", [parameters[0]]);
    output.orValue = "Right";
    output.orType = [instruction.args[0].prim, parameters[0].prim];
    return output;
};
global.applySELF = (instruction, parameters, stack) => {
    // Not implemented completely
    const output = new Data("contract", [new Data("address", [global.currentState.address])]);
    output.contractType = "Unit";
    return output;
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
    return new Data("bytes", [toHex(sha256(utf8ToBytes(parameters[0].value[0])))]);
};
global.applySHA512 = (instruction, parameters, stack) => {
    return new Data("bytes", [toHex(sha256(utf8ToBytes(parameters[0].value[0])))]);
};
global.applySIZE = (instruction, parameters, stack) => {
    if (['set', 'map'].includes(parameters[0].prim)) {
        return new Data('nat', [parameters[0].value[0].size.toString()]);
    } else {
        return new Data('nat', [parameters[0].value[0].length.toString()]);
    }
};
global.applySLICE = (instruction, parameters, stack) => {
    const offset = parseInt(parameters[0].value[0]);
    const len = parseInt(parameters[1].value[0]);
    const str = parameters[2].value[0];
    const output = new Data('option', []);
    output.optionType = [parameters[2].prim];
    if (str.length == 0 || offset >= str.length || offset + len > str.length) {
        output.optionValue = 'None';
    } else if (offset < str.length && offset + len <= str.length) {
        output.optionValue = 'Some';
        output.value.push(new Data(parameters[2].prim, [str.slice(offset, offset + len)]));
    }
    return output;
};
global.applySOME = (instruction, parameters, stack) => {
    if (!instruction.hasOwnProperty('args')) {
        throw new CustomError('type of option is not declared', {instruction, parameters});
    } else if (instruction.args[0].prim !== parameters[0].prim) {
        throw new CustomError("stack value and option type doesn't match", {instruction, parameters});
    }
    const output = new Data('option', [parameters[0]]);
    output.optionValue = 'Some';
    output.optionType = [instruction.args[0].prim];
    return output;
};
global.applySOURCE = (instruction, parameters, stack) => {
    // Not implemented completely
    const output = new Data("address", [global.currentState.address]);
    return output;
};
global.applySUB = (instruction, parameters, stack) => {
    if ([parameters[0].prim, parameters[1].prim].includes("timestamp") &&
        (/[a-z]/i.test(parameters[0].value[0]) || /[a-z]/i.test(parameters[1].value[0]))) {
        throw new CustomError('SUB not implemented for timestamps in RFC3339 notation', {instruction, parameters});
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
    // Type check is not being done here
    const v = deserialize(JSON.parse(bytesToUtf8(hexToBytes(parameters[0].value[0]))));
    const output = new Data('option', []);
    const i = new Data(instruction.args[0].prim, []);
    if (instruction.args[0].hasOwnProperty('args') && instruction.args[0].args.map(x => x.prim).every((e, index) => (e === v[index].prim))) {
        i.value = v;
    } else {
        i.value = v;
    }
    // Not implemented
    output.optionValue = 'Some';
    output.optionType = [instruction.args[0].prim];
    output.value.push(i);
    return output;
};
global.applyUPDATE = (instruction, parameters, stack) => {
    if (parameters[1].prim === "bool") {
        if (parameters[0].prim !== parameters[2].setType) {
            throw new CustomError('set type does not match', {instruction, parameters});
        }
        if (JSON.parse(parameters[1].value[0].toLowerCase())) {
            parameters[2].value[0].add(parameters[2].value);
        } else {
            parameters[2].value[0].delete(parameters[2].value);
        }
    } else {
        if (parameters[0].prim !== parameters[2].keyType) {
            throw new CustomError('key type does not match', {instruction, parameters});
        }
        if (parameters[1].optionValue === 'Some') {
            if (parameters[1].optionType[0] !== parameters[2].valueType) {
                throw new CustomError('value type does not match', {instruction, parameters});
            }
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
        throw new CustomError("input doesn't match with the specified types", {args, value});
    }
    const kv = [];
    params[1].split(';').forEach(e => kv.push(e.trim()));
    if (kv[kv.length - 1] === "") {
        kv.pop();
    }
    for (const i of kv) {
        const r = i.match(re2);
        if (r === null) {
            throw new CustomError("input doesn't match with the specified types", {args, value});
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
                    throw new CustomError('key already present in map', {args, value});
                }
                break;
            case 'string':
            case 'address':
            case 'key':
            case 'key_hash':
                r[1] = r[1].replace(/^"(.+(?="$))"$/, '$1');
                if (output.value[0].has(r[1])) {
                    throw new CustomError('key already present in map', {args, value});
                }
                break;
            default:
                throw new CustomError('not implemented', {args, value});
        }
        const v = global["parse" + output.valueType.prim.toUpperCase()].call(null, args[1].args, r[2]);
        output.value[0].set(r[1], v);
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
        throw new CustomError("can't parse", {args, value});
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
    const re1 = /\s*\{((?:.+\s*;)+(?:.+\s*)?)\s*\}\s*/;
    const output = new Data('list', [[]]);
    output.listType = args[0];

    const params = value.match(re1);
    if (params === null) {
        throw new CustomError("input doesn't match with the specified types", {args, value});
    }
    const elements = [];
    params[1].split(';').forEach(e => elements.push(e.trim()));
    if (elements[elements.length - 1] === "") {
        elements.pop();
    }
    for (const i of elements) {
        const v = global["parse" + output.listType.prim.toUpperCase()].call(null, args[0], i);
        output.value[0].push(v);
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
        throw new CustomError("input doesn't match with the specified types", {args, value});
    }
    const kv = [];
    params[1].split(';').forEach(e => kv.push(e.trim()));
    if (kv[kv.length - 1] === "") {
        kv.pop();
    }
    for (const i of kv) {
        const r = i.match(re2);
        if (r === null) {
            throw new CustomError("input doesn't match with the specified types", {args, value});
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
                    throw new CustomError('key already present in map', {args, value});
                }
                break;
            case 'string':
            case 'address':
            case 'key':
            case 'key_hash':
                r[1] = r[1].replace(/^"(.+(?="$))"$/, '$1');
                if (output.value[0].has(r[1])) {
                    throw new CustomError('key already present in map', {args, value});
                }
                break;
            default:
                throw new CustomError('not implemented', {args, value});
        }
        const v = global["parse" + output.valueType.prim.toUpperCase()].call(null, args[1].args, r[2]);
        output.value[0].set(r[1], v);
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
    const re = /\s*\(\s*(?:(?:Some)\s+(.+)|(?:None)\s*)\s*\)\s*/;
    const output = new Data('option', []);
    output.optionType = [args[0].prim];
    const params = value.match(re);
    if (params === null) {
        throw new CustomError("input doesn't match with the specified types", {args, value});
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
    const re = /\s*\(\s*(?:(Left|Right)\s+(.+))\s*\)\s*/;
    const params = value.match(re);
    const output = new Data('or', []);
    if (params === null) {
        throw new CustomError("input doesn't match with the specified types", {args, value});
    }
    output.orValue = params[1];
    output.orType = args;
    const v2 = new Data(output.orValue === 'Left' ? output.orType[0].prim : output.orType[1].prim, [params[2]]);
    output.value.push(v2);
    return output;
};
global.parsePAIR = (args, value) => {
    const re = /\s*\(\s*Pair\s+((?:\(.+\))|(?:.+?))\s+((?:\(.+\))|(?:.+?))\s*\)\s*/;
    const output = new Data('pair', []);
    const params = value.match(re);
    if (params === null) {
        throw new CustomError("input doesn't match with the specified types", {args, value});
    }
    output.value.push(global["parse" + args[0].prim.toUpperCase()].call(null, args[0].args, params[1]));
    output.value.push(global["parse" + args[1].prim.toUpperCase()].call(null, args[1].args, params[2]));
    return output;
};
global.parseSET = (args, value) => {
    const re = /\s*\{((?:.+\s*;)+(?:.+\s*)?)\s*\}\s*/;
    const output = new Data('set', [new Set()]);
    output.setType = args[0];

    const params = value.match(re);
    if (params === null) {
        throw new CustomError("input doesn't match with the specified types", {args, value});
    }
    const elements = [];
    params[1].split(';').forEach(e => elements.push(e.trim()));
    if (elements[elements.length - 1] === "") {
        elements.pop();
    }
    for (let i = 0; i < elements.length; i++) {
        switch(output.setType.prim) {
            case 'int':
            case 'mutez':
            case 'nat':
            case 'timestamp':
            case 'bytes':
            case 'signature':
            case 'bool':
                if (output.value[0].has(elements[i])) {
                    throw new CustomError('key already present in map', {args, value});
                }
                break;
            case 'string':
            case 'address':
            case 'key':
            case 'key_hash':
                elements[i] = elements[i].replace(/^"(.+(?="$))"$/, '$1');
                if (output.value[0].has(elements[i])) {
                    throw new CustomError('key already present in map', {args, value});
                }
                break;
            default:
                throw new CustomError('not implemented', {args, value});
        }
        output.value[0].add(elements[i]);
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
