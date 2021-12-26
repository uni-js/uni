"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UIStateContainer = exports.CreateUIState = exports.ObserveArrayChange = exports.UIState = void 0;
function UIState() {
    return (target) => target;
}
exports.UIState = UIState;
function ObserveArrayChange(array, onchange) {
    return new Proxy(array, {
        set() {
            onchange();
            return true;
        },
    });
}
exports.ObserveArrayChange = ObserveArrayChange;
/**
 * create a ui state
 *
 * @param definedClass the class that defines the ui state
 */
function CreateUIState(definedClass) {
    const stateObject = new definedClass();
    const metaInfo = {
        revision: 0,
        class: definedClass,
    };
    return new Proxy(stateObject, {
        get(obj, prop) {
            if (prop == 'meta') {
                return metaInfo;
            }
            if (Array.isArray(obj[prop])) {
                return ObserveArrayChange(obj[prop], () => {
                    metaInfo.revision++;
                });
            }
            return obj[prop];
        },
        set(obj, prop, value) {
            obj[prop] = value;
            metaInfo.revision++;
            return true;
        },
    });
}
exports.CreateUIState = CreateUIState;
class UIStateContainer {
    constructor(uiStateDefs) {
        this.uiStateDefs = uiStateDefs;
        this.uiStates = new Map();
        for (const def of this.uiStateDefs) {
            this.uiStates.set(def, CreateUIState(def));
        }
    }
    getEntries() {
        return Array.from(this.uiStates.entries());
    }
    getState(clazz) {
        return this.uiStates.get(clazz);
    }
}
exports.UIStateContainer = UIStateContainer;
