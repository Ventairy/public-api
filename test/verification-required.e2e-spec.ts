import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { Test, type TestingModule } from "@nestjs/testing";
import { Controller, Get, HttpCode, HttpStatus, INestApplication, CanActivate, ExecutionContext, UseGuards } from "@nestjs/common";
import { APP_GUARD, Reflector } from "@nestjs/core";
import supertest from "supertest";
import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";
import { JwtService } from "@modules/auth/jwt/jwt.service";
import { JWT_CONFIG_KEY, type JwtConfig } from "@core/config";
import { Public } from "@shared/decorators/public.decorator";
import { VerificationStatus } from "@shared/enums";
import { VerificationNotApprovedException } from "@shared/exceptions";
import { ACCESS_COOKIE_NAME } from "@modules/auth/constants/token.constants";

const mockVerificationRepository = { getVerificationStatus: vi.fn() };

class TestVerificationGuard implements CanActivate {
	public async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const actor: { id: string } | undefined = request.user;

		const verificationStatus = await mockVerificationRepository.getVerificationStatus(actor!.id);

		if (verificationStatus === VerificationStatus.VERIFIED) return true;

		throw new VerificationNotApprovedException({ verificationStatus });
	}
}

function RequireVerificationForTest(): ReturnType<typeof UseGuards> {
	return UseGuards(TestVerificationGuard);
}

@Controller("test")
class TestVerificationController {
	@Get("required")
	@HttpCode(HttpStatus.OK)
	@RequireVerificationForTest()
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
			],
		}).compile();

		app = module.createNestApplication();
		jwtService = jwtServiceInstance;
		await app.init();
	});

	afterAll(async () => {
		await app.close();
	});

	async function generateToken(): Promise<string> {
		return jwtService.generateAccessToken({
			userId: "test-user-id",
			sessionId: "test-session-id",
			userType: "BUSINESS" as any,
			walletAddress: "0x123",
			chainId: 8453,
		});
	}

	describe("@RequireVerification() endpoint", () => {
		it("should allow access when verification status is VERIFIED", async () => {
			mockVerificationRepository.getVerificationStatus.mockResolvedValue(VerificationStatus.VERIFIED);
			const token = await generateToken();

			await supertest(app.getHttpServer())
				.get("/test/required")
				.set("Cookie", `${ACCESS_COOKIE_NAME}=${token}`)
				.expect(HttpStatus.OK)
				.expect({ ok: true });
		});

		it("should return 403 with VERIFICATION_NOT_APPROVED when status is PENDING", async () => {
			mockVerificationRepository.getVerificationStatus.mockResolvedValue(VerificationStatus.PENDING);
			const token = await generateToken();

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
			mockVerificationRepository.getVerificationStatus.mockResolvedValue(VerificationStatus.VERIFYING);
			const token = await generateToken();

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
			mockVerificationRepository.getVerificationStatus.mockResolvedValue(VerificationStatus.REJECTED);
			const token = await generateToken();

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
			mockVerificationRepository.getVerificationStatus.mockResolvedValue(VerificationStatus.PENDING);
			const token = await generateToken();

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
