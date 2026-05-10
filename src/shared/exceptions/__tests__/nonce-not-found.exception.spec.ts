import { describe, it, expect } from "vitest";
import { HttpStatus } from "@nestjs/common";
import { ERROR_CODES } from "@shared/constants/error-codes";
import { NonceNotFoundException } from "../nonce-not-found.exception";

describe("NonceNotFoundException", () => {
	it("should have correct properties", () => {
		const exception = new NonceNotFoundException("abc");
		expect(exception.domainCode).toBe(ERROR_CODES.NONCE_NOT_FOUND);
		expect(exception.statusCode).toBe(HttpStatus.NOT_FOUND);
		expect(exception.details?.["context"]).toEqual({ nonce: "abc" });
	});
});
