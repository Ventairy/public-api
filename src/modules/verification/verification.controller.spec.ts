import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserType } from "@shared/enums/user-type";
import { VerificationController } from "./verification.controller";
import { VerificationService } from "./verification.service";
import type { Actor } from "@shared/types/actor.type";
import { VerificationStatusOutputDto, VerificationMissingDto, VerificationSubmissionOutputDto } from "./dto";
import { VerificationStatus } from "@shared/enums";

const MOCK_ACTOR: Actor = { id: "user-1", sessionId: "s-1", userType: UserType.BUSINESS, walletAddress: "0xabc", chainId: 8453, verificationStatus: VerificationStatus.VERIFIED };

const MOCK_STATUS = new VerificationStatusOutputDto({
	userId: "user-1",
	verificationStatus: VerificationStatus.PENDING,
	canSubmit: false,
	submittedAt: null,
	missing: new VerificationMissingDto({ fields: [], files: [] }),
});

function createMockVerificationService() {
	return {
		submitVerification: vi.fn(),
		getVerificationStatus: vi.fn(),
	};
}

describe("VerificationController", () => {
	let controller: VerificationController;
	let mockService: ReturnType<typeof createMockVerificationService>;

	beforeEach(() => {
		mockService = createMockVerificationService();
		controller = new VerificationController(mockService as unknown as VerificationService);
	});

	describe("submitVerification", () => {
		it("should delegate to service.submitVerification with the full actor", async () => {
			const mockResult = new VerificationSubmissionOutputDto({
				id: "kyc-1",
				userId: "user-1",
				verificationStatus: VerificationStatus.VERIFYING,
				submittedAt: "2026-05-12T10:00:00.000Z",
				createdAt: "2026-05-01T00:00:00.000Z",
			});
			mockService.submitVerification.mockResolvedValue(mockResult);

			const result = await controller.submitVerification(MOCK_ACTOR);

			expect(mockService.submitVerification).toHaveBeenCalledWith(MOCK_ACTOR);
			expect(result).toBe(mockResult);
		});
	});

	describe("getVerificationStatus", () => {
		it("should delegate to service.getVerificationStatus with the full actor", async () => {
			mockService.getVerificationStatus.mockResolvedValue(MOCK_STATUS);

			const result = await controller.getVerificationStatus(MOCK_ACTOR);

			expect(mockService.getVerificationStatus).toHaveBeenCalledWith(MOCK_ACTOR);
			expect(result).toBe(MOCK_STATUS);
		});
	});
});
