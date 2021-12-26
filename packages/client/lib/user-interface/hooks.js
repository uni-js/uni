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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTexturePath = exports.useUIState = exports.useTicker = exports.useTextureProvider = exports.useEventBus = exports.useDataSource = exports.UIEntry = exports.UIContext = exports.UIEventBus = void 0;
const react_1 = __importStar(require("react"));
const inversify_1 = require("inversify");
const eventemitter2_1 = require("eventemitter2");
let UIEventBus = class UIEventBus extends eventemitter2_1.EventEmitter2 {
};
UIEventBus = __decorate([
    (0, inversify_1.injectable)()
], UIEventBus);
exports.UIEventBus = UIEventBus;
exports.UIContext = react_1.default.createContext(null);
function UIEntry(props) {
    const contextValue = {
        dataSource: props.dataSource,
        ticker: props.ticker,
        eventBus: props.eventBus,
        textureProvider: props.textureProvider,
    };
    return react_1.default.createElement(exports.UIContext.Provider, { value: contextValue }, props.children);
}
exports.UIEntry = UIEntry;
function useDataSource() {
    return (0, react_1.useContext)(exports.UIContext).dataSource;
}
exports.useDataSource = useDataSource;
function useEventBus() {
    return (0, react_1.useContext)(exports.UIContext).eventBus;
}
exports.useEventBus = useEventBus;
function useTextureProvider() {
    return (0, react_1.useContext)(exports.UIContext).textureProvider;
}
exports.useTextureProvider = useTextureProvider;
function useTicker(fn, deps = []) {
    const { ticker } = (0, react_1.useContext)(exports.UIContext);
    react_1.default.useEffect(() => {
        ticker.add(fn);
        return () => {
            ticker.remove(fn);
        };
    }, deps);
}
exports.useTicker = useTicker;
function useUIState(cls) {
    const [state, setState] = react_1.default.useState();
    const versionRef = react_1.default.useRef(null);
    const uiState = useDataSource().getState(cls);
    useTicker(() => {
        if (uiState && uiState.meta.revision !== versionRef.current) {
            versionRef.current = uiState.meta.revision;
            setState({ ...uiState, meta: uiState.meta });
        }
    });
    return state || { ...uiState, meta: uiState.meta };
}
exports.useUIState = useUIState;
function useTexturePath(provider, key) {
    const item = provider.getItem(key);
    return item?.url;
}
exports.useTexturePath = useTexturePath;
