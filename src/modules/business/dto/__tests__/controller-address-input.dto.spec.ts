import "reflect-metadata";
import { describe, it, expect } from "vitest";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { BusinessControllerAddressInputDto } from "../business-controller-address-input.dto";
import type { BusinessControllerDatabaseRow } from "@db/schema/business-controllers-table";

describe("ControllerAddressInputDto", () => {
	describe("fromDatabaseRow", () => {
		it("should map non-null fields from the database row", () => {
			const row = {
				address_country_code: "BR",
				address_street: "456 Oak Ave",
				address_city: "Rio de Janeiro",
				address_state: "RJ",
				address_postal_code: "20040-020",
				address_proof_type: "UTILITY_BILL",
			} as BusinessControllerDatabaseRow;

			const dto = BusinessControllerAddressInputDto.fromDatabaseRow(row);

			expect(dto.countryCode).toBe("BR");
			expect(dto.street).toBe("456 Oak Ave");
			expect(dto.city).toBe("Rio de Janeiro");
			expect(dto.state).toBe("RJ");
			expect(dto.postalCode).toBe("20040-020");
			expect(dto.addressProofType).toBe("UTILITY_BILL");
		});

		it("should convert null DB values to null", () => {
			const row = {} as BusinessControllerDatabaseRow;

			const dto = BusinessControllerAddressInputDto.fromDatabaseRow(row);

			expect(dto.countryCode).toBeNull();
			expect(dto.street).toBeNull();
			expect(dto.city).toBeNull();
			expect(dto.state).toBeNull();
			expect(dto.postalCode).toBeNull();
			expect(dto.addressProofType).toBeNull();
		});
	});

	it("should validate an empty dto (since all fields are optional)", async () => {
		const input = {};
		const dto = plainToInstance(BusinessControllerAddressInputDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBe(0);
	});

	it("should fail validation if country_code is not a valid ISO 3166-1 alpha-2 code", async () => {
		const input = {
			country_code: "BRA",
		};
		const dto = plainToInstance(BusinessControllerAddressInputDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBeGreaterThan(0);
		expect(errors[0]!.property).toBe("countryCode");
	});

	it("should validate a correct dto with all fields", async () => {
		const input = {
			country_code: "US",
			street: "123 Main St",
			city: "New York",
			state: "NY",
			postal_code: "10001",
			address_proof_type: "UTILITY_BILL",
		};

		const dto = plainToInstance(BusinessControllerAddressInputDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBe(0);
	});

	it("should fail validation if address_proof_type is invalid", async () => {
		const input = {
			address_proof_type: "INVALID_TYPE",
		};

		const dto = plainToInstance(BusinessControllerAddressInputDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBeGreaterThan(0);
		expect(errors[0]!.property).toBe("addressProofType");
	});
});
