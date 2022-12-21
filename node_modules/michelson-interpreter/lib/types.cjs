'use strict';

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
                this.attributes = ["PM", "S", "D"];
                break;
            case 'lambda':
            case 'list':
            case 'map':
            case 'set':
                this.attributes = ["PM", "S", "PU", "PA", "B", "D"];
                break;
            case 'contract':
                this.attributes = ["PM", "PA", "D"];
                break;
            case 'operation':
                this.attributes = ["D"];
                break;
            default:
                throw new CustomError('unknown data type '.concat(this.prim), [prim, value, name]);
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
    constructor(account, address, amount, entrypoint, gas_limit, id, timestamp) {
        this.account = account;
        this.address = address;
        this.amount = amount;
        this.entrypoint = entrypoint;
        this.gas_limit = gas_limit;
        this.id = id;
        this.timestamp = timestamp;
    }
}

class Step {
    constructor(delta, instruction, stack) {
        this.delta = JSON.parse(JSON.stringify(delta));
        this.instruction = JSON.parse(JSON.stringify(instruction));
        this.stack = JSON.parse(JSON.stringify(stack));
    }
}

class CustomError extends Error {
    constructor(message, errorExtraParams) {
        super(message);
        this._errorExtraParams = errorExtraParams;
    }
    get errorExtraParams() {
        return this._errorExtraParams;
    }
}

exports.Step = Step;
exports.Data = Data;
exports.State = State;
exports.Delta = Delta;
exports.CustomError = CustomError;
