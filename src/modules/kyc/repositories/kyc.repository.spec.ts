import { describe, it, expect, vi, beforeEach } from "vitest";
import { DRIZZLE_DB, type DrizzleDb, type AtomicCall } from "@core/database";
import { KycRepository } from "./kyc.repository";
import { VentairyKycStatus } from "@shared/enums/ventairy-kyc-status";

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

describe("KycRepository", () => {
	let repository: KycRepository;
	let mockDb: ReturnType<typeof createMockDb>;

	beforeEach(() => {
		vi.clearAllMocks();
		mockDb = createMockDb();
		repository = new KycRepository(mockDb as unknown as DrizzleDb);
	});

	describe("findByUserId", () => {
		it("should return the kyc row when found", async () => {
			const expectedRow = { id: "kyc-1", user_id: "user-1", ventairy_kyc_status: VentairyKycStatus.PENDING };
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

	describe("create", () => {
		it("should insert a kyc row", async () => {
			const data = { id: "kyc-1", user_id: "user-1" };

			await repository.create(data);

			expect(mockDb.insert).toHaveBeenCalledTimes(1);
			expect(mockDb.values).toHaveBeenCalledWith(data);
		});
	});

	describe("create_atomicCall", () => {
		const kycData = { id: "kyc-1", user_id: "user-1" };

		it("should return a AtomicCall without executing the query", () => {
			const insertBuilder = { values: vi.fn().mockReturnThis() };
			mockDb.insert.mockReturnValue(insertBuilder);

			const result = repository.create_atomicCall(kycData);

			expect(result).toHaveProperty("query");
			expect(result).toHaveProperty("processResult");
			expect(typeof result.processResult).toBe("function");
			expect(mockDb.insert).toHaveBeenCalledWith(expect.anything());
			expect(insertBuilder.values).toHaveBeenCalledWith(kycData);
			expect(mockDb.values).not.toHaveBeenCalledWith(expect.anything());
		});

		it("processResult should return undefined", () => {
			const insertBuilder = { values: vi.fn().mockReturnThis() };
			mockDb.insert.mockReturnValue(insertBuilder);

			const call = repository.create_atomicCall(kycData);

			expect(call.processResult([{ id: "kyc-1" }])).toBeUndefined();
			expect(call.processResult([])).toBeUndefined();
		});
	});

	describe("updateStatusByUserId", () => {
		it("should update kyc status and submitted_at and return the updated row", async () => {
			const updatedRow = { id: "kyc-1", user_id: "user-1", ventairy_kyc_status: VentairyKycStatus.VERIFYING, kyc_submitted_at: "2026-01-01T00:00:00.000Z" };
			const updateBuilder = { set: vi.fn().mockReturnThis(), where: vi.fn().mockReturnThis(), returning: vi.fn().mockResolvedValue([updatedRow]) };
			mockDb.update.mockReturnValue(updateBuilder);

			const result = await repository.updateStatusByUserId({
				userId: "user-1",
				status: VentairyKycStatus.VERIFYING,
				submittedAt: "2026-01-01T00:00:00.000Z",
			});

			expect(mockDb.update).toHaveBeenCalledTimes(1);
			expect(updateBuilder.set).toHaveBeenCalledWith({
				ventairy_kyc_status: VentairyKycStatus.VERIFYING,
				kyc_submitted_at: "2026-01-01T00:00:00.000Z",
			});
			expect(updateBuilder.returning).toHaveBeenCalledTimes(1);
			expect(result).toEqual(updatedRow);
		});

		it("should update only status when submittedAt is not provided", async () => {
			const updatedRow = { id: "kyc-1", user_id: "user-1", ventairy_kyc_status: VentairyKycStatus.REJECTED, kyc_submitted_at: null };
			const updateBuilder = { set: vi.fn().mockReturnThis(), where: vi.fn().mockReturnThis(), returning: vi.fn().mockResolvedValue([updatedRow]) };
			mockDb.update.mockReturnValue(updateBuilder);

			const result = await repository.updateStatusByUserId({ userId: "user-1", status: VentairyKycStatus.REJECTED });

			expect(updateBuilder.set).toHaveBeenCalledWith({
				ventairy_kyc_status: VentairyKycStatus.REJECTED,
			});
			expect(updateBuilder.returning).toHaveBeenCalledTimes(1);
			expect(result).toEqual(updatedRow);
		});
	});
});
