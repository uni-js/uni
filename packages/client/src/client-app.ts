import 'reflect-metadata';
import * as PIXI from 'pixi.js';
import { EventEmitter2 as EventEmitter } from "eventemitter2"

import { EventBusClient } from './bus-client';

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
PIXI.settings.SORTABLE_CHILDREN = true;

export interface PluginContext {
    app: ClientApp
}

export type UniClientPlugin = (context: PluginContext) => any;

export interface ClientApplicationOption {
	serverUrl: string;
	playground: HTMLElement;
	width: number;
	height: number;
	resolution: number;
	msgPacked?: boolean;
	[key: string]: any;
}

export function wait(time: number) {
	return new Promise((resolve) => setTimeout(resolve, time));
}

export class ClientApp extends EventEmitter{
	private app: PIXI.Application;

	private busClient: EventBusClient;

	private wrapper: HTMLElement;
	private coverContainer: HTMLElement;
	private canvasContainer: HTMLElement;

	private playground: HTMLElement;

	constructor(private option: ClientApplicationOption) {
		super();

		this.app = new PIXI.Application({
			width: option.width,
			height: option.height,
			resolution: option.resolution,
		});

		this.playground = option.playground;

		this.busClient = new EventBusClient(this.option.serverUrl, this.option.msgPacked === undefined ? true : this.option.msgPacked);

		this.initWrapper();
		this.initCanvasContainer();
		this.initCoverContainer();
	}

	getBusClient() {
		return this.busClient;
	}

	getOption() {
		return this.option;
	}

	getCanvasElement() {
		return this.app.view;
	}

	getCanvasContainer() {
		return this.canvasContainer;
	}

	async use(plugin: UniClientPlugin) {
		const context: PluginContext = {
			app: this
		}

		return await plugin(context);
	}
 
	addTicker(fn: any) {
		this.app.ticker.add(fn);
	}

	removeTicker(fn: any) {
		this.app.ticker.remove(fn);
	}

	addDisplayObject(displayObject: PIXI.DisplayObject) {
		this.app.stage.addChild(displayObject);
	}

	removeDisplayObject(displayObject: PIXI.DisplayObject) {
		this.app.stage.removeChild(displayObject);
	}

	/**
	 * add a html element as a child of cover container element
	 */
	addCoverElement(element: HTMLElement) {
		this.coverContainer.appendChild(element);
	}

	removeCoverElement(element: HTMLElement) {
		this.coverContainer.removeChild(element);
	}

	async start() {
		this.emit("prestart")
		this.app.start();
		this.emit("start")
	}

	private initWrapper() {
		const wrapper = document.createElement('div');
		wrapper.classList.add('uni-wrapper');
		wrapper.style.position = 'relative';

		this.playground.appendChild(wrapper);
		this.wrapper = wrapper;
	}

	private initCanvasContainer() {
		this.app.view.style.width = "100%";
		this.app.view.style.height = "100%";
		
		const canvasContainer = document.createElement('div');
		canvasContainer.classList.add('uni-canvas-container');
		canvasContainer.append(this.app.view);
		this.wrapper.appendChild(canvasContainer);
		this.canvasContainer = canvasContainer;
	}

	private initCoverContainer() {
		const coverContainer = document.createElement('div');
		coverContainer.classList.add('uni-cover-container');
		coverContainer.style.position = 'absolute';
		coverContainer.style.left = '0px';
		coverContainer.style.top = '0px';
		coverContainer.style.width = '100%';
		coverContainer.style.height = '100%';
		coverContainer.style.userSelect = "none";
		coverContainer.style.pointerEvents = "none";

		this.wrapper.appendChild(coverContainer);
		this.coverContainer = coverContainer;
	}
}
