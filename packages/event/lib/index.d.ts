import "reflect-metadata";
import { EventEmitter2 } from 'eventemitter2';
declare type ClassOf<T> = {
    new (...args: any[]): T;
};
export declare class InternalEvent {
}
export declare class ExternalEvent extends InternalEvent {
}
export interface EventBound {
    bindToMethod: (...args: any[]) => void;
    eventClass: ClassOf<any>;
    [key: string]: any;
}
export declare const EXTERNAL_EVENT_HANDLER: unique symbol;
export declare const INTERNAL_EVENT_HANDLER: unique symbol;
export declare const IS_GAME_EVENT_EMITTER: unique symbol;
/**
 * decorate a controller, to add a specified listener of an event and bind it to the method automatically.
 *
 * @param eventClass the event class specified
 */
export declare function HandleExternalEvent<T extends ExternalEvent>(eventClass: ClassOf<T>): {
    (target: Function): void;
    (target: Object, propertyKey: string | symbol): void;
};
export declare function HandleInternalEvent<T extends InternalEvent>(emitterPropertyName: string, eventClass: ClassOf<T>): {
    (target: Function): void;
    (target: Object, propertyKey: string | symbol): void;
};
export declare function getHandledEventBounds(object: any, sign: symbol): EventBound[];
export declare function copyOwnPropertiesTo(from: any, target: any): void;
export declare function convertInternalToExternalEvent<I extends InternalEvent, E extends ExternalEvent>(internalEvent: I, internaleventClass: ClassOf<I>, externaleventClass: ClassOf<E>): E;
export declare class GameEventEmitter extends EventEmitter2 {
    [IS_GAME_EVENT_EMITTER]: boolean;
    constructor();
    private initInternalHandledEvents;
    onEvent<T extends InternalEvent>(eventClass: ClassOf<T>, listener: (event: T) => void): void;
    offEvent<T extends InternalEvent>(eventClass: ClassOf<T>, listener: (event: T) => void): void;
    emitEvent<T extends InternalEvent>(eventClass: ClassOf<T>, event: T): void;
    /**
     * redirect the specified event,
     * emit out once received a event
     */
    redirectEvent<T extends InternalEvent>(from: GameEventEmitter, eventClass: ClassOf<T>): void;
}
export declare class AddEntityEvent extends InternalEvent {
    entityId: number;
    entity: unknown;
}
export declare class RemoveEntityEvent extends InternalEvent {
    entityId: number;
    entity: unknown;
}
export {};
