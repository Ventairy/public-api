import { describe, it, expect } from "vitest";
import { HttpStatus } from "@nestjs/common";
import { VerificationNotApprovedException } from "../verification-not-approved.exception";
import { ERROR_CODES } from "@shared/constants";
import { VerificationStatus } from "@shared/enums";

describe("VerificationNotApprovedException", () => {
	it("should have VERIFICATION_NOT_APPROVED domain code", () => {
		const exception = new VerificationNotApprovedException({ verificationStatus: VerificationStatus.PENDING });

		expect(exception.domainCode).toBe(ERROR_CODES.VERIFICATION_NOT_APPROVED);
	});

	it("should have FORBIDDEN status code", () => {
		const exception = new VerificationNotApprovedException({ verificationStatus: VerificationStatus.PENDING });

		expect(exception.statusCode).toBe(HttpStatus.FORBIDDEN);
	});

	it("should include verificationStatus in details", () => {
		const exception = new VerificationNotApprovedException({ verificationStatus: VerificationStatus.REJECTED });

		expect(exception.details).toEqual({ verificationStatus: VerificationStatus.REJECTED });
	});

	it("should have PENDING message when status is PENDING", () => {
		const exception = new VerificationNotApprovedException({ verificationStatus: VerificationStatus.PENDING });

		expect(exception.message).toBe(
			"Verification approval is required to access this resource. Your verification has not been submitted yet.",
		);
	});

	it("should have VERIFYING message when status is VERIFYING", () => {
		const exception = new VerificationNotApprovedException({ verificationStatus: VerificationStatus.VERIFYING });

		expect(exception.message).toBe(
			"Verification approval is required to access this resource. Your verification is currently under review.",
		);
	});

	it("should have REJECTED message when status is REJECTED", () => {
		const exception = new VerificationNotApprovedException({ verificationStatus: VerificationStatus.REJECTED });

		expect(exception.message).toBe(
			"Verification approval is required to access this resource. Your verification has been rejected.",
		);
	});

	it("should have default message for unexpected status", () => {
		const exception = new VerificationNotApprovedException({ verificationStatus: "UNKNOWN" as VerificationStatus });

		expect(exception.message).toBe("Verification approval is required to access this resource.");
	});
});