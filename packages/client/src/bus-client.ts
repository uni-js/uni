import { injectable } from 'inversify';
import { ExternalEvent, GameEventEmitter } from '@uni.js/event';

@injectable()
export class EventBusClient extends GameEventEmitter {
	constructor(private socket: any) {
		super();

		this.socket.onAny((event: any, ...args: any[]) => {
			this.emit(event, ...args);
		});
	}

	emitBusEvent(event: ExternalEvent) {
		this.socket.emit(event.constructor.name, event);
	}
}
