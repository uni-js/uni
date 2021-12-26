import * as PIXI from 'pixi.js';
export interface IViewport {
    moveCenter(x: number, y: number): void;
    getWorldPointAt(screenX: number, screenY: number): [number, number];
    getWorldWidth(): number;
    getWorldHeight(): number;
}
export declare class Viewport extends PIXI.Container implements IViewport {
    private screenWidth;
    private screenHeight;
    private worldWidth;
    private worldHeight;
    constructor(screenWidth: number, screenHeight: number, worldWidth: number, worldHeight: number);
    moveCenter(x: number, y: number): void;
    getWorldPointAt(screenX: number, screenY: number): [number, number];
    getWorldWidth(): number;
    getWorldHeight(): number;
}
