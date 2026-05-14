import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { Test, type TestingModule } from "@nestjs/testing";
import { Controller, Get, HttpCode, HttpStatus, INestApplication } from "@nestjs/common";
import type { Response } from "supertest";
import { APP_GUARD, Reflector } from "@nestjs/core";
import { type ThrottlerStorage } from "@nestjs/throttler";
import supertest from "supertest";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { RateLimitGuard } from "@shared/rate-limit/rate-limit.guard";
import { UserTypeGuard } from "../guards/user-type.guard";
import { KYCGuard } from "../guards/kyc.guard";
import { JwtService } from "../jwt/jwt.service";
import { JWT_CONFIG_KEY, type JwtConfig } from "@core/config";
import { KYCRequired } from "@shared/decorators";
import { Public } from "@shared/decorators/public.decorator";
import { VentairyKycStatus } from "@shared/enums";
import { ACCESS_COOKIE_NAME } from "../constants/token.constants";

@Controller("test")
class TestGuardOrderController {
	@Get("kyc-required")
	@HttpCode(HttpStatus.OK)
	@KYCRequired()
	kycRequired(): { ok: boolean } {
		return { ok: true };
	}

	@Get("public")
	@HttpCode(HttpStatus.OK)
	@Public()
	publicEndpoint(): { ok: boolean } {
		return { ok: true };
	}
}

describe("Guard ordering: JwtAuthGuard → RateLimitGuard → UserTypeGuard → KYCGuard", () => {
	let app: INestApplication;
	let jwtService: JwtService;
	const testSecret = "test-secret-that-is-long-enough-for-hs256-algorithm!";

	beforeAll(async () => {
		const mockConfigService = {
			get: (key: string) => {
				if (key === JWT_CONFIG_KEY) return { secret: testSecret } satisfies JwtConfig;
				return undefined;
			},
		};

		const reflector = new Reflector();
		const jwtServiceInstance = new JwtService(mockConfigService as any);
		jwtService = jwtServiceInstance;
		const jwtAuthGuard = new JwtAuthGuard(reflector, jwtServiceInstance);
		const mockStorage = {
			increment: vi.fn().mockResolvedValue({
				totalHits: 1,
				timeToExpire: 60,
				isBlocked: false,
				timeToBlockExpire: 0,
			}),
		} as unknown as ThrottlerStorage;
		const rateLimitGuard = new RateLimitGuard(
			[{ name: "default", ttl: 60_000, limit: 100 }],
			mockStorage,
			reflector,
		);
		const userTypeGuard = new UserTypeGuard(reflector);
		const kycGuard = new KYCGuard(reflector);

		const module: TestingModule = await Test.createTestingModule({
			controllers: [TestGuardOrderController],
			providers: [
				{
					provide: APP_GUARD,
					useValue: jwtAuthGuard,
				},
				{
					provide: APP_GUARD,
					useValue: rateLimitGuard,
				},
				{
					provide: APP_GUARD,
					useValue: userTypeGuard,
				},
				{
					provide: APP_GUARD,
					useValue: kycGuard,
				},
			],
		}).compile();

		app = module.createNestApplication();
		await app.init();
	});

	afterAll(async () => {
		await app.close();
	});

	async function generateToken(kycStatus: VentairyKycStatus): Promise<string> {
		return jwtService.generateAccessToken({
			userId: "test-user-id",
			sessionId: "test-session-id",
			userType: "BUSINESS" as any,
			walletAddress: "0x123",
			chainId: 8453,
			kycStatus,
		});
	}

	describe("Ordering proof: JwtAuthGuard runs before KYCGuard", () => {
		it("should return 401 (not 403) when no token is sent to a protected route", async () => {
			await supertest(app.getHttpServer())
				.get("/test/kyc-required")
				.expect(HttpStatus.UNAUTHORIZED);
		});

		it("should return 401 (not 403) when an invalid token is sent", async () => {
			await supertest(app.getHttpServer())
				.get("/test/kyc-required")
				.set("Cookie", `${ACCESS_COOKIE_NAME}=invalid-token`)
				.expect(HttpStatus.UNAUTHORIZED);
		});

		it("should return 403 with KYC_NOT_APPROVED when token has non-APPROVED KYC status", async () => {
			const token = await generateToken(VentairyKycStatus.PENDING);

			await supertest(app.getHttpServer())
				.get("/test/kyc-required")
				.set("Cookie", `${ACCESS_COOKIE_NAME}=${token}`)
				.expect(HttpStatus.FORBIDDEN)
				.expect((res: Response) => {
					expect(res.body.code).toBe("KYC_NOT_APPROVED");
				});
		});
	});

	describe("Full chain passes for legitimate requests", () => {
		it("should allow access when token has APPROVED KYC status", async () => {
			const token = await generateToken(VentairyKycStatus.APPROVED);

			await supertest(app.getHttpServer())
				.get("/test/kyc-required")
				.set("Cookie", `${ACCESS_COOKIE_NAME}=${token}`)
				.expect(HttpStatus.OK)
				.expect({ ok: true });
		});
	});

	describe("Public routes bypass all guards", () => {
		it("should allow access to public endpoint without any token", async () => {
			await supertest(app.getHttpServer())
				.get("/test/public")
				.expect(HttpStatus.OK)
				.expect({ ok: true });
		});
	});
});
