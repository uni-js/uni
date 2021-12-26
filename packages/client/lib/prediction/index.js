"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PredictedInputManager = exports.CORRECTION_RATIO = exports.AckData = exports.Input = exports.EntityState = void 0;
const eventemitter2_1 = require("eventemitter2");
class EntityState {
}
exports.EntityState = EntityState;
class Input {
}
exports.Input = Input;
class AckData {
}
exports.AckData = AckData;
exports.CORRECTION_RATIO = 10;
/**
 * support client-side prediction and server reconciliation
 */
class PredictedInputManager extends eventemitter2_1.EventEmitter2 {
    constructor(initState) {
        super();
        this.inputSequenceCount = 0;
        this.pendingInputs = [];
        this.state = initState;
        this.simulatedState = { ...this.state };
    }
    applyInput(input) {
        this.state.x += input.moveX;
        this.state.y += input.moveY;
        this.simulatedState.x += input.moveX;
        this.simulatedState.y += input.moveY;
        this.emit('applyState', this.state);
    }
    applyState(state) {
        this.state = state;
        this.emit('applyState', this.state);
    }
    pendInput(input) {
        const bufferedInput = {
            ...input,
            seqId: this.inputSequenceCount,
        };
        this.applyInput(bufferedInput);
        this.pendingInputs.push(bufferedInput);
        this.inputSequenceCount += 1;
        this.emit('applyInput', bufferedInput);
        return bufferedInput;
    }
    /**
     * acknowledge the input,
     * for example, call this method
     * when received a input ack from server
     */
    ackInput(ackData) {
        this.simulatedState.x = ackData.x;
        this.simulatedState.y = ackData.y;
        const newPendingInputs = [];
        for (const input of this.pendingInputs) {
            if (input.seqId > ackData.lastProcessedInput) {
                newPendingInputs.push(input);
                this.simulatedState.x += input.moveX;
                this.simulatedState.y += input.moveY;
            }
        }
        this.pendingInputs = newPendingInputs;
    }
    doBlending() {
        const offsetX = this.state.x - this.simulatedState.x;
        const offsetY = this.state.y - this.simulatedState.y;
        this.state.x += -offsetX / exports.CORRECTION_RATIO;
        this.state.y += -offsetY / exports.CORRECTION_RATIO;
        this.applyState(this.state);
    }
    doGameTick() {
        this.doBlending();
    }
}
exports.PredictedInputManager = PredictedInputManager;
