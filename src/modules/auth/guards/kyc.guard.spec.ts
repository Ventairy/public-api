import { describe, it, expect, vi } from "vitest";
import { Reflector } from "@nestjs/core";
import { ForbiddenException } from "@nestjs/common";
import { KYCGuard } from "./kyc.guard";
import { VentairyKycStatus } from "@shared/enums";
import { KycNotApprovedException, KycStatusNotAllowedException } from "@shared/exceptions";
import { KYC_REQUIRED_DECORATOR_KEY } from "@shared/decorators/kyc-required.decorator";
import { ALLOWED_KYC_STATUSES_DECORATOR_KEY } from "@shared/decorators/kyc-status.decorator";

function createMockContext(actor?: { kycStatus: VentairyKycStatus }): any {
	return {
		getHandler: vi.fn(),
		getClass: vi.fn(),
		switchToHttp: vi.fn().mockReturnValue({
			getRequest: vi.fn().mockReturnValue({
				user: actor,
			}),
		}),
	};
}

function createMockReflector(overrides: {
	kycRequired?: boolean;
	allowedKycStatuses?: VentairyKycStatus[];
}): Reflector {
	return {
		getAllAndOverride: vi.fn().mockImplementation((key: string) => {
			if (key === KYC_REQUIRED_DECORATOR_KEY) return overrides.kycRequired;
			if (key === ALLOWED_KYC_STATUSES_DECORATOR_KEY) return overrides.allowedKycStatuses;
			return undefined;
		}),
	} as unknown as Reflector;
}

describe("KYCGuard", () => {
	describe("canActivate", () => {
		it("should allow access when no @KYCRequired() or @KYCStatus() decorator is present", () => {
			const guard = new KYCGuard(createMockReflector({}));
			const context = createMockContext({ kycStatus: VentairyKycStatus.PENDING });

			const result = guard.canActivate(context);

			expect(result).toBe(true);
		});

		it("should allow access when @KYCRequired() is set and status is APPROVED", () => {
			const guard = new KYCGuard(createMockReflector({ kycRequired: true }));
			const context = createMockContext({ kycStatus: VentairyKycStatus.APPROVED });

			const result = guard.canActivate(context);

			expect(result).toBe(true);
		});

		it("should throw KycNotApprovedException when @KYCRequired() is set and status is PENDING", () => {
			const guard = new KYCGuard(createMockReflector({ kycRequired: true }));
			const context = createMockContext({ kycStatus: VentairyKycStatus.PENDING });

			expect(() => guard.canActivate(context)).toThrow(KycNotApprovedException);
		});

		it("should throw KycNotApprovedException when @KYCRequired() is set and status is VERIFYING", () => {
			const guard = new KYCGuard(createMockReflector({ kycRequired: true }));
			const context = createMockContext({ kycStatus: VentairyKycStatus.VERIFYING });

			expect(() => guard.canActivate(context)).toThrow(KycNotApprovedException);
		});

		it("should throw KycNotApprovedException when @KYCRequired() is set and status is REJECTED", () => {
			const guard = new KYCGuard(createMockReflector({ kycRequired: true }));
			const context = createMockContext({ kycStatus: VentairyKycStatus.REJECTED });

			expect(() => guard.canActivate(context)).toThrow(KycNotApprovedException);
		});

		it("should throw KycStatusNotAllowedException when @KYCStatus([APPROVED]) is set and status is PENDING", () => {
			const guard = new KYCGuard(createMockReflector({ allowedKycStatuses: [VentairyKycStatus.APPROVED] }));
			const context = createMockContext({ kycStatus: VentairyKycStatus.PENDING });

			expect(() => guard.canActivate(context)).toThrow(KycStatusNotAllowedException);
		});

		it("should allow access when @KYCStatus([PENDING, VERIFYING]) is set and status is VERIFYING", () => {
			const guard = new KYCGuard(
				createMockReflector({ allowedKycStatuses: [VentairyKycStatus.PENDING, VentairyKycStatus.VERIFYING] }),
			);
			const context = createMockContext({ kycStatus: VentairyKycStatus.VERIFYING });

			const result = guard.canActivate(context);

			expect(result).toBe(true);
		});

		it("should throw ForbiddenException when no actor is present but KYC metadata exists", () => {
			const guard = new KYCGuard(createMockReflector({ kycRequired: true }));
			const context = createMockContext(undefined);

			expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
		});

		it("should check class-level decorator if no handler-level decorator exists", () => {
			const reflector = {
				getAllAndOverride: vi.fn().mockReturnValue(true),
			} as unknown as Reflector;
			const guard = new KYCGuard(reflector);
			const context = createMockContext({ kycStatus: VentairyKycStatus.APPROVED });

			const result = guard.canActivate(context);
			expect(result).toBe(true);
			expect(reflector.getAllAndOverride).toHaveBeenCalledWith(KYC_REQUIRED_DECORATOR_KEY, [
				context.getHandler(),
				context.getClass(),
			]);
		});
	});
});
