import { describe, it, expect, vi, beforeEach } from "vitest";
import { DRIZZLE_DB, type DrizzleDb } from "@core/database";
import { UserLiquidityProvidersRepository } from "./user-liquidity-providers.repository";
import { UserLiquidityProviderStatus } from "@shared/enums/user-liquidity-provider-status";

function createMockDb() {
	return {
		select: vi.fn().mockReturnThis(),
		from: vi.fn().mockReturnThis(),
		where: vi.fn(),
	};
}

describe("UserLiquidityProviderRepository", () => {
	let repository: UserLiquidityProvidersRepository;
	let mockDb: ReturnType<typeof createMockDb>;

	beforeEach(() => {
		vi.clearAllMocks();
		mockDb = createMockDb();
		repository = new UserLiquidityProvidersRepository(mockDb as unknown as DrizzleDb);
	});

	describe("findActiveProvidersByUserId", () => {
		it("should return only ACTIVE liquidity provider rows for a user", async () => {
			const activeRow = {
				id: "ulp-1",
				user_id: "user-1",
				liquidity_provider_id: "BLINDPAY",
				status: UserLiquidityProviderStatus.ACTIVE,
			};
			const pendingRow = {
				id: "ulp-2",
				user_id: "user-1",
				liquidity_provider_id: "BLINDPAY",
				status: UserLiquidityProviderStatus.PENDING,
			};
			const selectBuilder = { from: vi.fn().mockReturnThis(), where: vi.fn() };
			mockDb.select.mockReturnValue(selectBuilder);
			selectBuilder.where.mockResolvedValue([activeRow, pendingRow]);

			const result = await repository.findActiveProvidersByUserId({ userId: "user-1" });

			expect(result).toHaveLength(2);
		});

		it("should filter rows with ACTIVEstatus", async () => {
			const activeRow = {
				id: "ulp-1",
				user_id: "user-1",
				liquidity_provider_id: "BLINDPAY",
				status: UserLiquidityProviderStatus.ACTIVE,
			};
			const selectBuilder = { from: vi.fn().mockReturnThis(), where: vi.fn() };
			mockDb.select.mockReturnValue(selectBuilder);
			selectBuilder.where.mockResolvedValue([activeRow]);

			const result = await repository.findActiveProvidersByUserId({ userId: "user-1" });

			expect(result).toEqual([activeRow]);
			expect(selectBuilder.where).toHaveBeenCalledTimes(1);
		});

		it("should return empty array when no active providers exist", async () => {
			const selectBuilder = { from: vi.fn().mockReturnThis(), where: vi.fn() };
			mockDb.select.mockReturnValue(selectBuilder);
			selectBuilder.where.mockResolvedValue([]);

			const result = await repository.findActiveProvidersByUserId({ userId: "user-1" });

			expect(result).toEqual([]);
		});
	});
});
