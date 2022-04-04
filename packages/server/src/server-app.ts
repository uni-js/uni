import { EventBusServer, IEventBus } from './bus-server';

import { Container, interfaces } from 'inversify';
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
}

export class ServerApp {
	private eventBus: IEventBus;
	private ioc: Container;

	private tick = 0;

	constructor(private option: ServerApplicationOption) {
		this.eventBus = new EventBusServer();
	}

	start() {
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

	private async startLoop() {
		Logger.info('The server app is running');

		while (true) {
			const startTime = new Date().getTime();
	
			const endTime = new Date().getTime();

			const deltaTime = endTime - startTime;

			await wait(50 - deltaTime);

			this.tick += 1;
		}
	}
}
