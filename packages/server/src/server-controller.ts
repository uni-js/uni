import { IEventBus } from './bus-server';
import {
	ExternalEvent,
	EXTERNAL_EVENT_HANDLER,
	GameEventEmitter,
	getHandledEventBounds,
} from '@uni.js/event';

type ClassOf<T> = { new (...args: any[]): T };

export type TargetConnIdsProvider<T> = (param: T) => string[] | string;

export class ServerSideController<T extends Record<string, any> = any> extends GameEventEmitter<T> {
	constructor(protected eventBus: IEventBus) {
		super();

		this.initExternalHandledEvents();
	}

	private initExternalHandledEvents() {
		const bounds = getHandledEventBounds(this, EXTERNAL_EVENT_HANDLER);
		for (const bound of bounds) {
			this.eventBus.on(bound.eventClassName, bound.bindToMethod.bind(this));
		}
	}

	/**
	 * redirect the event received,
	 * and publish the event to network event bus.
	 */
	protected redirectToBusEvent<E extends ExternalEvent>(
		from: GameEventEmitter,
		eventName: string,
		externalEvent: ClassOf<E>,
		targetConnIdsProvider: TargetConnIdsProvider<any>,
	) {
		from.on(eventName, (event: any) => {
			const connIdsRet = targetConnIdsProvider(event);
			const connIds = typeof connIdsRet == 'string' ? [connIdsRet] : connIdsRet;
			this.eventBus.emitToByName(connIds, externalEvent.name, event);
		});
	}

	doTick(tick: number) {}
}
