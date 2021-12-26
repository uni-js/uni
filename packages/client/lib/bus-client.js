"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBusClient = void 0;
const inversify_1 = require("inversify");
const socket_io_client_1 = require("socket.io-client");
const event_1 = require("@uni.js/event");
const MsgPackParser = require('socket.io-msgpack-parser');
let EventBusClient = class EventBusClient extends event_1.GameEventEmitter {
    constructor(url) {
        super();
        const isDebug = Boolean(process.env['DEBUG']);
        const option = isDebug ? {} : { parser: MsgPackParser };
        this.client = (0, socket_io_client_1.io)(url, option);
        this.client.onAny((event, ...args) => {
            this.emit(event, ...args);
        });
    }
    emitBusEvent(event) {
        this.client.emit(event.constructor.name, event);
    }
};
EventBusClient = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [String])
], EventBusClient);
exports.EventBusClient = EventBusClient;
