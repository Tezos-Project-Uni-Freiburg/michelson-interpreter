"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Data = exports.TypeAttribute = void 0;
const enumify_1 = require("enumify");
class TypeAttribute extends enumify_1.Enumify {
}
exports.TypeAttribute = TypeAttribute;
// Comparable (C)
TypeAttribute.C = new TypeAttribute();
// Passable (PM)
TypeAttribute.PM = new TypeAttribute();
// Storable (S)
TypeAttribute.S = new TypeAttribute();
// Pushable (PU)
TypeAttribute.PU = new TypeAttribute();
// Packable (PA)
TypeAttribute.PA = new TypeAttribute();
// big_map Value (BA)
TypeAttribute.B = new TypeAttribute();
// Duplicable (D)
TypeAttribute.D = new TypeAttribute();
class Data {
    constructor(attributes) {
        this._attributes = attributes;
    }
}
exports.Data = Data;
