import { describe, it, expect } from "vitest";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { LoginInputDto } from "../login-input.dto";

describe("LoginInputDto", () => {
	it("should validate a correct dto", async () => {
		const input = {
			wallet_address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0BEb1",
			siwe: {
				message: "example.com wants you to sign in...",
				signature: "0x" + "ab".repeat(65),
			},
		};

		const dto = plainToInstance(LoginInputDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBe(0);
	});

	it("should fail validation if wallet_address is missing", async () => {
		const input = {
			siwe: { message: "msg", signature: "0x" + "ab".repeat(65) },
		};

		const dto = plainToInstance(LoginInputDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBeGreaterThan(0);
	});

	it("should fail validation if wallet_address is invalid", async () => {
		const input = {
			wallet_address: "not-an-address",
			siwe: { message: "msg", signature: "0x" + "ab".repeat(65) },
		};

		const dto = plainToInstance(LoginInputDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBeGreaterThan(0);
	});

	it("should fail validation if siwe is missing", async () => {
		const input = {
			wallet_address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0BEb1",
		};

		const dto = plainToInstance(LoginInputDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBeGreaterThan(0);
	});
});
