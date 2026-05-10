import { describe, it, expect, vi, beforeEach } from "vitest";
import { DRIZZLE_DB, type DrizzleDb } from "@core/database";
import { SignatureNonceRepository } from "./signature-nonce.repository";

function createMockDb() {
	return {
		insert: vi.fn().mockReturnThis(),
		values: vi.fn().mockResolvedValue(undefined),
		select: vi.fn().mockReturnThis(),
		from: vi.fn().mockReturnThis(),
		where: vi.fn(),
		delete: vi.fn().mockReturnThis(),
		returning: vi.fn(),
	};
}

describe("SignatureNonceRepository", () => {
	let repository: SignatureNonceRepository;
	let mockDb: ReturnType<typeof createMockDb>;

	beforeEach(() => {
		vi.clearAllMocks();
		mockDb = createMockDb();
		repository = new SignatureNonceRepository(mockDb as unknown as DrizzleDb);
	});

	describe("create", () => {
		it("should insert a nonce row", async () => {
			const data = {
				id: "uuid-1",
				nonce: "abc123",
				wallet_address: "0xabc",
				expires_at: "2026-01-01T00:00:00.000Z",
			};

			await repository.create(data);

			expect(mockDb.insert).toHaveBeenCalledTimes(1);
			expect(mockDb.values).toHaveBeenCalledWith(data);
		});
	});

	describe("findByNonce", () => {
		it("should return the row when found", async () => {
			const expectedRow = { id: "1", nonce: "abc123" };
			const selectBuilder = { from: vi.fn().mockReturnThis(), where: vi.fn() };
			mockDb.select.mockReturnValue(selectBuilder);
			selectBuilder.where.mockResolvedValue([expectedRow]);

			const result = await repository.findByNonce("abc123");

			expect(result).toEqual(expectedRow);
		});

		it("should return undefined when not found", async () => {
			const selectBuilder = { from: vi.fn().mockReturnThis(), where: vi.fn() };
			mockDb.select.mockReturnValue(selectBuilder);
			selectBuilder.where.mockResolvedValue([]);

			const result = await repository.findByNonce("nonexistent");

			expect(result).toBeUndefined();
		});
	});

	describe("deleteByNonceAndWalletAddress", () => {
		it("should delete and return the deleted row when found", async () => {
			const deletedRow = { id: "1", nonce: "abc123", wallet_address: "0xabc" };
			const deleteBuilder = { where: vi.fn().mockReturnThis(), returning: vi.fn() };
			mockDb.delete.mockReturnValue(deleteBuilder);
			deleteBuilder.returning.mockResolvedValue([deletedRow]);

			const result = await repository.deleteByNonceAndWalletAddress("abc123", "0xabc");

			expect(result).toEqual(deletedRow);
		});

		it("should return undefined when no row matches", async () => {
			const deleteBuilder = { where: vi.fn().mockReturnThis(), returning: vi.fn() };
			mockDb.delete.mockReturnValue(deleteBuilder);
			deleteBuilder.returning.mockResolvedValue([]);

			const result = await repository.deleteByNonceAndWalletAddress("abc123", "0xabc");

			expect(result).toBeUndefined();
		});
	});

	describe("deleteExpired", () => {
		it("should delete rows with expires_at <= now", async () => {
			const deleteBuilder = { where: vi.fn().mockResolvedValue(undefined) };
			mockDb.delete.mockReturnValue(deleteBuilder);

			await repository.deleteExpired();

			expect(mockDb.delete).toHaveBeenCalledTimes(1);
			expect(deleteBuilder.where).toHaveBeenCalledTimes(1);
		});
	});
});
