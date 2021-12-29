import { EntityIndex, getEntityIndexes } from "./indexes";
import { getPrivateProperties } from "./private";

export const UniEntitySymbol = Symbol();
export const UniEntityPropertySymbol = Symbol();

export interface EntityMetadata{
    indexes: EntityIndex[];
    privateProps: string[];
    properties: string[]
}

export function Property() : PropertyDecorator{
    return function (target: any, propKey: string | symbol) {
        const array = Reflect.getMetadata(UniEntityPropertySymbol, target.constructor) || [];
        array.push(propKey);
        Reflect.defineMetadata(UniEntityPropertySymbol, array, target.constructor);
    }
}

export function Entity() : ClassDecorator {
    return (target: any) => {
        Reflect.defineMetadata(UniEntitySymbol , true, target);
    }
}

export function isEntity(targetEntityClass: any) {
    return Reflect.hasMetadata(UniEntitySymbol, targetEntityClass);
}

export function getEntityProperties(targetEntityClass: any) {
    return Reflect.getMetadata(UniEntityPropertySymbol, targetEntityClass);
}

export function getEntityMetadata(targetEntityClass: any): EntityMetadata {
    return {
        indexes: getEntityIndexes(targetEntityClass),
        privateProps: getPrivateProperties(targetEntityClass),
        properties: getEntityProperties(targetEntityClass)
    };
}