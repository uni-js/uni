import { EventEmitter2 } from 'eventemitter2';
export declare class EntityState {
    x: number;
    y: number;
    motionX: number;
    motionY: number;
}
export declare class Input {
    moveX: number;
    moveY: number;
    seqId?: number;
}
export declare class AckData {
    x: number;
    y: number;
    motionX: number;
    motionY: number;
    lastProcessedInput: number;
}
export declare const CORRECTION_RATIO = 10;
/**
 * support client-side prediction and server reconciliation
 */
export declare class PredictedInputManager extends EventEmitter2 {
    private state;
    private simulatedState;
    private inputSequenceCount;
    private pendingInputs;
    constructor(initState: EntityState);
    private applyInput;
    private applyState;
    pendInput(input: Input): {
        seqId: number;
        moveX: number;
        moveY: number;
    };
    /**
     * acknowledge the input,
     * for example, call this method
     * when received a input ack from server
     */
    ackInput(ackData: AckData): void;
    doBlending(): void;
    doGameTick(): void;
}
