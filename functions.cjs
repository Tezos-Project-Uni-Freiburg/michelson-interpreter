// import {Enumify} from "enumify";
const enumify = require("enumify");
// const enumify = require("enumify");

// Auxiliary definitions
class State {
    constructor(parameter, amount, address, storage) {
        this.parameter = parameter;
        this.amount = amount;
        this.address = address;
        this.storage = storage;
    }
}

class Attribute extends enumify.Enumify {
    // Comparable (C)
    static C = new Attribute();
    // Passable (PM)
    static PM = new Attribute();
    // Storable (S)
    static S = new Attribute();
    // Pushable (PU)
    static PU = new Attribute();
    // Packable (PA)
    static PA = new Attribute();
    // big_map value (B)
    static B = new Attribute();
    // Duplicable (D)
    static D = new Attribute();
}

function initializeData(obj) {
    switch (obj.prim) {
        case 'address':
            obj.attributes = [Attribute.C, Attribute.PM, Attribute.S, Attribute.PU, Attribute.PA, Attribute.B, Attribute.D];
            break;
        case 'big_map':
            obj.attributes = [Attribute.PM, Attribute.S, Attribute.D];
            break;
        case 'bls12_381_fr':
            obj.attributes = [Attribute.PM, Attribute.S, Attribute.PU, Attribute.PA, Attribute.B, Attribute.D];
            break;
        case 'bls12_381_g1':
            obj.attributes = [Attribute.PM, Attribute.S, Attribute.PU, Attribute.PA, Attribute.B, Attribute.D];
            break;
        case 'bls12_381_g2':
            obj.attributes = [Attribute.PM, Attribute.S, Attribute.PU, Attribute.PA, Attribute.B, Attribute.D];
            break;
        case 'bool':
            obj.attributes = [Attribute.C, Attribute.PM, Attribute.S, Attribute.PU, Attribute.PA, Attribute.B, Attribute.D];
            break;
        case 'bytes':
            obj.attributes = [Attribute.C, Attribute.PM, Attribute.S, Attribute.PU, Attribute.PA, Attribute.B, Attribute.D];
            break;
        case 'chain_id':
            obj.attributes = [Attribute.C, Attribute.PM, Attribute.S, Attribute.PU, Attribute.PA, Attribute.B, Attribute.D];
            break;
        case 'contract':
            obj.attributes = [Attribute.PM, Attribute.PA, Attribute.D];
            break;
        case 'int':
            obj.attributes = [Attribute.C, Attribute.PM, Attribute.S, Attribute.PU, Attribute.PA, Attribute.B, Attribute.D];
            break;
        case 'key':
            obj.attributes = [Attribute.C, Attribute.PM, Attribute.S, Attribute.PU, Attribute.PA, Attribute.B, Attribute.D];
            break;
        case 'key_hash':
            obj.attributes = [Attribute.C, Attribute.PM, Attribute.S, Attribute.PU, Attribute.PA, Attribute.B, Attribute.D];
            break;
        case 'lambda':
            obj.attributes = [Attribute.PM, Attribute.S, Attribute.PU, Attribute.PA, Attribute.B, Attribute.D];
            break;
        case 'list':
            obj.attributes = [Attribute.PM, Attribute.S, Attribute.PU, Attribute.PA, Attribute.B, Attribute.D];
            break;
        case 'map':
            obj.attributes = [Attribute.PM, Attribute.S, Attribute.PU, Attribute.PA, Attribute.B, Attribute.D];
            break;
        case 'mutez':
            obj.attributes = [Attribute.C, Attribute.PM, Attribute.S, Attribute.PU, Attribute.PA, Attribute.B, Attribute.D];
            break;
        case 'nat':
            obj.attributes = [Attribute.C, Attribute.PM, Attribute.S, Attribute.PU, Attribute.PA, Attribute.B, Attribute.D];
            break;
        case 'never':
            obj.attributes = [Attribute.C, Attribute.PM, Attribute.S, Attribute.PU, Attribute.PA, Attribute.B, Attribute.D];
            break;
        case 'operation':
            obj.attributes = [Attribute.D];
            break;
        case 'option':
            obj.attributes = [Attribute.C, Attribute.PM, Attribute.S, Attribute.PU, Attribute.PA, Attribute.B, Attribute.D];
            break;
        case 'or':
            obj.attributes = [Attribute.C, Attribute.PM, Attribute.S, Attribute.PU, Attribute.PA, Attribute.B, Attribute.D];
            break;
        case 'pair':
            obj.attributes = [Attribute.C, Attribute.PM, Attribute.S, Attribute.PU, Attribute.PA, Attribute.B, Attribute.D];
            break;
        case 'sapling_state':
            obj.attributes = [Attribute.PM, Attribute.S, Attribute.D];
            break;
        case 'sapling_transaction':
            obj.attributes = [Attribute.PM, Attribute.S, Attribute.PU, Attribute.PA, Attribute.B, Attribute.D];
            break;
        case 'set':
            obj.attributes = [Attribute.PM, Attribute.S, Attribute.PU, Attribute.PA, Attribute.B, Attribute.D];
            break;
        case 'signature':
            obj.attributes = [Attribute.C, Attribute.PM, Attribute.S, Attribute.PU, Attribute.PA, Attribute.B, Attribute.D];
            break;
        case 'string':
            obj.attributes = [Attribute.C, Attribute.PM, Attribute.S, Attribute.PU, Attribute.PA, Attribute.B, Attribute.D];
            break;
        case 'ticket':
            obj.attributes = [Attribute.PM, Attribute.S, Attribute.B];
            break;
        case 'timestamp':
            obj.attributes = [Attribute.C, Attribute.PM, Attribute.S, Attribute.PU, Attribute.PA, Attribute.B, Attribute.D];
            break;
        case 'unit':
            obj.attributes = [Attribute.C, Attribute.PM, Attribute.S, Attribute.PU, Attribute.PA, Attribute.B, Attribute.D];
            break;
        default:
            throw ('unknown data type '.concat(obj.prim));
    }
    return obj;
}

function initialize(parameter, storage) {
    return initializeData({prim: "pair", args: [initializeData(parameter.args[0]), initializeData(storage.args[0])]});
}

exports.initialize = initialize;