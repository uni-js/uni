import { EventEmitter2 } from 'eventemitter2';
import { Viewport } from './viewport';
export interface ConvertedMouseEvent {
    screenX: number;
    screenY: number;
    floorX: number;
    floorY: number;
    worldX: number;
    worldY: number;
}
export declare class ViewportHTMLEventDispatcher extends EventEmitter2 {
    private viewport;
    private element;
    constructor(viewport: Viewport);
    bind(element: HTMLElement): void;
    private convertMouseEvent;
}
