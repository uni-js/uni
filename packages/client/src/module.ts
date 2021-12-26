import { ClientSideController } from './client-controller';
import { ClientSideManager } from './client-manager';


interface ClassOf<T> {
	new (...args: any[]): T;
}

export interface Provider {
	key: any;
	value: any;
}

export type ClientControllerClass = ClassOf<ClientSideController>;
export type ClientManagerClass = ClassOf<ClientSideManager>;

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


export function resolveClientSideModule(module: ClientSideModule): ClientModuleResolvedResult {
	const controllers: ClassOf<ClientSideController>[] = [...module.controllers];
	const managers: ClassOf<ClientSideManager>[] = [...module.managers];
	const providers: Provider[] = [...module.providers];
	const uiStates: ClassOf<any>[] = [...module.uiStates];

	for (const subModule of module.imports) {
		const resolved = resolveClientSideModule(subModule);
		controllers.push(...resolved.controllers);
		managers.push(...resolved.managers);
		providers.push(...resolved.providers);
		uiStates.push(...resolved.uiStates);
	}

	return { controllers, managers, providers, uiStates };
}

export function createClientSideModule(option: Partial<ClientSideModule>): ClientSideModule {
	return {
		imports: option.imports || [],
		controllers: option.controllers || [],
		managers: option.managers || [],
		providers: option.providers || [],
		uiStates: option.uiStates || [],
	};
}
