import { describe, it, expect } from "vitest";
import { VerificationSubmissionOutputDto } from "../verification-submission-output.dto";
import { type VerificationDatabaseRow } from "@db/schema/verifications-table";
import { VerificationStatus } from "@shared/enums";

describe("VerificationSubmissionOutputDto", () => {
	it("should map from database row correctly when submitted", () => {
		const mockRow: VerificationDatabaseRow = {
			id: "k-1",
			user_id: "u-1",
			verification_status: VerificationStatus.VERIFYING,
			verification_submitted_at: "2026-05-01T00:00:00.000Z",
			created_at: "2026-05-01T00:00:00.000Z",
		};

		const result = VerificationSubmissionOutputDto.fromDatabaseRow(mockRow);

		expect(result.id).toBe("k-1");
		expect(result.userId).toBe("u-1");
		expect(result.verificationStatus).toBe(VerificationStatus.VERIFYING);
		expect(result.submittedAt).toBe("2026-05-01T00:00:00.000Z");
		expect(result.createdAt).toBe("2026-05-01T00:00:00.000Z");
	});

	it("should map from database row correctly when in draft", () => {
		const mockRow: VerificationDatabaseRow = {
			id: "k-1",
			user_id: "u-1",
			verification_status: VerificationStatus.PENDING,
			verification_submitted_at: null,
			created_at: "2026-05-01T00:00:00.000Z",
		};

		const result = VerificationSubmissionOutputDto.fromDatabaseRow(mockRow);

		expect(result.id).toBe("k-1");
		expect(result.userId).toBe("u-1");
		expect(result.verificationStatus).toBe(VerificationStatus.PENDING);
		expect(result.submittedAt).toBeNull();
		expect(result.createdAt).toBe("2026-05-01T00:00:00.000Z");
	});
});
