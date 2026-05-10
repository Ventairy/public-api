import { describe, it, expect, vi } from "vitest";
import { Reflector } from "@nestjs/core";
import { ForbiddenException } from "@nestjs/common";
import { UserTypeGuard } from "./user-type.guard";
import { UserType } from "@shared/enums/user-type";
import { BusinessOnlyException } from "@shared/exceptions/business-only.exception";
import { ALLOWED_USER_TYPES_DECORATOR_KEY } from "@shared/decorators/user-type.decorator";

function createMockContext(actor?: { userType: UserType }): any {
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

function createMockReflector(allowedTypes: UserType[] | undefined): Reflector {
	return {
		getAllAndOverride: vi.fn().mockImplementation((key: string) => {
			if (key === ALLOWED_USER_TYPES_DECORATOR_KEY) return allowedTypes;
			return undefined;
		}),
	} as unknown as Reflector;
}

describe("UserTypeGuard", () => {
	describe("canActivate", () => {
		it("should allow access when no @BusinessUserOnly() decorator is present", () => {
			const guard = new UserTypeGuard(createMockReflector(undefined));
			const context = createMockContext({ userType: UserType.BUSINESS });

			const result = guard.canActivate(context);

			expect(result).toBe(true);
		});

		it("should allow access when user type matches the allowed types", () => {
			const guard = new UserTypeGuard(createMockReflector([UserType.BUSINESS]));
			const context = createMockContext({ userType: UserType.BUSINESS });

			const result = guard.canActivate(context);

			expect(result).toBe(true);
		});

		it("should throw BusinessOnlyException when user type does not match", () => {
			const guard = new UserTypeGuard(createMockReflector([UserType.BUSINESS]));
			const context = createMockContext({ userType: "INDIVIDUAL" as UserType });

			expect(() => guard.canActivate(context)).toThrow(BusinessOnlyException);
		});

		it("should throw ForbiddenException when no actor is present but type restriction exists", () => {
			const guard = new UserTypeGuard(createMockReflector([UserType.BUSINESS]));
			const context = createMockContext(undefined);

			expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
		});

		it("should check class-level decorator if no handler-level decorator exists", () => {
			const reflector = {
				getAllAndOverride: vi.fn().mockReturnValue([UserType.BUSINESS]),
			} as unknown as Reflector;
			const guard = new UserTypeGuard(reflector);
			const context = createMockContext({ userType: UserType.BUSINESS });

			const result = guard.canActivate(context);
			expect(result).toBe(true);
			expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ALLOWED_USER_TYPES_DECORATOR_KEY, [
				context.getHandler(),
				context.getClass(),
			]);
		});
	});
});
