import { describe, it, expect } from "vitest";
import { VerificationStatusOutputDto } from "../verification-status-output.dto";
import { VerificationMissingDataDto } from "../verification-missing.dto";
import { type VerificationDatabaseRow } from "@db/schema/verifications-table";
import { VerificationStatus } from "@shared/enums";

function emptyMissing(): VerificationMissingDataDto {
	return new VerificationMissingDataDto({ fields: [], files: [] });
}

describe("VerificationStatusOutputDto", () => {
	it("should map from database row correctly when submitted", () => {
		const mockRow: VerificationDatabaseRow = {
			id: "k-1",
			user_id: "u-1",
			verification_status: VerificationStatus.VERIFYING,
			verification_submitted_at: "2026-05-01T00:00:00.000Z",
			created_at: "2026-05-01T00:00:00.000Z",
		};

		const result = VerificationStatusOutputDto.fromDatabaseRow(mockRow, false, emptyMissing());

		expect(result.userId).toBe("u-1");
		expect(result.verificationStatus).toBe(VerificationStatus.VERIFYING);
		expect(result.submittedAt).toBe("2026-05-01T00:00:00.000Z");
		expect(result.canSubmit).toBe(false);
		expect(result.missing.fields).toEqual([]);
		expect(result.missing.files).toEqual([]);
	});

	it("should map from database row correctly when in draft", () => {
		const mockRow: VerificationDatabaseRow = {
			id: "k-1",
			user_id: "u-1",
			verification_status: VerificationStatus.PENDING,
			verification_submitted_at: null,
			created_at: "2026-05-01T00:00:00.000Z",
		};

		const missingWithItems = new VerificationMissingDataDto({
			fields: ["business.legal_name", "business.controllers"],
			files: ["business.PROOF_OF_ADDRESS"],
		});

		const result = VerificationStatusOutputDto.fromDatabaseRow(mockRow, false, missingWithItems);

		expect(result.userId).toBe("u-1");
		expect(result.verificationStatus).toBe(VerificationStatus.PENDING);
		expect(result.submittedAt).toBeNull();
		expect(result.canSubmit).toBe(false);
		expect(result.missing.fields).toEqual(["business.legal_name", "business.controllers"]);
		expect(result.missing.files).toEqual(["business.PROOF_OF_ADDRESS"]);
	});

	it("should set can_submit to true when missing is empty and status is PENDING", () => {
		const mockRow: VerificationDatabaseRow = {
			id: "k-1",
			user_id: "u-1",
			verification_status: VerificationStatus.PENDING,
			verification_submitted_at: null,
			created_at: "2026-05-01T00:00:00.000Z",
		};

		const result = VerificationStatusOutputDto.fromDatabaseRow(mockRow, true, emptyMissing());

		expect(result.canSubmit).toBe(true);
	});
});
