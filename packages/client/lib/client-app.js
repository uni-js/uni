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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientApp = exports.wait = void 0;
require("reflect-metadata");
const PIXI = __importStar(require("pixi.js"));
const react_1 = __importDefault(require("react"));
const react_dom_1 = __importDefault(require("react-dom"));
const texture_1 = require("./texture");
const bus_client_1 = require("./bus-client");
const inversify_1 = require("inversify");
const inversify_2 = require("./inversify");
const hooks_1 = require("./user-interface/hooks");
const state_1 = require("./user-interface/state");
const module_1 = require("./module");
const utils_1 = require("@uni.js/utils");
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
PIXI.settings.SORTABLE_CHILDREN = true;
function wait(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}
exports.wait = wait;
class ClientApp {
    constructor(option) {
        this.option = option;
        this.updateTick = 0;
        this.fixedTick = 0;
        this.managers = [];
        this.controllers = [];
        this.textureProvider = new texture_1.TextureProvider();
        this.moduleResolved = (0, module_1.resolveClientSideModule)(option.module);
        this.app = new PIXI.Application({
            width: option.width,
            height: option.height,
            resolution: option.resolution,
        });
        this.playground = option.playground;
        this.iocContainer = new inversify_1.Container({ skipBaseClassChecks: true });
        this.uiStatesContainer = new state_1.UIStateContainer(this.moduleResolved.uiStates);
        this.managers = this.moduleResolved.managers;
        this.controllers = this.moduleResolved.controllers;
        this.busClient = new bus_client_1.EventBusClient(this.option.serverUrl);
        this.uiEventBus = new hooks_1.UIEventBus();
        this.initProviderBindings();
        this.initWrapper();
        this.initUiContainer();
    }
    getCanvasElement() {
        return this.app.view;
    }
    getCanvasContainer() {
        return this.canvasContainer;
    }
    get(identifier) {
        return this.iocContainer.get(identifier);
    }
    getCanvas() {
        return this.app.view;
    }
    addTicker(fn) {
        this.app.ticker.add(fn);
    }
    addDisplayObject(displayObject) {
        this.app.stage.addChild(displayObject);
    }
    removeDisplayObject(displayObject) {
        this.app.stage.removeChild(displayObject);
    }
    removeTicker(fn) {
        this.app.ticker.remove(fn);
    }
    async start() {
        await this.initTextures();
        this.initUIBindings();
        this.initBaseBindings();
        (0, inversify_2.resolveAllBindings)(this.iocContainer, this.managers);
        (0, inversify_2.resolveAllBindings)(this.iocContainer, this.controllers);
        this.app.start();
        this.renderUI();
        this.startLoop();
    }
    initWrapper() {
        const wrapper = document.createElement('div');
        wrapper.classList.add('uni-wrapper');
        wrapper.style.width = `${this.app.view.width}px`;
        wrapper.style.height = `${this.app.view.height}px`;
        wrapper.style.position = 'relative';
        this.playground.appendChild(wrapper);
        this.wrapper = wrapper;
    }
    initUiContainer() {
        const uiContainer = document.createElement('div');
        uiContainer.classList.add('uni-ui-container');
        uiContainer.style.position = 'absolute';
        uiContainer.style.left = '0px';
        uiContainer.style.top = '0px';
        uiContainer.style.width = '100%';
        uiContainer.style.height = '100%';
        uiContainer.style.userSelect = 'none';
        uiContainer.style.pointerEvents = 'none';
        const canvasContainer = document.createElement('div');
        canvasContainer.classList.add('uni-canvas-container');
        canvasContainer.append(this.app.view);
        this.wrapper.appendChild(uiContainer);
        this.wrapper.appendChild(canvasContainer);
        this.uiContainer = uiContainer;
        this.canvasContainer = canvasContainer;
    }
    initProviderBindings() {
        for (const provider of this.moduleResolved.providers) {
            this.iocContainer.bind(provider.key).toConstantValue(provider.value);
        }
    }
    initBaseBindings() {
        const ioc = this.iocContainer;
        ioc.bind(bus_client_1.EventBusClient).toConstantValue(this.busClient);
        ioc.bind(texture_1.TextureProvider).toConstantValue(this.textureProvider);
        ioc.bind(hooks_1.UIEventBus).toConstantValue(this.uiEventBus);
        (0, inversify_2.bindToContainer)(ioc, [...this.managers, ...this.controllers]);
    }
    initUIBindings() {
        this.iocContainer.bind(state_1.UIStateContainer).toConstantValue(this.uiStatesContainer);
        for (const [stateClass, state] of this.uiStatesContainer.getEntries()) {
            this.iocContainer.bind(stateClass).toConstantValue(state);
        }
    }
    renderUI() {
        const dataSource = this.iocContainer.get(state_1.UIStateContainer);
        const ticker = this.app.ticker;
        const eventBus = this.uiEventBus;
        const textureProvider = this.textureProvider;
        react_dom_1.default.render(react_1.default.createElement(hooks_1.UIEntry, { dataSource, ticker, eventBus, textureProvider }, react_1.default.createElement(this.option.uiEntry)), this.uiContainer);
    }
    doUpdateTick() {
        try {
            for (const manager of this.managers) {
                this.iocContainer.get(manager).doUpdateTick(this.updateTick);
            }
        }
        catch (err) {
            utils_1.Logger.error(err.stack);
        }
        this.updateTick += 1;
    }
    doFixedUpdateTick() {
        try {
            for (const manager of this.managers) {
                this.iocContainer.get(manager).doFixedUpdateTick(this.fixedTick);
            }
        }
        catch (err) {
            utils_1.Logger.error(err.stack);
        }
        this.fixedTick += 1;
    }
    startLoop() {
        this.app.ticker.add(this.doUpdateTick.bind(this));
        this.app.ticker.add(this.doFixedUpdateTick.bind(this));
    }
    async initTextures() {
        for (const path of this.option.texturePaths) {
            const parsed = (0, texture_1.ParseTexturePath)(path);
            if (Boolean(parsed) === false)
                continue;
            const [key, relPath, type] = parsed;
            if (type == texture_1.TextureType.IMAGESET) {
                await this.textureProvider.addJSON(key, relPath);
            }
            else {
                await this.textureProvider.add(key, relPath);
            }
        }
    }
}
exports.ClientApp = ClientApp;
