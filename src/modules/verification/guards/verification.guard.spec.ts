import { describe, it, expect, vi } from "vitest";
import { VerificationGuard } from "./verification.guard";
import { VerificationStatus } from "@shared/enums";
import { VerificationNotApprovedException } from "@shared/exceptions";

function createMockContext(actor?: { id: string }): any {
	return {
		switchToHttp: () => ({
			getRequest: () => ({ user: actor }),
		}),
	};
}

function createMockRepository() {
	return {
		getVerificationStatus: vi.fn(),
	};
}

describe("VerificationGuard", () => {
	describe("canActivate", () => {
		it("should allow access when verification status is VERIFIED", async () => {
			const mockRepository = createMockRepository();
			mockRepository.getVerificationStatus.mockResolvedValue(VerificationStatus.VERIFIED);
			const guard = new VerificationGuard(mockRepository as any);
			const context = createMockContext({ id: "user-1" });

			const result = await guard.canActivate(context);

			expect(result).toBe(true);
			expect(mockRepository.getVerificationStatus).toHaveBeenCalledWith("user-1");
		});

		it("should throw VerificationNotApprovedException when status is PENDING", async () => {
			const mockRepository = createMockRepository();
			mockRepository.getVerificationStatus.mockResolvedValue(VerificationStatus.PENDING);
			const guard = new VerificationGuard(mockRepository as any);
			const context = createMockContext({ id: "user-1" });

			await expect(guard.canActivate(context)).rejects.toThrow(VerificationNotApprovedException);
		});

		it("should throw VerificationNotApprovedException when status is VERIFYING", async () => {
			const mockRepository = createMockRepository();
			mockRepository.getVerificationStatus.mockResolvedValue(VerificationStatus.VERIFYING);
			const guard = new VerificationGuard(mockRepository as any);
			const context = createMockContext({ id: "user-1" });

			await expect(guard.canActivate(context)).rejects.toThrow(VerificationNotApprovedException);
		});

		it("should throw VerificationNotApprovedException when status is REJECTED", async () => {
			const mockRepository = createMockRepository();
			mockRepository.getVerificationStatus.mockResolvedValue(VerificationStatus.REJECTED);
			const guard = new VerificationGuard(mockRepository as any);
			const context = createMockContext({ id: "user-1" });

			await expect(guard.canActivate(context)).rejects.toThrow(VerificationNotApprovedException);
		});

		it("should propagate error when repository throws", async () => {
			const mockRepository = createMockRepository();
			mockRepository.getVerificationStatus.mockRejectedValue(new Error("Verification row not found for user user-1"));
			const guard = new VerificationGuard(mockRepository as any);
			const context = createMockContext({ id: "user-1" });

			await expect(guard.canActivate(context)).rejects.toThrow("Verification row not found for user user-1");
		});
	});
});
