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
    constructor(type, attributes, annots = [], value = null, extraParameters = null) {
        this.type = type;
        switch (type) {
            case 'address':
                this.attributes = [TypeAttribute.C, TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D];
            case 'big_map':
                this.attributes = [TypeAttribute.PM, TypeAttribute.S, TypeAttribute.D];
            case 'bls12_381_fr':
                this.attributes = [TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D];
            case 'bls12_381_g1':
                this.attributes = [TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D];
            case 'bls12_381_g2':
                this.attributes = [TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D];
            case 'bool':
                this.attributes = [TypeAttribute.C, TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D];
            case 'bytes':
                this.attributes = [TypeAttribute.C, TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D];
            case 'chain_id':
                this.attributes = [TypeAttribute.C, TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D];
            case 'contract':
                this.attributes = [TypeAttribute.PM, TypeAttribute.PA, TypeAttribute.D];
            case 'int':
                this.attributes = [TypeAttribute.C, TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D];
            case 'key':
                this.attributes = [TypeAttribute.C, TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D];
            case 'key_hash':
                this.attributes = [TypeAttribute.C, TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D];
            case 'lambda':
                this.attributes = [TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D];
            case 'list':
                this.attributes = [TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D];
            case 'map':
                this.attributes = [TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D];
            case 'mutez':
                this.attributes = [TypeAttribute.C, TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D];
            case 'nat':
                this.attributes = [TypeAttribute.C, TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D];
            case 'never':
                this.attributes = [TypeAttribute.C, TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D];
            case 'operation':
                this.attributes = [TypeAttribute.D];
            case 'option':
                this.attributes = [TypeAttribute.C, TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D];
            case 'or':
                this.attributes = [TypeAttribute.C, TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D];
            case 'pair':
                this.attributes = [TypeAttribute.C, TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D];
            case 'sapling_state':
                this.attributes = [TypeAttribute.PM, TypeAttribute.S, TypeAttribute.D];
            case 'sapling_transaction':
                this.attributes = [TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D];
            case 'set':
                this.attributes = [TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D];
            case 'signature':
                this.attributes = [TypeAttribute.C, TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D];
            case 'string':
                this.attributes = [TypeAttribute.C, TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D];
            case 'ticket':
                this.attributes = [TypeAttribute.PM, TypeAttribute.S, TypeAttribute.B];
            case 'timestamp':
                this.attributes = [TypeAttribute.C, TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D];
            case 'unit':
                this.attributes = [TypeAttribute.C, TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D];
            default:
                throw('unknown data type');
        }
        this.annots = annots;
        this.value = value;
        this.extraParameters = extraParameters;
    }
}