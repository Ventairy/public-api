import { describe, it, expect } from "vitest";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { SiweVerificationInputDto } from "../siwe-verification-input.dto";

describe("SiweVerificationInputDto", () => {
	it("should validate a correct dto", async () => {
		const input = {
			message: "test message",
			signature: "0x" + "a".repeat(130),
		};

		const dto = plainToInstance(SiweVerificationInputDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBe(0);
	});

	it("should fail validation if message is missing", async () => {
		const input = {
			signature: "0x" + "a".repeat(130),
		};

		const dto = plainToInstance(SiweVerificationInputDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBeGreaterThan(0);
		expect(errors[0]!.property).toBe("message");
	});

	it("should fail validation if signature is missing", async () => {
		const input = {
			message: "test message",
		};

		const dto = plainToInstance(SiweVerificationInputDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBeGreaterThan(0);
		expect(errors[0]!.property).toBe("signature");
	});

	it("should fail validation if signature is invalid length", async () => {
		const input = {
			message: "test message",
			signature: "0x123",
		};

		const dto = plainToInstance(SiweVerificationInputDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBeGreaterThan(0);
		expect(errors[0]!.property).toBe("signature");
	});
});
