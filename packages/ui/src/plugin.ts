import React from "react";
import ReactDOM from "react-dom";
import { TextureProvider } from "@uni.js/texture";
import { ClientApp, PluginContext, resolveClientSideModule, UniClientPlugin } from "@uni.js/client"
import { UIStateContainer } from "./state";
import { UIEventBus, UIEntry } from "./hooks";

function renderUI(container: HTMLElement, uiEntry: any, ticker: any, uiStateContainer: UIStateContainer, uiEventBus: UIEventBus, textureProvider?: TextureProvider) {
	const dataSource = uiStateContainer;
	const eventBus = uiEventBus;

	ReactDOM.render(
		React.createElement(UIEntry, { dataSource, ticker, eventBus, textureProvider }, React.createElement(uiEntry)),
		container,
	);
}

function initUIContainer() {
	const container = document.createElement('div');
	container.classList.add('uni-ui-container');
	container.style.position = 'absolute';
	container.style.left = '0px';
	container.style.top = '0px';
	container.style.width = '100%';
	container.style.height = '100%';
	container.style.userSelect = 'none';
	container.style.pointerEvents = 'none';
	return container;
}

function initStatesContainer(app: ClientApp, uiStateDefs: any[]) {
	const stateContainer = new UIStateContainer(uiStateDefs);
	for(const [key,value] of stateContainer.getEntries()) {
		app.add(key, value);
	}
	return stateContainer;
}
export function UIPlugin(uiEntry: any) : UniClientPlugin {
	return function (context: PluginContext) {
		const app = context.app;
		const resolvedModules = resolveClientSideModule(app.getOption().module);
		const textureProvider = app.get(TextureProvider);
		
		const stateContainer = initStatesContainer(app, resolvedModules.uiStates);
		const uiContainer = initUIContainer();
		const eventBus = new UIEventBus();

		const ticker = {
			add: (tickerFn: any) => app.addTicker(tickerFn),
			remove: (tickerFn: any) => app.removeTicker(tickerFn)
		}

		app.add(UIStateContainer, stateContainer);
		app.add(UIEventBus, eventBus);


		app.addCoverElement(uiContainer);
		app.on("start", () => {
			renderUI(uiContainer, uiEntry, ticker, stateContainer, eventBus, textureProvider);
		})
	}
}
