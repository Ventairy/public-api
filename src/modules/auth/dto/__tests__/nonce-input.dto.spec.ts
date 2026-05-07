import { describe, it, expect } from "vitest";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { NonceInputDto } from "../nonce-input.dto";

describe("NonceInputDto", () => {
	it("should validate a correct dto", async () => {
		const input = {
			wallet_address: "0x742d35Cc6634C0532925a3b844Bc9e7595f0BEb1",
		};

		const dto = plainToInstance(NonceInputDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBe(0);
	});

	it("should fail validation if wallet_address is missing", async () => {
		const input = {};

		const dto = plainToInstance(NonceInputDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBeGreaterThan(0);
		expect(errors[0]!.property).toBe("walletAddress");
	});

	it("should fail validation if wallet_address is invalid", async () => {
		const input = {
			wallet_address: "invalid-address",
		};

		const dto = plainToInstance(NonceInputDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBeGreaterThan(0);
		expect(errors[0]!.property).toBe("walletAddress");
	});
});
