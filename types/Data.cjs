'use strict';
/* jshint esversion: 6 */
/* jshint node: true */

const { v4: uuidv4 } = require('uuid');

class Data {
    constructor(type, value, name) {
        this.type = type;
        switch (this.type) {
            case 'address':
                this.attributes = ["C", "PM", "S", "PU", "PA", "B", "D"];
                break;
            case 'big_map':
                this.attributes = ["PM", "S", "D"];
                break;
            case 'bls12_381_fr':
                this.attributes = ["PM", "S", "PU", "PA", "B", "D"];
                break;
            case 'bls12_381_g1':
                this.attributes = ["PM", "S", "PU", "PA", "B", "D"];
                break;
            case 'bls12_381_g2':
                this.attributes = ["PM", "S", "PU", "PA", "B", "D"];
                break;
            case 'bool':
                this.attributes = ["C", "PM", "S", "PU", "PA", "B", "D"];
                break;
            case 'bytes':
                this.attributes = ["C", "PM", "S", "PU", "PA", "B", "D"];
                break;
            case 'chain_id':
                this.attributes = ["C", "PM", "S", "PU", "PA", "B", "D"];
                break;
            case 'contract':
                this.attributes = ["PM", "PA", "D"];
                break;
            case 'int':
                this.attributes = ["C", "PM", "S", "PU", "PA", "B", "D"];
                break;
            case 'key':
                this.attributes = ["C", "PM", "S", "PU", "PA", "B", "D"];
                break;
            case 'key_hash':
                this.attributes = ["C", "PM", "S", "PU", "PA", "B", "D"];
                break;
            case 'lambda':
                this.attributes = ["PM", "S", "PU", "PA", "B", "D"];
                break;
            case 'list':
                this.attributes = ["PM", "S", "PU", "PA", "B", "D"];
                break;
            case 'map':
                this.attributes = ["PM", "S", "PU", "PA", "B", "D"];
                break;
            case 'mutez':
                this.attributes = ["C", "PM", "S", "PU", "PA", "B", "D"];
                break;
            case 'nat':
                this.attributes = ["C", "PM", "S", "PU", "PA", "B", "D"];
                break;
            case 'never':
                this.attributes = ["C", "PM", "S", "PU", "PA", "B", "D"];
                break;
            case 'operation':
                this.attributes = ["D"];
                break;
            case 'option':
                this.attributes = ["C", "PM", "S", "PU", "PA", "B", "D"];
                break;
            case 'or':
                this.attributes = ["C", "PM", "S", "PU", "PA", "B", "D"];
                break;
            case 'pair':
                this.attributes = ["C", "PM", "S", "PU", "PA", "B", "D"];
                break;
            case 'sapling_state':
                this.attributes = ["PM", "S", "D"];
                break;
            case 'sapling_transaction':
                this.attributes = ["PM", "S", "PU", "PA", "B", "D"];
                break;
            case 'set':
                this.attributes = ["PM", "S", "PU", "PA", "B", "D"];
                break;
            case 'signature':
                this.attributes = ["C", "PM", "S", "PU", "PA", "B", "D"];
                break;
            case 'string':
                this.attributes = ["C", "PM", "S", "PU", "PA", "B", "D"];
                break;
            case 'ticket':
                this.attributes = ["PM", "S", "B"];
                break;
            case 'timestamp':
                this.attributes = ["C", "PM", "S", "PU", "PA", "B", "D"];
                break;
            case 'unit':
                this.attributes = ["C", "PM", "S", "PU", "PA", "B", "D"];
                break;
            default:
                throw ('unknown data type '.concat(this.type));
        }
        this.value = JSON.parse(JSON.stringify(value));
        this.name = JSON.parse(JSON.stringify(name));
        this.id = uuidv4();
    }
}

exports.Data = Data;