import { describe, it, expect } from "vitest";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { CreateUserInputDto } from "../create-user-input.dto";

describe("CreateUserInputDto", () => {
	it("should validate a correct dto", async () => {
		const input = {
			wallet_address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0BEb1",
			siwe: {
				message: "test message",
				signature: "0x" + "a".repeat(130),
			},
		};

		const dto = plainToInstance(CreateUserInputDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBe(0);
	});

	it("should fail validation if wallet_address is missing", async () => {
		const input = {
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
		};

		const dto = plainToInstance(CreateUserInputDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBeGreaterThan(0);
		expect(errors[0]!.property).toBe("siwe");
	});
});
