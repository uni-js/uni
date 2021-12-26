import { ObjectStore, HashItem } from './object-store';
import { GameEventEmitter, InternalEvent } from '@uni.js/event';
import { IGameObject } from './game-object';

type ClassOf<T> = { new (...args: any[]) : T };

export abstract class ClientSideManager extends GameEventEmitter {
	constructor() {
		super();
	}

	doUpdateTick(tick: number): void {}
	doFixedUpdateTick(tick: number): void {}
}

export class GameObjectManager<T extends IGameObject> extends ClientSideManager {
	private redirectedObjectEvents: ClassOf<InternalEvent>[] = [];

	constructor(private objectStore: ObjectStore<T>) {
		super();
	}

	/**
	 * redirect the event from the specified-type game object
	 */
	protected redirectObjectEvent(eventClass: ClassOf<InternalEvent>) {
		this.redirectedObjectEvents.push(eventClass);
	}

	addGameObject(gameObject: T) {
		this.objectStore.add(gameObject);

		for (const eventClass of this.redirectedObjectEvents) {
			gameObject.onEvent(eventClass, (event: InternalEvent) => {
				this.emitEvent(eventClass, event);
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
