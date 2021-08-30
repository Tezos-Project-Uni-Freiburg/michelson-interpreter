"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Address = void 0;
const data_1 = require("./def/data");
class Address extends data_1.Data {
    constructor(type, content) {
        super([data_1.TypeAttribute.C, data_1.TypeAttribute.PM, data_1.TypeAttribute.S, data_1.TypeAttribute.PU, data_1.TypeAttribute.PA, data_1.TypeAttribute.B, data_1.TypeAttribute.D]);
        this.content = content;
    }
    get content() {
        return this._content;
    }
    set content(value) {
        if (value.startsWith("tz1") || value.startsWith("tz2") || value.startsWith("tz3") || value.startsWith("KT1")) {
            this._content = value;
        }
        else {
            throw new Error("Address is not a valid Tezos address");
        }
    }
    get attributes() {
        return this._attributes;
    }
}
exports.Address = Address;
