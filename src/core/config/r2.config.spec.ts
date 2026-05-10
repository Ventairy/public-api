import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { r2Config } from "./r2.config";
import { R2BucketType } from "@shared/enums/r2-bucket-type";

describe("r2Config", () => {
	const originalEnv = process.env;

	beforeEach(() => {
		process.env = { ...originalEnv };
	});

	afterEach(() => {
		process.env = originalEnv;
	});

	it("should return undefined for missing environment variables", () => {
		delete process.env["R2_ENDPOINT"];
		delete process.env["R2_BUSINESS_FILES_ACCESS_KEY_ID"];
		delete process.env["R2_BUSINESS_FILES_SECRET_ACCESS_KEY"];
		delete process.env["R2_BUSINESS_FILES_BUCKET_NAME"];

		const config = r2Config();

		expect(config.endpoint).toBeUndefined();
		expect(config.buckets[R2BucketType.BUSINESS_FILES]).toEqual({
			bucketName: undefined,
			accessKeyId: undefined,
			secretAccessKey: undefined,
		});
	});

	it("should return values from environment variables", () => {
		process.env["R2_ENDPOINT"] = "https://test-endpoint.com";
		process.env["R2_BUSINESS_FILES_ACCESS_KEY_ID"] = "test-access-key";
		process.env["R2_BUSINESS_FILES_SECRET_ACCESS_KEY"] = "test-secret-key";
		process.env["R2_BUSINESS_FILES_BUCKET_NAME"] = "test-bucket";

		const config = r2Config();

		expect(config.endpoint).toBe("https://test-endpoint.com");
		expect(config.buckets[R2BucketType.BUSINESS_FILES]).toEqual({
			bucketName: "test-bucket",
			accessKeyId: "test-access-key",
			secretAccessKey: "test-secret-key",
		});
	});
});
