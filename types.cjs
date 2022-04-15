'use strict';
/* jshint esversion: 11 */
/* jshint node: true */

// const { v4: uuidv4 } = require('uuid');

class Data {
    constructor(prim, value, name = "") {
        this.prim = prim;
        switch (this.prim) {
            case 'address':
            case 'bool':
            case 'bytes':
            case 'chain_id':
            case 'int':
            case 'key':
            case 'key_hash':
            case 'mutez':
            case 'nat':
            case 'never':
            case 'option':
            case 'or':
            case 'pair':
            case 'signature':
            case 'string':
            case 'timestamp':
            case 'unit':
                this.attributes = ["C", "PM", "S", "PU", "PA", "B", "D"];
                break;
            case 'big_map':
            case 'sapling_state':
                this.attributes = ["PM", "S", "D"];
                break;
            case 'bls12_381_fr':
            case 'bls12_381_g1':
            case 'bls12_381_g2':
            case 'lambda':
            case 'list':
            case 'map':
            case 'sapling_transaction':
            case 'set':
                this.attributes = ["PM", "S", "PU", "PA", "B", "D"];
                break;
            case 'contract':
                this.attributes = ["PM", "PA", "D"];
                break;
            case 'operation':
                this.attributes = ["D"];
                break;
            case 'ticket':
                this.attributes = ["PM", "S", "B"];
                break;
            default:
                throw ('unknown data type '.concat(this.prim));
        }
        // this.value = JSON.parse(JSON.stringify(value));
        this.value = value;
        if (this.value.length == 1 && this.value[0] == undefined) {
            this.value[0] = '';
        }
        this.name = name;
        // this.id = uuidv4();
    }
}

class Delta {
    constructor(removed, added) {
        this.removed = JSON.parse(JSON.stringify(removed));
        this.added = JSON.parse(JSON.stringify(added));
    }
}

class State {
    constructor(gas_limit, amount, id, account, entrypoint, timestamp, address) {
        this.gas_limit = gas_limit;
        this.amount = amount;
        this.id = id;
        this.account = account;
        this.entrypoint = entrypoint;
        this.timestamp = timestamp;
        this.address = address;
    }
}

class Step {
    constructor(delta, instruction) {
        this.delta = JSON.parse(JSON.stringify(delta));
        this.instruction = JSON.parse(JSON.stringify(instruction));
    }
}

exports.Step = Step;
exports.Data = Data;
exports.State = State;
exports.Delta = Delta;
