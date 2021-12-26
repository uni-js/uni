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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectStore = exports.HASH_SPLIT_CHAR = exports.MapStore = exports.SetStore = void 0;
const PIXI = __importStar(require("pixi.js"));
class SetStore extends Set {
}
exports.SetStore = SetStore;
class MapStore extends Map {
}
exports.MapStore = MapStore;
exports.HASH_SPLIT_CHAR = '#';
class ObjectStore {
    constructor(initHasher) {
        this.initHasher = initHasher;
        this.container = new PIXI.Container();
        this.store = new Map();
    }
    add(item) {
        const hashes = this.getHashStrings(item);
        if (this.hasHashes(hashes))
            return;
        for (const hash of hashes) {
            this.store.set(hash, item);
        }
        this.container.addChild(item);
    }
    remove(item) {
        const hashes = this.getHashStrings(item);
        if (this.hasHashes(hashes) === false)
            return;
        for (const hash of hashes) {
            this.store.delete(hash);
        }
        this.container.removeChild(item);
    }
    get(...hashItems) {
        const hashStr = this.getSingleHashString(hashItems);
        return this.store.get(hashStr);
    }
    getAll() {
        return Array.from(this.store.values());
    }
    hasHashes(hashes) {
        for (const hash of hashes) {
            if (this.store.has(hash))
                return true;
        }
        return false;
    }
    getHashStrings(item) {
        const hasher = this.initHasher || this.hash;
        const hashed = hasher(item);
        if (Array.isArray(hashed[0])) {
            return hashed.map((hash) => {
                return this.getSingleHashString(hash);
            });
        }
        else {
            return [this.getSingleHashString(hashed)];
        }
    }
    getSingleHashString(hash) {
        return `${this.getObjectTypeName()}${exports.HASH_SPLIT_CHAR}${hash.join(exports.HASH_SPLIT_CHAR)}`;
    }
    getObjectTypeName() {
        return this.constructor.name;
    }
    hash(item) {
        return [];
    }
}
exports.ObjectStore = ObjectStore;
