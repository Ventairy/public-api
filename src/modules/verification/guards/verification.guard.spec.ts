import { describe, it, expect } from "vitest";
import { VerificationGuard } from "./verification.guard";
import { VerificationStatus } from "@shared/enums";
import { VerificationNotApprovedException } from "@shared/exceptions";

function createMockContext(actor?: { verificationStatus: VerificationStatus }): any {
	return {
		switchToHttp: () => ({
			getRequest: () => ({ user: actor }),
		}),
	};
}

describe("VerificationGuard", () => {
	describe("canActivate", () => {
		it("should allow access when verification status is APPROVED", () => {
			const guard = new VerificationGuard();
			const context = createMockContext({ verificationStatus: VerificationStatus.VERIFIED });

			const result = guard.canActivate(context);

			expect(result).toBe(true);
		});

		it("should throw VerificationNotApprovedException when status is PENDING", () => {
			const guard = new VerificationGuard();
			const context = createMockContext({ verificationStatus: VerificationStatus.PENDING });

			expect(() => guard.canActivate(context)).toThrow(VerificationNotApprovedException);
		});

		it("should throw VerificationNotApprovedException when status is VERIFYING", () => {
			const guard = new VerificationGuard();
			const context = createMockContext({ verificationStatus: VerificationStatus.VERIFYING });

			expect(() => guard.canActivate(context)).toThrow(VerificationNotApprovedException);
		});

		it("should throw VerificationNotApprovedException when status is REJECTED", () => {
			const guard = new VerificationGuard();
			const context = createMockContext({ verificationStatus: VerificationStatus.REJECTED });

			expect(() => guard.canActivate(context)).toThrow(VerificationNotApprovedException);
		});
	});
});