import "reflect-metadata";

import { TypedEmitter } from 'tiny-typed-emitter';

export type EventMap<T> = {
	[key in keyof T]: (event: T[key]) => void;
}

type ClassOf<T> = { new (...args: any[]): T };

export class RemoteEvent {}

export interface EventBound {
	bindToMethod: (...args: any[]) => void;
	eventClass: ClassOf<any>;
	eventClassName: string;
	[key: string]: any;
}

export const REMOTE_EVENT_HANDLER = Symbol();
export const LOCAL_EVENT_HANDLER = Symbol();
export const LOCAL_EVENT_EMITTER = Symbol();
export const OBJECT_EVENT_EMITTER = Symbol();
export const IS_GAME_EVENT_EMITTER = Symbol();

export function EmitObjectEvent(objectEventName: string) {
	return (target: any, propertyKey: string) => {
		let list: any[] = Reflect.getMetadata(OBJECT_EVENT_EMITTER, target);	
		if(!list){
			list = [];
			Reflect.defineMetadata(OBJECT_EVENT_EMITTER, list, target);
		}
		list.push({ bindToMethod: target[propertyKey], objectEventName });
	}

}

export function EmitLocalEvent(emitterName: string, localEventName: string) {
	return (target: any, propertyKey: string) => {
		let list: any[] = Reflect.getMetadata(LOCAL_EVENT_EMITTER, target);	
		if(!list){
			list = [];
			Reflect.defineMetadata(LOCAL_EVENT_EMITTER, list, target);
		}
		list.push({ bindToMethod: target[propertyKey], emitterName, localEventName });
	}
}

/**
 * decorate a controller, to add a specified listener of an event and bind it to the method automatically.
 *
 * @param eventClass the event class specified
 */
export function HandleRemoteEvent<T extends RemoteEvent>(eventClass: ClassOf<T>) {
	return Reflect.metadata(REMOTE_EVENT_HANDLER, { eventClass, eventClassName: eventClass.name });
}

export function HandleEvent(emitterPropertyName: string, eventClassName: string) {
	return Reflect.metadata(LOCAL_EVENT_HANDLER, { emitterPropertyName, eventClassName });
}

export function getObjectEventEmitters(object: any) {
	return Reflect.getMetadata(OBJECT_EVENT_EMITTER, object);
}

export function getLocalEventEmitters(object: any) {
	return Reflect.getMetadata(LOCAL_EVENT_EMITTER, object);
}

export function getHandledEventBounds(object: any, sign: symbol): EventBound[] {
	const methods = getAllMethodsOfObject(object);
	const bounds: EventBound[] = [];
	for (const method of methods) {
		const metadata = Reflect.getMetadata(sign, object, method);
		if (metadata !== undefined){
			bounds.push({ bindToMethod: object[method], ...metadata });
		}
	}
	return bounds;
}

export function copyOwnPropertiesTo(from: any, target: any) {
	const names = Object.getOwnPropertyNames(from);
	for (const property of names) {
		target[property] = from[property];
	}
}

export class GameEventEmitter<T extends Record<string, any> = any> extends TypedEmitter<EventMap<T>> {
	[IS_GAME_EVENT_EMITTER] = true;

	constructor() {
		super();

		nextTick(() => this.initLocalHandledEvents());
	}

	private initLocalHandledEvents() {
		const bounds = getHandledEventBounds(this, LOCAL_EVENT_HANDLER);
		for (const bound of bounds) {
			const emitterName = bound.emitterPropertyName as string;
			const emitter = emitterName ? (this as any)[emitterName] as GameEventEmitter<T> : this;

			if(!emitter)
				throw new Error(`the target emitter ${emitterName} doesn't exists at: ${this.constructor.name}`)

			if (emitter[IS_GAME_EVENT_EMITTER] !== true)
				throw new Error(`the target emitter is not GameEventEmitter when binding ${bound.eventClass}`);

			emitter.on(bound.eventClassName, bound.bindToMethod.bind(this));
		}
	}

	/**
	 * redirect the specified event,
	 * emit out once received a event
	 */
	redirectEvent(from: GameEventEmitter, eventClass: keyof T) {
		const listener : any = (...args: any) => {
			this.emit(eventClass, ...args);
		};
		from.on(eventClass, listener);
	}
}

function getAllMethodsOfObject(object: any) {
    let properties = new Set<string>()
    let currentObj = object
    do {
      Object.getOwnPropertyNames(currentObj).map(item => properties.add(item))
    } while ((currentObj = Object.getPrototypeOf(currentObj)))
    return [...properties.keys()].filter(item => typeof object[item] === 'function');
}

function nextTick(fn: (...args: any[]) => any) {
	setTimeout(fn, 0);
}
