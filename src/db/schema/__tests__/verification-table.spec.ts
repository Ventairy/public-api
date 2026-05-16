import { describe, it, expect } from "vitest";
import { verificationTable } from "../verifications-table";
import { VerificationStatus } from "@shared/enums";

describe("verificationTable schema", () => {
	it("should use VerificationStatus.PENDING as the default for verification_status", () => {
		const columnDefault = (verificationTable.verification_status as any).default;

		expect(columnDefault).toBe(VerificationStatus.PENDING);
	});
});
