import "reflect-metadata";
import { describe, it, expect } from "vitest";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { BusinessAddressInputDto } from "../business-address-input.dto";
import type { BusinessDatabaseRow } from "@db/schema/businesses-table";

describe("BusinessAddressInputDto", () => {
	describe("fromDatabaseRow", () => {
		it("should map all non-null fields from the database row", () => {
			const row = {
				country_code: "BR",
				street: "123 Main St",
				city: "Sao Paulo",
				state: "SP",
				postal_code: "01310-100",
				address_proof_type: "UTILITY_BILL",
			} as BusinessDatabaseRow;

			const dto = BusinessAddressInputDto.fromDatabaseRow(row);

			expect(dto.countryCode).toBe("BR");
			expect(dto.street).toBe("123 Main St");
			expect(dto.city).toBe("Sao Paulo");
			expect(dto.state).toBe("SP");
			expect(dto.postalCode).toBe("01310-100");
			expect(dto.addressProofType).toBe("UTILITY_BILL");
		});

		it("should convert null DB values to null", () => {
			const row = {} as BusinessDatabaseRow;

			const dto = BusinessAddressInputDto.fromDatabaseRow(row);

			expect(dto.countryCode).toBeNull();
			expect(dto.street).toBeNull();
			expect(dto.city).toBeNull();
			expect(dto.state).toBeNull();
			expect(dto.postalCode).toBeNull();
			expect(dto.addressProofType).toBeNull();
		});

		it("should handle mixed null and non-null fields", () => {
			const row = {
				country_code: "US",
				city: "New York",
			} as BusinessDatabaseRow;

			const dto = BusinessAddressInputDto.fromDatabaseRow(row);

			expect(dto.countryCode).toBe("US");
			expect(dto.city).toBe("New York");
			expect(dto.street).toBeNull();
			expect(dto.state).toBeNull();
			expect(dto.postalCode).toBeNull();
			expect(dto.addressProofType).toBeNull();
		});
	});

	it("should validate an empty dto (since all fields are optional)", async () => {
		const input = {};
		const dto = plainToInstance(BusinessAddressInputDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBe(0);
	});

	it("should fail validation if country_code is not a valid ISO 3166-1 alpha-2 code", async () => {
		const input = {
			country_code: "USA",
		};
		const dto = plainToInstance(BusinessAddressInputDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBeGreaterThan(0);
		expect(errors[0]!.property).toBe("countryCode");
	});

	it("should validate a correct dto with all fields", async () => {
		const input = {
			country_code: "US",
			street: "123 Test St",
			city: "New York",
			state: "NY",
			postal_code: "10001",
			address_proof_type: "UTILITY_BILL",
		};

		const dto = plainToInstance(BusinessAddressInputDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBe(0);
	});

	it("should fail validation if address_proof_type is invalid", async () => {
		const input = {
			address_proof_type: "INVALID_TYPE",
		};

		const dto = plainToInstance(BusinessAddressInputDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBeGreaterThan(0);
		expect(errors[0]!.property).toBe("addressProofType");
	});
});
