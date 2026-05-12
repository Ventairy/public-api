import { describe, it, expect, vi, beforeEach } from "vitest";
import { DRIZZLE_DB, type DrizzleDb } from "@core/database";
import { UserLiquidityProviderRepository } from "./user-liquidity-provider.repository";
import { LiquidityProviderStatus } from "@shared/constants";

function createMockDb() {
	return {
		select: vi.fn().mockReturnThis(),
		from: vi.fn().mockReturnThis(),
		where: vi.fn(),
	};
}

describe("UserLiquidityProviderRepository", () => {
	let repository: UserLiquidityProviderRepository;
	let mockDb: ReturnType<typeof createMockDb>;

	beforeEach(() => {
		vi.clearAllMocks();
		mockDb = createMockDb();
		repository = new UserLiquidityProviderRepository(mockDb as unknown as DrizzleDb);
	});

	describe("findByUserId", () => {
		it("should return all liquidity provider rows for a user", async () => {
			const expectedRows = [
				{ id: "ulp-1", user_id: "user-1", liquidity_provider: "BLINDPAY", status: LiquidityProviderStatus.ACTIVE },
				{ id: "ulp-2", user_id: "user-1", liquidity_provider: "BLINDPAY", status: LiquidityProviderStatus.PENDING },
			];
			const selectBuilder = { from: vi.fn().mockReturnThis(), where: vi.fn() };
			mockDb.select.mockReturnValue(selectBuilder);
			selectBuilder.where.mockResolvedValue(expectedRows);

			const result = await repository.findByUserId({ userId: "user-1" });

			expect(result).toEqual(expectedRows);
		});

		it("should return empty array when user has no liquidity provider rows", async () => {
			const selectBuilder = { from: vi.fn().mockReturnThis(), where: vi.fn() };
			mockDb.select.mockReturnValue(selectBuilder);
			selectBuilder.where.mockResolvedValue([]);

			const result = await repository.findByUserId({ userId: "nonexistent" });

			expect(result).toEqual([]);
		});
	});

	describe("findActiveByUserId", () => {
		it("should return only ACTIVE liquidity provider rows for a user", async () => {
			const activeRow = { id: "ulp-1", user_id: "user-1", liquidity_provider: "BLINDPAY", status: LiquidityProviderStatus.ACTIVE };
			const pendingRow = { id: "ulp-2", user_id: "user-1", liquidity_provider: "BLINDPAY", status: LiquidityProviderStatus.PENDING };
			const selectBuilder = { from: vi.fn().mockReturnThis(), where: vi.fn() };
			mockDb.select.mockReturnValue(selectBuilder);
			selectBuilder.where.mockResolvedValue([activeRow, pendingRow]);

			const result = await repository.findActiveByUserId({ userId: "user-1" });

			expect(result).toHaveLength(2);
		});

		it("should filter rows with ACTIVEstatus", async () => {
			const activeRow = { id: "ulp-1", user_id: "user-1", liquidity_provider: "BLINDPAY", status: LiquidityProviderStatus.ACTIVE };
			const selectBuilder = { from: vi.fn().mockReturnThis(), where: vi.fn() };
			mockDb.select.mockReturnValue(selectBuilder);
			selectBuilder.where.mockResolvedValue([activeRow]);

			const result = await repository.findActiveByUserId({ userId: "user-1" });

			expect(result).toEqual([activeRow]);
			expect(selectBuilder.where).toHaveBeenCalledTimes(1);
		});

		it("should return empty array when no active providers exist", async () => {
			const selectBuilder = { from: vi.fn().mockReturnThis(), where: vi.fn() };
			mockDb.select.mockReturnValue(selectBuilder);
			selectBuilder.where.mockResolvedValue([]);

			const result = await repository.findActiveByUserId({ userId: "user-1" });

			expect(result).toEqual([]);
		});
	});
});
