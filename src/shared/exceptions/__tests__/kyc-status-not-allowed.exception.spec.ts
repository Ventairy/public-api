import { describe, it, expect } from "vitest";
import { HttpStatus } from "@nestjs/common";
import { KycStatusNotAllowedException } from "../kyc-status-not-allowed.exception";
import { VentairyKycStatus } from "@shared/enums";

describe("KycStatusNotAllowedException", () => {
	it("should create a 403 exception with KYC_STATUS_NOT_ALLOWED code", () => {
		const exception = new KycStatusNotAllowedException({ kycStatus: VentairyKycStatus.PENDING });

		expect(exception.statusCode).toBe(HttpStatus.FORBIDDEN);
		expect(exception.domainCode).toBe("KYC_STATUS_NOT_ALLOWED");
		expect(exception.message).toBe("Your current KYC status (PENDING) does not allow access to this resource.");
	});

	it("should include kycStatus in details", () => {
		const exception = new KycStatusNotAllowedException({ kycStatus: VentairyKycStatus.REJECTED });

		expect(exception.details).toEqual({ kycStatus: VentairyKycStatus.REJECTED });
	});
});
