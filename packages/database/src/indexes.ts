export const EntityIndexesSymbol = Symbol();

export interface EntityIndex{
    propNames: string[]
}

/**
 * mark a property as a index
 * or mark a union-index
 */
export function Index(propNames?: string[]) {
    const isUnion = propNames !== undefined;

    return (target: any, propKey?: string) => {
        let indexes: Set<EntityIndex> = Reflect.getMetadata(EntityIndexesSymbol, target);
        if(!indexes){
            indexes = new Set<EntityIndex>();
            Reflect.defineMetadata(EntityIndexesSymbol, indexes, target);
        }
        if(isUnion) {
            indexes.add({
                propNames
            })
        }else{
            indexes.add({
                propNames: [ propKey ]
            })
        }
    }
}

export function getEntityIndexes(targetEntityClass: any) : EntityIndex[] {
    const indexes = Reflect.getMetadata(EntityIndexesSymbol, targetEntityClass);
    if(!indexes)return [];
    return Array.from(indexes);
}
