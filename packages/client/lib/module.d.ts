import { ClientSideController } from './client-controller';
import { ClientSideManager } from './client-manager';
interface ClassOf<T> {
    new (...args: any[]): T;
}
export interface Provider {
    key: any;
    value: any;
}
export declare type ClientControllerClass = ClassOf<ClientSideController>;
export declare type ClientManagerClass = ClassOf<ClientSideManager>;
export interface ClientSideModule {
    imports: ClientSideModule[];
    controllers: ClientControllerClass[];
    managers: ClientManagerClass[];
    providers: Provider[];
    uiStates: ClassOf<any>[];
}
export interface ClientModuleResolvedResult {
    controllers: ClientControllerClass[];
    managers: ClientManagerClass[];
    providers: Provider[];
    uiStates: ClassOf<any>[];
}
export declare function resolveClientSideModule(module: ClientSideModule): ClientModuleResolvedResult;
export declare function createClientSideModule(option: Partial<ClientSideModule>): ClientSideModule;
export {};
