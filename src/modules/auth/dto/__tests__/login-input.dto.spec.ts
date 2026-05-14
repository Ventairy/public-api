import { describe, it, expect } from "vitest";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { LoginInputDto } from "../login-input.dto";

describe("LoginInputDto", () => {
	it("should validate a correct dto", async () => {
		const input = {
			siwe: {
				message: "example.com wants you to sign in...",
				signature: "0x" + "ab".repeat(65),
			},
		};

		const dto = plainToInstance(LoginInputDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBe(0);
	});

	it("should fail validation if siwe is missing", async () => {
		const input = {};

		const dto = plainToInstance(LoginInputDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBeGreaterThan(0);
	});
});
