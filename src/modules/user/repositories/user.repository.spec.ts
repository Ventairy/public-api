import { describe, it, expect, vi, beforeEach } from "vitest";
import { DRIZZLE_DB, type DrizzleDb, type AtomicCall } from "@core/database";
import { SupportedBlockchain } from "@shared/blockchain/supported-blockchains";
import { UserType } from "@shared/enums/user-type";
import { UserRepository } from "./user.repository";

function createMockDb() {
	return {
		select: vi.fn().mockReturnThis(),
		from: vi.fn().mockReturnThis(),
		where: vi.fn(),
		insert: vi.fn().mockReturnThis(),
		values: vi.fn().mockReturnThis(),
		returning: vi.fn(),
	};
}

describe("UserRepository", () => {
	let repository: UserRepository;
	let mockDb: ReturnType<typeof createMockDb>;

	beforeEach(() => {
		vi.clearAllMocks();
		mockDb = createMockDb();
		repository = new UserRepository(mockDb as unknown as DrizzleDb);
	});

	describe("findById", () => {
		it("should return the user row when found", async () => {
			const expectedRow = { id: "user-1", wallet_address: "0xabc", created_at: "2026-01-01T00:00:00.000Z" };
			const selectBuilder = { from: vi.fn().mockReturnThis(), where: vi.fn() };
			mockDb.select.mockReturnValue(selectBuilder);
			selectBuilder.where.mockResolvedValue([expectedRow]);

			const result = await repository.findById("user-1");

			expect(result).toEqual(expectedRow);
		});

		it("should return null when not found", async () => {
			const selectBuilder = { from: vi.fn().mockReturnThis(), where: vi.fn() };
			mockDb.select.mockReturnValue(selectBuilder);
			selectBuilder.where.mockResolvedValue([]);

			const result = await repository.findById("nonexistent");

			expect(result).toBeNull();
		});
	});

	describe("findByWalletAddress", () => {
		it("should return the user row when found", async () => {
			const expectedRow = { id: "user-1", wallet_address: "0xabc", created_at: "2026-01-01T00:00:00.000Z" };
			const selectBuilder = { from: vi.fn().mockReturnThis(), where: vi.fn() };
			mockDb.select.mockReturnValue(selectBuilder);
			selectBuilder.where.mockResolvedValue([expectedRow]);

			const result = await repository.findByWalletAddress("0xabc");

			expect(result).toEqual(expectedRow);
		});

		it("should return null when not found", async () => {
			const selectBuilder = { from: vi.fn().mockReturnThis(), where: vi.fn() };
			mockDb.select.mockReturnValue(selectBuilder);
			selectBuilder.where.mockResolvedValue([]);

			const result = await repository.findByWalletAddress("nonexistent");

			expect(result).toBeNull();
		});
	});

	describe("create", () => {
		it("should insert a user and return the inserted row", async () => {
			const insertedRow = { id: "user-1", wallet_address: "0xabc", chain_id: SupportedBlockchain.BASE, user_type: UserType.BUSINESS, created_at: "2026-01-01T00:00:00.000Z" };
			const insertBuilder = { values: vi.fn().mockReturnThis(), returning: vi.fn() };
			mockDb.insert.mockReturnValue(insertBuilder);
			insertBuilder.returning.mockResolvedValue([insertedRow]);

			const result = await repository.create({ id: "user-1", wallet_address: "0xabc", chain_id: SupportedBlockchain.BASE, user_type: UserType.BUSINESS });

			expect(result).toEqual(insertedRow);
			expect(mockDb.insert).toHaveBeenCalledTimes(1);
		});

		it("should throw when insert returns empty array", async () => {
			const insertBuilder = { values: vi.fn().mockReturnThis(), returning: vi.fn() };
			mockDb.insert.mockReturnValue(insertBuilder);
			insertBuilder.returning.mockResolvedValue([]);

			await expect(
				repository.create({ id: "user-1", wallet_address: "0xabc", chain_id: SupportedBlockchain.BASE, user_type: UserType.BUSINESS }),
			).rejects.toThrow("User insert returned no rows");
		});
	});

	describe("create_atomicCall", () => {
		const userData = { id: "user-1", wallet_address: "0xabc", chain_id: SupportedBlockchain.BASE, user_type: UserType.BUSINESS };

		it("should return a AtomicCall without executing the query", () => {
			const insertBuilder = { values: vi.fn().mockReturnThis(), returning: vi.fn() };
			mockDb.insert.mockReturnValue(insertBuilder);
			insertBuilder.returning.mockResolvedValue([{ id: "user-1" }]);

			const result = repository.create_atomicCall(userData);

			expect(result).toHaveProperty("query");
			expect(result).toHaveProperty("processResult");
			expect(typeof result.processResult).toBe("function");
			expect(mockDb.insert).toHaveBeenCalledWith(expect.anything());
			expect(insertBuilder.values).toHaveBeenCalledWith(userData);
			expect(insertBuilder.returning).toHaveBeenCalledWith();
			expect(insertBuilder.returning).not.toHaveBeenCalledWith(expect.anything());
		});

		it("should process result and extract first row", () => {
			const insertBuilder = { values: vi.fn().mockReturnThis(), returning: vi.fn() };
			mockDb.insert.mockReturnValue(insertBuilder);

			const call = repository.create_atomicCall(userData);
			const rawRows = [{ id: "user-1", wallet_address: "0xabc", created_at: "2026-01-01T00:00:00.000Z" }];

			const result = call.processResult(rawRows);

			expect(result).toEqual(rawRows[0]);
		});

		it("should throw in processResult when rows array is empty", () => {
			const insertBuilder = { values: vi.fn().mockReturnThis(), returning: vi.fn() };
			mockDb.insert.mockReturnValue(insertBuilder);

			const call = repository.create_atomicCall(userData);

			expect(() => call.processResult([])).toThrow("User insert returned no rows");
		});
	});
});
