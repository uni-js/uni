import React from "react";
import ReactDOM from "react-dom";
import { TextureProvider } from "@uni.js/texture";
import { ClientApp, PluginContext, UniClientPlugin } from "@uni.js/client"
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

function initStatesContainer(uiStateDefs: any[]) {
	return new UIStateContainer(uiStateDefs);
}
export function UIPlugin(uiEntry: any, uiStates: any[], textureProvider: TextureProvider) : UniClientPlugin {
	return function (context: PluginContext) {
		const app = context.app;
		
		const stateContainer = initStatesContainer(uiStates);
		const uiContainer = initUIContainer();
		const eventBus = new UIEventBus();

		const ticker = {
			add: (tickerFn: any) => app.addTicker(tickerFn),
			remove: (tickerFn: any) => app.removeTicker(tickerFn)
		}

		app.addCoverElement(uiContainer);
		app.on("start", () => {
			renderUI(uiContainer, uiEntry, ticker, stateContainer, eventBus, textureProvider);
		})

		return { uiStates: stateContainer, uiEventBus: eventBus };
	}
}
