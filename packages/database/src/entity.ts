import { EntityIndexesSymbol } from "./indexes"

const UniTopClass = Symbol();
const UniEntityExtendedClass = Symbol();
const UniEntitySymbol = Symbol();
const UniEntityPropertySymbol = Symbol();

export interface UniEntityPart{
    id: number;
}

export interface UniEntity{
    [key: string]: any;
}

export type UniEntityWithOptionalId<T extends UniEntity> = T & Partial<UniEntityPart>

export function Property() : PropertyDecorator{
    return function (target: any, propKey: string | symbol) {
        const array = Reflect.getMetadata(UniEntityPropertySymbol, target.constructor) || [];
        if(!array.includes(propKey))
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

        if(!Reflect.hasMetadata(UniEntityPropertySymbol, target)){
            Reflect.defineMetadata(UniEntityPropertySymbol, [], target)
        }
        
        if(!Reflect.hasMetadata(EntityIndexesSymbol, target)){
            Reflect.defineMetadata(EntityIndexesSymbol, [], target)
        }
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
    try{
        return Reflect.getMetadata(UniTopClass, targetEntityClass);
    }catch(err){
        throw new Error(`can not get the top class of : ${targetEntityClass.name} type: ${typeof(targetEntityClass)}`)
    }
}
