import { ObjectStore, HashItem } from './object-store';
import { GameEventEmitter, getObjectEventEmitters } from '@uni.js/event';
import { IGameObject } from './game-object';

export abstract class ClientSideManager<E extends Record<string, any> = any> extends GameEventEmitter<E> {
	constructor() {
		super();
	}

	doUpdateTick(tick: number): void {}
	doFixedUpdateTick(tick: number): void {}
}

export class GameObjectManager<T extends IGameObject, E extends Record<string, any> = any> extends ClientSideManager<E> {
	private redirectedObjectEvents: string[] = [];

	constructor(private objectStore: ObjectStore<T>) {
		super();
		this.initObjectEventEmitters();
	}

	private initObjectEventEmitters() {
		const bounds = getObjectEventEmitters(this);
		if(!bounds) return;
		for(const bound of bounds){
			this.redirectObjectEvent(bound.objectEventName);
		}
	}

	/**
	 * redirect the event from the specified-type game object
	 */
	protected redirectObjectEvent(eventClass: string) {
		this.redirectedObjectEvents.push(eventClass);
	}

	addGameObject(gameObject: T) {
		this.objectStore.add(gameObject);

		for (const eventClass of this.redirectedObjectEvents) {
			gameObject.on(eventClass, (...args: any) => {
				this.emit(eventClass, ...args);
			});
		}
	}

	removeGameObject(gameObject: T) {
		this.objectStore.remove(gameObject);
	}

	getObjectById(objectId: number): T {
		return this.getObjectByHash(objectId);
	}

	getObjectByHash(...hashItems: HashItem[]): T {
		return this.objectStore.get(...hashItems);
	}

	getAllObjects() {
		return this.objectStore.getAll();
	}

	doUpdateTick(tick: number) {}

	doFixedUpdateTick(tick: number) {
		const objects = this.objectStore.getAll();
		for (const object of objects) {
			object.doFixedUpdateTick(tick);
		}
	}
}
