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
exports.Logger = void 0;
const Log = __importStar(require("loglevel"));
const chalk_1 = __importDefault(require("chalk"));
const loglevel_plugin_prefix_1 = __importDefault(require("loglevel-plugin-prefix"));
const colors = {
    TRACE: chalk_1.default.magenta,
    DEBUG: chalk_1.default.cyan,
    INFO: chalk_1.default.blue,
    WARN: chalk_1.default.yellow,
    ERROR: chalk_1.default.red,
};
const isNode = !global.window;
const Logger = Log.noConflict();
exports.Logger = Logger;
Logger.enableAll();
loglevel_plugin_prefix_1.default.reg(Log);
if (isNode) {
    loglevel_plugin_prefix_1.default.apply(Logger, {
        format(level, name, timestamp) {
            const levelString = colors[level.toUpperCase()](level);
            return `[${chalk_1.default.gray(`${timestamp}`)}] [${levelString}]`;
        },
    });
}
