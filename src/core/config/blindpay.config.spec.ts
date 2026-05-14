import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { blindpayConfig } from "./blindpay.config";

describe("blindpayConfig", () => {
	const originalEnv = process.env;

	beforeEach(() => {
		process.env = { ...originalEnv };
	});

	afterEach(() => {
		process.env = originalEnv;
	});

	it("should return apiKey and instanceId from environment variables", () => {
		process.env["BLINDPAY_API_KEY"] = "bp_key_abc123";
		process.env["BLINDPAY_INSTANCE_ID"] = "in_000000000000";

		const config = blindpayConfig();

		expect(config.apiKey).toBe("bp_key_abc123");
		expect(config.instanceId).toBe("in_000000000000");
	});

	it("should return undefined when environment variables are missing", () => {
		delete process.env["BLINDPAY_API_KEY"];
		delete process.env["BLINDPAY_INSTANCE_ID"];

		const config = blindpayConfig();

		expect(config.apiKey).toBeUndefined();
		expect(config.instanceId).toBeUndefined();
	});
});
