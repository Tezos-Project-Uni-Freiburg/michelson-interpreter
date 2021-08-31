'use strict';

// Object.defineProperty(exports, '__esModule', { value: true });

const nearley = require('nearley');
const grammar = require('./grammar');
const enumify = require('enumify');
const fs = require('fs');

const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar));
const data = fs.readFileSync('/home/berkay/Nextcloud/Proje/Michelson/old/auction.tz', 'utf8');

parser.feed(data);
const result = JSON.parse(parser.results[0])

// Auxiliary definitions
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
    constructor(type, attributes, value = null, extraParameters = null) {
        this.type = type;
        this.attributes = attributes;
        this.value = value;
        this.extraParameters = extraParameters;
    }
}

function GenerateType(type, value = null, extraParameters = null) {
    switch (type) {
        case 'address':
            return new Type(type, [TypeAttribute.C, TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D], value, extraParameters);
        case 'big_map':
            return new Type(type, [TypeAttribute.PM, TypeAttribute.S, TypeAttribute.D], value, extraParameters);
        case 'bls12_381_fr':
            return new Type(type, [TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D], value, extraParameters);
        case 'bls12_381_g1':
            return new Type(type, [TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D], value, extraParameters);
        case 'bls12_381_g2':
            return new Type(type, [TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D], value, extraParameters);
        case 'bool':
            return new Type(type, [TypeAttribute.C, TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D], value, extraParameters);
        case 'bytes':
            return new Type(type, [TypeAttribute.C, TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D], value, extraParameters);
        case 'chain_id':
            return new Type(type, [TypeAttribute.C, TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D], value, extraParameters);
        case 'contract':
            return new Type(type, [TypeAttribute.PM, TypeAttribute.PA, TypeAttribute.D], value, extraParameters);
        case 'int':
            return new Type(type, [TypeAttribute.C, TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D], value, extraParameters);
        case 'key':
            return new Type(type, [TypeAttribute.C, TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D], value, extraParameters);
        case 'key_hash':
            return new Type(type, [TypeAttribute.C, TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D], value, extraParameters);
        case 'lambda':
            return new Type(type, [TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D], value, extraParameters);
        case 'list':
            return new Type(type, [TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D], value, extraParameters);
        case 'map':
            return new Type(type, [TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D], value, extraParameters);
        case 'mutez':
            return new Type(type, [TypeAttribute.C, TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D], value, extraParameters);
        case 'nat':
            return new Type(type, [TypeAttribute.C, TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D], value, extraParameters);
        case 'never':
            return new Type(type, [TypeAttribute.C, TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D], value, extraParameters);
        case 'operation':
            return new Type(type, [TypeAttribute.D], value, extraParameters);
        case 'option':
            return new Type(type, [TypeAttribute.C, TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D], value, extraParameters);
        case 'or':
            return new Type(type, [TypeAttribute.C, TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D], value, extraParameters);
        case 'pair':
            return new Type(type, [TypeAttribute.C, TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D], value, extraParameters);
        case 'sapling_state':
            return new Type(type, [TypeAttribute.PM, TypeAttribute.S, TypeAttribute.D], value, extraParameters);
        case 'sapling_transaction':
            return new Type(type, [TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D], value, extraParameters);
        case 'set':
            return new Type(type, [TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D], value, extraParameters);
        case 'signature':
            return new Type(type, [TypeAttribute.C, TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D], value, extraParameters);
        case 'string':
            return new Type(type, [TypeAttribute.C, TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D], value, extraParameters);
        case 'ticket':
            return new Type(type, [TypeAttribute.PM, TypeAttribute.S, TypeAttribute.B], value, extraParameters);
        case 'timestamp':
            return new Type(type, [TypeAttribute.C, TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D], value, extraParameters);
        case 'unit':
            return new Type(type, [TypeAttribute.C, TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D], value, extraParameters);
        default:
            throw('unknown data type');
    }
}