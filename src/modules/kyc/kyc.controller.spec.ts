import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserType } from "@shared/enums/user-type";
import { KycController } from "./kyc.controller";
import { KycService } from "./kyc.service";
import type { Actor } from "@shared/types/actor.type";
import { KycStatusOutputDto, KycMissingDto, KycSubmissionOutputDto } from "./dto";
import { VentairyKycStatus } from "@shared/enums";

const MOCK_ACTOR: Actor = { id: "user-1", sessionId: "s-1", userType: UserType.BUSINESS, walletAddress: "0xabc", chainId: 8453 };

const MOCK_STATUS = new KycStatusOutputDto({
	userId: "user-1",
	ventairyKycStatus: VentairyKycStatus.PENDING,
	canSubmitKyc: false,
	submittedAt: null,
	missing: new KycMissingDto({ fields: [], files: [] }),
});

function createMockKycService() {
	return {
		submitKyc: vi.fn(),
		getKycStatus: vi.fn(),
	};
}

describe("KycController", () => {
	let controller: KycController;
	let mockService: ReturnType<typeof createMockKycService>;

	beforeEach(() => {
		mockService = createMockKycService();
		controller = new KycController(mockService as unknown as KycService);
	});

	describe("submitKyc", () => {
		it("should delegate to service.submitKyc with the full actor", async () => {
			const mockResult = new KycSubmissionOutputDto({
				id: "kyc-1",
				userId: "user-1",
				ventairyKycStatus: VentairyKycStatus.VERIFYING,
				submittedAt: "2026-05-12T10:00:00.000Z",
				createdAt: "2026-05-01T00:00:00.000Z",
			});
			mockService.submitKyc.mockResolvedValue(mockResult);

			const result = await controller.submitKyc(MOCK_ACTOR);

			expect(mockService.submitKyc).toHaveBeenCalledWith(MOCK_ACTOR);
			expect(result).toBe(mockResult);
		});
	});

	describe("getKycStatus", () => {
		it("should delegate to service.getKycStatus with the full actor", async () => {
			mockService.getKycStatus.mockResolvedValue(MOCK_STATUS);

			const result = await controller.getKycStatus(MOCK_ACTOR);

			expect(mockService.getKycStatus).toHaveBeenCalledWith(MOCK_ACTOR);
			expect(result).toBe(MOCK_STATUS);
		});
	});
});
