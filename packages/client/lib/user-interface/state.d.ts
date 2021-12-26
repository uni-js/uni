export declare function UIState(): (target: any) => any;
export interface UIStateMetaInfo {
    /**
     * state revision, increased when state changed
     */
    revision: number;
    class: any;
}
export declare type UIStateWithMetaInfo<T> = T & {
    meta: UIStateMetaInfo;
};
export declare function ObserveArrayChange(array: any[], onchange: () => void): any[];
/**
 * create a ui state
 *
 * @param definedClass the class that defines the ui state
 */
export declare function CreateUIState(definedClass: any): any;
export declare class UIStateContainer {
    private uiStateDefs;
    private uiStates;
    constructor(uiStateDefs: any[]);
    getEntries(): [string, any][];
    getState(clazz: any): any;
}
