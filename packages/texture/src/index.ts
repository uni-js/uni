import * as PIXI from 'pixi.js';

import { injectable } from 'inversify';
import { PluginContext, UniClientPlugin } from "@uni.js/client"

export interface ClipRect{
	left: number;
	top: number;
	width: number;
	height: number;
}

export interface TextureItem{
	relKey: string;
	fullKey: string;
	clipRect: ClipRect;
	url: string;
}

export interface TextureModule {
	baseKey: string;
	items: TextureItem[];
}

export interface TextureStoredItem {
	key: string;
	url: string;
	texture: PIXI.Texture;
}

export async function LoadResource(url: string) {
	const loader = new PIXI.Loader();
	loader.add('resource', url);

	const resource = await new Promise<PIXI.LoaderResource>((resolve, reject) => {
		loader.load((loader, resources) => {
			resolve(resources['resource']);
		});
	});

	return resource;
}


@injectable()
export class TextureProvider {
	private groupTextures = new Map<string, TextureStoredItem[]>();
	private textureMap = new Map<string, TextureStoredItem>();
	constructor() {}

	private parseKey(key: string) : [string, string] {
		const slices = key.split(".");
		const itemName = slices.pop();
		const groupKey = slices.join(".");
		return [groupKey, itemName];
	}

	async add(key: string, url: string) {
		const resource = await LoadResource(url);
		const texture = resource.texture;
		const [groupKey, name] = this.parseKey(key);

		let group = this.groupTextures.get(groupKey);
		if(!group){
			group = [];
			this.groupTextures.set(groupKey, group);
		}

		group.push({ key, texture, url });

		this.textureMap.set(key, { key, texture, url });
		this.updateGroupOrder(groupKey)
	}

	private updateGroupOrder(groupKey: string) {
		const group = this.groupTextures.get(groupKey);
		if(!group) return;

		group.sort((a,b)=>{
			if(a.key.length < b.key.length){
				return -1;
			}else if(a.key.length > b.key.length){
				return 1;
			}else{
				return a.key < b.key ? -1 : 1;
			}
		});
	}

	get(key: string): PIXI.Texture | undefined {
		return this.textureMap.get(key)?.texture;
	}

	getGroup(groupKey: string): PIXI.Texture[]{
		const group = this.groupTextures.get(groupKey);
		if(!group) return;
		return group.map((x) => (x.texture));
	}

	getUrl(key: string): string | undefined {
		return this.textureMap.get(key)?.url;

	}

	getGroupUrls(groupKey: string): string[] {
		const group = this.groupTextures.get(groupKey);
		if(!group) return;
		return group.map((x) => (x.url));
	}
}

export class TextureLoader{
	constructor(private provider: TextureProvider) { }

	/**
	 * import a texture module from specified path
	 */
	async import(module: TextureModule) {		
		for(const item of module.items){
			await this.provider.add(item.fullKey, item.url);
		}
	}

}

export interface TexturePluginOption{
	imports: TextureModule[];
}

export function TexturePlugin(option: TexturePluginOption) : UniClientPlugin {
	return async function(context: PluginContext) {
		const app = context.app;
		const textureProvider = new TextureProvider();
		
		const loader = new TextureLoader(textureProvider);
		for(const module of option.imports){
			await loader.import(module);
		}

		return textureProvider;
	}
}