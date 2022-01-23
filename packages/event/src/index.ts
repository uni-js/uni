import "reflect-metadata";

import { TypedEmitter } from 'tiny-typed-emitter';

export type EventMap<T> = {
	[key in keyof T]: (event: T[key]) => void;
}

type ClassOf<T> = { new (...args: any[]): T };

export class ExternalEvent {}

export interface EventBound {
	bindToMethod: (...args: any[]) => void;
	eventClass: ClassOf<any>;
	eventClassName: string;
	[key: string]: any;
}

export const EXTERNAL_EVENT_HANDLER = Symbol();
export const INTERNAL_EVENT_HANDLER = Symbol();
export const IS_GAME_EVENT_EMITTER = Symbol();

/**
 * decorate a controller, to add a specified listener of an event and bind it to the method automatically.
 *
 * @param eventClass the event class specified
 */
export function HandleRemoteEvent<T extends ExternalEvent>(eventClass: ClassOf<T>) {
	return Reflect.metadata(EXTERNAL_EVENT_HANDLER, { eventClass, eventClassName: eventClass.name });
}

export function HandleEvent(emitterPropertyName: string, eventClassName: string) {
	return Reflect.metadata(INTERNAL_EVENT_HANDLER, { emitterPropertyName, eventClassName });
}

export function getHandledEventBounds(object: any, sign: symbol): EventBound[] {
	const methods = getAllMethodsOfObject(object);
	const bounds: EventBound[] = [];
	for (const method of methods) {
		const metadata = Reflect.getMetadata(sign, object, method);
		if (metadata !== undefined) bounds.push({ bindToMethod: object[method], eventClass: metadata.eventClass, ...metadata });
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

		nextTick(() => this.initInternalHandledEvents());
	}

	private initInternalHandledEvents() {
		const bounds = getHandledEventBounds(this, INTERNAL_EVENT_HANDLER);
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
	const prototype = Object.getPrototypeOf(object);
	return Object.getOwnPropertyNames(prototype).filter(function (property) {
		return typeof object[property] == 'function';
	});
}

function nextTick(fn: (...args: any[]) => any) {
	setTimeout(fn, 0);
}
