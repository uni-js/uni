import { EntityIndex } from "./indexes";
import { getTopEntity, isEntity } from "./entity";
import { EntityMetadata, getEntityMetadata } from "./metadata";

const HashKeySplitChar = "#";

function buildIndexKey(propNames: string[], types: string[], values: (string | number)[]): string {
    let key = '';
    for (let i = 0; i < types.length; i++) {
        key += propNames[i] + HashKeySplitChar + types[i] + HashKeySplitChar + values[i] + HashKeySplitChar;
    }

    return key;
}

export class UniDatabase {
    private collections = new Map<any, EntityCollection>();

    constructor(private entityClasses: any[]) {
        for(const clazz of entityClasses){
            this.addCollection(clazz);
        }
    }
    
    private addCollection(entityClass: any) {
        if(!isEntity(entityClass))
            throw new Error(`must be an entity`);

        const topEntity = getTopEntity(entityClass);
        if(topEntity === entityClass){
            const metadata = getEntityMetadata(entityClass);
            this.collections.set(entityClass, new EntityCollection(metadata));
        }
    }

    collection(entityClass: any){
        const topEntity = getTopEntity(entityClass);
        return this.collections.get(topEntity);
    }

    removeCollection(entityClass: any){
        this.collections.delete(entityClass);        
    }
}

export class EntityCollection {
    private indexes: Set<EntityIndex> = new Set<EntityIndex>()
    private indexMap: Map<string, Set<any>> = new Map();
    private reverseIndexMap: Map<any, string[]> = new Map();
    private matchedIndexes: EntityIndex[];
    private idCount: number = 0;
    private idMap: Map<number, any> = new Map();

    constructor(metadata: EntityMetadata) {
        
        this.indexes = new Set();
        for (const index of metadata.indexes) {
            this.indexes.add({propNames: index.propNames})
        }

        this.matchedIndexes = this.getMatchedIndexesInPropNames(metadata.properties);
    }

    insertOne(entity: any): void {
        this.reverseIndexMap.set(entity, []);
                
        for (const index of this.matchedIndexes) {
            const values: string[] = [];
            for (const prop of index.propNames) {
                values.push(entity[prop]);
            }

            this.addNewIndex(index.propNames, values, entity);
        }

        entity.id = this.idCount++;
        this.idMap.set(entity.id, entity)
        
    }

    /**
     * find entities by `query` condition
     * 
     * * BE AWARE: `query` condition must match a index
     */
    find(query: any): any[] {
        const names = Object.getOwnPropertyNames(query);        
        if(query.id !== undefined){
            return [this.idMap.get(query.id)];
        }

        let indexKey = '';
        for(const name of names){
            const value = query[name];
            const type = typeof(value);
            if(type !== "string" && type !== "number" && type !== "undefined")
                throw new Error(`value type must be string/number/undefined`);

            indexKey += name + HashKeySplitChar + type + HashKeySplitChar + value + HashKeySplitChar;
        }

        const results = this.indexMap.get(indexKey);
        if(results === undefined) return [];
        return Array.from(results.values());
    }

    update(entity: any) {
        if(entity.id === undefined){
            entity.id = this.idCount++;
            this.idMap.set(entity.id, entity);
        }
        this.updateEntity(entity, entity)
    }

    /**
     * only for test
     * @deprecated
     */
    test_getIndexSize() {
        return {
            indexSize: this.indexMap.size,
            idSize: this.idMap.size,
            reverseSize: this.reverseIndexMap.size        
        };
    }

    private updateEntity(entity: any, updateAction: any) {
        this.reverseIndexMap.set(entity, []);
        for (const index of this.matchedIndexes) {
            const values: string[] = [];
            for (const prop of index.propNames) {
                if(updateAction[prop] !== undefined){
                    values.push(updateAction[prop]);
                }else{
                    values.push(entity[prop])
                }
            }

            this.addNewIndex(index.propNames, values, entity);
        }

        for(const prop in updateAction){
            entity[prop] = updateAction[prop];
        }
    }

    /**
     * find an entity by `query` condition
     * 
     * * BE AWARE: `query` condition must match a index
     */
    findOne(query: any): any {
        return this.find(query)[0];
    }

    findAndUpdate(findQuery: any, updateAction: any): void {
        const entities = this.find(findQuery);
        if (!entities) return;
        if(entities[0] === undefined) return;

        this.removeEntitiesIndexes(entities);

        for(const entity of entities){ // rebuild indexes
            this.updateEntity(entity, updateAction);
        }
    }

    findAndRemove(findQuery: any): void{
        const entities = this.find(findQuery);
        if (!entities) return;

        this.removeEntitiesIndexes(entities);
        for(const entity of entities){
            this.idMap.delete(entity.id);
        }
    }

    private removeEntitiesIndexes(entities: any[]){
        for(const entity of entities) {
            for(const index of this.reverseIndexMap.get(entity)){
                const set = this.indexMap.get(index);
                set.delete(entity);
                if(set.size === 0){
                    this.indexMap.delete(index);
                }
            }
            this.reverseIndexMap.delete(entity);
        }
    }

    private addNewIndex(propNames: string[], values: string[], object: any): void {

        const types: string[] = [];
        const strValues: string[] = []

        for (const value of values) {
            types.push(typeof(value));
            strValues.push(value);
        }
        const indexKey = buildIndexKey(propNames, types, strValues);

        let set = this.indexMap.get(indexKey);
        if(set === undefined){
            set = new Set();
            this.indexMap.set(indexKey, set);
        }

        set.add(object);
        this.reverseIndexMap.get(object).push(indexKey);
    }

    private getMatchedIndexesInPropNames(propNames: string[]): EntityIndex[] {
        const result: EntityIndex[] = [];
        for (const index of this.indexes.values()) {
            let exists = false;
            for (const prop of index.propNames) {
                if (propNames.includes(prop)) {
                    exists = true;
                    break;
                }
            }
            if (!exists) continue;
                
            result.push(index)
        }
        return result;
    }
}