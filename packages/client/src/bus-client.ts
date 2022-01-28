import { injectable } from 'inversify';
import { io } from 'socket.io-client';
import { RemoteEvent } from '@uni.js/event';
import { EventEmitter2 } from 'eventemitter2';

const MsgPackParser = require('socket.io-msgpack-parser');

@injectable()
export class EventBusClient extends EventEmitter2 {
	private client;
	constructor(url: string) {
		super();

		const isDebug = Boolean(process.env['DEBUG']);
		const option = isDebug ? {} : { parser: MsgPackParser };

		this.client = io(url, option);
		this.client.onAny((event, ...args) => {
			this.emit(event, ...args);
		});
	}

	emitBusEvent(event: RemoteEvent) {
		this.emitBusEventByName(event.constructor.name, event);
	}

	emitBusEventByName(eventName: string, eventPayload: any) {
		this.client.emit(eventName, eventPayload);
	}
}
