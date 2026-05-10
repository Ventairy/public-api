import { describe, it, expect } from "vitest";
import { HttpStatus } from "@nestjs/common";
import { ERROR_CODES } from "@shared/constants/error-codes";
import { NonceExpiredException } from "../nonce-expired.exception";

describe("NonceExpiredException", () => {
	it("should have correct properties and format time correctly (minutes)", () => {
		const exception = new NonceExpiredException({ nonce: "abc", ttlSeconds: 120 });
		expect(exception.domainCode).toBe(ERROR_CODES.NONCE_EXPIRED);
		expect(exception.statusCode).toBe(HttpStatus.UNAUTHORIZED);
		expect(exception.details?.["hint"]).toContain("2 minutes");
	});

	it("should have correct properties and format time correctly (seconds)", () => {
		const exception = new NonceExpiredException({ nonce: "abc", ttlSeconds: 45 });
		expect(exception.details?.["hint"]).toContain("45 seconds");
	});
});
