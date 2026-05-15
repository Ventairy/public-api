import { describe, it, expect } from "vitest";
import { VentairyKycStatus } from "@shared/enums";
import { KycUtils } from "../kyc.utils";

describe("KycUtils", () => {
	describe("canKycStatusModifyKycData", () => {
		it("should return false when KYC status is APPROVED", () => {
			expect(KycUtils.canKycStatusModifyKycData(VentairyKycStatus.APPROVED)).toBe(false);
		});

		it("should return true when KYC status is PENDING", () => {
			expect(KycUtils.canKycStatusModifyKycData(VentairyKycStatus.PENDING)).toBe(true);
		});

		it("should return true when KYC status is VERIFYING", () => {
			expect(KycUtils.canKycStatusModifyKycData(VentairyKycStatus.VERIFYING)).toBe(true);
		});

		it("should return true when KYC status is REJECTED", () => {
			expect(KycUtils.canKycStatusModifyKycData(VentairyKycStatus.REJECTED)).toBe(true);
		});
	});
});
