import 'reflect-metadata';
import * as PIXI from 'pixi.js';
import { interfaces } from 'inversify';
import { ClientSideModule } from './module';
export interface TextureDef {
    name: string;
    url: string;
}
export interface ClientApplicationOption {
    socket: any;
    playground: HTMLElement;
    texturePaths: string[];
    uiEntry: any;
    width: number;
    height: number;
    resolution: number;
    module: ClientSideModule;
}
export declare function wait(time: number): Promise<unknown>;
export declare class ClientApp {
    private option;
    private updateTick;
    private fixedTick;
    private app;
    private managers;
    private controllers;
    private uiStatesContainer;
    private textureProvider;
    private busClient;
    private uiEventBus;
    private iocContainer;
    private wrapper;
    private uiContainer;
    private canvasContainer;
    private playground;
    private moduleResolved;
    constructor(option: ClientApplicationOption);
    getCanvasElement(): HTMLCanvasElement;
    getCanvasContainer(): HTMLElement;
    get<T>(identifier: interfaces.ServiceIdentifier<T>): T;
    getCanvas(): HTMLCanvasElement;
    addTicker(fn: any): void;
    addDisplayObject(displayObject: PIXI.DisplayObject): void;
    removeDisplayObject(displayObject: PIXI.DisplayObject): void;
    removeTicker(fn: any): void;
    start(): Promise<void>;
    private initWrapper;
    private initUiContainer;
    private initProviderBindings;
    private initBaseBindings;
    private initUIBindings;
    private renderUI;
    private doUpdateTick;
    private doFixedUpdateTick;
    private startLoop;
    private initTextures;
}
