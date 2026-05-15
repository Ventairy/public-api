import "reflect-metadata";
import { describe, it, expect } from "vitest";
import { AuthController } from "@modules/auth/auth.controller";
import { KycController } from "@modules/kyc/kyc.controller";
import { BusinessController } from "@modules/business/business.controller";
import { HealthController } from "@modules/health/health.controller";

function expectRateLimit(controller: { prototype: Record<string, any>; name: string }, methodName: string, expected: { limit: number; ttl: number }): void {
	const method = (controller.prototype as any)[methodName];
	expect(method).toBeDefined();

	const limit = Reflect.getOwnMetadata("THROTTLER:LIMITdefault", method);
	const ttl = Reflect.getOwnMetadata("THROTTLER:TTLdefault", method);

	expect(limit).toBe(expected.limit);
	expect(ttl).toBe(expected.ttl);
}

describe("AuthController rate limits", () => {
	it("POST /auth/wallet/nonce/create: 10 req / 60s", () => {
		expectRateLimit(AuthController, "createNonce", { limit: 10, ttl: 60_000 });
	});

	it("POST /auth/login: 5 req / 300s", () => {
		expectRateLimit(AuthController, "login", { limit: 5, ttl: 300_000 });
	});

	it("POST /auth/refresh: 20 req / 3600s", () => {
		expectRateLimit(AuthController, "refresh", { limit: 20, ttl: 3_600_000 });
	});

	it("POST /auth/logout: 10 req / 60s", () => {
		expectRateLimit(AuthController, "logout", { limit: 10, ttl: 60_000 });
	});

	it("GET /auth/sessions: 10 req / 60s", () => {
		expectRateLimit(AuthController, "listSessions", { limit: 10, ttl: 60_000 });
	});

	it("DELETE /auth/sessions/:session_id: 10 req / 60s", () => {
		expectRateLimit(AuthController, "revokeSession", { limit: 10, ttl: 60_000 });
	});

	it("POST /auth/logout/others: 5 req / 60s", () => {
		expectRateLimit(AuthController, "logoutOthers", { limit: 5, ttl: 60_000 });
	});

	it("POST /auth/register: 5 req / 60s", () => {
		expectRateLimit(AuthController, "register", { limit: 5, ttl: 60_000 });
	});
});

describe("KycController rate limits", () => {
	it("POST /kyc/submit: 3 req / 900s", () => {
		expectRateLimit(KycController, "submitKyc", { limit: 3, ttl: 900_000 });
	});

	it("GET /kyc/status: 20 req / 60s", () => {
		expectRateLimit(KycController, "getKycStatus", { limit: 20, ttl: 60_000 });
	});
});

describe("BusinessController rate limits", () => {
	it("POST /business/files/upload: 10 req / 60s", () => {
		expectRateLimit(BusinessController, "uploadFile", { limit: 10, ttl: 60_000 });
	});

	it("POST /business/controller/:controller_id/files/upload: 10 req / 60s", () => {
		expectRateLimit(BusinessController, "uploadBusinessControllerFile", { limit: 10, ttl: 60_000 });
	});

	it("PUT /business: 20 req / 60s", () => {
		expectRateLimit(BusinessController, "saveBusiness", { limit: 20, ttl: 60_000 });
	});

	it("GET /business: 10 req / 60s", () => {
		expectRateLimit(BusinessController, "getBusiness", { limit: 10, ttl: 60_000 });
	});

	it("GET /business/files: 5 req / 60s", () => {
		expectRateLimit(BusinessController, "getBusinessFile", { limit: 5, ttl: 60_000 });
	});

	it("GET /business/controller/:controller_id/files: 5 req / 60s", () => {
		expectRateLimit(BusinessController, "getBusinessControllerFile", { limit: 5, ttl: 60_000 });
	});
});

describe("HealthController rate limits", () => {
	it("GET /health/live: 10 req / 60s", () => {
		expectRateLimit(HealthController, "liveness", { limit: 10, ttl: 60_000 });
	});

	it("GET /health/ready: 5 req / 60s", () => {
		expectRateLimit(HealthController, "readiness", { limit: 5, ttl: 60_000 });
	});
});
