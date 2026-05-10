import { describe, it, expect } from "vitest";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { BusinessControllerAddressInputDto } from "../business-controller-address-input.dto";

describe("ControllerAddressInputDto", () => {
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
