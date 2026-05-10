import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { jwtConfig } from "./jwt.config";

describe("jwtConfig", () => {
	const originalEnv = process.env;

	beforeEach(() => {
		process.env = { ...originalEnv };
	});

	afterEach(() => {
		process.env = originalEnv;
	});

	it("should return the secret from environment", () => {
		process.env["JWT_SECRET"] = "my-super-secret-key-that-is-long-enough-123456";

		const config = jwtConfig();

		expect(config.secret).toBe("my-super-secret-key-that-is-long-enough-123456");
	});

	it("should return undefined when JWT_SECRET is not set (runtime invariant — Joi enforces presence)", () => {
		delete process.env["JWT_SECRET"];

		const config = jwtConfig();

		expect(config.secret).toBeUndefined();
	});
});
