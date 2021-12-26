import * as PIXI from 'pixi.js';
export declare class SetStore extends Set {
}
export declare class MapStore<V> extends Map<string, V> {
}
export declare const HASH_SPLIT_CHAR = "#";
export declare type HashItem = string | number;
export declare type Hasher<T> = (item: T) => HashItem[] | HashItem[][];
export declare class ObjectStore<T extends PIXI.DisplayObject> {
    private initHasher?;
    readonly container: PIXI.Container;
    private store;
    constructor(initHasher?: Hasher<T>);
    add(item: T): void;
    remove(item: T): void;
    get(...hashItems: HashItem[]): T;
    getAll(): T[];
    private hasHashes;
    private getHashStrings;
    private getSingleHashString;
    protected getObjectTypeName(): string;
    protected hash(item: T): HashItem[] | HashItem[][];
}
