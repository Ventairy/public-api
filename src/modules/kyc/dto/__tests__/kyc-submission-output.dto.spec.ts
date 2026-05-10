import { describe, it, expect } from "vitest";
import { KycSubmissionOutputDto } from "../kyc-submission-output.dto";
import { type KycRow } from "@db/schema/kyc-table";
import { VentairyKycStatus } from "@shared/constants";

describe("KycSubmissionOutputDto", () => {
	it("should map from database row correctly when submitted", () => {
		const mockRow: KycRow = {
			id: "k-1",
			user_id: "u-1",
			ventairy_kyc_status: VentairyKycStatus.VERIFYING,
			kyc_submitted_at: "2026-05-01T00:00:00.000Z",
			created_at: "2026-05-01T00:00:00.000Z",
		};

		const result = KycSubmissionOutputDto.fromDatabaseRow(mockRow);

		expect(result.id).toBe("k-1");
		expect(result.userId).toBe("u-1");
		expect(result.ventairyKycStatus).toBe(VentairyKycStatus.VERIFYING);
		expect(result.submittedAt).toBe("2026-05-01T00:00:00.000Z");
		expect(result.createdAt).toBe("2026-05-01T00:00:00.000Z");
	});

	it("should map from database row correctly when in draft", () => {
		const mockRow: KycRow = {
			id: "k-1",
			user_id: "u-1",
			ventairy_kyc_status: VentairyKycStatus.PENDING,
			kyc_submitted_at: null,
			created_at: "2026-05-01T00:00:00.000Z",
		};

		const result = KycSubmissionOutputDto.fromDatabaseRow(mockRow);

		expect(result.id).toBe("k-1");
		expect(result.userId).toBe("u-1");
		expect(result.ventairyKycStatus).toBe(VentairyKycStatus.PENDING);
		expect(result.submittedAt).toBeNull();
		expect(result.createdAt).toBe("2026-05-01T00:00:00.000Z");
	});
});
