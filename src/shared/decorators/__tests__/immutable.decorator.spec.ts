import "reflect-metadata";
import { describe, it, expect } from "vitest";
import { Immutable, IMMUTABLE_DECORATOR_KEY } from "../immutable.decorator";

describe("ImmutableDecorator", () => {
	it("should store metadata on the class constructor", () => {
		class TestDto {
			@Immutable()
			fieldOne?: string;

			@Immutable()
			fieldTwo?: string;

			nonImmutableField?: string;
		}

		const metadata: { propertyKey: string }[] = Reflect.getOwnMetadata(IMMUTABLE_DECORATOR_KEY, TestDto);

		expect(metadata).toBeDefined();
		expect(metadata).toHaveLength(2);
		expect(metadata).toEqual(
			expect.arrayContaining([
				{ propertyKey: "fieldOne" },
				{ propertyKey: "fieldTwo" },
			]),
		);
	});

	it("should handle a single immutable field", () => {
		class SingleDto {
			@Immutable()
			name?: string;
		}

		const metadata: { propertyKey: string }[] = Reflect.getOwnMetadata(IMMUTABLE_DECORATOR_KEY, SingleDto);

		expect(metadata).toHaveLength(1);
		expect(metadata[0]!.propertyKey).toBe("name");
	});

	it("should not include non-annotated fields", () => {
		class MixedDto {
			@Immutable()
			immutableField?: string;

			mutableField?: string;

			@Immutable()
			anotherImmutable?: string;
		}

		const metadata: { propertyKey: string }[] = Reflect.getOwnMetadata(IMMUTABLE_DECORATOR_KEY, MixedDto);

		expect(metadata).toHaveLength(2);
		expect(metadata.map((m) => m.propertyKey)).not.toContain("mutableField");
		expect(metadata.map((m) => m.propertyKey)).toContain("immutableField");
		expect(metadata.map((m) => m.propertyKey)).toContain("anotherImmutable");
	});

	it("should not leak metadata between different classes", () => {
		class ClassA {
			@Immutable()
			fieldA?: string;
		}

		class ClassB {
			@Immutable()
			fieldB?: string;
		}

		const metadataA: { propertyKey: string }[] = Reflect.getOwnMetadata(IMMUTABLE_DECORATOR_KEY, ClassA);
		const metadataB: { propertyKey: string }[] = Reflect.getOwnMetadata(IMMUTABLE_DECORATOR_KEY, ClassB);

		expect(metadataA).toHaveLength(1);
		expect(metadataA[0]!.propertyKey).toBe("fieldA");

		expect(metadataB).toHaveLength(1);
		expect(metadataB[0]!.propertyKey).toBe("fieldB");
	});

	it("should use Reflect.getOwnMetadata not Reflect.getMetadata to avoid prototype chain leaks", () => {
		class Parent {
			@Immutable()
			parentField?: string;
		}

		class Child extends Parent {
			@Immutable()
			childField?: string;
		}

		const parentMetadata: { propertyKey: string }[] = Reflect.getOwnMetadata(IMMUTABLE_DECORATOR_KEY, Parent);
		const childMetadata: { propertyKey: string }[] = Reflect.getOwnMetadata(IMMUTABLE_DECORATOR_KEY, Child);

		expect(parentMetadata).toHaveLength(1);
		expect(parentMetadata[0]!.propertyKey).toBe("parentField");

		expect(childMetadata).toHaveLength(1);
		expect(childMetadata[0]!.propertyKey).toBe("childField");
	});

	it("should return an empty array when no fields are annotated", () => {
		class NoImmutableDto {
			fieldOne?: string;
			fieldTwo?: string;
		}

		const metadata: { propertyKey: string }[] = Reflect.getOwnMetadata(IMMUTABLE_DECORATOR_KEY, NoImmutableDto);

		expect(metadata).toBeUndefined();
	});
});
