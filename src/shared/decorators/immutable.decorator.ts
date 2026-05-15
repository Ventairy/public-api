export const IMMUTABLE_DECORATOR_KEY = "immutable";

export interface ImmutableDecoratorMetadata {
	propertyKey: string;
}

export function Immutable(): PropertyDecorator {
	return (target: object, propertyKey: string | symbol): void => {
		const constructor = target.constructor;

		const existing: ImmutableDecoratorMetadata[] = Reflect.getOwnMetadata(IMMUTABLE_DECORATOR_KEY, constructor) ?? [];

		Reflect.defineMetadata(IMMUTABLE_DECORATOR_KEY, [...existing, { propertyKey: String(propertyKey) }], constructor);
	};
}
