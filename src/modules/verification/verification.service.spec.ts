import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserType } from "@shared/enums";
import { VerificationStatus } from "@shared/enums/verification-status";
import { VerificationSubmissionLockedException } from "@shared/exceptions/verification-submission-locked.exception";
import { VerificationSubmissionRequirementsNotMetException } from "@shared/exceptions/verification-submission-requirements-not-met.exception";
import { UserVerificationNotFoundException } from "@shared/exceptions/user-verification-not-found.exception";
import { VerificationService } from "./verification.service";
import { VerificationMissingDto } from "./dto";
import type { Actor } from "@shared/types/actor.type";

const MOCK_USER_ID = "user-123";
const MOCK_ACTOR: Actor = { id: MOCK_USER_ID, sessionId: "session-1", userType: UserType.BUSINESS, walletAddress: "0xabc", chainId: 8453, verificationStatus: VerificationStatus.VERIFIED };

function createMockMissingData(overrides: Partial<{ fields: string[]; files: string[] }> = {}): VerificationMissingDto {
	return new VerificationMissingDto({ fields: overrides.fields ?? [], files: overrides.files ?? [] });
}

describe("VerificationService", () => {
	let service: VerificationService;
	let mockVerificationRepository: any;
	let mockKybService: any;

	beforeEach(() => {
		mockVerificationRepository = {
			findByUserId: vi.fn(),
			getVerificationStatus: vi.fn(),
			create: vi.fn(),
			updateStatusByUserId: vi.fn(),
		};

		mockKybService = {
			getKybMissingData: vi.fn().mockResolvedValue(createMockMissingData()),
		};

		service = new VerificationService(mockVerificationRepository, mockKybService);
	});

	describe("submitVerification", () => {
		it("should throw UserVerificationNotFoundException when user has no verification record", async () => {
			mockVerificationRepository.getVerificationStatus.mockRejectedValue(new UserVerificationNotFoundException(MOCK_USER_ID));

			await expect(service.submitVerification(MOCK_ACTOR)).rejects.toThrow(UserVerificationNotFoundException);
		});

		it("should throw VerificationSubmissionLockedException when user is APPROVED", async () => {
			mockVerificationRepository.getVerificationStatus.mockResolvedValue(VerificationStatus.VERIFIED);

			await expect(service.submitVerification(MOCK_ACTOR)).rejects.toThrow(VerificationSubmissionLockedException);

			expect(mockVerificationRepository.getVerificationStatus).toHaveBeenCalledWith(MOCK_USER_ID);
		});

		it("should throw VerificationSubmissionLockedException when user is REJECTED", async () => {
			mockVerificationRepository.getVerificationStatus.mockResolvedValue(VerificationStatus.REJECTED);

			await expect(service.submitVerification(MOCK_ACTOR)).rejects.toThrow(VerificationSubmissionLockedException);

			expect(mockVerificationRepository.getVerificationStatus).toHaveBeenCalledWith(MOCK_USER_ID);
		});

		it("should throw VerificationSubmissionRequirementsNotMetException when required fields are missing", async () => {
			mockVerificationRepository.getVerificationStatus.mockResolvedValue(VerificationStatus.PENDING);
			mockKybService.getKybMissingData.mockResolvedValue(createMockMissingData({ fields: ["business.legal_name"] }));

			await expect(service.submitVerification(MOCK_ACTOR)).rejects.toThrow(VerificationSubmissionRequirementsNotMetException);

			expect(mockVerificationRepository.getVerificationStatus).toHaveBeenCalledWith(MOCK_USER_ID);
		});

		it("should throw VerificationSubmissionRequirementsNotMetException when required files are missing", async () => {
			mockVerificationRepository.getVerificationStatus.mockResolvedValue(VerificationStatus.PENDING);
			mockKybService.getKybMissingData.mockResolvedValue(createMockMissingData({ files: ["business.PROOF_OF_ADDRESS"] }));

			await expect(service.submitVerification(MOCK_ACTOR)).rejects.toThrow(VerificationSubmissionRequirementsNotMetException);

			expect(mockVerificationRepository.getVerificationStatus).toHaveBeenCalledWith(MOCK_USER_ID);
		});

		it("should include missing details in VerificationSubmissionRequirementsNotMetException", async () => {
			mockVerificationRepository.getVerificationStatus.mockResolvedValue(VerificationStatus.PENDING);
			mockKybService.getKybMissingData.mockResolvedValue(createMockMissingData({ fields: ["business.legal_name"], files: [] }));

			let thrownError: VerificationSubmissionRequirementsNotMetException | undefined;
			try {
				await service.submitVerification(MOCK_ACTOR);
			} catch (error) {
				thrownError = error as VerificationSubmissionRequirementsNotMetException;
			}

			expect(thrownError).toBeDefined();
			expect(thrownError!.details!["missing"]).toHaveProperty("fields");
			expect(thrownError!.details!["missing"]).toHaveProperty("files");
		});

		it("should delegate to KybService for missing data computation", async () => {
			mockVerificationRepository.getVerificationStatus.mockResolvedValue(VerificationStatus.PENDING);
			mockKybService.getKybMissingData.mockResolvedValue(createMockMissingData());
			mockVerificationRepository.updateStatusByUserId.mockResolvedValue({
				id: "ver-001",
				user_id: MOCK_USER_ID,
				verification_status: VerificationStatus.VERIFYING,
				verification_submitted_at: "2026-05-05T10:00:00.000Z",
				created_at: "2026-05-04T14:48:00.000Z",
			});

			await service.submitVerification(MOCK_ACTOR);

			expect(mockKybService.getKybMissingData).toHaveBeenCalledWith(MOCK_ACTOR, "throw");
		});

		it("should update verification status to VERIFYING on successful submit", async () => {
			mockVerificationRepository.getVerificationStatus.mockResolvedValue(VerificationStatus.PENDING);
			mockKybService.getKybMissingData.mockResolvedValue(createMockMissingData());
			mockVerificationRepository.updateStatusByUserId.mockResolvedValue({
				id: "ver-001",
				user_id: MOCK_USER_ID,
				verification_status: VerificationStatus.VERIFYING,
				verification_submitted_at: "2026-05-05T10:00:00.000Z",
				created_at: "2026-05-04T14:48:00.000Z",
			});

			const result = await service.submitVerification(MOCK_ACTOR);

			expect(mockVerificationRepository.updateStatusByUserId).toHaveBeenCalledWith({
				userId: MOCK_USER_ID,
				status: VerificationStatus.VERIFYING,
				submittedAt: expect.any(String),
			});
			expect(result.verificationStatus).toBe(VerificationStatus.VERIFYING);
			expect(result.userId).toBe(MOCK_USER_ID);

			expect(mockVerificationRepository.getVerificationStatus).toHaveBeenCalledWith(MOCK_USER_ID);
		});
	});

	describe("getVerificationStatus", () => {
		it("should throw UserVerificationNotFoundException when user has no verification record", async () => {
			mockVerificationRepository.findByUserId.mockResolvedValue(undefined);

			await expect(service.getVerificationStatus(MOCK_ACTOR)).rejects.toThrow(UserVerificationNotFoundException);
		});

		it("should delegate to KybService with notFoundBehaviour null", async () => {
			mockVerificationRepository.findByUserId.mockResolvedValue({
				id: "ver-001",
				user_id: MOCK_USER_ID,
				verification_status: VerificationStatus.PENDING,
				verification_submitted_at: null,
				created_at: "2026-05-04T14:48:00.000Z",
			});
			mockKybService.getKybMissingData.mockResolvedValue(createMockMissingData({ fields: ["business.legal_name"] }));

			await service.getVerificationStatus(MOCK_ACTOR);

			expect(mockKybService.getKybMissingData).toHaveBeenCalledWith(MOCK_ACTOR, "null");
		});

		it("should return verification status and missing data from KybService", async () => {
			mockVerificationRepository.findByUserId.mockResolvedValue({
				id: "ver-001",
				user_id: MOCK_USER_ID,
				verification_status: VerificationStatus.PENDING,
				verification_submitted_at: null,
				created_at: "2026-05-04T14:48:00.000Z",
			});
			mockKybService.getKybMissingData.mockResolvedValue(createMockMissingData({ fields: ["business.legal_name"], files: ["business.PROOF_OF_ADDRESS"] }));

			const result = await service.getVerificationStatus(MOCK_ACTOR);

			expect(result.verificationStatus).toBe(VerificationStatus.PENDING);
			expect(result.canSubmit).toBe(false);
			expect(result.missing.fields).toContain("business.legal_name");
			expect(result.missing.files).toContain("business.PROOF_OF_ADDRESS");
			expect(mockVerificationRepository.findByUserId).toHaveBeenCalledWith(MOCK_USER_ID);
		});

		it("should return VERIFYING status when user has verification_submitted_at", async () => {
			mockVerificationRepository.findByUserId.mockResolvedValue({
				id: "ver-001",
				user_id: MOCK_USER_ID,
				verification_status: VerificationStatus.VERIFYING,
				verification_submitted_at: "2026-05-05T10:00:00.000Z",
				created_at: "2026-05-04T14:48:00.000Z",
			});

			const result = await service.getVerificationStatus(MOCK_ACTOR);

			expect(result.verificationStatus).toBe(VerificationStatus.VERIFYING);
			expect(result.submittedAt).toBe("2026-05-05T10:00:00.000Z");

			expect(mockVerificationRepository.findByUserId).toHaveBeenCalledWith(MOCK_USER_ID);
		});

		it("should set can_submit to true when all data and files are provided", async () => {
			mockVerificationRepository.findByUserId.mockResolvedValue({
				id: "ver-001",
				user_id: MOCK_USER_ID,
				verification_status: VerificationStatus.PENDING,
				verification_submitted_at: null,
				created_at: "2026-05-04T14:48:00.000Z",
			});
			mockKybService.getKybMissingData.mockResolvedValue(createMockMissingData());

			const result = await service.getVerificationStatus(MOCK_ACTOR);

			expect(result.canSubmit).toBe(true);
			expect(result.missing.fields).toHaveLength(0);
			expect(result.missing.files).toHaveLength(0);
		});

		it("should set can_submit to false when status is not PENDING", async () => {
			mockVerificationRepository.findByUserId.mockResolvedValue({
				id: "ver-001",
				user_id: MOCK_USER_ID,
				verification_status: VerificationStatus.VERIFYING,
				verification_submitted_at: null,
				created_at: "2026-05-04T14:48:00.000Z",
			});

			const result = await service.getVerificationStatus(MOCK_ACTOR);

			expect(result.verificationStatus).toBe(VerificationStatus.VERIFYING);
			expect(result.canSubmit).toBe(false);
		});
	});
});