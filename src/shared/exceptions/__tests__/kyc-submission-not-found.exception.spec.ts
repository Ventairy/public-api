import { describe, it, expect } from "vitest";
import { HttpStatus } from "@nestjs/common";
import { ERROR_CODES } from "@shared/constants/error-codes";
import { KycSubmissionNotFoundException } from "../kyc-submission-not-found.exception";

describe("KycSubmissionNotFoundException", () => {
	it("should have correct properties", () => {
		const exception = new KycSubmissionNotFoundException("user-123");
		expect(exception.domainCode).toBe(ERROR_CODES.KYC_SUBMISSION_NOT_FOUND);
		expect(exception.statusCode).toBe(HttpStatus.NOT_FOUND);
		expect(exception.details?.["userId"]).toBe("user-123");
	});
});
