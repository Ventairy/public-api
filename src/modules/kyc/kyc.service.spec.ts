import { describe, it, expect, vi, beforeEach } from "vitest";
import { VentairyKycStatus } from "@shared/enums/ventairy-kyc-status";
import { KycSubmissionLockedException } from "@shared/exceptions/kyc-submission-locked.exception";
import { UserNotFoundException } from "@shared/exceptions/user-not-found.exception";
import { KycService } from "./kyc.service";

const MOCK_USER_ID = "user-123";

function createMockDb() {
	return {
		select: vi.fn().mockReturnThis(),
		from: vi.fn().mockReturnThis(),
		where: vi.fn().mockReturnThis(),
		set: vi.fn().mockReturnThis(),
		values: vi.fn().mockReturnThis(),
		returning: vi.fn(),
		insert: vi.fn().mockReturnThis(),
		update: vi.fn().mockReturnThis(),
		delete: vi.fn().mockReturnThis(),
	};
}

function createMockDrizzleService() {
	return { db: createMockDb() };
}

function createMockKyc(overrides: Record<string, unknown> = {}) {
	return {
		id: "kyc-001",
		user_id: MOCK_USER_ID,
		ventairy_kyc_status: VentairyKycStatus.PENDING,
		kyc_submitted_at: null as string | null,
		created_at: "2026-05-04T14:48:00.000Z",
		...overrides,
	};
}

describe("KycService", () => {
	let service: KycService;
	let mockDrizzleService: ReturnType<typeof createMockDrizzleService>;

	beforeEach(() => {
		vi.clearAllMocks();
		mockDrizzleService = createMockDrizzleService();
		service = new KycService(mockDrizzleService as unknown as import("@core/database/drizzle.service").DrizzleService);
	});

	describe("submitKyc", () => {
		it("should throw UserNotFoundException when user has no kyc record", async () => {
			mockDrizzleService.db.select.mockReturnThis();
			mockDrizzleService.db.from.mockReturnThis();
			mockDrizzleService.db.where.mockResolvedValue([]);

			await expect(service.submitKyc(MOCK_USER_ID)).rejects.toThrow(UserNotFoundException);
		});

		it("should throw KycSubmissionLockedException when user is APPROVED", async () => {
			const mockKyc = createMockKyc({ ventairy_kyc_status: VentairyKycStatus.APPROVED });

			mockDrizzleService.db.select.mockReturnThis();
			mockDrizzleService.db.from.mockReturnThis();
			mockDrizzleService.db.where.mockResolvedValue([mockKyc]);

			await expect(service.submitKyc(MOCK_USER_ID)).rejects.toThrow(KycSubmissionLockedException);
		});

		it("should throw KycSubmissionLockedException when user is REJECTED", async () => {
			const mockKyc = createMockKyc({ ventairy_kyc_status: VentairyKycStatus.REJECTED });

			mockDrizzleService.db.select.mockReturnThis();
			mockDrizzleService.db.from.mockReturnThis();
			mockDrizzleService.db.where.mockResolvedValue([mockKyc]);

			await expect(service.submitKyc(MOCK_USER_ID)).rejects.toThrow(KycSubmissionLockedException);
		});

		it("should update kyc status to VERIFYING on successful submit", async () => {
			const mockKyc = createMockKyc({ ventairy_kyc_status: VentairyKycStatus.PENDING });
			const updatedKyc = createMockKyc({
				ventairy_kyc_status: VentairyKycStatus.VERIFYING,
				kyc_submitted_at: "2026-05-05T10:00:00.000Z",
			});

			mockDrizzleService.db.select.mockReturnThis();
			mockDrizzleService.db.from.mockReturnThis();
			mockDrizzleService.db.where
				.mockResolvedValueOnce([mockKyc])
				.mockResolvedValueOnce([mockKyc])
				.mockResolvedValueOnce([updatedKyc]);
			mockDrizzleService.db.update.mockReturnThis();
			mockDrizzleService.db.set.mockReturnThis();

			const result = await service.submitKyc(MOCK_USER_ID);

			expect(mockDrizzleService.db.update).toHaveBeenCalled();
			expect(mockDrizzleService.db.set).toHaveBeenCalled();
			expect(result.ventairyKycStatus).toBe(VentairyKycStatus.VERIFYING);
			expect(result.userId).toBe(MOCK_USER_ID);
		});
	});

	describe("getKycStatus", () => {
		it("should throw UserNotFoundException when user has no kyc record", async () => {
			mockDrizzleService.db.select.mockReturnThis();
			mockDrizzleService.db.from.mockReturnThis();
			mockDrizzleService.db.where.mockResolvedValue([]);

			await expect(service.getKycStatus(MOCK_USER_ID)).rejects.toThrow(UserNotFoundException);
		});

		it("should return PENDING status when user has no kyc_submitted_at", async () => {
			const mockKyc = createMockKyc({ kyc_submitted_at: null });

			mockDrizzleService.db.select.mockReturnThis();
			mockDrizzleService.db.from.mockReturnThis();
			mockDrizzleService.db.where.mockResolvedValue([mockKyc]);

			const result = await service.getKycStatus(MOCK_USER_ID);

			expect(result.ventairyKycStatus).toBe(VentairyKycStatus.PENDING);
			expect(result.userId).toBe(MOCK_USER_ID);
			expect(result.submittedAt).toBeNull();
		});

		it("should return VERIFYING status when user has kyc_submitted_at", async () => {
			const mockKyc = createMockKyc({
				kyc_submitted_at: "2026-05-05T10:00:00.000Z",
				ventairy_kyc_status: VentairyKycStatus.VERIFYING,
			});

			mockDrizzleService.db.select.mockReturnThis();
			mockDrizzleService.db.from.mockReturnThis();
			mockDrizzleService.db.where.mockResolvedValue([mockKyc]);

			const result = await service.getKycStatus(MOCK_USER_ID);

			expect(result.ventairyKycStatus).toBe(VentairyKycStatus.VERIFYING);
			expect(result.submittedAt).toBe("2026-05-05T10:00:00.000Z");
		});
	});
});
