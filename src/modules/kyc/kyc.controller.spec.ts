import { describe, it, expect, vi, beforeEach } from "vitest";
import { UserType } from "@shared/enums/user-type";
import { KycController } from "./kyc.controller";
import { KycService } from "./kyc.service";
import type { Actor } from "@shared/types/actor.type";
import { KycStatusOutputDto, KycMissingDto } from "./dto";
import { VentairyKycStatus } from "@shared/constants";

const MOCK_ACTOR: Actor = { id: "user-1", sessionId: "s-1", userType: UserType.BUSINESS };

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

	describe("getKycStatus", () => {
		it("should delegate to service.getKycStatus with the full actor", async () => {
			mockService.getKycStatus.mockResolvedValue(MOCK_STATUS);

			const result = await controller.getKycStatus(MOCK_ACTOR);

			expect(mockService.getKycStatus).toHaveBeenCalledWith(MOCK_ACTOR);
			expect(result).toBe(MOCK_STATUS);
		});
	});
});
