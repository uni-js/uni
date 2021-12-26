import { ObjectStore, HashItem } from './object-store';
import { GameEventEmitter, InternalEvent } from '@uni.js/event';
import { IGameObject } from './game-object';
declare type ClassOf<T> = {
    new (...args: any[]): T;
};
export declare abstract class ClientSideManager extends GameEventEmitter {
    constructor();
    doUpdateTick(tick: number): void;
    doFixedUpdateTick(tick: number): void;
}
export declare class GameObjectManager<T extends IGameObject> extends ClientSideManager {
    private objectStore;
    private redirectedObjectEvents;
    constructor(objectStore: ObjectStore<T>);
    /**
     * redirect the event from the specified-type game object
     */
    protected redirectObjectEvent(eventClass: ClassOf<InternalEvent>): void;
    addGameObject(gameObject: T): void;
    removeGameObject(gameObject: T): void;
    getObjectById(objectId: number): T;
    getObjectByHash(...hashItems: HashItem[]): T;
    getAllObjects(): T[];
    doUpdateTick(tick: number): void;
    doFixedUpdateTick(tick: number): void;
}
export {};
