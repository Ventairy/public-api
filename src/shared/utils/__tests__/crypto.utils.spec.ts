import { describe, it, expect } from "vitest";
import { createHash } from "node:crypto";
import { CryptoUtils } from "../crypto.utils";

describe("CryptoUtils", () => {
	describe("generateSecureRandom", () => {
		it("should return a hex string of twice the requested byte length", () => {
			const result = CryptoUtils.generateSecureRandom(16);

			expect(result).toHaveLength(32);
			expect(result).toMatch(/^[0-9a-f]+$/);
		});

		it("should return different values on successive calls", () => {
			const a = CryptoUtils.generateSecureRandom(32);
			const b = CryptoUtils.generateSecureRandom(32);

			expect(a).not.toBe(b);
		});
	});

	describe("hashSha256", () => {
		it("should return a SHA-256 hex digest", () => {
			const result = CryptoUtils.hashSha256("hello");

			expect(result).toHaveLength(64);
			expect(result).toMatch(/^[0-9a-f]{64}$/);
		});

		it("should be deterministic", () => {
			const a = CryptoUtils.hashSha256("hello");
			const b = CryptoUtils.hashSha256("hello");

			expect(a).toBe(b);
		});

		it("should produce the correct SHA-256 hash", () => {
			const result = CryptoUtils.hashSha256("hello");
			const expected = createHash("sha256").update("hello").digest("hex");

			expect(result).toBe(expected);
		});
	});
});
