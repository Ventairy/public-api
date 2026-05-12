import { describe, it, expect } from "vitest";
import { HttpStatus } from "@nestjs/common";
import { ERROR_CODES } from "@shared/constants";
import { KycSubmissionRequirementsNotMetException } from "../kyc-submission-requirements-not-met.exception";

describe("KycSubmissionRequirementsNotMetException", () => {
	it("should have correct properties", () => {
		const exception = new KycSubmissionRequirementsNotMetException({
			userId: "user-123",
			missing: { fields: ["business.legal_name"], files: ["business.PROOF_OF_ADDRESS"] },
		});
		expect(exception.domainCode).toBe(ERROR_CODES.KYC_SUBMISSION_REQUIREMENTS_NOT_MET);
		expect(exception.statusCode).toBe(HttpStatus.UNPROCESSABLE_ENTITY);
		expect(exception.details).toEqual({
			userId: "user-123",
			missing: { fields: ["business.legal_name"], files: ["business.PROOF_OF_ADDRESS"] },
		});
	});
});
