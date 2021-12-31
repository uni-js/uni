import { GameEventEmitter } from '@uni.js/event';


export class ServerSideManager extends GameEventEmitter {
	constructor() {
		super();
	}

	doTick(tick: number): void {}
}
