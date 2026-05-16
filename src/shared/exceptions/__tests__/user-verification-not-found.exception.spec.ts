import { describe, it, expect } from "vitest";
import { HttpStatus } from "@nestjs/common";
import { UserVerificationNotFoundException } from "../user-verification-not-found.exception";

describe("UserVerificationNotFoundException", () => {
	it("should create a 404 exception with VERIFICATION_NOT_FOUND code", () => {
		const exception = new UserVerificationNotFoundException("user-123");

		expect(exception.statusCode).toBe(HttpStatus.NOT_FOUND);
		expect(exception.domainCode).toBe("VERIFICATION_NOT_FOUND");
		expect(exception.message).toBe('Verification record not found for user "user-123"');
	});

	it("should include userId in details", () => {
		const exception = new UserVerificationNotFoundException("user-456");

		expect(exception.details).toEqual({ userId: "user-456" });
	});
});