import { DelayedEventBus, EventBusServer, EventBusServerSymbol, IEventBus } from './bus-server';

import { Container, interfaces } from 'inversify';
import { bindToContainer, resolveAllBindings } from './inversify';
import { ServerSideManager } from './server-manager';
import { ServerSideController } from './server-controller';
import { getIsServerUseDelay, getServerDebugDelay, isDebugMode } from './debug';
import { EntityClass, Provider, resolveServerSideModule, ServerControllerClass, ServerManagerClass, ServerSideModule } from './module';
import { Logger } from '@uni.js/utils';
import chalk from 'chalk';

function wait(time: number) {
	return new Promise((resolve) => setTimeout(resolve, time));
}

export interface PluginContext {
    app: ServerApp
}

export type UniServerPlugin = (context: PluginContext) => any;

export interface ServerApplicationOption {
	port: number;
	module: ServerSideModule;
}

export class ServerApp {
	private entities: EntityClass[] = [];
	private managers: ServerManagerClass[] = [];
	private controllers: ServerControllerClass[] = [];
	private providers: Provider[] = [];

	private eventBus: IEventBus;
	private ioc: Container;

	private tick = 0;

	constructor(private option: ServerApplicationOption) {
		const moduleResolved = resolveServerSideModule(option.module);

		this.entities = moduleResolved.entities;
		this.managers = moduleResolved.managers;
		this.controllers = moduleResolved.controllers;
		this.providers = moduleResolved.providers;

		if (isDebugMode()) {
			Logger.warn(chalk.bold.red('Debug mode is enabled!'));
		}

		if (getIsServerUseDelay()) {
			Logger.warn(chalk.bold.red(`Server is running based on a ${getServerDebugDelay(false)}ms delayed event bus`));
		}

		this.eventBus = getIsServerUseDelay() ? new DelayedEventBus() : new EventBusServer();

		this.initInversifyContainer();
	}

	start() {
		resolveAllBindings(this.ioc, this.managers);
		resolveAllBindings(this.ioc, this.controllers);

		this.eventBus.listen(this.option.port);
		this.startLoop();

		Logger.info(`Server has started.`);
	}

	getOption() {
		return this.option;
	}

	add(key: any, value: any) {
		this.ioc.bind(key).toConstantValue(value);
	}

	get<T>(identifier: interfaces.ServiceIdentifier<T>) {
		return this.ioc.get(identifier);
	}

	async use(plugin: UniServerPlugin) {
		const context: PluginContext = {
			app: this
		}

		await plugin(context);
	}

	private initInversifyContainer() {
		const ioc = new Container({ skipBaseClassChecks: true });
		ioc.bind(EventBusServerSymbol).toConstantValue(this.eventBus);

		bindToContainer(ioc, [...this.managers, ...this.controllers]);

		for (const provider of this.providers) {
			ioc.bind(provider.key).toConstantValue(provider.value);
		}

		this.ioc = ioc;
	}

	private async startLoop() {
		Logger.info('The server app is running');

		while (true) {
			const startTime = new Date().getTime();

			try {
				for (const manager of this.managers) {
					const singleton: ServerSideManager = this.ioc.get(manager);
					singleton.doTick(this.tick);
				}
				for (const controller of this.controllers) {
					const singleton: ServerSideController = this.ioc.get(controller);
					singleton.doTick(this.tick);
				}
			} catch (err: any) {
				Logger.error(err.stack);
			}
			const endTime = new Date().getTime();

			const deltaTime = endTime - startTime;

			await wait(50 - deltaTime);

			this.tick += 1;
		}
	}
}
