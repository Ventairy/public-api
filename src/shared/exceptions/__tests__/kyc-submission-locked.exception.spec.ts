import { describe, it, expect } from "vitest";
import { HttpStatus } from "@nestjs/common";
import { ERROR_CODES, VentairyKycStatus } from "@shared/constants";
import { KycSubmissionLockedException } from "../kyc-submission-locked.exception";

describe("KycSubmissionLockedException", () => {
	it("should have correct properties", () => {
		const exception = new KycSubmissionLockedException({ userId: "user-123", kycStatus: VentairyKycStatus.PENDING });
		expect(exception.domainCode).toBe(ERROR_CODES.KYC_SUBMISSION_LOCKED);
		expect(exception.statusCode).toBe(HttpStatus.FORBIDDEN);
		expect(exception.details).toEqual({ userId: "user-123", kycStatus: VentairyKycStatus.PENDING });
	});
});
