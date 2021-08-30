import { Data } from "./data";

export class Operation {
    private _name: string;
    private _func: Object;
    private _outputs: Object;
    private _requirements: Object;
    private _internal_data: Array<Data>;

    constructor(name: string, func: Object, outputs: any, requirements: Object, internal_data: Data[]) {
        this._name = name;
        this._func = func;
        this._outputs = outputs;
        this._requirements = requirements;
        this._internal_data = internal_data;
    }

    public get name(): string {
        return this._name;
    }
    public set name(value: string) {
        this._name = value;
    }
    public get func(): Object {
        return this._func;
    }
    public set func(value: Object) {
        this._func = value;
    }
    public get outputs(): Object {
        return this._outputs;
    }
    public set outputs(value: Object) {
        this._outputs = value;
    }
    public get requirements(): Object {
        return this._requirements;
    }
    public set requirements(value: Object) {
        this._requirements = value;
    }
    public get internal_data(): Array<Data> {
        return this._internal_data;
    }
    public set internal_data(value: Array<Data>) {
        this._internal_data = value;
    }
}
