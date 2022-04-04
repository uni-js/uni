import { injectable } from 'inversify';
import { io } from 'socket.io-client';
import { RemoteEvent } from '@uni.js/event';
import { EventEmitter2 } from 'eventemitter2';

const MsgPackParser = require('socket.io-msgpack-parser');

@injectable()
export class EventBusClient extends EventEmitter2 {
	private client;
	constructor(url: string, msgPacked = true) {
		super();

		const option = !msgPacked ? {} : { parser: MsgPackParser };

		this.client = io(url, option);
		this.client.onAny((event, ...args) => {
			this.emit(event, ...args);
		});
	}

	on(eventClassOrName: any, handler: (...args: any[]) => void) {
		return super.on(eventClassOrName.name || eventClassOrName, handler);
	}
	
	emitBusEvent(event: RemoteEvent) {
		this.client.emit(event.constructor.name, event);
	}
}
