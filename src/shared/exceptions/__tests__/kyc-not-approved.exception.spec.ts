import { describe, it, expect } from "vitest";
import { HttpStatus } from "@nestjs/common";
import { KycNotApprovedException } from "../kyc-not-approved.exception";
import { ERROR_CODES } from "@shared/constants";
import { VentairyKycStatus } from "@shared/enums";

describe("KycNotApprovedException", () => {
	it("should have KYC_NOT_APPROVED domain code", () => {
		const exception = new KycNotApprovedException({ kycStatus: VentairyKycStatus.PENDING });

		expect(exception.domainCode).toBe(ERROR_CODES.KYC_NOT_APPROVED);
	});

	it("should have FORBIDDEN status code", () => {
		const exception = new KycNotApprovedException({ kycStatus: VentairyKycStatus.PENDING });

		expect(exception.statusCode).toBe(HttpStatus.FORBIDDEN);
	});

	it("should include kycStatus in details", () => {
		const exception = new KycNotApprovedException({ kycStatus: VentairyKycStatus.REJECTED });

		expect(exception.details).toEqual({ kycStatus: VentairyKycStatus.REJECTED });
	});

	it("should have PENDING message when status is PENDING", () => {
		const exception = new KycNotApprovedException({ kycStatus: VentairyKycStatus.PENDING });

		expect(exception.message).toBe(
			"KYC approval is required to access this resource. Your KYC application has not been submitted yet.",
		);
	});

	it("should have VERIFYING message when status is VERIFYING", () => {
		const exception = new KycNotApprovedException({ kycStatus: VentairyKycStatus.VERIFYING });

		expect(exception.message).toBe(
			"KYC approval is required to access this resource. Your KYC application is currently under review.",
		);
	});

	it("should have REJECTED message when status is REJECTED", () => {
		const exception = new KycNotApprovedException({ kycStatus: VentairyKycStatus.REJECTED });

		expect(exception.message).toBe(
			"KYC approval is required to access this resource. Your KYC application has been rejected.",
		);
	});

	it("should have default message for unexpected status", () => {
		const exception = new KycNotApprovedException({ kycStatus: "UNKNOWN" as VentairyKycStatus });

		expect(exception.message).toBe("KYC approval is required to access this resource.");
	});
});
