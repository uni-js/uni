"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveAllBindings = exports.bindToContainer = void 0;
function bindToContainer(container, classes) {
    for (const cls of classes) {
        container.bind(cls).to(cls).inSingletonScope();
    }
}
exports.bindToContainer = bindToContainer;
function resolveAllBindings(container, classes) {
    for (const cls of classes) {
        container.get(cls);
    }
}
exports.resolveAllBindings = resolveAllBindings;
