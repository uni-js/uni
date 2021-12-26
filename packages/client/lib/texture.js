"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParseTexturePath = exports.TextureProvider = exports.LoadResource = exports.GetEmptyTexture = exports.TextureType = void 0;
const inversify_1 = require("inversify");
const PIXI = __importStar(require("pixi.js"));
const Path = __importStar(require("path"));
const pupa_1 = __importDefault(require("pupa"));
var TextureType;
(function (TextureType) {
    TextureType[TextureType["IMAGE"] = 0] = "IMAGE";
    TextureType[TextureType["IMAGESET"] = 1] = "IMAGESET";
})(TextureType = exports.TextureType || (exports.TextureType = {}));
function GetEmptyTexture() {
    return PIXI.Texture.fromBuffer(new Uint8Array(1), 1, 1);
}
exports.GetEmptyTexture = GetEmptyTexture;
async function LoadResource(url) {
    const loader = new PIXI.Loader();
    loader.add('resource', url);
    const resource = await new Promise((resolve, reject) => {
        loader.load((loader, resources) => {
            resolve(resources['resource']);
        });
    });
    return resource;
}
exports.LoadResource = LoadResource;
let TextureProvider = class TextureProvider {
    constructor() {
        this.textures = new Map();
    }
    async add(name, url) {
        const resource = await LoadResource(url);
        const texture = resource.texture;
        this.textures.set(name, { url, isJsonUrl: false, textures: [texture] });
    }
    async addJSON(name, json_url) {
        const resource = await LoadResource(json_url);
        this.textures.set(name, { url: json_url, isJsonUrl: true, textures: Object.values(resource.textures) });
    }
    getGroup(name_pattern, count) {
        const group = [];
        for (let order = 0; order < count; order++) {
            const name = (0, pupa_1.default)(name_pattern, { order });
            const texture = this.getOne(name);
            if (!texture)
                return;
            group.push(texture);
        }
        return group;
    }
    get(name) {
        if (!this.textures.has(name))
            return;
        return this.textures.get(name)?.textures;
    }
    getOne(name) {
        const textures = this.get(name);
        if (!textures || !textures[0])
            return;
        return textures[0];
    }
    getItem(name) {
        return this.textures.get(name);
    }
};
TextureProvider = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [])
], TextureProvider);
exports.TextureProvider = TextureProvider;
/**
 * resolve a texture path
 *
 * @returns [textureKey, texturePath, textureType]
 */
function ParseTexturePath(texturePath) {
    const relPath = Path.join('texture', texturePath);
    const parsed = Path.parse(texturePath);
    const splited = parsed.name.split('.');
    const isSet = splited[splited.length - 1] == 'set';
    const isSetJson = parsed.ext === '.json';
    if (isSet) {
        const setName = splited.slice(0, splited.length - 1).join('.');
        const joined = Path.join(Path.dirname(parsed.dir), setName);
        const key = joined.replace(new RegExp('/', 'g'), '.');
        if (isSetJson)
            return [key, relPath, TextureType.IMAGESET];
    }
    else {
        const joined = Path.join(parsed.dir, parsed.name);
        const key = joined.replace(new RegExp('/', 'g'), '.');
        return [key, relPath, TextureType.IMAGE];
    }
}
exports.ParseTexturePath = ParseTexturePath;
