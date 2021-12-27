import 'reflect-metadata';
import * as PIXI from 'pixi.js';
import { EventEmitter2 as EventEmitter } from "eventemitter2"

import { EventBusClient } from './bus-client';
import { Container, interfaces } from 'inversify';
import { bindToContainer, resolveAllBindings } from './inversify';

import { ClientModuleResolvedResult, ClientSideModule, resolveClientSideModule } from './module';
import { Logger } from '@uni.js/utils';

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
	module: ClientSideModule;
}

export function wait(time: number) {
	return new Promise((resolve) => setTimeout(resolve, time));
}

export class ClientApp extends EventEmitter{
	private updateTick = 0;
	private fixedTick = 0;

	private app: PIXI.Application;

	private managers: any[] = [];
	private controllers: any[] = [];

	private busClient: EventBusClient;

	private ioc: Container;

	private wrapper: HTMLElement;
	private coverContainer: HTMLElement;
	private canvasContainer: HTMLElement;

	private playground: HTMLElement;

	private moduleResolved: ClientModuleResolvedResult;

	constructor(private option: ClientApplicationOption) {
		super();

		this.moduleResolved = resolveClientSideModule(option.module);

		this.app = new PIXI.Application({
			width: option.width,
			height: option.height,
			resolution: option.resolution,
		});

		this.playground = option.playground;

		this.ioc = new Container({ skipBaseClassChecks: true });

		this.managers = this.moduleResolved.managers;
		this.controllers = this.moduleResolved.controllers;

		this.busClient = new EventBusClient(this.option.serverUrl);

		this.initProviderBindings();
		this.initWrapper();
		this.initCanvasContainer();
		this.initCoverContainer();
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
	
	add(key: any, value: any) {
		this.ioc.bind(key).toConstantValue(value);
	}

	get<T>(identifier: interfaces.ServiceIdentifier<T>) {
		return this.ioc.get(identifier);
	}

	async use(plugin: UniClientPlugin) {
		const context: PluginContext = {
			app: this
		}

		await plugin(context);
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
		this.emit("beforestart");
		this.initBaseBindings();

		resolveAllBindings(this.ioc, this.managers);
		resolveAllBindings(this.ioc, this.controllers);

		this.app.start();

		this.startLoop();
		this.emit("start");
	}

	private initWrapper() {
		const wrapper = document.createElement('div');
		wrapper.classList.add('uni-wrapper');
		wrapper.style.width = `${this.app.view.width}px`;
		wrapper.style.height = `${this.app.view.height}px`;
		wrapper.style.position = 'relative';

		this.playground.appendChild(wrapper);
		this.wrapper = wrapper;
	}

	private initCanvasContainer() {
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

	private initProviderBindings() {
		for (const provider of this.moduleResolved.providers) {
			this.ioc.bind(provider.key).toConstantValue(provider.value);
		}
	}

	private initBaseBindings() {
		this.ioc.bind(EventBusClient).toConstantValue(this.busClient);

		bindToContainer(this.ioc, [...this.managers, ...this.controllers]);
	}

	private doUpdateTick() {
		try {
			for (const manager of this.managers) {
				this.ioc.get<any>(manager).doUpdateTick(this.updateTick);
			}
		} catch (err: any) {
			Logger.error(err.stack);
		}

		this.updateTick += 1;
	}

	private doFixedUpdateTick() {
		try {
			for (const manager of this.managers) {
				this.ioc.get<any>(manager).doFixedUpdateTick(this.fixedTick);
			}
		} catch (err: any) {
			Logger.error(err.stack);
		}

		this.fixedTick += 1;
	}

	private startLoop() {
		this.app.ticker.add(this.doUpdateTick.bind(this));
		this.app.ticker.add(this.doFixedUpdateTick.bind(this));
	}
}
