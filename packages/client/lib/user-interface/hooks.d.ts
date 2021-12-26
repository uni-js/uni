import React from 'react';
import { TextureProvider } from '../texture';
import { EventEmitter2 } from 'eventemitter2';
import { UIStateContainer, UIStateWithMetaInfo } from './state';
export declare class UIEventBus extends EventEmitter2 {
}
export declare type DataSource = UIStateContainer;
export declare type TickingFunction = (...args: any[]) => void;
export interface UITicker {
    add(func: TickingFunction): void;
    remove(func: TickingFunction): void;
}
export interface UIContext {
    /**
     * data source
     */
    dataSource: DataSource;
    /**
     * the ticker of ui component, sync to the main rendering loop
     */
    ticker: UITicker;
    /**
     * ui component can emit out event through event bus
     */
    eventBus: UIEventBus;
    /**
     * provider ability to access texture
     */
    textureProvider: TextureProvider;
}
export interface UIEntryProps extends UIContext {
    children?: any[];
}
export declare const UIContext: React.Context<UIContext>;
export declare function UIEntry(props: UIEntryProps): JSX.Element;
export declare function useDataSource(): UIStateContainer;
export declare function useEventBus(): UIEventBus;
export declare function useTextureProvider(): TextureProvider;
export declare function useTicker(fn: TickingFunction, deps?: any[]): void;
export declare function useUIState<E>(cls: new () => E): UIStateWithMetaInfo<E>;
export declare function useTexturePath(provider: TextureProvider, key: string): string;
