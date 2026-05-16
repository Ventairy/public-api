import { describe, it, expect } from "vitest";
import { VerificationStatus } from "../verification-status";

describe("VerificationStatus", () => {
	it("should have correct values", () => {
		expect(VerificationStatus.VERIFIED).toBe("VERIFIED");
		expect(VerificationStatus.PENDING).toBe("PENDING");
		expect(VerificationStatus.VERIFYING).toBe("VERIFYING");
		expect(VerificationStatus.REJECTED).toBe("REJECTED");
	});

	it("should have exactly 4 members", () => {
		expect(Object.keys(VerificationStatus)).toHaveLength(4);
	});
});
