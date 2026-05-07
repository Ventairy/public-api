import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { databaseConfig } from "./database.config";

describe("databaseConfig", () => {
	const originalEnv = process.env;

	beforeEach(() => {
		vi.resetModules();
		process.env = { ...originalEnv };
	});

	afterEach(() => {
		process.env = originalEnv;
	});

	it("should return default empty values when environment variables are missing", () => {
		delete process.env["CF_ACCOUNT_ID"];
		delete process.env["CF_D1_DATABASE_ID"];
		delete process.env["CF_D1_API_TOKEN"];

		const config = databaseConfig();

		expect(config.cloudflareAccountId).toBe("");
		expect(config.databaseId).toBe("");
		expect(config.apiToken).toBe("");
	});

	it("should return values from environment variables", () => {
		process.env["CF_ACCOUNT_ID"] = "test-account-id";
		process.env["CF_D1_DATABASE_ID"] = "test-database-id";
		process.env["CF_D1_API_TOKEN"] = "test-api-token";

		const config = databaseConfig();

		expect(config.cloudflareAccountId).toBe("test-account-id");
		expect(config.databaseId).toBe("test-database-id");
		expect(config.apiToken).toBe("test-api-token");
	});
});
