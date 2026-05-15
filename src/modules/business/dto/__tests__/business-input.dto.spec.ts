import "reflect-metadata";
import { describe, it, expect } from "vitest";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { BusinessInputDto } from "../business-input.dto";
import type { BusinessDatabaseRow } from "@db/schema/businesses-table";
import type { BusinessControllerDatabaseRow } from "@db/schema/business-controllers-table";

describe("BusinessInputDto", () => {
	describe("fromDatabaseRow", () => {
		it("should map business fields from the database row", () => {
			const row = {
				legal_name: "Ventairy Inc.",
				fantasy_name: "Ventairy",
				formation_date: "2020-01-15",
				email: "contact@ventairy.com",
				tax_id: "12.345.678/0001-90",
				phone_number: "+5511999990000",
				website: "https://ventairy.com",
			} as BusinessDatabaseRow;

			const dto = BusinessInputDto.fromDatabaseRow(row, []);

			expect(dto.legalName).toBe("Ventairy Inc.");
			expect(dto.fantasyName).toBe("Ventairy");
			expect(dto.formationDate).toBe("2020-01-15");
			expect(dto.email).toBe("contact@ventairy.com");
			expect(dto.taxId).toBe("12.345.678/0001-90");
			expect(dto.phoneNumber).toBe("+5511999990000");
			expect(dto.website).toBe("https://ventairy.com");
		});

		it("should map address nested DTO from flattened DB fields", () => {
			const row = {
				country_code: "BR",
				street: "123 Main St",
				city: "Sao Paulo",
			} as BusinessDatabaseRow;

			const dto = BusinessInputDto.fromDatabaseRow(row, []);
			expect(dto.address).toBeDefined();
			expect(dto.address?.countryCode).toBe("BR");
			expect(dto.address?.street).toBe("123 Main St");
			expect(dto.address?.city).toBe("Sao Paulo");
		});

		it("should map controllers from controller rows", () => {
			const row = {} as BusinessDatabaseRow;
			const controllerRows = [
				{ id: "ctrl-1", legal_first_name: "João" },
				{ id: "ctrl-2", legal_first_name: "Maria" },
			] as BusinessControllerDatabaseRow[];

			const dto = BusinessInputDto.fromDatabaseRow(row, controllerRows);

			expect(dto.controllers).toHaveLength(2);
			expect(dto.controllers?.[0]?.id).toBe("ctrl-1");
			expect(dto.controllers?.[0]?.legalFirstName).toBe("João");
			expect(dto.controllers?.[1]?.id).toBe("ctrl-2");
			expect(dto.controllers?.[1]?.legalFirstName).toBe("Maria");
		});

		it("should convert null/undefined DB values to null", () => {
			const row = {} as BusinessDatabaseRow;

			const dto = BusinessInputDto.fromDatabaseRow(row, []);

			expect(dto.legalName).toBeNull();
			expect(dto.fantasyName).toBeNull();
			expect(dto.formationDate).toBeNull();
			expect(dto.email).toBeNull();
			expect(dto.taxId).toBeNull();
			expect(dto.phoneNumber).toBeNull();
			expect(dto.website).toBeNull();
		});

		it("should handle empty controllers array", () => {
			const row = { legal_name: "Test" } as BusinessDatabaseRow;

			const dto = BusinessInputDto.fromDatabaseRow(row, []);

			expect(dto.legalName).toBe("Test");
			expect(dto.controllers).toEqual([]);
		});
	});

	it("should validate an empty dto (since all fields are optional)", async () => {
		const input = {};
		const dto = plainToInstance(BusinessInputDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBe(0);
	});

	it("should validate a correct dto with all fields", async () => {
		const input = {
			legal_name: "Test Corp",
			fantasy_name: "Test",
			formation_date: "2020-01-01",
			email: "test@example.com",
			tax_id: "12345",
			phone_number: "+123456789",
			website: "https://example.com",
			address: {
				country_code: "US",
				street: "123 Test St",
			},
		};

		const dto = plainToInstance(BusinessInputDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBe(0);
	});

	it("should fail validation if email is invalid", async () => {
		const input = {
			email: "not-an-email",
		};

		const dto = plainToInstance(BusinessInputDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBeGreaterThan(0);
		expect(errors[0]!.property).toBe("email");
	});

	it("should fail validation if legal_name is not a string", async () => {
		const input = {
			legal_name: 123,
		};

		const dto = plainToInstance(BusinessInputDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBeGreaterThan(0);
		expect(errors[0]!.property).toBe("legalName");
	});

	it("should fail validation if address is invalid", async () => {
		const input = {
			address: "not-an-object",
		};

		const dto = plainToInstance(BusinessInputDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBeGreaterThan(0);
		expect(errors[0]!.property).toBe("address");
	});
});
