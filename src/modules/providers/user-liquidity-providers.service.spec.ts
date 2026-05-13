import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserLiquidityProvidersService } from "./user-liquidity-providers.service";
import { LiquidityProviderId } from "@shared/constants";
import type { UserLiquidityProviderRow } from "@db/schema/user-liquidity-providers-table";
import { UserLiquidityProviderStatus } from "@shared/enums/user-liquidity-provider-status";

const MOCK_USER_ID = "user-123";

function createMockRow(overrides: Partial<UserLiquidityProviderRow> = {}): UserLiquidityProviderRow {
	return {
		id: "ulp-001",
		user_id: MOCK_USER_ID,
		liquidity_provider_id: LiquidityProviderId.BLINDPAY,
		liquidity_provider_user_id: null as string | null,
		status: UserLiquidityProviderStatus.ACTIVE,
		created_at: "2026-05-04T14:48:00.000Z",
		...overrides,
	};
}

describe("LiquidityProviderService", () => {
	let service: UserLiquidityProvidersService;
	let mockRepository: { findActiveProvidersByUserId: ReturnType<typeof vi.fn> };

	beforeEach(() => {
		vi.clearAllMocks();
		mockRepository = { findActiveProvidersByUserId: vi.fn() };
		service = new UserLiquidityProvidersService(mockRepository as any);
	});

	describe("getUserActiveProviders", () => {
		it("should return UserProviderOutputDto array for active rows", async () => {
			const rows = [createMockRow()];
			mockRepository.findActiveProvidersByUserId.mockResolvedValue(rows);

			const result = await service.getActiveLiquidityProviders({ userId: MOCK_USER_ID });

			expect(result).toHaveLength(1);
			expect(result[0]!.userId).toBe(MOCK_USER_ID);
			expect(result[0]!.liquidityProviderId).toBe(LiquidityProviderId.BLINDPAY);
			expect(result[0]!.status).toBe(UserLiquidityProviderStatus.ACTIVE);
		});

		it("should return empty array when no active providers exist", async () => {
			mockRepository.findActiveProvidersByUserId.mockResolvedValue([]);

			const result = await service.getActiveLiquidityProviders({ userId: MOCK_USER_ID });

			expect(result).toEqual([]);
		});
	});
});
