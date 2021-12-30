import { getSuperEntity, getTopEntity } from "./entity";

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

        let indexes: EntityIndex[] = Reflect.getMetadata(EntityIndexesSymbol, targetClass);
        if(!indexes){
            indexes = [];
            Reflect.defineMetadata(EntityIndexesSymbol, indexes, targetClass);
        }
        if(isUnion) {
            indexes.push({
                propNames
            })
        }else{
            indexes.push({
                propNames: [ propKey ]
            })
        }
    }
}

export function getEntityIndexes(targetEntityClass: any) : EntityIndex[] {
    return Reflect.getMetadata(EntityIndexesSymbol, targetEntityClass) || [];
}
