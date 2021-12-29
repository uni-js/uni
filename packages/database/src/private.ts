
export const PropertyPrivateSymbol = Symbol();

/**
 * mark a property as private,
 * it will not be serialized
 * when the entity is transported through the network 
 */
export function Private() : PropertyDecorator {
    return (target: any, propKey: string | symbol) => {
        Reflect.defineMetadata(PropertyPrivateSymbol, true, target, propKey);
    }
}

export function getPrivateProperties(targetEntityClass: any) {
    const props: string[] = [];
    const keys = Reflect.ownKeys(targetEntityClass);
    for(const key of keys){
        if(typeof(key) === "symbol") continue;
        const hasMarked = Reflect.getMetadata(PropertyPrivateSymbol, targetEntityClass, key);
        if(hasMarked) {
            props.push(key)
        }
    }
    return props;
}