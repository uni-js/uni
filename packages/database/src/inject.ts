import { inject } from "inversify";

export const CAN_INJECT_COLLECTION = Symbol();

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
