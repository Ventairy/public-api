import { describe, it, expect } from "vitest";
import { SupportedBlockchain } from "@shared/blockchain/supported-blockchains";
import { UserType } from "@shared/enums/user-type";
import { CreateUserOutputDto } from "../create-user-output.dto";
import { type UserRow } from "@db/schema/users-table";
import { VentairyKycStatus } from "@shared/enums/ventairy-kyc-status";

describe("CreateUserOutputDto", () => {
	it("should map from database row correctly", () => {
		const mockRow: UserRow = {
			id: "u-1",
			wallet_address: "0x123",
			chain_id: SupportedBlockchain.BASE,
			user_type: UserType.BUSINESS,
			created_at: "2026-05-01T00:00:00.000Z",
		};

		const result = CreateUserOutputDto.fromDatabaseRow(mockRow);

		expect(result.id).toBe("u-1");
		expect(result.walletAddress).toBe("0x123");
		expect(result.chainId).toBe(8453);
		expect(result.ventairyKycStatus).toBe(VentairyKycStatus.PENDING);
		expect(result.createdAt).toBe("2026-05-01T00:00:00.000Z");
	});
});
