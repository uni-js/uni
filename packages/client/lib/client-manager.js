"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameObjectManager = exports.ClientSideManager = void 0;
const event_1 = require("@uni.js/event");
class ClientSideManager extends event_1.GameEventEmitter {
    constructor() {
        super();
    }
    doUpdateTick(tick) { }
    doFixedUpdateTick(tick) { }
}
exports.ClientSideManager = ClientSideManager;
class GameObjectManager extends ClientSideManager {
    constructor(objectStore) {
        super();
        this.objectStore = objectStore;
        this.redirectedObjectEvents = [];
    }
    /**
     * redirect the event from the specified-type game object
     */
    redirectObjectEvent(eventClass) {
        this.redirectedObjectEvents.push(eventClass);
    }
    addGameObject(gameObject) {
        this.objectStore.add(gameObject);
        for (const eventClass of this.redirectedObjectEvents) {
            gameObject.onEvent(eventClass, (event) => {
                this.emitEvent(eventClass, event);
            });
        }
    }
    removeGameObject(gameObject) {
        this.objectStore.remove(gameObject);
    }
    getObjectById(objectId) {
        return this.getObjectByHash(objectId);
    }
    getObjectByHash(...hashItems) {
        return this.objectStore.get(...hashItems);
    }
    getAllObjects() {
        return this.objectStore.getAll();
    }
    doUpdateTick(tick) { }
    doFixedUpdateTick(tick) {
        const objects = this.objectStore.getAll();
        for (const object of objects) {
            object.doFixedUpdateTick(tick);
        }
    }
}
exports.GameObjectManager = GameObjectManager;
