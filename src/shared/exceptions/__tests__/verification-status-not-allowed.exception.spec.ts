import { describe, it, expect } from "vitest";
import { HttpStatus } from "@nestjs/common";
import { VerificationStatusNotAllowedException } from "../verification-status-not-allowed.exception";
import { VerificationStatus } from "@shared/enums";

describe("VerificationStatusNotAllowedException", () => {
	it("should create a 403 exception with VERIFICATION_STATUS_NOT_ALLOWED code", () => {
		const exception = new VerificationStatusNotAllowedException({ verificationStatus: VerificationStatus.PENDING });

		expect(exception.statusCode).toBe(HttpStatus.FORBIDDEN);
		expect(exception.domainCode).toBe("VERIFICATION_STATUS_NOT_ALLOWED");
		expect(exception.message).toBe("Your current verification status (PENDING) does not allow access to this resource.");
	});

	it("should include verificationStatus in details", () => {
		const exception = new VerificationStatusNotAllowedException({ verificationStatus: VerificationStatus.REJECTED });

		expect(exception.details).toEqual({ verificationStatus: VerificationStatus.REJECTED });
	});
});