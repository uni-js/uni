"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveEntityEvent = exports.AddEntityEvent = exports.GameEventEmitter = exports.convertInternalToExternalEvent = exports.copyOwnPropertiesTo = exports.getHandledEventBounds = exports.HandleInternalEvent = exports.HandleExternalEvent = exports.IS_GAME_EVENT_EMITTER = exports.INTERNAL_EVENT_HANDLER = exports.EXTERNAL_EVENT_HANDLER = exports.ExternalEvent = exports.InternalEvent = void 0;
require("reflect-metadata");
const eventemitter2_1 = require("eventemitter2");
class InternalEvent {
}
exports.InternalEvent = InternalEvent;
class ExternalEvent extends InternalEvent {
}
exports.ExternalEvent = ExternalEvent;
exports.EXTERNAL_EVENT_HANDLER = Symbol();
exports.INTERNAL_EVENT_HANDLER = Symbol();
exports.IS_GAME_EVENT_EMITTER = Symbol();
/**
 * decorate a controller, to add a specified listener of an event and bind it to the method automatically.
 *
 * @param eventClass the event class specified
 */
function HandleExternalEvent(eventClass) {
    return Reflect.metadata(exports.EXTERNAL_EVENT_HANDLER, { eventClass });
}
exports.HandleExternalEvent = HandleExternalEvent;
function HandleInternalEvent(emitterPropertyName, eventClass) {
    return Reflect.metadata(exports.INTERNAL_EVENT_HANDLER, { emitterPropertyName, eventClass });
}
exports.HandleInternalEvent = HandleInternalEvent;
function getHandledEventBounds(object, sign) {
    const methods = getAllMethodsOfObject(object);
    const bounds = [];
    for (const method of methods) {
        const metadata = Reflect.getMetadata(sign, object, method);
        if (metadata !== undefined)
            bounds.push({ bindToMethod: object[method], eventClass: metadata.eventClass, ...metadata });
    }
    return bounds;
}
exports.getHandledEventBounds = getHandledEventBounds;
function copyOwnPropertiesTo(from, target) {
    const names = Object.getOwnPropertyNames(from);
    for (const property of names) {
        target[property] = from[property];
    }
}
exports.copyOwnPropertiesTo = copyOwnPropertiesTo;
function convertInternalToExternalEvent(internalEvent, internaleventClass, externaleventClass) {
    const exEvent = new externaleventClass();
    copyOwnPropertiesTo(internalEvent, exEvent);
    return exEvent;
}
exports.convertInternalToExternalEvent = convertInternalToExternalEvent;
class GameEventEmitter extends eventemitter2_1.EventEmitter2 {
    constructor() {
        super();
        this[_a] = true;
        nextTick(() => this.initInternalHandledEvents());
    }
    initInternalHandledEvents() {
        const bounds = getHandledEventBounds(this, exports.INTERNAL_EVENT_HANDLER);
        for (const bound of bounds) {
            const emitterName = bound.emitterPropertyName;
            const emitter = this[emitterName];
            if (emitter[exports.IS_GAME_EVENT_EMITTER] !== true)
                throw new Error(`the target emitter is not GameEventEmitter when binding ${bound.eventClass.name}`);
            emitter.onEvent(bound.eventClass, bound.bindToMethod.bind(this));
        }
    }
    onEvent(eventClass, listener) {
        this.on(eventClass.name, listener);
    }
    offEvent(eventClass, listener) {
        this.off(eventClass.name, listener);
    }
    emitEvent(eventClass, event) {
        this.emit(eventClass.name, event);
    }
    /**
     * redirect the specified event,
     * emit out once received a event
     */
    redirectEvent(from, eventClass) {
        from.onEvent(eventClass, (event) => {
            this.emitEvent(eventClass, event);
        });
    }
}
exports.GameEventEmitter = GameEventEmitter;
_a = exports.IS_GAME_EVENT_EMITTER;
class AddEntityEvent extends InternalEvent {
}
exports.AddEntityEvent = AddEntityEvent;
class RemoveEntityEvent extends InternalEvent {
}
exports.RemoveEntityEvent = RemoveEntityEvent;
function getAllMethodsOfObject(object) {
    const prototype = Object.getPrototypeOf(object);
    return Object.getOwnPropertyNames(prototype).filter(function (property) {
        return typeof object[property] == 'function';
    });
}
function nextTick(fn) {
    setTimeout(fn, 0);
}
