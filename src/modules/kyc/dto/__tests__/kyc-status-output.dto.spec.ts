import { describe, it, expect } from "vitest";
import { KycStatusOutputDto } from "../kyc-status-output.dto";
import { KycMissingDataDto } from "../kyc-missing.dto";
import { type KycRow } from "@db/schema/kyc-table";
import { VentairyKycStatus } from "@shared/enums";

function emptyMissing(): KycMissingDataDto {
	return new KycMissingDataDto({ fields: [], files: [] });
}

describe("KycStatusOutputDto", () => {
	it("should map from database row correctly when submitted", () => {
		const mockRow: KycRow = {
			id: "k-1",
			user_id: "u-1",
			ventairy_kyc_status: VentairyKycStatus.VERIFYING,
			kyc_submitted_at: "2026-05-01T00:00:00.000Z",
			created_at: "2026-05-01T00:00:00.000Z",
		};

		const result = KycStatusOutputDto.fromDatabaseRow(mockRow, false, emptyMissing());

		expect(result.userId).toBe("u-1");
		expect(result.ventairyKycStatus).toBe(VentairyKycStatus.VERIFYING);
		expect(result.submittedAt).toBe("2026-05-01T00:00:00.000Z");
		expect(result.canSubmitKyc).toBe(false);
		expect(result.missing.fields).toEqual([]);
		expect(result.missing.files).toEqual([]);
	});

	it("should map from database row correctly when in draft", () => {
		const mockRow: KycRow = {
			id: "k-1",
			user_id: "u-1",
			ventairy_kyc_status: VentairyKycStatus.PENDING,
			kyc_submitted_at: null,
			created_at: "2026-05-01T00:00:00.000Z",
		};

		const missingWithItems = new KycMissingDataDto({
			fields: ["business.legal_name", "business.controllers"],
			files: ["business.PROOF_OF_ADDRESS"],
		});

		const result = KycStatusOutputDto.fromDatabaseRow(mockRow, false, missingWithItems);

		expect(result.userId).toBe("u-1");
		expect(result.ventairyKycStatus).toBe(VentairyKycStatus.PENDING);
		expect(result.submittedAt).toBeNull();
		expect(result.canSubmitKyc).toBe(false);
		expect(result.missing.fields).toEqual(["business.legal_name", "business.controllers"]);
		expect(result.missing.files).toEqual(["business.PROOF_OF_ADDRESS"]);
	});

	it("should set can_submit_kyc to true when missing is empty and status is PENDING", () => {
		const mockRow: KycRow = {
			id: "k-1",
			user_id: "u-1",
			ventairy_kyc_status: VentairyKycStatus.PENDING,
			kyc_submitted_at: null,
			created_at: "2026-05-01T00:00:00.000Z",
		};

		const result = KycStatusOutputDto.fromDatabaseRow(mockRow, true, emptyMissing());

		expect(result.canSubmitKyc).toBe(true);
	});
});
