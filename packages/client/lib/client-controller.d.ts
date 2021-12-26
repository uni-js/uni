import { EventBusClient } from './bus-client';
import { ExternalEvent, GameEventEmitter, InternalEvent } from '@uni.js/event';
declare type ClassOf<T> = {
    new (...args: any[]): T;
};
export declare class ClientSideController extends GameEventEmitter {
    protected eventBus: EventBusClient;
    /**
     *
     * @param eventBus event bus on network
     */
    constructor(eventBus: EventBusClient);
    private initExternalHandledEvents;
    /**
     * redirect the event specified, publish the event to event bus on network.
     */
    protected redirectToBusEvent<I extends InternalEvent, E extends ExternalEvent & InternalEvent>(from: GameEventEmitter, internalEvent: ClassOf<I>, externalEvent: ClassOf<E>): void;
}
export {};
