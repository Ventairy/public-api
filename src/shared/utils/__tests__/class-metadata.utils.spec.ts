import "reflect-metadata";
import { describe, it, expect } from "vitest";
import { Expose, Type } from "class-transformer";

class TestAddressDto {
	@Expose({ name: "country_code" })
	countryCode?: string;

	@Expose({ name: "street" })
	street?: string;
}

class TestNestedDto {
	@Expose({ name: "name" })
	name?: string;

	@Expose({ name: "address" })
	@Type(() => TestAddressDto)
	address?: TestAddressDto;
}

class TestRootDto {
	@Expose({ name: "legal_name" })
	legalName?: string;

	@Expose({ name: "email" })
	email?: string;

	@Expose({ name: "nested" })
	@Type(() => TestNestedDto)
	nested?: TestNestedDto;

	@Expose({ name: "skip_me" })
	skipMe?: string;
}

describe("ClassMetadataUtils", () => {
	describe("getExposeName", () => {
		it("should return the expose name for a property", async () => {
			const { DtoUtils: ClassMetadataUtils } = await import("../dto.utils");

			expect(ClassMetadataUtils.getExposeName(TestRootDto, "legalName")).toBe("legal_name");
			expect(ClassMetadataUtils.getExposeName(TestRootDto, "email")).toBe("email");
			expect(ClassMetadataUtils.getExposeName(TestAddressDto, "countryCode")).toBe("country_code");
		});

		it("should return null for a property without @Expose", async () => {
			const { DtoUtils: ClassMetadataUtils } = await import("../dto.utils");

			class PlainDto {
				noExpose?: string;
			}

			expect(ClassMetadataUtils.getExposeName(PlainDto, "noExpose")).toBeNull();
		});
	});

	describe("getNestedClass", () => {
		it("should return the nested class for @Type decorated property", async () => {
			const { DtoUtils: ClassMetadataUtils } = await import("../dto.utils");

			const nestedClass = ClassMetadataUtils.getNestedClass(TestRootDto, "nested");
			expect(nestedClass).toBe(TestNestedDto);
		});

		it("should return null for a property without @Type", async () => {
			const { DtoUtils: ClassMetadataUtils } = await import("../dto.utils");

			expect(ClassMetadataUtils.getNestedClass(TestRootDto, "legalName")).toBeNull();
		});
	});

	describe("collectFieldPaths", () => {
		it("should collect paths for all exposed properties when filter always returns true", async () => {
			const { DtoUtils: ClassMetadataUtils } = await import("../dto.utils");

			const paths = ClassMetadataUtils.mapFieldsToPath({ dto: TestRootDto, filter: () => true, pathPrefix: "root" });

			expect(paths).toContain("root.legal_name");
			expect(paths).toContain("root.email");
			expect(paths).toContain("root.skip_me");
		});

		it("should traverse nested DTOs via @Type", async () => {
			const { DtoUtils: ClassMetadataUtils } = await import("../dto.utils");

			const paths = ClassMetadataUtils.mapFieldsToPath({ dto: TestRootDto, filter: () => true, pathPrefix: "root" });

			expect(paths).toContain("root.legal_name");
			expect(paths).toContain("root.nested.name");
			expect(paths).toContain("root.nested.address.country_code");
			expect(paths).toContain("root.nested.address.street");
		});

		it("should filter properties using the filter function", async () => {
			const { DtoUtils: ClassMetadataUtils } = await import("../dto.utils");

			const paths = ClassMetadataUtils.mapFieldsToPath({
				dto: TestRootDto,
				filter: (_dtoClass, propertyKey) => propertyKey !== "skipMe",
				pathPrefix: "root",
			});

			expect(paths).toContain("root.legal_name");
			expect(paths).toContain("root.nested.name");
			expect(paths).not.toContain("root.skip_me");
		});

		it("should not recurse into nested DTOs that fail the filter", async () => {
			const { DtoUtils: ClassMetadataUtils } = await import("../dto.utils");

			const paths = ClassMetadataUtils.mapFieldsToPath({
				dto: TestRootDto,
				filter: (_dtoClass, propertyKey) => propertyKey === "skipMe",
				pathPrefix: "root",
			});

			expect(paths).toContain("root.skip_me");
			expect(paths).not.toContain("root.legal_name");
			expect(paths).not.toContain("root.nested");
		});
	});

	describe("resolvePath", () => {
		it("should resolve a wire-format path using @Expose metadata", async () => {
			const { DtoUtils: ClassMetadataUtils } = await import("../dto.utils");

			class TestDto {
				@Expose({ name: "my_field" })
				myField?: string;
			}

			const dto = new TestDto();
			dto.myField = "hello";

			expect(ClassMetadataUtils.isPathFieldDefined(dto, "my_field")).toBe(true);
		});

		it("should return false for null/undefined values", async () => {
			const { DtoUtils: ClassMetadataUtils } = await import("../dto.utils");

			class TestDto {
				@Expose({ name: "my_field" })
				myField?: string;
			}

			const dto = new TestDto();
			dto.myField = undefined;

			expect(ClassMetadataUtils.isPathFieldDefined(dto, "my_field")).toBe(false);
			expect(ClassMetadataUtils.isPathFieldDefined(null, "my_field")).toBe(false);
			expect(ClassMetadataUtils.isPathFieldDefined(undefined, "my_field")).toBe(false);
		});

		it("should resolve nested paths", async () => {
			const { DtoUtils: ClassMetadataUtils } = await import("../dto.utils");

			class InnerDto {
				@Expose({ name: "value" })
				value?: string;
			}

			class OuterDto {
				@Expose({ name: "inner" })
				@Type(() => InnerDto)
				inner?: InnerDto;
			}

			const dto = new OuterDto();
			dto.inner = new InnerDto();
			dto.inner.value = "present";

			expect(ClassMetadataUtils.isPathFieldDefined(dto, "inner.value")).toBe(true);
		});
	});
});
