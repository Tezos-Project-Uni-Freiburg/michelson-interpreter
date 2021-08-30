import { Data, TypeAttribute } from "./def/data";

export class address extends Data {
    constructor(type: string, content: string) {
        super([TypeAttribute.C, TypeAttribute.PM, TypeAttribute.S, TypeAttribute.PU, TypeAttribute.PA, TypeAttribute.B, TypeAttribute.D]);
        this.content = content;
    }

    public get content(): string {
        return this._content;
    }
    public set content(value: string) {
        if (value.startsWith("tz1") || value.startsWith("tz2") || value.startsWith("tz3") || value.startsWith("KT1")) {
            this._content = value;
        } else {
            throw new Error("Address is not a valid Tezos address");
        }
    }
    public get attributes(): Array<TypeAttribute> {
        return this._attributes;
    }
}

export class big_map extends Data {
    constructor(type: string, content: string) {
        super([TypeAttribute.PM, TypeAttribute.S, TypeAttribute.D]);
        this.content = content;
    }

    public get content(): string {
        return this._content;
    }
    public set content(value: string) {
        if (value.startsWith("tz1") || value.startsWith("tz2") || value.startsWith("tz3") || value.startsWith("KT1")) {
            this._content = value;
        } else {
            throw new Error("Address is not a valid Tezos address");
        }
    }
    public get attributes(): Array<TypeAttribute> {
        return this._attributes;
    }
}