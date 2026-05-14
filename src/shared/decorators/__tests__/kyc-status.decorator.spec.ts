import { describe, it, expect } from "vitest";
import { VentairyKycStatus } from "@shared/enums";
import { KYCStatus, ALLOWED_KYC_STATUSES_DECORATOR_KEY } from "../kyc-status.decorator";

describe("KYCStatus", () => {
	it("should set metadata with allowedKycStatuses key and provided statuses", () => {
		const decorator = KYCStatus(VentairyKycStatus.PENDING, VentairyKycStatus.VERIFYING);

		expect(decorator).toBeDefined();
		expect(typeof decorator).toBe("function");

		const target = function () {};
		decorator(target);

		const metadata = Reflect.getMetadata(ALLOWED_KYC_STATUSES_DECORATOR_KEY, target);
		expect(metadata).toEqual([VentairyKycStatus.PENDING, VentairyKycStatus.VERIFYING]);
	});

	it("should set metadata with single status", () => {
		const decorator = KYCStatus(VentairyKycStatus.APPROVED);
		const target = function () {};
		decorator(target);

		const metadata = Reflect.getMetadata(ALLOWED_KYC_STATUSES_DECORATOR_KEY, target);
		expect(metadata).toEqual([VentairyKycStatus.APPROVED]);
	});
});
