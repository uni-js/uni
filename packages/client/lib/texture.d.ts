import * as PIXI from 'pixi.js';
export declare enum TextureType {
    IMAGE = 0,
    IMAGESET = 1
}
export declare function GetEmptyTexture(): PIXI.Texture<PIXI.BufferResource>;
export declare function LoadResource(url: string): Promise<PIXI.LoaderResource>;
export interface TextureItem {
    isJsonUrl: boolean;
    url: string;
    textures: PIXI.Texture[];
}
export declare class TextureProvider {
    private textures;
    constructor();
    add(name: string, url: string): Promise<void>;
    addJSON(name: string, json_url: string): Promise<void>;
    getGroup(name_pattern: string, count: number): PIXI.Texture<PIXI.Resource>[];
    get(name: string): PIXI.Texture[] | undefined;
    getOne(name: string): PIXI.Texture | undefined;
    getItem(name: string): TextureItem;
}
/**
 * resolve a texture path
 *
 * @returns [textureKey, texturePath, textureType]
 */
export declare function ParseTexturePath(texturePath: string): [string, string, TextureType] | undefined;
