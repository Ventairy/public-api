import { describe, it, expect } from "vitest";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { BusinessControllerInputDto } from "../business-controller-input.dto";

describe("ControllerInputDto", () => {
	it("should validate an empty dto (since all fields are optional)", async () => {
		const input = {};
		const dto = plainToInstance(BusinessControllerInputDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBe(0);
	});

	it("should validate a correct dto with all fields", async () => {
		const input = {
			id: "1234-5678",
			role: "CONTROLLING_PERSON",
			ownership_percentage: 50.5,
			title: "CEO",
			legal_first_name: "John",
			legal_last_name: "Doe",
			date_of_birth: "1990-01-01",
			tax_id: "12345",
			identification: {
				country_code: "US",
			},
			address: {
				country_code: "US",
			},
		};

		const dto = plainToInstance(BusinessControllerInputDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBe(0);
	});

	it("should fail validation if role is invalid", async () => {
		const input = {
			role: "INVALID_ROLE",
		};

		const dto = plainToInstance(BusinessControllerInputDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBeGreaterThan(0);
		expect(errors[0]!.property).toBe("role");
	});

	it("should fail validation if ownership_percentage is out of bounds", async () => {
		const input = {
			ownership_percentage: 150,
		};

		const dto = plainToInstance(BusinessControllerInputDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBeGreaterThan(0);
		expect(errors[0]!.property).toBe("ownershipPercentage");
	});

	it("should fail validation if identification is not an object", async () => {
		const input = {
			identification: "not-an-object",
		};

		const dto = plainToInstance(BusinessControllerInputDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBeGreaterThan(0);
		expect(errors[0]!.property).toBe("identification");
	});
});
