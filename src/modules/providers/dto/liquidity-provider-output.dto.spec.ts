import { describe, it, expect } from "vitest";
import { UserLiquidityProviderOutputDto } from "./user-liquidity-provider-output.dto";
import { UserLiquidityProviderStatus } from "@shared/enums/user-liquidity-provider-status";
import type { UserLiquidityProviderRow } from "@db/schema/user-liquidity-providers-table";
import { LiquidityProviderId } from "@shared/enums/liquidity-provider-id";

describe("UserProviderOutputDto", () => {
	function createMockRow(overrides: Partial<UserLiquidityProviderRow> = {}): UserLiquidityProviderRow {
		return {
			id: "ulp-1",
			user_id: "user-1",
			liquidity_provider_id: LiquidityProviderId.BLINDPAY,
			liquidity_provider_user_id: "lp-user-1",
			status: UserLiquidityProviderStatus.ACTIVE,
			created_at: "2026-05-04T14:48:00.000Z",
			...overrides,
		};
	}

	it("should map from database row correctly", () => {
		const row = createMockRow();

		const result = UserLiquidityProviderOutputDto.fromDatabaseRow(row);

		expect(result.userId).toBe("user-1");
		expect(result.liquidityProviderId).toBe(LiquidityProviderId.BLINDPAY);
		expect(result.liquidityProviderUserId).toBe("lp-user-1");
		expect(result.status).toBe(UserLiquidityProviderStatus.ACTIVE);
	});

	it("should handle null liquidity provider user id", () => {
		const row = createMockRow({ liquidity_provider_user_id: null });

		const result = UserLiquidityProviderOutputDto.fromDatabaseRow(row);

		expect(result.liquidityProviderUserId).toBeNull();
	});
});
