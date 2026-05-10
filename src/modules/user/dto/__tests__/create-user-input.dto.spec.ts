import { describe, it, expect } from "vitest";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { CreateUserInputDto } from "../create-user-input.dto";

describe("CreateUserInputDto", () => {
	const validInput = {
		wallet_address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0BEb1",
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

	it("should fail validation if wallet_address is missing", async () => {
		const input = {
			user_type: "BUSINESS",
			siwe: {
				message: "test message",
				signature: "0x" + "a".repeat(130),
			},
		};

		const dto = plainToInstance(CreateUserInputDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBeGreaterThan(0);
		expect(errors[0]!.property).toBe("walletAddress");
	});

	it("should fail validation if wallet_address is invalid", async () => {
		const input = {
			wallet_address: "invalid-address",
			user_type: "BUSINESS",
			siwe: {
				message: "test message",
				signature: "0x" + "a".repeat(130),
			},
		};

		const dto = plainToInstance(CreateUserInputDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBeGreaterThan(0);
		expect(errors[0]!.property).toBe("walletAddress");
	});

	it("should fail validation if siwe is missing", async () => {
		const input = {
			wallet_address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0BEb1",
			user_type: "BUSINESS",
		};

		const dto = plainToInstance(CreateUserInputDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBeGreaterThan(0);
		expect(errors.map((e) => e.property)).toContain("siwe");
	});

	it("should fail validation if user_type is missing", async () => {
		const input = {
			wallet_address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0BEb1",
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
			wallet_address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0BEb1",
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
