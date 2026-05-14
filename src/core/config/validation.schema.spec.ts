import { describe, it, expect } from "vitest";
import { validationSchema } from "./validation.schema";

describe("validationSchema", () => {
	const validEnv = {
		NODE_ENV: "development",
		PORT: 3000,
		CF_ACCOUNT_ID: "test-account-id",
		CF_D1_DATABASE_ID: "test-database-id",
		CF_D1_API_TOKEN: "test-api-token",
		LOG_LEVEL: "info",
		JWT_SECRET: "my-super-secret-key-that-is-long-enough-123456",
		SIWE_DOMAIN: "example.com",
		SIWE_URI: "https://example.com",
		SIWE_NONCE_TTL_SECONDS: 300,
		R2_ENDPOINT: "https://test-endpoint.com",
		R2_BUSINESS_FILES_ACCESS_KEY_ID: "test-access-key",
		R2_BUSINESS_FILES_SECRET_ACCESS_KEY: "test-secret-key",
		R2_BUSINESS_FILES_BUCKET_NAME: "test-bucket",
		BLINDPAY_API_KEY: "bp_key_abc123",
		BLINDPAY_INSTANCE_ID: "in_000000000000",
	};

	it("should validate a correct environment configuration", () => {
		const { error, value } = validationSchema.validate(validEnv);
		expect(error).toBeUndefined();
		expect(value.PORT).toBe(3000);
	});

	it("should provide default values", () => {
		const minimalEnv = {
			CF_ACCOUNT_ID: "test-account-id",
			CF_D1_DATABASE_ID: "test-database-id",
			CF_D1_API_TOKEN: "test-api-token",
			JWT_SECRET: "my-super-secret-key-that-is-long-enough-123456",
			SIWE_DOMAIN: "example.com",
			SIWE_URI: "https://example.com",
			SIWE_NONCE_TTL_SECONDS: 300,
			R2_ENDPOINT: "https://test-endpoint.com",
			R2_BUSINESS_FILES_ACCESS_KEY_ID: "test-access-key",
			R2_BUSINESS_FILES_SECRET_ACCESS_KEY: "test-secret-key",
			R2_BUSINESS_FILES_BUCKET_NAME: "test-bucket",
			BLINDPAY_API_KEY: "bp_key_abc123",
			BLINDPAY_INSTANCE_ID: "in_000000000000",
		};
		const { error, value } = validationSchema.validate(minimalEnv);
		expect(error).toBeUndefined();
		expect(value.NODE_ENV).toBe("development");
		expect(value.PORT).toBe(3000);
		expect(value.LOG_LEVEL).toBe("info");
	});

	it("should fail validation if required fields are missing", () => {
		const invalidEnv = { ...validEnv };
		delete (invalidEnv as any).CF_ACCOUNT_ID;

		const { error } = validationSchema.validate(invalidEnv);
		expect(error).toBeDefined();
		expect(error?.message).toContain('"CF_ACCOUNT_ID" is required');
	});

	it("should fail validation for invalid NODE_ENV", () => {
		const invalidEnv = { ...validEnv, NODE_ENV: "invalid" };

		const { error } = validationSchema.validate(invalidEnv);
		expect(error).toBeDefined();
		expect(error?.message).toContain('"NODE_ENV" must be one of [development, production, test, staging]');
	});

	it("should fail validation if JWT_SECRET is missing", () => {
		const invalidEnv = { ...validEnv };
		delete (invalidEnv as any).JWT_SECRET;

		const { error } = validationSchema.validate(invalidEnv);
		expect(error).toBeDefined();
		expect(error?.message).toContain('"JWT_SECRET" is required');
	});

	it("should fail validation for invalid SIWE_NONCE_TTL_SECONDS", () => {
		const tooSmallEnv = { ...validEnv, SIWE_NONCE_TTL_SECONDS: 10 };
		const tooLargeEnv = { ...validEnv, SIWE_NONCE_TTL_SECONDS: 1000 };

		expect(validationSchema.validate(tooSmallEnv).error).toBeDefined();
		expect(validationSchema.validate(tooLargeEnv).error).toBeDefined();
	});
});
