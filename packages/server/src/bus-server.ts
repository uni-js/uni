import { Server, Socket } from 'socket.io';

import { RemoteEvent } from '@uni.js/event';
import { EventEmitter2, ListenerFn } from 'eventemitter2';

const MsgPackParser = require('socket.io-msgpack-parser');

export const EventBusServerSymbol = Symbol();

export const enum BusEvent {
	ClientDisconnectEvent = 'ClientDisconnectEvent',
	ClientConnectEvent = 'ClientConnectEvent',
}

export interface IEventBus  {
	emitTo(connIds: string | string[], event: RemoteEvent): void;
	emitToAll(event: RemoteEvent): void;
	listen(port: number): void;
	on(event: any, handler: ListenerFn): void;
}

export class EventBusServer extends EventEmitter2 implements IEventBus {
	private server: Server;
	private map = new Map<string, Socket>();

	constructor(msgPacked = true) {
		super();
		
		const cors = { origin: '*', methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] };
		const option = !msgPacked ? { cors } : { cors, parser: MsgPackParser };

		this.server = new Server(option);
		this.server.on('connect', this.handleConnection);
	}

	private handleConnection = (conn: Socket) => {
		this.map.set(conn.id, conn);

		conn.onAny((name: string, event: any) => {
			this.emit(name, event, conn.id);
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

	emitTo(connIds: string[] | string, event: RemoteEvent){
		if (typeof(connIds) === "string") {
			connIds = [connIds];
		}
		
		for (const id of connIds) {
			const conn = this.getConnection(id);
			if (!conn) continue;
			conn.emit(event.constructor.name, event);
		}
	}

	emitToAll(event: RemoteEvent): void {
		this.emitTo(Array.from(this.map.keys()), event);
	}

	on(eventClassOrName: any, handler: ListenerFn) {
		return super.on(eventClassOrName.name || eventClassOrName, handler);
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
