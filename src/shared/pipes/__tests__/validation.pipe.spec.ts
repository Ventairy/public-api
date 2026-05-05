import { describe, it, expect, beforeEach } from "vitest";
import { CustomValidationPipe } from "@shared/pipes/validation.pipe";
import { ValidationException } from "@shared/exceptions/validation.exception";
import { IsEthereumAddress, IsString, IsEmail, IsNotEmpty } from "class-validator";

class TestDto {
	@IsString()
	@IsEthereumAddress()
	walletAddress!: string;
}

class SecretDto {
	@IsEmail()
	email!: string;
}

describe("CustomValidationPipe", () => {
	let pipe: CustomValidationPipe;

	beforeEach(() => {
		pipe = new CustomValidationPipe();
	});

	it("throws ValidationException for a single field with a single constraint failure", async () => {
		const payload = { walletAddress: "KULE" };
		const transformPromise = pipe.transform(payload, {
			getType: () => "body",
			metatype: TestDto,
			data: "",
		} as any);

		await expect(transformPromise).rejects.toThrow(ValidationException);

		try {
			await transformPromise;
		} catch (error) {
			const exception = error as ValidationException;
			expect(exception.fieldErrors).toHaveLength(1);
			const fieldError = exception.fieldErrors[0]!;
			expect(fieldError.path).toBe("walletAddress");
			expect(fieldError.constraint).toBe("isEthereumAddress");
			expect(fieldError.received).toBe("KULE");
			expect(fieldError.hint).toContain("0x-prefixed");
		}
	});

	it("throws ValidationException for multiple constraint failures on the same field", async () => {
		const payload = { walletAddress: 123 };
		const transformPromise = pipe.transform(payload, {
			getType: () => "body",
			metatype: TestDto,
			data: "",
		} as any);

		await expect(transformPromise).rejects.toThrow(ValidationException);

		try {
			await transformPromise;
		} catch (error) {
			const exception = error as ValidationException;
			expect(exception.fieldErrors.length).toBeGreaterThanOrEqual(1);
			const paths = exception.fieldErrors.map((e) => e.path);
			expect(paths).toContain("walletAddress");
		}
	});

	it("throws ValidationException for an unknown property (forbidNonWhitelisted)", async () => {
		const payload = {
			KULE: "x",
			walletAddress: "0x742d35cc6634c0532925a3b844bc9e7595f0beb1",
		};
		const transformPromise = pipe.transform(payload, {
			getType: () => "body",
			metatype: TestDto,
			data: "",
		} as any);

		await expect(transformPromise).rejects.toThrow(ValidationException);

		try {
			await transformPromise;
		} catch (error) {
			const exception = error as ValidationException;
			expect(exception.fieldErrors.length).toBeGreaterThanOrEqual(1);
			const constraints = exception.fieldErrors.map((e) => e.constraint);
			expect(constraints).toContain("whitelistValidation");
		}
	});

	it("throws ValidationException for a missing required field", async () => {
		const payload = {};
		const transformPromise = pipe.transform(payload, {
			getType: () => "body",
			metatype: TestDto,
			data: "",
		} as any);

		await expect(transformPromise).rejects.toThrow(ValidationException);
	});

	it("redacts received value for secret-like field values", async () => {
		const payload = { email: "not-an-email-password-token" };
		const transformPromise = pipe.transform(payload, {
			getType: () => "body",
			metatype: SecretDto,
			data: "",
		} as any);

		await expect(transformPromise).rejects.toThrow(ValidationException);

		try {
			await transformPromise;
		} catch (error) {
			const exception = error as ValidationException;
			const received = exception.fieldErrors[0]!.received;
			expect(received).toBe("[REDACTED]");
		}
	});

	it("truncates long received values to 100 characters", async () => {
		const longValue = "A".repeat(200);
		const payload = { walletAddress: longValue };
		const transformPromise = pipe.transform(payload, {
			getType: () => "body",
			metatype: TestDto,
			data: "",
		} as any);

		await expect(transformPromise).rejects.toThrow(ValidationException);

		try {
			await transformPromise;
		} catch (error) {
			const exception = error as ValidationException;
			const received = exception.fieldErrors.find(
				(e) => e.constraint === "isEthereumAddress",
			)?.received;
			expect(received).not.toBeNull();
			expect(received!.length).toBeLessThanOrEqual(101);
		}
	});

	it("transforms valid input without throwing", async () => {
		const payload = {
			walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0BEb1",
		};
		const result = (await pipe.transform(payload, {
			getType: () => "body",
			metatype: TestDto,
			data: "",
		} as any)) as TestDto;

		expect(result).toBeDefined();
		expect(result.walletAddress).toBe(
			"0x742d35Cc6634C0532925a3b844Bc9e7595f0BEb1",
		);
	});
});
