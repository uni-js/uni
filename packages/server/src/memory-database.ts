import { EntityCollection, UniDatabase } from '@uni.js/database';
import { Container, inject } from 'inversify';
import LokiJS from 'lokijs';

export const MemoryDatabaseSymbol = Symbol();

export interface NotLimitCollection<T extends Record<string, any>> extends EntityCollection<T> {}

export const CAN_INJECT_COLLECTION = Symbol();

export class Entity {
	$loki?: number;
	meta?: {
		created: number;
		revision: number;
		updated: number;
		version: number;
	};
}
export interface EntityImpl {
	new (): Entity;
	name: string;
}

export function createMemoryDatabase(entities: EntityImpl[]) {
	return new UniDatabase( entities );
}
export function injectCollection(cls: any) {
	const decorate = inject(cls);
	return (target: any, targetKey: string, index?: number) => {
		if (!target[CAN_INJECT_COLLECTION])
			throw new Error(
				`class ${target.name} could not be injected a collection, only an entity manager can inject collections and update data.`,
			);

		decorate(target, targetKey, index);
	};
}

export function bindCollectionsTo(ioc: Container, entities: EntityImpl[], db: UniDatabase) {
	for (const cls of entities) {
		ioc.bind(cls).toConstantValue(db.collection(cls));
	}
}
