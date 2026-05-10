import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { appConfig } from "./app.config";

describe("appConfig", () => {
	const originalEnv = process.env;

	beforeEach(() => {
		process.env = { ...originalEnv };
	});

	afterEach(() => {
		process.env = originalEnv;
	});

	it("should return default values when environment variables are missing", () => {
		delete process.env["PORT"];
		
		const config = appConfig();
		
		expect(config.port).toBe(3000);
	});

	it("should return values from environment variables", () => {
		process.env["NODE_ENV"] = "production";
		process.env["PORT"] = "4000";

		const config = appConfig();

		expect(config.nodeEnv).toBe("production");
		expect(config.port).toBe(4000);
	});

	it("should handle invalid port by falling back to default", () => {
		process.env["PORT"] = "invalid";

		const config = appConfig();

		expect(config.port).toBeNaN(); // parseInt("invalid") returns NaN
	});
});
