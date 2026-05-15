import { IMMUTABLE_DECORATOR_KEY, type ImmutableDecoratorMetadata } from "@shared/decorators/immutable.decorator";
import { DtoClass, DtoUtils } from "@shared/utils/dto.utils";

export const ImmutableFieldUtils = {
	hasImmutableViolations<T extends DtoClass>(params: { requestDto: InstanceType<T>; databaseDto: InstanceType<T>; dtoClass: T }): boolean {
		const { requestDto, databaseDto, dtoClass } = params;

		const immutableFields: ImmutableDecoratorMetadata[] = Reflect.getOwnMetadata(IMMUTABLE_DECORATOR_KEY, dtoClass) ?? [];

		for (const { propertyKey } of immutableFields) {
			const requestValue = (requestDto as Record<string, unknown>)[propertyKey];
			const databaseValue = (databaseDto as Record<string, unknown>)[propertyKey];

			const nestedClass = DtoUtils.getNestedClass(dtoClass, propertyKey);

			if (nestedClass) {
				if (Array.isArray(requestValue) && Array.isArray(databaseValue)) {
					if (this._hasNestedArrayViolations({ requestItems: requestValue, databaseItems: databaseValue, nestedClass })) {
						return true;
					}
				} else if (requestValue && databaseValue) {
					if (this.hasImmutableViolations({ requestDto: requestValue, databaseDto: databaseValue, dtoClass: nestedClass })) {
						return true;
					}
				}
			} else {
				if (requestValue === undefined) continue;
				if (databaseValue === undefined || databaseValue === null) continue;
				if (requestValue === databaseValue) continue;

				return true;
			}
		}

		return false;
	},

	_hasNestedArrayViolations(params: { requestItems: unknown[]; databaseItems: unknown[]; nestedClass: DtoClass }): boolean {
		const { requestItems, databaseItems, nestedClass } = params;

		const hasExistingItems = databaseItems.length > 0;

		for (const requestItem of requestItems) {
			const reqItem = requestItem as Record<string, unknown>;
			const itemId = reqItem["id"] as string | undefined;

			if (!itemId) {
				if (hasExistingItems) return true;

				continue;
			}

			const dbItem = (databaseItems as Record<string, unknown>[]).find((db) => db["id"] === itemId);

			if (!dbItem) continue;

			if (this.hasImmutableViolations({ requestDto: requestItem, databaseDto: dbItem, dtoClass: nestedClass })) {
				return true;
			}
		}

		return false;
	},
} as const;
