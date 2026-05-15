import "reflect-metadata";
import { describe, it, expect } from "vitest";
import { Expose, Type } from "class-transformer";
import { Immutable } from "@shared/decorators/immutable.decorator";
import { ImmutableFieldUtils } from "../immutable-field.utils";

class ControllerNestedDto {
	@Expose({ name: "id" })
	id?: string;

	@Expose({ name: "legal_first_name" })
	@Immutable()
	legalFirstName?: string;

	@Expose({ name: "tax_id" })
	@Immutable()
	taxId?: string;

	@Expose({ name: "phone" })
	phone?: string;
}

class AddressNestedDto {
	@Expose({ name: "street" })
	@Immutable()
	street?: string;

	@Expose({ name: "city" })
	@Immutable()
	city?: string;
}

class RootDto {
	@Expose({ name: "legal_name" })
	@Immutable()
	legalName?: string;

	@Expose({ name: "fantasy_name" })
	@Immutable()
	fantasyName?: string;

	@Expose({ name: "email" })
	email?: string;

	@Expose({ name: "address" })
	@Immutable()
	@Type(() => AddressNestedDto)
	address?: AddressNestedDto;

	@Expose({ name: "controllers" })
	@Immutable()
	@Type(() => ControllerNestedDto)
	controllers?: ControllerNestedDto[];
}

