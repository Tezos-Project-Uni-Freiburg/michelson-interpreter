"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Operation = void 0;
class Operation {
    constructor(name, func, outputs, requirements, internal_data) {
        this._name = name;
        this._func = func;
        this._outputs = outputs;
        this._requirements = requirements;
        this._internal_data = internal_data;
    }
    get name() {
        return this._name;
    }
    set name(value) {
        this._name = value;
    }
    get func() {
        return this._func;
    }
    set func(value) {
        this._func = value;
    }
    get outputs() {
        return this._outputs;
    }
    set outputs(value) {
        this._outputs = value;
    }
    get requirements() {
        return this._requirements;
    }
    set requirements(value) {
        this._requirements = value;
    }
    get internal_data() {
        return this._internal_data;
    }
    set internal_data(value) {
        this._internal_data = value;
    }
}
exports.Operation = Operation;
