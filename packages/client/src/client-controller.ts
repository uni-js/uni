import { EventBusClient } from './bus-client';
import {
	RemoteEvent,
	GameEventEmitter,
	REMOTE_EVENT_HANDLER,
	getHandledEventBounds,
} from '@uni.js/event';

type ClassOf<T> = { new (...args: any[]): T };

export class ClientSideController extends GameEventEmitter {
	/**
	 *
	 * @param eventBus event bus on network
	 */
	constructor(protected eventBus: EventBusClient) {
		super();

		this.initRemoteHandledEvents();
	}

	private initRemoteHandledEvents() {
		const bounds = getHandledEventBounds(this, REMOTE_EVENT_HANDLER);
		for (const bound of bounds) {
			this.eventBus.on(bound.eventClassName, bound.bindToMethod.bind(this));
		}
	}

	/**
	 * redirect the event specified, publish the event to event bus on network.
	 */
	protected redirectToBusEvent<E extends RemoteEvent>(
		from: GameEventEmitter,
		eventName: string,
		remoteEvent: ClassOf<E>,
	) {
		from.on(eventName, (event: any) => {
			this.eventBus.emitBusEventByName(remoteEvent.name, event);
		});
	}
}
