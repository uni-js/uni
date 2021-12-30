export const EntityIndexesSymbol = Symbol();

export interface EntityIndex{
    propNames: string[]
}

function isArraysEqual(a: any, b: any) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    for (var i = 0; i < a.length; ++i) {
        if (!a.includes(b[i])) return false;
    }
    return true;
}

/**
 * mark a property as a index
 * or mark a union-index
 */
export function Index(propNames?: string[]) {

    return (target: any, propKey?: string) => {
        const isUnion = propKey === undefined;
        const targetClass = isUnion ? target : target.constructor;

        let indexes: EntityIndex[] = Reflect.getMetadata(EntityIndexesSymbol, targetClass) || [];
        const indexPropNames = isUnion ? propNames : [ propKey ];

        let exists = false;
        for(const oldIndex of indexes){
            if(isArraysEqual(oldIndex, indexes)){
                exists = true;
                break;
            }

        }
        
        if(!exists){
            indexes.push({ propNames: indexPropNames });
        }

        Reflect.defineMetadata(EntityIndexesSymbol, indexes, targetClass);
    }
}

export function getEntityIndexes(targetEntityClass: any) : EntityIndex[] {
    return Reflect.getMetadata(EntityIndexesSymbol, targetEntityClass) || [];
}
