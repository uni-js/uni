import * as PIXI from 'pixi.js';
import { TextureProvider } from './texture';
declare type ClassOf<T> = {
    new (...args: any[]): T;
};
export interface IGameObject extends PIXI.DisplayObject {
    getLocalId(): number;
    getServerId(): number;
    onEvent<T>(eventClass: ClassOf<T>, listener: (event: T) => void): void;
    offEvent<T>(eventClass: ClassOf<T>, listener: (event: T) => void): void;
    emitEvent<T>(eventClass: ClassOf<T>, event: T): void;
    doUpdateTick(tick: number): void;
    doFixedUpdateTick(tick: number): void;
}
export declare class GameObject extends PIXI.Container implements IGameObject {
    protected textureProvider: TextureProvider;
    protected serverId?: number;
    static objectCount: number;
    private localId;
    constructor(textureProvider: TextureProvider, serverId?: number);
    onEvent<T>(eventClass: ClassOf<T>, listener: (event: T) => void): void;
    offEvent<T>(eventClass: ClassOf<T>, listener: (event: T) => void): void;
    emitEvent<T>(eventClass: ClassOf<T>, event: T): void;
    /**
     * local id of game obejct
     *
     * @returns always return negative number
     */
    getLocalId(): number;
    /**
     * remote object id
     * the id is unique and provided by server
     */
    getServerId(): number;
    doUpdateTick(tick: number): void;
    doFixedUpdateTick(tick: number): void;
}
export {};
