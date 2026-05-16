import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Test, type TestingModule } from "@nestjs/testing";
import { Controller, Get, HttpCode, HttpStatus, INestApplication } from "@nestjs/common";
import { APP_GUARD, Reflector } from "@nestjs/core";
import supertest from "supertest";
import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";
import { VerificationGuard } from "@modules/verification/guards/verification.guard";
import { JwtService } from "@modules/auth/jwt/jwt.service";
import { JWT_CONFIG_KEY, type JwtConfig } from "@core/config";
import { RequireVerification } from "@modules/verification/guards/require-verification.decorator";
import { Public } from "@shared/decorators/public.decorator";
import { VerificationStatus } from "@shared/enums";
import { ACCESS_COOKIE_NAME } from "@modules/auth/constants/token.constants";

@Controller("test")
class TestVerificationController {
	@Get("required")
	@HttpCode(HttpStatus.OK)
	@RequireVerification()
	verificationRequired(): { ok: boolean } {
		return { ok: true };
	}

	@Get("no-requirement")
	@HttpCode(HttpStatus.OK)
	noRequirement(): { ok: boolean } {
		return { ok: true };
	}

	@Get("public")
	@HttpCode(HttpStatus.OK)
	@Public()
	publicEndpoint(): { ok: boolean } {
		return { ok: true };
	}
}

describe("Verification Required Guard (e2e)", () => {
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

		const jwtServiceInstance = new JwtService(mockConfigService as any);
		const jwtAuthGuard = new JwtAuthGuard(new Reflector(), jwtServiceInstance);

		const module: TestingModule = await Test.createTestingModule({
			controllers: [TestVerificationController],
			providers: [
				{
					provide: JwtService,
					useValue: jwtServiceInstance,
				},
				{
					provide: APP_GUARD,
					useValue: jwtAuthGuard,
				},
				VerificationGuard,
			],
		}).compile();

		app = module.createNestApplication();
		jwtService = jwtServiceInstance;
		await app.init();
	});

	afterAll(async () => {
		await app.close();
	});

	async function generateToken(verificationStatus: VerificationStatus): Promise<string> {
		return jwtService.generateAccessToken({
			userId: "test-user-id",
			sessionId: "test-session-id",
			userType: "BUSINESS" as any,
			walletAddress: "0x123",
			chainId: 8453,
			verificationStatus,
		});
	}

	describe("@RequireVerification() endpoint", () => {
		it("should allow access when verification status is VERIFIED", async () => {
			const token = await generateToken(VerificationStatus.VERIFIED);

			await supertest(app.getHttpServer())
				.get("/test/required")
				.set("Cookie", `${ACCESS_COOKIE_NAME}=${token}`)
				.expect(HttpStatus.OK)
				.expect({ ok: true });
		});

		it("should return 403 with VERIFICATION_NOT_APPROVED when status is PENDING", async () => {
			const token = await generateToken(VerificationStatus.PENDING);

			await supertest(app.getHttpServer())
				.get("/test/required")
				.set("Cookie", `${ACCESS_COOKIE_NAME}=${token}`)
				.expect(HttpStatus.FORBIDDEN)
				.expect((res) => {
					expect(res.body.code).toBe("VERIFICATION_NOT_APPROVED");
					expect(res.body.details.verificationStatus).toBe("PENDING");
				});
		});

		it("should return 403 with VERIFICATION_NOT_APPROVED when status is VERIFYING", async () => {
			const token = await generateToken(VerificationStatus.VERIFYING);

			await supertest(app.getHttpServer())
				.get("/test/required")
				.set("Cookie", `${ACCESS_COOKIE_NAME}=${token}`)
				.expect(HttpStatus.FORBIDDEN)
				.expect((res) => {
					expect(res.body.code).toBe("VERIFICATION_NOT_APPROVED");
					expect(res.body.details.verificationStatus).toBe("VERIFYING");
				});
		});

		it("should return 403 with VERIFICATION_NOT_APPROVED when status is REJECTED", async () => {
			const token = await generateToken(VerificationStatus.REJECTED);

			await supertest(app.getHttpServer())
				.get("/test/required")
				.set("Cookie", `${ACCESS_COOKIE_NAME}=${token}`)
				.expect(HttpStatus.FORBIDDEN)
				.expect((res) => {
					expect(res.body.code).toBe("VERIFICATION_NOT_APPROVED");
					expect(res.body.details.verificationStatus).toBe("REJECTED");
				});
		});
	});

	describe("no verification requirement endpoint", () => {
		it("should allow access regardless of verification status", async () => {
			const token = await generateToken(VerificationStatus.PENDING);

			await supertest(app.getHttpServer())
				.get("/test/no-requirement")
				.set("Cookie", `${ACCESS_COOKIE_NAME}=${token}`)
				.expect(HttpStatus.OK)
				.expect({ ok: true });
		});
	});

	describe("public endpoint", () => {
		it("should allow access without any token", async () => {
			await supertest(app.getHttpServer())
				.get("/test/public")
				.expect(HttpStatus.OK)
				.expect({ ok: true });
		});
	});
});