describe("ImmutableFieldUtils", () => {
	describe("hasImmutableViolations", () => {
		it("should return false when request matches DB state (no changes)", () => {
			const databaseDto = new RootDto();
			databaseDto.legalName = "Ventairy Inc.";
			databaseDto.fantasyName = "Ventairy";

			const requestDto = new RootDto();
			requestDto.legalName = "Ventairy Inc.";
			requestDto.fantasyName = "Ventairy";

			const result = ImmutableFieldUtils.hasImmutableViolations({
				requestDto,
				databaseDto,
				dtoClass: RootDto,
			});

			expect(result).toBe(false);
		});

		it("should return false when request fields are undefined (not provided)", () => {
			const databaseDto = new RootDto();
			databaseDto.legalName = "Ventairy Inc.";

			const requestDto = new RootDto();
			requestDto.fantasyName = "New Fantasy";

			const result = ImmutableFieldUtils.hasImmutableViolations({
				requestDto,
				databaseDto,
				dtoClass: RootDto,
			});

			expect(result).toBe(false);
		});

		it("should return false when DB value was never set (null/undefined)", () => {
			const databaseDto = new RootDto();
			databaseDto.legalName = undefined;

			const requestDto = new RootDto();
			requestDto.legalName = "Ventairy Inc.";

			const result = ImmutableFieldUtils.hasImmutableViolations({
				requestDto,
				databaseDto,
				dtoClass: RootDto,
			});

			expect(result).toBe(false);
		});

		it("should return true when an immutable field is changed from a previously-set value", () => {
			const databaseDto = new RootDto();
			databaseDto.legalName = "Ventairy Inc.";

			const requestDto = new RootDto();
			requestDto.legalName = "Ventairy LLC";

			const result = ImmutableFieldUtils.hasImmutableViolations({
				requestDto,
				databaseDto,
				dtoClass: RootDto,
			});

			expect(result).toBe(true);
		});

		it("should return false when values are the same (no actual change)", () => {
			const databaseDto = new RootDto();
			databaseDto.legalName = "Ventairy Inc.";

			const requestDto = new RootDto();
			requestDto.legalName = "Ventairy Inc.";

			const result = ImmutableFieldUtils.hasImmutableViolations({
				requestDto,
				databaseDto,
				dtoClass: RootDto,
			});

			expect(result).toBe(false);
		});

		it("should short-circuit on the first violation found", () => {
			const databaseDto = new RootDto();
			databaseDto.legalName = "Ventairy Inc.";
			databaseDto.fantasyName = "Ventairy";

			const requestDto = new RootDto();
			requestDto.legalName = "Ventairy LLC";
			requestDto.fantasyName = "Not Ventairy";

			const result = ImmutableFieldUtils.hasImmutableViolations({
				requestDto,
				databaseDto,
				dtoClass: RootDto,
			});

			expect(result).toBe(true);
		});

		it("should NOT consider non-immutable fields as violations", () => {
			const databaseDto = new RootDto();
			databaseDto.email = "old@email.com";

			const requestDto = new RootDto();
			requestDto.email = "new@email.com";

			const result = ImmutableFieldUtils.hasImmutableViolations({
				requestDto,
				databaseDto,
				dtoClass: RootDto,
			});

			expect(result).toBe(false);
		});

		it("should detect violations in nested DTOs (address)", () => {
			const dbAddress = new AddressNestedDto();
			dbAddress.street = "123 Old St";

			const databaseDto = new RootDto();
			databaseDto.address = dbAddress;

			const reqAddress = new AddressNestedDto();
			reqAddress.street = "456 New Ave";

			const requestDto = new RootDto();
			requestDto.address = reqAddress;

			const result = ImmutableFieldUtils.hasImmutableViolations({
				requestDto,
				databaseDto,
				dtoClass: RootDto,
			});

			expect(result).toBe(true);
		});

		it("should allow setting nested DTO fields that were null in DB", () => {
			const databaseDto = new RootDto();
			databaseDto.address = new AddressNestedDto();

			const reqAddress = new AddressNestedDto();
			reqAddress.street = "123 Main St";

			const requestDto = new RootDto();
			requestDto.address = reqAddress;

			const result = ImmutableFieldUtils.hasImmutableViolations({
				requestDto,
				databaseDto,
				dtoClass: RootDto,
			});

			expect(result).toBe(false);
		});

		it("should detect violations in array items matched by id", () => {
			const dbController = new ControllerNestedDto();
			dbController.id = "ctrl-1";
			dbController.legalFirstName = "João";

			const databaseDto = new RootDto();
			databaseDto.controllers = [dbController];

			const reqController = new ControllerNestedDto();
			reqController.id = "ctrl-1";
			reqController.legalFirstName = "Carlos";

			const requestDto = new RootDto();
			requestDto.controllers = [reqController];

			const result = ImmutableFieldUtils.hasImmutableViolations({
				requestDto,
				databaseDto,
				dtoClass: RootDto,
			});

			expect(result).toBe(true);
		});

		it("should allow new array items (no id) when DB array is empty", () => {
			const databaseDto = new RootDto();
			databaseDto.controllers = [];

			const reqController = new ControllerNestedDto();
			reqController.legalFirstName = "New Person";

			const requestDto = new RootDto();
			requestDto.controllers = [reqController];

			const result = ImmutableFieldUtils.hasImmutableViolations({
				requestDto,
				databaseDto,
				dtoClass: RootDto,
			});

			expect(result).toBe(false);
		});

		it("should detect violations when adding new items to immutable array that has existing items", () => {
			const dbController = new ControllerNestedDto();
			dbController.id = "ctrl-1";
			dbController.legalFirstName = "João";

			const databaseDto = new RootDto();
			databaseDto.controllers = [dbController];

			const existingController = new ControllerNestedDto();
			existingController.id = "ctrl-1";
			existingController.legalFirstName = "João";

			const newController = new ControllerNestedDto();
			newController.legalFirstName = "Maria";

			const requestDto = new RootDto();
			requestDto.controllers = [existingController, newController];

			const result = ImmutableFieldUtils.hasImmutableViolations({
				requestDto,
				databaseDto,
				dtoClass: RootDto,
			});

			expect(result).toBe(true);
		});

		it("should allow setting previously null fields on existing array items", () => {
			const dbController = new ControllerNestedDto();
			dbController.id = "ctrl-1";
			dbController.legalFirstName = "João";

			const databaseDto = new RootDto();
			databaseDto.controllers = [dbController];

			const reqController = new ControllerNestedDto();
			reqController.id = "ctrl-1";
			reqController.legalFirstName = "João";
			reqController.taxId = "123.456.789-00";

			const requestDto = new RootDto();
			requestDto.controllers = [reqController];

			const result = ImmutableFieldUtils.hasImmutableViolations({
				requestDto,
				databaseDto,
				dtoClass: RootDto,
			});

			expect(result).toBe(false);
		});

		it("should return false when all fields are undefined in both request and DB", () => {
			const databaseDto = new RootDto();
			const requestDto = new RootDto();

			const result = ImmutableFieldUtils.hasImmutableViolations({
				requestDto,
				databaseDto,
				dtoClass: RootDto,
			});

			expect(result).toBe(false);
		});
	});
});
