import { EventMap } from "@uni.js/event";
import { ServerSideManager } from "@uni.js/server";
import { UniEntityWithOptionalId } from ".";
import { EntityCollection } from "./database";
import { UniEntity, UniEntityPart } from "./entity";
import { CAN_INJECT_COLLECTION } from "./inject";

type ClassOf<T> = { new (...args: any[]): T };


export interface AddEntityEvent<T = any>{
	entityId: number;
	entity: T;	
}

export interface RemoveEntityEvent<T = any>{
	entityId: number;
	entity: T;	
}

export interface EntityBaseEvent<T = any> {
	"AddEntityEvent": AddEntityEvent<T>;
	"RemoveEntityEvent": RemoveEntityEvent<T>;
}

export interface NotLimitCollection<T extends Record<string, any>> extends EntityCollection<T> {}

export type ObjectQueryCondition<T extends UniEntity> =  Partial<T & UniEntityPart>;

export interface UpdateOnlyCollection<T extends Record<string, any>> extends NotLimitCollection<T> {
	/**
	 * @deprecated use removeEntity method of a entity manager to remove an entity
	 */
	remove(entity: any): any;

	/**
	 * @deprecated use removeEntity method of a entity manager to remove an entity
	 */
	removeWhere(query: any): any;

	/**
	 * @deprecated use removeEntity method of a entity manager to remove an entity
	 */
	findAndRemove(query: any): any;

	/**
	 * @deprecated use addEntity method of a entity manager to add an entity
	 */
	insert(entities: any[]): any;

	/**
	 * @deprecated use addEntity method of a entity manager to add an entity
	 */
	insertOne(entity: any): any;
}

export interface IEntityManager<K, E extends EntityBaseEvent<K>> extends ServerSideManager<E> {
	getEntityById(entityId: number): ReadonlyUniEntity<K>;
	findEntity(query: ObjectQueryCondition<K>): ReadonlyUniEntity<K>;
	findEntities(query?: ObjectQueryCondition<K>): ReadonlyUniEntity<K>[];
	getAllEntities(): ReadonlyUniEntity<K>[];
	hasEntity(query?: ObjectQueryCondition<K>): boolean;
	addNewEntity(newEntity: K): ReadonlyUniEntity<K>;
	addNewEntities(newEntities: K[]): void;
	removeEntity(entity: K): void;
}

export type ReadonlyUniEntity<T> = Readonly<T & UniEntityPart>

/**
 * entity manager is designed for managing one type of entity
 */
export class EntityManager<T extends UniEntity, E extends EntityBaseEvent<T> = any> extends ServerSideManager<E> {
	static [CAN_INJECT_COLLECTION] = true;

	private emitter: ServerSideManager<EntityBaseEvent<T>> = this;
	private entityList: NotLimitCollection<T>;

	/**
	 * @param listOrManager the entity set which is managed
	 */
	constructor(entityList: UpdateOnlyCollection<T>) {
		super();

		this.entityList = entityList;
	}

	getEntityList(): NotLimitCollection<T> {
		return this.entityList;
	}

	addNewEntities(newEntities: T[]): ReadonlyUniEntity<T> [] {
		return newEntities.map((newEntity) => {
			return this.addNewEntity(newEntity);
		});
	}

	getEntityById(entityId: number): ReadonlyUniEntity<T> {
		return this.entityList.findOne({
			id: entityId
		} as any);
	}

	findEntity(query: ObjectQueryCondition<T>): ReadonlyUniEntity<T> {
		return this.entityList.findOne(query as any);
	}

	findEntities(query?: ObjectQueryCondition<T>): ReadonlyUniEntity<T>[] {
		return this.entityList.find(query as any);
	}

	/**
	 * @deprecated
	 */
	getAllEntities(): ReadonlyUniEntity<T>[] {
		throw new Error(`not implemented`)
	}

	hasEntity(query?: ObjectQueryCondition<T>) {
		return Boolean(this.findEntity(query));
	}

	addNewEntity(newEntity: UniEntityWithOptionalId<T>): ReadonlyUniEntity<T> {
		const insertedEntity = this.entityList.insertOne(newEntity);
		this.emitter.emit("AddEntityEvent", { entityId: insertedEntity.id, entity: insertedEntity });
		return insertedEntity;
	}

	removeEntity(entity: UniEntityWithOptionalId<T>) {
		const entityId = entity.id;
		this.entityList.remove(entity);
		
		this.emitter.emit("RemoveEntityEvent", {
			entity: entity as any,
			entityId: entityId as any,
		});
	}

	updateEntity(entity: UniEntityWithOptionalId<T>) {
		this.entityList.update(entity);
	}

}

export class ExtendedEntityManager<
	T extends UniEntity, 
	K extends T, 
	KE extends EntityBaseEvent<K> = any
> extends ServerSideManager<KE> implements IEntityManager<K, KE> {
	private emitter: ServerSideManager<EntityBaseEvent<T>> = this;

	constructor(private manager: EntityManager<T>, private clazz: ClassOf<K>) {
		super();
	}

	addNewEntities(newEntities: K[]) {
		return this.manager.addNewEntities(newEntities);
	}

	getEntityById(entityId: number) {
		return this.manager.getEntityById(entityId) as ReadonlyUniEntity<K>;
	}

	protected updateEntity<M extends K | T>(entity: M): Readonly<M> {
		const list = this.manager.getEntityList();
		return list.update(entity) as M;
	}

	findEntity(query: ObjectQueryCondition<K>) {
		return this.manager.findEntity(query) as ReadonlyUniEntity<K>;
	}

	findEntities(query?: ObjectQueryCondition<K>) {
		return this.manager.findEntities(query) as ReadonlyUniEntity<K>[];
	}

	getAllEntities() {
		return this.manager.getAllEntities() as ReadonlyUniEntity<K>[];
	}

	hasEntity(query?: ObjectQueryCondition<K>): boolean {
		return this.manager.hasEntity(query);
	}

	addNewEntity(newEntity: K) {
		const inserted = this.manager.addNewEntity(newEntity);

		if (inserted instanceof this.clazz) {
			this.emitter.emit("AddEntityEvent", { entityId: newEntity.id, entity: newEntity });
		}
		return inserted as ReadonlyUniEntity<K>;
	}

	removeEntity(entity: K): void {
		const entityId = entity.id;
		this.manager.removeEntity(entity);

		if (<any>entity instanceof this.clazz) {
			this.emitter.emit("RemoveEntityEvent", { entityId, entity });
		}
	}

	getEntityList(): NotLimitCollection<T> {
		return this.manager.getEntityList();
	}
}
