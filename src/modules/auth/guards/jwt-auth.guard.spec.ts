import { describe, it, expect, vi, beforeEach } from "vitest";
import { Reflector } from "@nestjs/core";
import { JwtAuthGuard } from "./jwt-auth.guard";
import { JwtService } from "../jwt/jwt.service";
import { UnauthorizedException } from "@nestjs/common";
import { UserType, VerificationStatus } from "@shared/enums";

function createMockContext(overrides?: {
	isPublic?: boolean;
	cookie?: string;
}): any {
	const cookieHeader = overrides?.cookie ? `__Host-ventairy-access=${overrides.cookie}` : undefined;
	return {
		getHandler: vi.fn(),
		getClass: vi.fn(),
		switchToHttp: vi.fn().mockReturnValue({
			getRequest: vi.fn().mockReturnValue({
				headers: {
					cookie: cookieHeader,
				},
			}),
		}),
	};
}

function createMockReflector(isPublic: boolean): Reflector {
	return {
		getAllAndOverride: vi.fn().mockReturnValue(isPublic),
	} as unknown as Reflector;
}

	function createMockJwtService(shouldSucceed: boolean): JwtService {
		return {
			verifyAccessToken: shouldSucceed
				? vi.fn().mockResolvedValue({ sub: "u-1", sid: "s-1", user_type: UserType.BUSINESS, wallet_address: "0xabc", chain_id: 8453, verification_status: VerificationStatus.VERIFIED, iat: 1000, exp: 2000 })
				: vi.fn().mockRejectedValue(new UnauthorizedException("Invalid token")),
		} as unknown as JwtService;
	}

describe("JwtAuthGuard", () => {
	describe("canActivate", () => {
		it("should allow access for @Public() routes", async () => {
			const guard = new JwtAuthGuard(createMockReflector(true), createMockJwtService(true));
			const context = createMockContext({ isPublic: true });

			const result = await guard.canActivate(context);

			expect(result).toBe(true);
		});

		it("should allow access with valid access token cookie", async () => {
			const guard = new JwtAuthGuard(createMockReflector(false), createMockJwtService(true));
			const context = createMockContext({ cookie: "valid-token" });

			const result = await guard.canActivate(context);

			expect(result).toBe(true);
		});

		it("should set request.user with id, sessionId, userType, walletAddress, chainId, and verificationStatus from payload", async () => {
			const guard = new JwtAuthGuard(createMockReflector(false), createMockJwtService(true));
			const request = { headers: { cookie: "__Host-ventairy-access=valid-token" } };
			const context = {
				getHandler: vi.fn(),
				getClass: vi.fn(),
				switchToHttp: vi.fn().mockReturnValue({
					getRequest: vi.fn().mockReturnValue(request),
				}),
			};

			await guard.canActivate(context as any);

			expect((request as any).user).toEqual({
				id: "u-1",
				sessionId: "s-1",
				userType: UserType.BUSINESS,
				walletAddress: "0xabc",
				chainId: 8453,
				verificationStatus: VerificationStatus.VERIFIED,
			});
		});

		it("should throw UnauthorizedException when access token is missing", async () => {
			const guard = new JwtAuthGuard(createMockReflector(false), createMockJwtService(true));
			const context = createMockContext();

			await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
		});

		it("should throw UnauthorizedException when access token is invalid", async () => {
			const guard = new JwtAuthGuard(createMockReflector(false), createMockJwtService(false));
			const context = createMockContext({ cookie: "invalid-token" });

			await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
		});
	});
});
