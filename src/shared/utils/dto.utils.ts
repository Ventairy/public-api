// @ts-expect-error - internal module, types not exported
import { defaultMetadataStorage } from "class-transformer/cjs/storage";

type DtoClass<T = unknown> = new (...args: T[]) => T;

function snakeToCamel(str: string): string {
	return str.replace(/_([a-z])/g, (_: string, letter: string) => letter.toUpperCase());
}

export const DtoUtils = {
	getExposeName(target: DtoClass, propertyKey: string): string | null {
		const metadata = defaultMetadataStorage.findExposeMetadata(target, propertyKey);
		return metadata?.options?.name ?? null;
	},

	getNestedClass(target: DtoClass, propertyKey: string): DtoClass | null {
		const metadata = defaultMetadataStorage.findTypeMetadata(target, propertyKey);
		if (!metadata?.typeFunction) return null;
		const nestedClass = metadata.typeFunction();

		return typeof nestedClass === "function" ? (nestedClass as DtoClass) : null;
	},

	mapFieldsToPath(params: {
		dto: DtoClass;
		filter: (dtoClass: DtoClass, propertyKey: string) => boolean;
		pathPrefix?: string;
	}): string[] {
		const paths: string[] = [];

		const { dto: dtoClass, filter, pathPrefix: prefix } = params;

		const propertyKeys = defaultMetadataStorage
			.getExposedMetadatas(dtoClass)
			.map((m: { propertyName: string }) => m.propertyName as string);

		for (const propertyKey of propertyKeys) {
			if (!filter(dtoClass, propertyKey)) continue;

			const wireName = this.getExposeName(dtoClass, propertyKey);
			if (!wireName) continue;

			const fullPath = prefix ? `${prefix}.${wireName}` : wireName;
			const nestedClass = this.getNestedClass(dtoClass, propertyKey);

			if (nestedClass) {
				const childPaths = this.mapFieldsToPath({ dto: nestedClass, filter, pathPrefix: fullPath });
				paths.push(...childPaths);
			} else {
				paths.push(fullPath);
			}
		}

		return paths;
	},

	isPathFieldDefined(obj: unknown, path: string): boolean {
		if (!obj || typeof obj !== "object") return false;

		const parts = path.split(".");
		let value: unknown = obj;

		for (const part of parts) {
			if (value == null || typeof value !== "object") return false;

			const targetClass = (value as object).constructor as DtoClass;
			const exposeMetadata = defaultMetadataStorage.findExposeMetadataByCustomName(targetClass, part);
			const propertyKey = exposeMetadata?.propertyName ?? snakeToCamel(part);

			value = (value as Record<string, unknown>)[propertyKey];
		}

		return !!value;
	},
} as const;
