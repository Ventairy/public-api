import { describe, it, expect } from "vitest";
import { kycTable } from "../kyc-table";
import { VentairyKycStatus } from "@shared/enums";

describe("kycTable schema", () => {
	it("should use VentairyKycStatus.PENDING as the default for ventairy_kyc_status", () => {
		const columnDefault = (kycTable.ventairy_kyc_status as any).default;

		expect(columnDefault).toBe(VentairyKycStatus.PENDING);
	});
});
