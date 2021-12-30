import { getEntityProperties } from "./entity";
import { EntityIndex, getEntityIndexes } from "./indexes";
import { getPrivateProperties } from "./private";

export interface EntityMetadata{
    indexes: EntityIndex[];
    privateProps: string[];
    properties: string[];
}


export function getEntityMetadata(targetEntityClass: any): EntityMetadata {
    return {
        indexes: getEntityIndexes(targetEntityClass),
        privateProps: getPrivateProperties(targetEntityClass),
        properties: getEntityProperties(targetEntityClass),
    };
}