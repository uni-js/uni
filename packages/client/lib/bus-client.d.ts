import { ExternalEvent, GameEventEmitter } from '@uni.js/event';
export declare class EventBusClient extends GameEventEmitter {
    private client;
    constructor(url: string);
    emitBusEvent(event: ExternalEvent): void;
}
