const UniTopClass = Symbol();
const UniEntityExtendedClass = Symbol();
const UniEntitySymbol = Symbol();
const UniEntityPropertySymbol = Symbol();

export function Property() : PropertyDecorator{
    return function (target: any, propKey: string | symbol) {
        const array = Reflect.getMetadata(UniEntityPropertySymbol, target.constructor) || [];
        array.push(propKey);
        Reflect.defineMetadata(UniEntityPropertySymbol, array, target.constructor);
    }
}

export function Entity() : ClassDecorator {
    return (target: any) => {
        const prototype = Reflect.getPrototypeOf(target);
        const superClass = isEntity(prototype) ? prototype : undefined;
        const topClass = (superClass && Reflect.getMetadata(UniTopClass, superClass)) || target;

        Reflect.defineMetadata(UniTopClass, topClass, target)
        Reflect.defineMetadata(UniEntityExtendedClass, superClass, target);
        Reflect.defineMetadata(UniEntitySymbol , true, target);
    }
}

export function isEntity(targetEntityClass: any) {
    return Reflect.hasMetadata(UniEntitySymbol, targetEntityClass);
}

export function getEntityProperties(targetEntityClass: any): string[] {
    return Reflect.getMetadata(UniEntityPropertySymbol, targetEntityClass);
}

export function getSuperEntity(targetEntityClass: any){
    return Reflect.getMetadata(UniEntityExtendedClass, targetEntityClass);
}

export function getTopEntity(targetEntityClass: any){
    return Reflect.getMetadata(UniTopClass, targetEntityClass);
}
