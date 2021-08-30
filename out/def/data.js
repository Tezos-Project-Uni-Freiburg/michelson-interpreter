"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Data = void 0;
const enumify_1 = require("enumify");
class TypeAttribute extends enumify_1.Enumify {
}
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
    constructor(type, content, attributes) {
        this._type = type;
        this._content = content;
        this._attributes = attributes;
    }
    get type() {
        return this._type;
    }
    set type(value) {
        this._type = value;
    }
    get content() {
        return this._content;
    }
    set content(value) {
        this._content = value;
    }
    get attributes() {
        return this._attributes;
    }
    set attributes(value) {
        this._attributes = value;
    }
}
exports.Data = Data;
