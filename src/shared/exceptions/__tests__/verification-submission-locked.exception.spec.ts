import { describe, it, expect } from "vitest";
import { HttpStatus } from "@nestjs/common";
import { ERROR_CODES } from "@shared/constants";
import { VerificationStatus } from "@shared/enums";
import { VerificationSubmissionLockedException } from "../verification-submission-locked.exception";

describe("VerificationSubmissionLockedException", () => {
	it("should have correct properties", () => {
		const exception = new VerificationSubmissionLockedException({ userId: "user-123", verificationStatus: VerificationStatus.PENDING });
		expect(exception.domainCode).toBe(ERROR_CODES.VERIFICATION_SUBMISSION_LOCKED);
		expect(exception.statusCode).toBe(HttpStatus.FORBIDDEN);
		expect(exception.details).toEqual({ userId: "user-123", verificationStatus: VerificationStatus.PENDING });
	});
});