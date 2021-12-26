"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameObject = void 0;
const PIXI = __importStar(require("pixi.js"));
class GameObject extends PIXI.Container {
    constructor(textureProvider, serverId) {
        super();
        this.textureProvider = textureProvider;
        this.serverId = serverId;
        this.localId = -++GameObject.objectCount;
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
     * local id of game obejct
     *
     * @returns always return negative number
     */
    getLocalId() {
        return this.localId;
    }
    /**
     * remote object id
     * the id is unique and provided by server
     */
    getServerId() {
        return this.serverId;
    }
    doUpdateTick(tick) { }
    doFixedUpdateTick(tick) { }
}
exports.GameObject = GameObject;
GameObject.objectCount = 0;
