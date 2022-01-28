import { IEventBus } from './bus-server';
import {
	RemoteEvent,
	LOCAL_EVENT_EMITTER,
	REMOTE_EVENT_HANDLER,
	GameEventEmitter,
	getHandledEventBounds,
	getLocalEventEmitters
} from '@uni.js/event';

type ClassOf<T> = { new (...args: any[]): T };

export type TargetConnIdsProvider<T> = (param: T) => string[] | string;

export class ServerSideController<T extends Record<string, any> = any> extends GameEventEmitter<T> {
	constructor(protected eventBus: IEventBus) {
		super();

		this.initRemoteHandledEvents();
		nextTick(()=>{
			this.initLocalEventEmitter();
		})
	}

	private initRemoteHandledEvents() {
		const bounds = getHandledEventBounds(this, REMOTE_EVENT_HANDLER);
		for (const bound of bounds) {
			this.eventBus.on(bound.eventClassName, bound.bindToMethod.bind(this));
		}
	}

	private initLocalEventEmitter() {
		const bounds = getLocalEventEmitters(this);
		if(!bounds) return;
		for(const bound of bounds){
			const emitter = (<any>this)[bound.emitterName];
			this.redirectToBusEvent(emitter, bound.localEventName, bound.localEventName, bound.bindToMethod);
		}
	}

	/**
	 * redirect the event received,
	 * and publish the event to network event bus.
	 */
	protected redirectToBusEvent<E extends RemoteEvent>(
		from: GameEventEmitter,
		eventName: string,
		externalEventName: string,
		targetConnIdsProvider: TargetConnIdsProvider<any>,
	) {
		from.on(eventName, (event: any) => {
			const connIdsRet = targetConnIdsProvider.call(this, event);
			if(connIdsRet === undefined){
				this.eventBus.emitToAllByName(externalEventName, event);
			}else{
				const connIds = typeof connIdsRet == 'string' ? [connIdsRet] : connIdsRet;
				this.eventBus.emitToByName(connIds, externalEventName, event);	
			}
		});
	}

	doTick(tick: number) {}
}

function nextTick(fn: (...args: any[]) => any) {
	setTimeout(fn, 0);
}
