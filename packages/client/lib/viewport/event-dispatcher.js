"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewportHTMLEventDispatcher = void 0;
const eventemitter2_1 = require("eventemitter2");
class ViewportHTMLEventDispatcher extends eventemitter2_1.EventEmitter2 {
    constructor(viewport) {
        super();
        this.viewport = viewport;
    }
    bind(element) {
        if (this.element) {
            throw new Error(`already bound`);
        }
        this.element = element;
        this.element.addEventListener('mousedown', (ev) => {
            this.emit('mousedown', this.convertMouseEvent(ev));
        });
        this.element.addEventListener('mouseup', (ev) => {
            this.emit('mouseup', this.convertMouseEvent(ev));
        });
        this.element.addEventListener('mousemove', (ev) => {
            this.emit('mousemove', this.convertMouseEvent(ev));
        });
    }
    convertMouseEvent(ev) {
        const [worldX, worldY] = this.viewport.getWorldPointAt(ev.offsetX, ev.offsetY);
        const newEvent = {
            worldX,
            worldY,
            floorX: Math.floor(worldX),
            floorY: Math.floor(worldY),
            screenX: ev.offsetX,
            screenY: ev.offsetY,
        };
        return newEvent;
    }
}
exports.ViewportHTMLEventDispatcher = ViewportHTMLEventDispatcher;
