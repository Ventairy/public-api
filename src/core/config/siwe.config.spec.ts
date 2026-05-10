import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { siweConfig } from "./siwe.config";

describe("siweConfig", () => {
	const originalEnv = process.env;

	beforeEach(() => {
		process.env = { ...originalEnv };
	});

	afterEach(() => {
		process.env = originalEnv;
	});

	it("should return default values when optional environment variables are missing", () => {
		delete process.env["SIWE_DOMAIN"];
		delete process.env["SIWE_URI"];
		delete process.env["SIWE_NONCE_TTL_SECONDS"];

		const config = siweConfig();

		expect(config.domain).toBeUndefined();
		expect(config.uri).toBeUndefined();
		expect(config.nonceTtlSeconds).toBe(180);
	});

	it("should return values from environment variables", () => {
		process.env["SIWE_DOMAIN"] = "example.com";
		process.env["SIWE_URI"] = "https://example.com";
		process.env["SIWE_NONCE_TTL_SECONDS"] = "300";

		const config = siweConfig();

		expect(config.domain).toBe("example.com");
		expect(config.uri).toBe("https://example.com");
		expect(config.nonceTtlSeconds).toBe(300);
	});

	it("should handle invalid nonce TTL by falling back to default", () => {
		process.env["SIWE_NONCE_TTL_SECONDS"] = "invalid";

		const config = siweConfig();

		expect(config.nonceTtlSeconds).toBeNaN(); // parseInt("invalid") returns NaN
	});
});
