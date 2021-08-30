import { Enumify } from 'enumify';

export class TypeAttribute extends Enumify {
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
    protected _content;
    protected _parameters: Array<Data>;
    protected _attributes: Array<TypeAttribute>;

    constructor(attributes: Array<TypeAttribute>) {
        this._attributes = attributes;
    }
}