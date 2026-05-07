import { describe, it, expect } from "vitest";
import { VentairyKycStatus } from "../ventairy-kyc-status";

describe("VentairyKycStatus", () => {
	it("should have correct values", () => {
		expect(VentairyKycStatus.APPROVED).toBe("APPROVED");
		expect(VentairyKycStatus.PENDING).toBe("PENDING");
		expect(VentairyKycStatus.VERIFYING).toBe("VERIFYING");
		expect(VentairyKycStatus.REJECTED).toBe("REJECTED");
	});

	it("should have exactly 4 members", () => {
		expect(Object.keys(VentairyKycStatus)).toHaveLength(4);
	});
});
