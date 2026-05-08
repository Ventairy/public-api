import { describe, it, expect, vi, beforeEach } from "vitest";
import { VentairyKycStatus } from "@shared/enums/ventairy-kyc-status";
import { KycSubmissionLockedException } from "@shared/exceptions/kyc-submission-locked.exception";
import { UserNotFoundException } from "@shared/exceptions/user-not-found.exception";
import { KycService } from "./kyc.service";

const MOCK_USER_ID = "user-123";

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
	let mockKycRepository: any;

	beforeEach(() => {
		mockKycRepository = {
			findByUserId: vi.fn(),
			create: vi.fn(),
			updateStatusByUserId: vi.fn(),
		} as any;
		service = new KycService(mockKycRepository);
	});

	describe("submitKyc", () => {
		it("should throw UserNotFoundException when user has no kyc record", async () => {
			mockKycRepository.findByUserId.mockResolvedValue(undefined);

			await expect(service.submitKyc(MOCK_USER_ID)).rejects.toThrow(UserNotFoundException);
		});

		it("should throw KycSubmissionLockedException when user is APPROVED", async () => {
			const mockKyc = createMockKyc({ ventairy_kyc_status: VentairyKycStatus.APPROVED });
			mockKycRepository.findByUserId.mockResolvedValue(mockKyc as any);

			await expect(service.submitKyc(MOCK_USER_ID)).rejects.toThrow(KycSubmissionLockedException);
		});

		it("should throw KycSubmissionLockedException when user is REJECTED", async () => {
			const mockKyc = createMockKyc({ ventairy_kyc_status: VentairyKycStatus.REJECTED });
			mockKycRepository.findByUserId.mockResolvedValue(mockKyc as any);

			await expect(service.submitKyc(MOCK_USER_ID)).rejects.toThrow(KycSubmissionLockedException);
		});

		it("should update kyc status to VERIFYING on successful submit", async () => {
			const mockKyc = createMockKyc({ ventairy_kyc_status: VentairyKycStatus.PENDING });
			const updatedKyc = createMockKyc({
				ventairy_kyc_status: VentairyKycStatus.VERIFYING,
				kyc_submitted_at: "2026-05-05T10:00:00.000Z",
			});

			mockKycRepository.findByUserId.mockResolvedValue(mockKyc as any);
			mockKycRepository.findByUserId.mockResolvedValueOnce(mockKyc as any);
			mockKycRepository.findByUserId.mockResolvedValueOnce(updatedKyc as any);

			const result = await service.submitKyc(MOCK_USER_ID);

			expect(mockKycRepository.updateStatusByUserId).toHaveBeenCalledWith({
				userId: MOCK_USER_ID,
				status: VentairyKycStatus.VERIFYING,
				submittedAt: expect.any(String),
			});
			expect(result.ventairyKycStatus).toBe(VentairyKycStatus.VERIFYING);
			expect(result.userId).toBe(MOCK_USER_ID);
		});
	});

	describe("getKycStatus", () => {
		it("should throw UserNotFoundException when user has no kyc record", async () => {
			mockKycRepository.findByUserId.mockResolvedValue(undefined);

			await expect(service.getKycStatus(MOCK_USER_ID)).rejects.toThrow(UserNotFoundException);
		});

		it("should return PENDING status when user has no kyc_submitted_at", async () => {
			const mockKyc = createMockKyc({ kyc_submitted_at: null });
			mockKycRepository.findByUserId.mockResolvedValue(mockKyc as any);

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
			mockKycRepository.findByUserId.mockResolvedValue(mockKyc as any);

			const result = await service.getKycStatus(MOCK_USER_ID);

			expect(result.ventairyKycStatus).toBe(VentairyKycStatus.VERIFYING);
			expect(result.submittedAt).toBe("2026-05-05T10:00:00.000Z");
		});
	});
});
