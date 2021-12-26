"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientSideController = void 0;
const event_1 = require("@uni.js/event");
class ClientSideController extends event_1.GameEventEmitter {
    /**
     *
     * @param eventBus event bus on network
     */
    constructor(eventBus) {
        super();
        this.eventBus = eventBus;
        this.initExternalHandledEvents();
    }
    initExternalHandledEvents() {
        const bounds = (0, event_1.getHandledEventBounds)(this, event_1.EXTERNAL_EVENT_HANDLER);
        for (const bound of bounds) {
            this.eventBus.onEvent(bound.eventClass, bound.bindToMethod.bind(this));
        }
    }
    /**
     * redirect the event specified, publish the event to event bus on network.
     */
    redirectToBusEvent(from, internalEvent, externalEvent) {
        from.onEvent(internalEvent, (event) => {
            const remoteEvent = (0, event_1.convertInternalToExternalEvent)(event, internalEvent, externalEvent);
            this.eventBus.emitBusEvent(remoteEvent);
        });
    }
}
exports.ClientSideController = ClientSideController;
