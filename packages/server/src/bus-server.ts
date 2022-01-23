import { Server, Socket } from 'socket.io';
import { getServerDebugDelay } from './debug';

import { ExternalEvent } from '@uni.js/event';
import { EventEmitter2 } from 'eventemitter2';

const wait = (time: number) => new Promise((resolve) => setTimeout(resolve, time));

const MsgPackParser = require('socket.io-msgpack-parser');

export const EventBusServerSymbol = Symbol();

export const enum BusEvent {
	ClientDisconnectEvent = 'ClientDisconnectEvent',
	ClientConnectEvent = 'ClientConnectEvent',
}

export interface IEventBus extends EventEmitter2  {
	emitTo(connIds: string[], event: ExternalEvent): void;
	emitToAll(event: ExternalEvent): void;
	emitToByName(connIds: string[], eventName: string, eventPayload: any): void;
	emitToAllByName(eventName: string, eventPayload: any): void;
	listen(port: number): void;
}

export class EventBusServer extends EventEmitter2 implements IEventBus {
	private server: Server;
	private map = new Map<string, Socket>();

	constructor() {
		super();

		
		const isDebug = Boolean(process.env['DEBUG']);
		const cors = { origin: '*', methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] };
		const option = isDebug ? { cors } : { cors, parser: MsgPackParser };

		this.server = new Server(option);
		this.server.on('connect', this.handleConnection);
	}

	private handleConnection = (conn: Socket) => {
		this.map.set(conn.id, conn);

		conn.onAny((event: any, ...args: any[]) => {
			this.emit(event, conn.id, ...args);
		});

		conn.on('disconnect', () => {
			this.map.delete(conn.id);
			this.emit(BusEvent.ClientDisconnectEvent, conn.id);
		});

		this.emit(BusEvent.ClientConnectEvent, conn.id);
	}

	private getConnection(connId: string) {
		return this.map.get(connId);
	}

	emitTo(connIds: string[], event: ExternalEvent){
		this.emitToByName(connIds, event.constructor.name, event);
	}

	emitToAll(event: ExternalEvent): void {
		this.emitToAllByName(event.constructor.name, event);
	}

	emitToByName(connIds: string[], eventName: string, eventPayload: any) {
		for (const id of connIds) {
			const conn = this.getConnection(id);
			if (!conn) continue;
			conn.emit(eventName, eventPayload);
		}
	}

	emitToAllByName(eventName: string, eventPayload: any) {
		this.emitToByName(Array.from(this.map.keys()), eventName, eventPayload);
	}

	listen(port: number): void{
		this.server.listen(port);
	}
	
}

export interface DelayedRequest {
	emitToAll: boolean;
	connIds: string[];
	eventName: string;
	event: any;
}

export class DelayedEventBus extends EventEmitter2 implements IEventBus {
	private eventBus: EventBusServer;
	private requestQueue: DelayedRequest[] = [];
	private consuming = false;
	constructor() {
		super();
		this.eventBus = new EventBusServer();
		this.eventBus.onAny((eventName, ...args) => {
			this.emit(eventName, ...args);
		});
		this.startConsuming();
	}

	private async startConsuming() {
		this.consuming = true;
		while (this.consuming) {
			while (this.requestQueue.length > 0) {
				const request = this.requestQueue.shift();
				if (request.emitToAll) {
					this.eventBus.emitToAllByName(request.eventName, request.event);
				} else {
					this.eventBus.emitToByName(request.connIds, request.eventName, request.event);
				}
			}
			await wait(getServerDebugDelay());
		}
	}

	emitToByName(connIds: string[], eventName: string, eventPayload: any)	{
		this.requestQueue.push({
			emitToAll: false,
			connIds,
			eventName,
			event: eventPayload
		});
	}

	emitToAllByName(eventName: string, eventPayload: any): void {
		this.requestQueue.push({
			emitToAll: true,
			connIds: [],
			eventName,
			event: eventPayload
		});
	}

	emitTo(connIds: string[], event: ExternalEvent){
		this.emitToByName(connIds, event.constructor.name, event);
	}

	emitToAll(event: ExternalEvent): void {
		this.emitToAllByName(event.constructor.name, event);
	}

	listen(port: number): void {
		this.eventBus.listen(port);
	}
}
