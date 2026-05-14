import { describe, it, expect } from "vitest";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { CreateUserInputDto } from "../create-user-input.dto";

describe("CreateUserInputDto", () => {
	const validInput = {
		user_type: "BUSINESS",
		siwe: {
			message: "test message",
			signature: "0x" + "a".repeat(130),
		},
	};

	it("should validate a correct dto", async () => {
		const dto = plainToInstance(CreateUserInputDto, validInput);
		const errors = await validate(dto);
		expect(errors.length).toBe(0);
	});

	it("should fail validation if siwe is missing", async () => {
		const input = {
			user_type: "BUSINESS",
		};

		const dto = plainToInstance(CreateUserInputDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBeGreaterThan(0);
		expect(errors.map((e) => e.property)).toContain("siwe");
	});

	it("should fail validation if user_type is missing", async () => {
		const input = {
			siwe: {
				message: "test message",
				signature: "0x" + "a".repeat(130),
			},
		};

		const dto = plainToInstance(CreateUserInputDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBeGreaterThan(0);
		expect(errors.map((e) => e.property)).toContain("userType");
	});

	it("should fail validation if user_type is invalid", async () => {
		const input = {
			user_type: "INVALID_TYPE",
			siwe: {
				message: "test message",
				signature: "0x" + "a".repeat(130),
			},
		};

		const dto = plainToInstance(CreateUserInputDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBeGreaterThan(0);
		expect(errors.map((e) => e.property)).toContain("userType");
	});
});
