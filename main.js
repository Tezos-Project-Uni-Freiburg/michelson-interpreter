'use strict';
// Object.defineProperty(exports, '__esModule', { value: true });

const nearley = require('nearley');
const grammar = require('./grammar');
const enumify = require('enumify');
const fs = require('fs');

// Auxiliary definitions
class State {
    constructor(parameter, amount, address, storage) {
        this.parameter = parameter;
        this.amount = amount;
        this.address = address;
        this.storage = storage;
    }
}

class TypeAttribute extends enumify.Enumify {
    // Comparable (C)
    static C = new TypeAttribute();
    // Passable (PM)
    static PM = new TypeAttribute();
    // Storable (S)
    static S = new TypeAttribute();
    // Pushable (PU)
    static PU = new TypeAttribute();
    // Packable (PA)
    static PA = new TypeAttribute();
    // big_map value (B)
    static B = new TypeAttribute();
    // Duplicable (D)
    static D = new TypeAttribute();
}

class Type {
    constructor(prim, args = [], annots = []) {
        this.prim = prim;
        this.annots = annots;
        this.args = args;
        switch (this.prim) {
            case 'address':
                this.attributes = [TypeAttribute.C, TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D];
                break;
            case 'big_map':
                this.attributes = [TypeAttribute.PM, TypeAttribute.S, TypeAttribute.D];
                break;
            case 'bls12_381_fr':
                this.attributes = [TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D];
                break;
            case 'bls12_381_g1':
                this.attributes = [TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D];
                break;
            case 'bls12_381_g2':
                this.attributes = [TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D];
                break;
            case 'bool':
                this.attributes = [TypeAttribute.C, TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D];
                break;
            case 'bytes':
                this.attributes = [TypeAttribute.C, TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D];
                break;
            case 'chain_id':
                this.attributes = [TypeAttribute.C, TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D];
                break;
            case 'contract':
                this.attributes = [TypeAttribute.PM, TypeAttribute.PA, TypeAttribute.D];
                break;
            case 'int':
                this.attributes = [TypeAttribute.C, TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D];
                break;
            case 'key':
                this.attributes = [TypeAttribute.C, TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D];
                break;
            case 'key_hash':
                this.attributes = [TypeAttribute.C, TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D];
                break;
            case 'lambda':
                this.attributes = [TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D];
                break;
            case 'list':
                this.attributes = [TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D];
                break;
            case 'map':
                this.attributes = [TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D];
                break;
            case 'mutez':
                this.attributes = [TypeAttribute.C, TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D];
                break;
            case 'nat':
                this.attributes = [TypeAttribute.C, TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D];
                break;
            case 'never':
                this.attributes = [TypeAttribute.C, TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D];
                break;
            case 'operation':
                this.attributes = [TypeAttribute.D];
                break;
            case 'option':
                this.attributes = [TypeAttribute.C, TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D];
                break;
            case 'or':
                this.attributes = [TypeAttribute.C, TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D];
                break;
            case 'pair':
                this.attributes = [TypeAttribute.C, TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D];
                break;
            case 'sapling_state':
                this.attributes = [TypeAttribute.PM, TypeAttribute.S, TypeAttribute.D];
                break;
            case 'sapling_transaction':
                this.attributes = [TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D];
                break;
            case 'set':
                this.attributes = [TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D];
                break;
            case 'signature':
                this.attributes = [TypeAttribute.C, TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D];
                break;
            case 'string':
                this.attributes = [TypeAttribute.C, TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D];
                break;
            case 'ticket':
                this.attributes = [TypeAttribute.PM, TypeAttribute.S, TypeAttribute.B];
                break;
            case 'timestamp':
                this.attributes = [TypeAttribute.C, TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D];
                break;
            case 'unit':
                this.attributes = [TypeAttribute.C, TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D];
                break;
            default:
                throw('unknown data type '.concat(this.prim));
        }
    }
}

const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
const data = fs.readFileSync('/Users/berkay/Nextcloud/Proje/Michelson/old/auction.tz', 'utf8');

parser.feed(data);
var result = JSON.parse(parser.results[0])

// our storage
var stack = [];

// examine parameter
var parameter = result.shift().args.shift();
stack.push(new Type(parameter.prim, parameter.args));
console.log(stack);