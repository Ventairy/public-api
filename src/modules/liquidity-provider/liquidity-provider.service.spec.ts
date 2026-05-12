import { describe, it, expect, vi, beforeEach } from "vitest";
import { LiquidityProviderService } from "./liquidity-provider.service";
import { LiquidityProvider, LiquidityProviderStatus } from "@shared/constants";

const MOCK_USER_ID = "user-123";

function createMockRow(overrides: Record<string, unknown> = {}) {
	return {
		id: "ulp-001",
		user_id: MOCK_USER_ID,
		liquidity_provider: LiquidityProvider.BLINDPAY,
		status: LiquidityProviderStatus.ACTIVE,
		created_at: "2026-05-04T14:48:00.000Z",
		updated_at: "2026-05-04T14:48:00.000Z",
		...overrides,
	};
}

describe("LiquidityProviderService", () => {
	let service: LiquidityProviderService;
	let mockRepository: { findActiveByUserId: ReturnType<typeof vi.fn> };

	beforeEach(() => {
		vi.clearAllMocks();
		mockRepository = { findActiveByUserId: vi.fn() };
		service = new LiquidityProviderService(mockRepository as any);
	});

	describe("getActiveLiquidityProvidersForUser", () => {
		it("should return liquidity provider enum values for active rows", async () => {
			const rows = [
				createMockRow(),
				createMockRow({ id: "ulp-002" }),
			];
			mockRepository.findActiveByUserId.mockResolvedValue(rows);

			const result = await service.getActiveLiquidityProvidersForUser({ userId: MOCK_USER_ID });

			expect(mockRepository.findActiveByUserId).toHaveBeenCalledWith({ userId: MOCK_USER_ID });
			expect(result).toEqual([LiquidityProvider.BLINDPAY, LiquidityProvider.BLINDPAY]);
		});

		it("should return empty array when user has no active providers", async () => {
			mockRepository.findActiveByUserId.mockResolvedValue([]);

			const result = await service.getActiveLiquidityProvidersForUser({ userId: MOCK_USER_ID });

			expect(result).toEqual([]);
		});

		it("should not include status in returned values", async () => {
			const activeRow = createMockRow({ id: "ulp-001" });
			const anotherActiveRow = createMockRow({ id: "ulp-002", liquidity_provider: LiquidityProvider.BLINDPAY });
			mockRepository.findActiveByUserId.mockResolvedValue([activeRow, anotherActiveRow]);

			const result = await service.getActiveLiquidityProvidersForUser({ userId: MOCK_USER_ID });

			expect(result.every((p) => typeof p === "string")).toBe(true);
			result.forEach((provider) => {
				expect(Object.values(LiquidityProvider)).toContain(provider);
			});
		});
	});
});
