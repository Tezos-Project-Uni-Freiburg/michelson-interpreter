import { Enumify } from 'enumify';

class TypeAttribute extends Enumify {
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
    // big_map Value (BA)
    static B = new TypeAttribute();
    // Duplicable (D)
    static D = new TypeAttribute();
}

export class Data {
    private _type: string;  
    private _content: string;
    private _attributes: Array<TypeAttribute>;

    constructor(type: string, content: string, attributes: TypeAttribute[]) {
        this._type = type;
        this._content = content;
        this._attributes = attributes;
    }

    public get type(): string {
        return this._type;
    }
    public set type(value: string) {
        this._type = value;
    }
    public get content(): string {
        return this._content;
    }
    public set content(value: string) {
        this._content = value;
    }
    public get attributes(): Array<TypeAttribute> {
        return this._attributes;
    }
    public set attributes(value: Array<TypeAttribute>) {
        this._attributes = value;
    }
}
