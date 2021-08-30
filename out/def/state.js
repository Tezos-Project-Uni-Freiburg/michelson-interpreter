"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.State = void 0;
class State {
    constructor(line, storage, address, parameter) {
        this._line = line;
        this._storage = storage;
        this._address = address;
        this._parameter = parameter;
    }
    get line() {
        return this._line;
    }
    set line(value) {
        this._line = value;
    }
    get storage() {
        return this._storage;
    }
    set storage(value) {
        this._storage = value;
    }
    get address() {
        return this._address;
    }
    set address(value) {
        this._address = value;
    }
    get parameter() {
        return this._parameter;
    }
    set parameter(value) {
        this._parameter = value;
    }
}
exports.State = State;
