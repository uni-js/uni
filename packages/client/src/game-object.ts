import * as PIXI from 'pixi.js';

type ClassOf<T> = { new (...args: any[]): T };

export interface IGameObject extends PIXI.DisplayObject {
	getLocalId(): number;
	getServerId(): number;
	doUpdateTick(tick: number): void;
	doTick(tick: number): void;
}

export class GameObject extends PIXI.Container implements IGameObject {
	static objectCount = 0;

	private localId: number;

	constructor(protected serverId?: number) {
		super();
		this.localId = -++GameObject.objectCount;
	}
	
	/**
	 * local id of game obejct
	 *
	 * @returns always return negative number
	 */
	getLocalId() {
		return this.localId;
	}

	/**
	 * remote object id
	 * the id is unique and provided by server
	 */
	getServerId(): number {
		return this.serverId;
	}

	doUpdateTick(tick: number): void {}
	doTick(tick: number): void {}
}
