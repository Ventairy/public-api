import { describe, it, expect } from "vitest";
import { HttpStatus } from "@nestjs/common";
import { ERROR_CODES } from "@shared/constants/error-codes";
import { SignatureVerificationUnavailableException } from "../signature-verification-unavailable.exception";

describe("SignatureVerificationUnavailableException", () => {
	it("should have correct properties", () => {
		const exception = new SignatureVerificationUnavailableException();
		expect(exception.domainCode).toBe(ERROR_CODES.SIGNATURE_VERIFICATION_UNAVAILABLE);
		expect(exception.statusCode).toBe(HttpStatus.SERVICE_UNAVAILABLE);
	});
});
