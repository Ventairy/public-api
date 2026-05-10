import { describe, it, expect } from "vitest";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { BusinessInputDto } from "../business-input.dto";

describe("BusinessInputDto", () => {
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
