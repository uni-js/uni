import { ExternalEvent, GameEventEmitter } from '@uni.js/event';
export declare class EventBusClient extends GameEventEmitter {
    private socket;
    constructor(socket: any);
    emitBusEvent(event: ExternalEvent): void;
}
