import { EntityIndex } from "./indexes";
import { getTopEntity, isEntity } from "./entity";
import { EntityMetadata, getEntityMetadata } from "./metadata";
import { UniEntity, UniEntityPart, UniEntityWithOptionalId } from ".";

const HashKeySplitChar = "#";

function buildIndexKey(propNames: string[], types: string[], values: (string | number)[]): string {
    let key = '';
    for (let i = 0; i < types.length; i++) {
        key += propNames[i] + HashKeySplitChar + types[i] + HashKeySplitChar + values[i] + HashKeySplitChar;
    }

    return key;
}

export class UniMemoryDatabase {
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

export class EntityCollection<T extends UniEntity = any> {
    private indexes: Set<EntityIndex> = new Set<EntityIndex>()
    private indexMap: Map<string, Set<any>> = new Map();
    private reverseIndexMap: Map<any, string[]> = new Map();
    private matchedIndexes: EntityIndex[];
    private idCount: number = 0;
    private idMap: Map<number, any> = new Map();

    constructor(private metadata: EntityMetadata) {
        
        this.indexes = new Set();
        for (const index of metadata.indexes) {
            this.indexes.add({propNames: index.propNames})
        }

        this.matchedIndexes = this.getMatchedIndexesInPropNames(metadata.properties);
    }
    
    insert(entities: UniEntityWithOptionalId<T>[]): void {
        for(const entity of entities){
            this.insertOne(entity);
        }
    }

    insertOne(entity: UniEntityWithOptionalId<T>): T & UniEntityPart {
        this.reverseIndexMap.set(entity, []);
                
        for (const index of this.matchedIndexes) {
            const values: string[] = [];
            for (const prop of index.propNames) {
                values.push(entity[prop]);
            }

            this.addNewIndex(index.propNames, values, entity);
        }

        (<any>entity).id = this.idCount++;
        this.idMap.set(entity.id, entity)
        
        return <T & UniEntityPart> entity;
    }

    /**
     * find entities by `query` condition
     * 
     * * BE AWARE: `query` condition must match a index
     */
    find(query: Partial<T & UniEntityPart>): (T & UniEntityPart)[] {
        const names = Object.getOwnPropertyNames(query);        
        if(query.id !== undefined){
            return [this.idMap.get(query.id)];
        }

        let indexKey = '';
        for(const name of names){
            const value = query[name];
            const type = typeof(value);
            if(type !== "string" && type !== "number" && type !== "boolean" && type !== "undefined")
                throw new Error(`value type must be string/number/boolean/undefined`);

            indexKey += name + HashKeySplitChar + type + HashKeySplitChar + value + HashKeySplitChar;
        }

        const results = this.indexMap.get(indexKey);
        if(results === undefined) return [];
        return Array.from(results.values());
    }

    update(entity: UniEntityWithOptionalId<T>) {
        if(entity.id === undefined){
            this.insertOne(entity);
        }else{
            this.removeEntitiesIndexes([entity]);
            this.updateEntity(entity, entity);
        }
        return entity;
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

    private updateEntity(entity: UniEntityWithOptionalId<T>, updateAction: Partial<T>) {
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

        if(this.reverseIndexMap.size === 0){
            this.reverseIndexMap.delete(entity);
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
    findOne(query: Partial<T & UniEntityPart>): T & UniEntityPart {
        return this.find(query)[0];
    }

    findAndUpdate(findQuery: Partial<T & UniEntityPart>, updateAction: Partial<T>): void {
        const entities = this.find(findQuery);
        if (!entities) return;
        if(entities[0] === undefined) return;

        this.removeEntitiesIndexes(entities);

        for(const entity of entities){ // rebuild indexes
            this.updateEntity(entity, updateAction);
        }
    }

    findAndRemove(findQuery: Partial<T & UniEntityPart>): void {
        return this.removeWhere(findQuery);
    }

    removeWhere(findQuery: Partial<T & UniEntityPart>): void{
        const entities = this.find(findQuery);
        if (!entities) return;

        this.removeEntitiesIndexes(entities);
        for(const entity of entities){
            this.idMap.delete(entity.id);
        }
    }

    remove(entity: UniEntityWithOptionalId<T>){
        if(entity.id === undefined) return;

        this.removeEntitiesIndexes([entity]);
        this.idMap.delete(entity.id);
    }

    private removeEntitiesIndexes(entities: UniEntityWithOptionalId<T>[]){
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
