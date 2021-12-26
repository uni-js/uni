import { getServerDebugDelay } from './debug';

import { ExternalEvent, GameEventEmitter } from '../event';

const wait = (time: number) => new Promise((resolve) => setTimeout(resolve, time));

type Server = any;
type Socket = any;

export const EventBusServerSymbol = Symbol();

export const enum BusEvent {
	ClientDisconnectEvent = 'ClientDisconnectEvent',
	ClientConnectEvent = 'ClientConnectEvent',
}

export interface IEventBus extends GameEventEmitter {
	emitTo(connIds: string[], event: ExternalEvent): void;
	emitToAll(event: ExternalEvent): void;
	close(): void;
}

export class EventBusServer extends GameEventEmitter implements IEventBus {
	private map = new Map<string, Socket>();
	constructor(private socketInstance: Server) {
		super();

		this.socketInstance.on('connect', this.handleConnection);
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

	emitTo(connIds: string[], event: ExternalEvent) {
		for (const id of connIds) {
			const conn = this.getConnection(id);
			if (!conn) continue;
			conn.emit(event.constructor.name, event);
		}
	}

	emitToAll(event: ExternalEvent) {
		this.emitTo(Array.from(this.map.keys()), event);
	}

	close() {
		this.socketInstance.off('connect', this.handleConnection);
	}
}

export interface DelayedRequest {
	emitToAll: boolean;
	connIds: string[];
	event: ExternalEvent;
}

export class DelayedEventBus extends GameEventEmitter implements IEventBus {
	private eventBus: EventBusServer;
	private requestQueue: DelayedRequest[] = [];
	private consuming = false;
	constructor(socketInstance: Server) {
		super();
		this.eventBus = new EventBusServer(socketInstance);
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
					this.eventBus.emitToAll(request.event);
				} else {
					this.eventBus.emitTo(request.connIds, request.event);
				}
			}
			await wait(getServerDebugDelay());
		}
	}

	emitTo(connIds: string[], event: ExternalEvent): void {
		this.requestQueue.push({
			emitToAll: false,
			connIds,
			event,
		});
	}

	emitToAll(event: ExternalEvent): void {
		this.requestQueue.push({
			emitToAll: true,
			connIds: [],
			event,
		});
	}

	close(): void {
		this.eventBus.close();
	}
}
