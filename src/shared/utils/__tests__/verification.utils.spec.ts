import { describe, it, expect } from "vitest";
import { VerificationStatus } from "@shared/enums";
import { VerificationUtils } from "../verification.utils";

describe("VerificationUtils", () => {
	describe("canModifyVerificationData", () => {
		it("should return false when verification status is APPROVED", () => {
			expect(VerificationUtils.canModifyVerificationData(VerificationStatus.VERIFIED)).toBe(false);
		});

		it("should return true when verification status is PENDING", () => {
			expect(VerificationUtils.canModifyVerificationData(VerificationStatus.PENDING)).toBe(true);
		});

		it("should return true when verification status is VERIFYING", () => {
			expect(VerificationUtils.canModifyVerificationData(VerificationStatus.VERIFYING)).toBe(true);
		});

		it("should return true when verification status is REJECTED", () => {
			expect(VerificationUtils.canModifyVerificationData(VerificationStatus.REJECTED)).toBe(true);
		});
	});
});