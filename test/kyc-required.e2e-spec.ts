import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Test, type TestingModule } from "@nestjs/testing";
import { Controller, Get, HttpCode, HttpStatus, INestApplication } from "@nestjs/common";
import { APP_GUARD, Reflector } from "@nestjs/core";
import supertest from "supertest";
import { JwtAuthGuard } from "@modules/auth/guards/jwt-auth.guard";
import { KYCGuard } from "@modules/auth/guards/kyc.guard";
import { JwtService } from "@modules/auth/jwt/jwt.service";
import { JWT_CONFIG_KEY, type JwtConfig } from "@core/config";
import { KYCRequired, KYCStatus } from "@shared/decorators";
import { Public } from "@shared/decorators/public.decorator";
import { VentairyKycStatus } from "@shared/enums";
import { ACCESS_COOKIE_NAME } from "@modules/auth/constants/token.constants";

@Controller("test")
class TestKycController {
	@Get("required")
	@HttpCode(HttpStatus.OK)
	@KYCRequired()
	kycRequired(): { ok: boolean } {
		return { ok: true };
	}

	@Get("status-pending")
	@HttpCode(HttpStatus.OK)
	@KYCStatus(VentairyKycStatus.PENDING)
	kycStatusPending(): { ok: boolean } {
		return { ok: true };
	}

	@Get("status-verifying")
	@HttpCode(HttpStatus.OK)
	@KYCStatus(VentairyKycStatus.VERIFYING)
	kycStatusVerifying(): { ok: boolean } {
		return { ok: true };
	}

	@Get("status-approved")
	@HttpCode(HttpStatus.OK)
	@KYCStatus(VentairyKycStatus.APPROVED)
	kycStatusApproved(): { ok: boolean } {
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

describe("KYC Required Guard (e2e)", () => {
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
		const jwtAuthGuard = new JwtAuthGuard(reflector, jwtServiceInstance);
		const kycGuard = new KYCGuard(reflector);

		const module: TestingModule = await Test.createTestingModule({
			controllers: [TestKycController],
			providers: [
				{
					provide: JwtService,
					useValue: jwtServiceInstance,
				},
				{
					provide: APP_GUARD,
					useValue: jwtAuthGuard,
				},
				{
					provide: APP_GUARD,
					useValue: kycGuard,
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

	describe("@KYCRequired() endpoint", () => {
		it("should allow access when KYC status is APPROVED", async () => {
			const token = await generateToken(VentairyKycStatus.APPROVED);

			await supertest(app.getHttpServer())
				.get("/test/required")
				.set("Cookie", `${ACCESS_COOKIE_NAME}=${token}`)
				.expect(HttpStatus.OK)
				.expect({ ok: true });
		});

		it("should return 403 with KYC_NOT_APPROVED when status is PENDING", async () => {
			const token = await generateToken(VentairyKycStatus.PENDING);

			await supertest(app.getHttpServer())
				.get("/test/required")
				.set("Cookie", `${ACCESS_COOKIE_NAME}=${token}`)
				.expect(HttpStatus.FORBIDDEN)
				.expect((res) => {
					expect(res.body.code).toBe("KYC_NOT_APPROVED");
					expect(res.body.details.kycStatus).toBe("PENDING");
				});
		});

		it("should return 403 with KYC_NOT_APPROVED when status is VERIFYING", async () => {
			const token = await generateToken(VentairyKycStatus.VERIFYING);

			await supertest(app.getHttpServer())
				.get("/test/required")
				.set("Cookie", `${ACCESS_COOKIE_NAME}=${token}`)
				.expect(HttpStatus.FORBIDDEN)
				.expect((res) => {
					expect(res.body.code).toBe("KYC_NOT_APPROVED");
					expect(res.body.details.kycStatus).toBe("VERIFYING");
				});
		});

		it("should return 403 with KYC_NOT_APPROVED when status is REJECTED", async () => {
			const token = await generateToken(VentairyKycStatus.REJECTED);

			await supertest(app.getHttpServer())
				.get("/test/required")
				.set("Cookie", `${ACCESS_COOKIE_NAME}=${token}`)
				.expect(HttpStatus.FORBIDDEN)
				.expect((res) => {
					expect(res.body.code).toBe("KYC_NOT_APPROVED");
					expect(res.body.details.kycStatus).toBe("REJECTED");
				});
		});
	});

	describe("@KYCStatus() endpoint", () => {
		it("should allow access when user status matches allowed PENDING", async () => {
			const token = await generateToken(VentairyKycStatus.PENDING);

			await supertest(app.getHttpServer())
				.get("/test/status-pending")
				.set("Cookie", `${ACCESS_COOKIE_NAME}=${token}`)
				.expect(HttpStatus.OK)
				.expect({ ok: true });
		});

		it("should allow access when user status matches allowed VERIFYING", async () => {
			const token = await generateToken(VentairyKycStatus.VERIFYING);

			await supertest(app.getHttpServer())
				.get("/test/status-verifying")
				.set("Cookie", `${ACCESS_COOKIE_NAME}=${token}`)
				.expect(HttpStatus.OK)
				.expect({ ok: true });
		});

		it("should deny access when APPROVED is required but status is REJECTED", async () => {
			const token = await generateToken(VentairyKycStatus.REJECTED);

			await supertest(app.getHttpServer())
				.get("/test/status-approved")
				.set("Cookie", `${ACCESS_COOKIE_NAME}=${token}`)
				.expect(HttpStatus.FORBIDDEN)
				.expect((res) => {
					expect(res.body.code).toBe("KYC_STATUS_NOT_ALLOWED");
					expect(res.body.details.kycStatus).toBe("REJECTED");
				});
		});
	});

	describe("no KYC requirement endpoint", () => {
		it("should allow access regardless of KYC status", async () => {
			const token = await generateToken(VentairyKycStatus.PENDING);

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
