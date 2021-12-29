export const EntityIndexesSymbol = Symbol();

export interface EntityIndex{
    propNames: string[]
}

/**
 * mark a property as a index
 * or mark a union-index
 */
export function Index(propNames?: string[]) {

    return (target: any, propKey?: string) => {
        const isUnion = propKey === undefined;
        const targetClass = isUnion ? target : target.constructor;

        let indexes: Set<EntityIndex> = Reflect.getMetadata(EntityIndexesSymbol, targetClass);
        if(!indexes){
            indexes = new Set<EntityIndex>();
            Reflect.defineMetadata(EntityIndexesSymbol, indexes, targetClass);
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
