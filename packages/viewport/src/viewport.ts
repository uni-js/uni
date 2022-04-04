import { PluginContext, UniClientPlugin } from '@uni.js/client';
import { injectable } from 'inversify';
import * as PIXI from 'pixi.js';
import { ViewportHTMLEventDispatcher } from './event-dispatcher';

export interface IViewport {
	moveCenter(x: number, y: number): void;
	getWorldPointAt(screenX: number, screenY: number): [number, number];
	getWorldWidth(): number;
	getWorldHeight(): number;
}

@injectable()
export class Viewport extends PIXI.Container implements IViewport {
	constructor(private screenWidth: number, private screenHeight: number, private worldWidth: number, private worldHeight: number) {
		super();

		this.moveCenter(0, 0);
	}

	moveCenter(x: number, y: number) {
		this.position.set(this.worldWidth / 2 - x, this.worldHeight / 2 - y);
	}

	getWorldPointAt(screenX: number, screenY: number): [number, number] {
		const ratioW = this.worldWidth / this.screenWidth;
		const ratioH = this.worldHeight / this.screenHeight;

		return [screenX * ratioW - this.position.x, screenY * ratioH - this.position.y];
	}

	getWorldWidth() {
		return this.worldWidth;
	}

	getWorldHeight() {
		return this.worldHeight;
	}
}

export interface ViewportPluginOption { 
	screenWidth: number;
	screenHeight: number;
	worldWidth: number;
	worldHeight: number;
	mouseElem?: HTMLElement;
	initLayers?: PIXI.DisplayObject[]
}
export function ViewportPlugin(option: ViewportPluginOption): UniClientPlugin {
	return function(context: PluginContext) {
		const app = context.app;
		const viewport = new Viewport(option.screenWidth, option.screenHeight, option.worldWidth, option.worldHeight);
		const viewportEventDispatcher = new ViewportHTMLEventDispatcher(viewport);

		if(option.mouseElem){
			viewportEventDispatcher.bind(option.mouseElem);		
		}
		
		app.on("start", () => {
			if(option.initLayers){
				for(const layer of option.initLayers){
					viewport.addChild(layer);
				}
			}

			app.addDisplayObject(viewport);
		})

		return { viewport, viewportEventDispatcher }
	}
}