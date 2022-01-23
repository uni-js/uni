import { GameEventEmitter } from '@uni.js/event';

export class ServerSideManager<T extends Record<string, any> = any> extends GameEventEmitter<T> {
	constructor() {
		super();
	}

	doTick(tick: number): void {}
}
