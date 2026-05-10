import { describe, it, expect, vi, beforeEach } from "vitest";
import { DRIZZLE_DB, type DrizzleDb } from "@core/database";
import { UserSessionRepository } from "./user-session.repository";

function createMockDb() {
	return {
		insert: vi.fn().mockReturnThis(),
		values: vi.fn().mockReturnThis(),
		returning: vi.fn(),
		select: vi.fn().mockReturnThis(),
		from: vi.fn().mockReturnThis(),
		where: vi.fn(),
		delete: vi.fn().mockReturnThis(),
		update: vi.fn().mockReturnThis(),
		set: vi.fn().mockReturnThis(),
	};
}

describe("UserSessionRepository", () => {
	let repository: UserSessionRepository;
	let mockDb: ReturnType<typeof createMockDb>;

	beforeEach(() => {
		vi.clearAllMocks();
		mockDb = createMockDb();
		repository = new UserSessionRepository(mockDb as unknown as DrizzleDb);
	});

	describe("create", () => {
		it("should insert and return a session row", async () => {
			const data = {
				id: "s-1",
				user_id: "u-1",
				refresh_token_hash: "hash123",
				device_info: "Mozilla/5.0",
				ip_address: "127.0.0.1",
				expires_at: "2026-01-01T00:00:00.000Z",
			};
			mockDb.returning.mockResolvedValue([data]);

			const result = await repository.create(data);

			expect(mockDb.insert).toHaveBeenCalledTimes(1);
			expect(mockDb.values).toHaveBeenCalledWith(data);
			expect(result).toEqual(data);
		});

		it("should throw when insert returns no rows", async () => {
			mockDb.returning.mockResolvedValue([]);
			const data = {
				id: "s-1",
				user_id: "u-1",
				refresh_token_hash: "hash123",
				expires_at: "2026-01-01T00:00:00.000Z",
			};

			await expect(repository.create(data)).rejects.toThrow("User session insert returned no rows");
		});
	});

	describe("findByRefreshTokenHash", () => {
		it("should return the row when found", async () => {
			const expectedRow = { id: "s-1", refresh_token_hash: "hash123" };
			const selectBuilder = { from: vi.fn().mockReturnThis(), where: vi.fn() };
			mockDb.select.mockReturnValue(selectBuilder);
			selectBuilder.where.mockResolvedValue([expectedRow]);

			const result = await repository.findByRefreshTokenHash("hash123");

			expect(result).toEqual(expectedRow);
		});

		it("should return undefined when not found", async () => {
			const selectBuilder = { from: vi.fn().mockReturnThis(), where: vi.fn() };
			mockDb.select.mockReturnValue(selectBuilder);
			selectBuilder.where.mockResolvedValue([]);

			const result = await repository.findByRefreshTokenHash("nonexistent");

			expect(result).toBeUndefined();
		});
	});

	describe("findById", () => {
		it("should return the row when found", async () => {
			const expectedRow = { id: "s-1" };
			const selectBuilder = { from: vi.fn().mockReturnThis(), where: vi.fn() };
			mockDb.select.mockReturnValue(selectBuilder);
			selectBuilder.where.mockResolvedValue([expectedRow]);

			const result = await repository.findById("s-1");

			expect(result).toEqual(expectedRow);
		});

		it("should return undefined when not found", async () => {
			const selectBuilder = { from: vi.fn().mockReturnThis(), where: vi.fn() };
			mockDb.select.mockReturnValue(selectBuilder);
			selectBuilder.where.mockResolvedValue([]);

			const result = await repository.findById("nonexistent");

			expect(result).toBeUndefined();
		});
	});

	describe("findByUserId", () => {
		it("should return all sessions for a user", async () => {
			const sessions = [{ id: "s-1" }, { id: "s-2" }];
			const selectBuilder = { from: vi.fn().mockReturnThis(), where: vi.fn() };
			mockDb.select.mockReturnValue(selectBuilder);
			selectBuilder.where.mockResolvedValue(sessions);

			const result = await repository.findByUserId("u-1");

			expect(result).toHaveLength(2);
			expect(result).toEqual(sessions);
		});
	});

	describe("updateRefreshTokenHash", () => {
		it("should update and return the session row", async () => {
			const updatedRow = { id: "s-1", refresh_token_hash: "new-hash" };
			const updateBuilder = { set: vi.fn().mockReturnThis(), where: vi.fn().mockReturnThis(), returning: vi.fn() };
			mockDb.update.mockReturnValue(updateBuilder);
			updateBuilder.returning.mockResolvedValue([updatedRow]);

			const result = await repository.updateRefreshTokenHash({
				id: "s-1",
				refreshTokenHash: "new-hash",
				expiresAt: "2026-01-08T00:00:00.000Z",
				updatedAt: "2026-01-01T01:00:00.000Z",
			});

			expect(result).toEqual(updatedRow);
			expect(mockDb.update).toHaveBeenCalledWith(expect.anything());
			expect(updateBuilder.set).toHaveBeenCalledWith({
				refresh_token_hash: "new-hash",
				expires_at: "2026-01-08T00:00:00.000Z",
				updated_at: "2026-01-01T01:00:00.000Z",
			});
		});

		it("should throw when update returns no rows", async () => {
			const updateBuilder = { set: vi.fn().mockReturnThis(), where: vi.fn().mockReturnThis(), returning: vi.fn() };
			mockDb.update.mockReturnValue(updateBuilder);
			updateBuilder.returning.mockResolvedValue([]);

			await expect(
				repository.updateRefreshTokenHash({
					id: "nonexistent",
					refreshTokenHash: "hash",
					expiresAt: "2026-01-08T00:00:00.000Z",
					updatedAt: "2026-01-01T01:00:00.000Z",
				}),
			).rejects.toThrow("User session nonexistent not updated");
		});
	});

	describe("deleteById", () => {
		it("should delete the session by id", async () => {
			const deleteBuilder = { where: vi.fn().mockResolvedValue(undefined) };
			mockDb.delete.mockReturnValue(deleteBuilder);

			await repository.deleteById("s-1");

			expect(mockDb.delete).toHaveBeenCalledTimes(1);
			expect(deleteBuilder.where).toHaveBeenCalledTimes(1);
		});
	});

	describe("deleteByUserId", () => {
		it("should delete all sessions for a user", async () => {
			const deleteBuilder = { where: vi.fn().mockResolvedValue(undefined) };
			mockDb.delete.mockReturnValue(deleteBuilder);

			await repository.deleteByUserId("u-1");

			expect(mockDb.delete).toHaveBeenCalledTimes(1);
			expect(deleteBuilder.where).toHaveBeenCalledTimes(1);
		});
	});

	describe("deleteExpired", () => {
		it("should delete expired sessions and return count", async () => {
			const deleteBuilder = { where: vi.fn().mockReturnThis(), returning: vi.fn() };
			mockDb.delete.mockReturnValue(deleteBuilder);
			deleteBuilder.returning.mockResolvedValue([{ id: "s-1" }, { id: "s-2" }]);

			const result = await repository.deleteExpired();

			expect(result).toBe(2);
			expect(mockDb.delete).toHaveBeenCalledTimes(1);
		});

		it("should return 0 when no expired sessions", async () => {
			const deleteBuilder = { where: vi.fn().mockReturnThis(), returning: vi.fn() };
			mockDb.delete.mockReturnValue(deleteBuilder);
			deleteBuilder.returning.mockResolvedValue([]);

			const result = await repository.deleteExpired();

			expect(result).toBe(0);
		});
	});
});
