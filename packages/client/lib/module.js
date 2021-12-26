"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClientSideModule = exports.resolveClientSideModule = void 0;
function resolveClientSideModule(module) {
    const controllers = [...module.controllers];
    const managers = [...module.managers];
    const providers = [...module.providers];
    const uiStates = [...module.uiStates];
    for (const subModule of module.imports) {
        const resolved = resolveClientSideModule(subModule);
        controllers.push(...resolved.controllers);
        managers.push(...resolved.managers);
        providers.push(...resolved.providers);
        uiStates.push(...resolved.uiStates);
    }
    return { controllers, managers, providers, uiStates };
}
exports.resolveClientSideModule = resolveClientSideModule;
function createClientSideModule(option) {
    return {
        imports: option.imports || [],
        controllers: option.controllers || [],
        managers: option.managers || [],
        providers: option.providers || [],
        uiStates: option.uiStates || [],
    };
}
exports.createClientSideModule = createClientSideModule;
