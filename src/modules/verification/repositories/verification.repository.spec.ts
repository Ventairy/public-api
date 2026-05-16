import { describe, it, expect, vi, beforeEach } from "vitest";
import { DRIZZLE_DB, type DrizzleDb, type AtomicCall } from "@core/database";
import { VerificationRepository } from "./verification.repository";
import { VerificationStatus } from "@shared/enums/verification-status";

function createMockDb() {
	return {
		select: vi.fn().mockReturnThis(),
		from: vi.fn().mockReturnThis(),
		where: vi.fn(),
		insert: vi.fn().mockReturnThis(),
		values: vi.fn().mockResolvedValue(undefined),
		update: vi.fn().mockReturnThis(),
		set: vi.fn().mockResolvedValue(undefined),
	};
}

describe("VerificationRepository", () => {
	let repository: VerificationRepository;
	let mockDb: ReturnType<typeof createMockDb>;

	beforeEach(() => {
		vi.clearAllMocks();
		mockDb = createMockDb();
		repository = new VerificationRepository(mockDb as unknown as DrizzleDb);
	});

	describe("findByUserId", () => {
		it("should return the verification row when found", async () => {
			const expectedRow = { id: "kyc-1", user_id: "user-1", verification_status: VerificationStatus.PENDING };
			const selectBuilder = { from: vi.fn().mockReturnThis(), where: vi.fn() };
			mockDb.select.mockReturnValue(selectBuilder);
			selectBuilder.where.mockResolvedValue([expectedRow]);

			const result = await repository.findByUserId("user-1");

			expect(result).toEqual(expectedRow);
		});

		it("should return undefined when not found", async () => {
			const selectBuilder = { from: vi.fn().mockReturnThis(), where: vi.fn() };
			mockDb.select.mockReturnValue(selectBuilder);
			selectBuilder.where.mockResolvedValue([]);

			const result = await repository.findByUserId("nonexistent");

			expect(result).toBeUndefined();
		});
	});

	describe("getVerificationStatus", () => {
		it("should return verification status when found", async () => {
			const expectedRow = { id: "kyc-1", user_id: "user-1", verification_status: VerificationStatus.VERIFIED };
			const selectBuilder = { from: vi.fn().mockReturnThis(), where: vi.fn() };
			mockDb.select.mockReturnValue(selectBuilder);
			selectBuilder.where.mockResolvedValue([expectedRow]);

			const result = await repository.getVerificationStatus("user-1");

			expect(result).toBe(VerificationStatus.VERIFIED);
		});

		it("should throw when user not found", async () => {
			const selectBuilder = { from: vi.fn().mockReturnThis(), where: vi.fn() };
			mockDb.select.mockReturnValue(selectBuilder);
			selectBuilder.where.mockResolvedValue([]);

			await expect(repository.getVerificationStatus("nonexistent")).rejects.toThrow("Verification row not found for user nonexistent");
		});
	});

	describe("create", () => {
		it("should insert a verification row and return it", async () => {
			const data = { id: "kyc-1", user_id: "user-1" };
			const newRow = { id: "kyc-1", user_id: "user-1", verification_status: VerificationStatus.PENDING };
			const insertBuilder = { values: vi.fn().mockReturnThis(), returning: vi.fn().mockResolvedValue([newRow]) };
			mockDb.insert.mockReturnValue(insertBuilder);

			const result = await repository.create(data);

			expect(mockDb.insert).toHaveBeenCalledTimes(1);
			expect(insertBuilder.values).toHaveBeenCalledWith(data);
			expect(result).toEqual(newRow);
		});
	});

	describe("create_atomicCall", () => {
		const verificationData = { id: "kyc-1", user_id: "user-1" };

		it("should return a AtomicCall without executing the query", () => {
			const insertBuilder = { values: vi.fn().mockReturnThis(), returning: vi.fn().mockReturnThis() };
			mockDb.insert.mockReturnValue(insertBuilder);

			const result = repository.create_atomicCall(verificationData);

			expect(result).toHaveProperty("query");
			expect(result).toHaveProperty("processResult");
			expect(typeof result.processResult).toBe("function");
			expect(mockDb.insert).toHaveBeenCalledWith(expect.anything());
			expect(insertBuilder.values).toHaveBeenCalledWith(verificationData);
			expect(insertBuilder.returning).toHaveBeenCalled();
			expect(mockDb.values).not.toHaveBeenCalledWith(expect.anything());
		});

		it("processResult should return the first row", () => {
			const insertBuilder = { values: vi.fn().mockReturnThis(), returning: vi.fn().mockReturnThis() };
			mockDb.insert.mockReturnValue(insertBuilder);

			const call = repository.create_atomicCall(verificationData);

			expect(call.processResult([{ id: "kyc-1", verification_status: "PENDING" }])).toEqual({
				id: "kyc-1",
				verification_status: "PENDING",
			});
		});

		it("processResult should throw if no rows returned", () => {
			const insertBuilder = { values: vi.fn().mockReturnThis(), returning: vi.fn().mockReturnThis() };
			mockDb.insert.mockReturnValue(insertBuilder);

			const call = repository.create_atomicCall(verificationData);

			expect(() => call.processResult([])).toThrow("Verification insert returned no rows");
		});
	});

	describe("updateStatusByUserId", () => {
		it("should update verification status and submitted_at and return the updated row", async () => {
			const updatedRow = { id: "kyc-1", user_id: "user-1", verification_status: VerificationStatus.VERIFYING, verification_submitted_at: "2026-01-01T00:00:00.000Z" };
			const updateBuilder = { set: vi.fn().mockReturnThis(), where: vi.fn().mockReturnThis(), returning: vi.fn().mockResolvedValue([updatedRow]) };
			mockDb.update.mockReturnValue(updateBuilder);

			const result = await repository.updateStatusByUserId({
				userId: "user-1",
				status: VerificationStatus.VERIFYING,
				submittedAt: "2026-01-01T00:00:00.000Z",
			});

			expect(mockDb.update).toHaveBeenCalledTimes(1);
			expect(updateBuilder.set).toHaveBeenCalledWith({
				verification_status: VerificationStatus.VERIFYING,
				verification_submitted_at: "2026-01-01T00:00:00.000Z",
			});
			expect(updateBuilder.returning).toHaveBeenCalledTimes(1);
			expect(result).toEqual(updatedRow);
		});

		it("should update only status when submittedAt is not provided", async () => {
			const updatedRow = { id: "kyc-1", user_id: "user-1", verification_status: VerificationStatus.REJECTED, verification_submitted_at: null };
			const updateBuilder = { set: vi.fn().mockReturnThis(), where: vi.fn().mockReturnThis(), returning: vi.fn().mockResolvedValue([updatedRow]) };
			mockDb.update.mockReturnValue(updateBuilder);

			const result = await repository.updateStatusByUserId({ userId: "user-1", status: VerificationStatus.REJECTED });

			expect(updateBuilder.set).toHaveBeenCalledWith({
				verification_status: VerificationStatus.REJECTED,
			});
			expect(updateBuilder.returning).toHaveBeenCalledTimes(1);
			expect(result).toEqual(updatedRow);
		});
	});
});
