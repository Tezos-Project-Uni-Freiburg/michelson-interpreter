import { Data } from "./data";

export class State {
    private _line: number;
    private _storage: Array<Data>;
    private _address: Data;
    private _parameter: Array<Data>;
    
    constructor(line, storage, address, parameter) {
        this._line = line;
        this._storage = storage;
        this._address = address;
        this._parameter = parameter;
    }

    public get line(): number {
        return this._line;
    }
    public set line(value: number) {
        this._line = value;
    }
    public get storage(): Array<Data> {
        return this._storage;
    }
    public set storage(value: Array<Data>) {
        this._storage = value;
    }
    public get address(): Data {
        return this._address;
    }
    public set address(value: Data) {
        this._address = value;
    }
    public get parameter(): Array<Data> {
        return this._parameter;
    }
    public set parameter(value: Array<Data>) {
        this._parameter = value;
    }
}
