import { describe, it, expect, vi, beforeEach } from "vitest";
import { ConfigService } from "@nestjs/config";
import { UnauthorizedException } from "@nestjs/common";
import { JwtService } from "./jwt.service";
import { UserType } from "@shared/enums/user-type";
import { VentairyKycStatus } from "@shared/enums";

function createMockConfigService(secret: string): ConfigService {
	return {
		get: vi.fn().mockImplementation((key: string) => {
			if (key === "jwt") return { secret };
			return undefined;
		}),
	} as unknown as ConfigService;
}

describe("JwtService", () => {
	const validSecret = "this-is-a-256-bit-secret-key-minimum-length!";
	let service: JwtService;

	beforeEach(() => {
		const configService = createMockConfigService(validSecret);
		service = new JwtService(configService);
	});

	const defaultParams = { userId: "u-1", sessionId: "s-1", userType: UserType.BUSINESS as UserType, walletAddress: "0xabc", chainId: 8453, kycStatus: VentairyKycStatus.APPROVED };

	describe("generateAccessToken", () => {
		it("should generate a valid JWT string", async () => {
			const token = await service.generateAccessToken(defaultParams);

			expect(token).toBeTruthy();
			expect(typeof token).toBe("string");
			expect(token.split(".")).toHaveLength(3);
		});
	});

	describe("verifyAccessToken", () => {
		it("should return payload for valid token", async () => {
			const token = await service.generateAccessToken(defaultParams);
			const payload = await service.verifyAccessToken(token);

			expect(payload.sub).toBe("u-1");
			expect(payload.sid).toBe("s-1");
			expect(payload.user_type).toBe(UserType.BUSINESS);
			expect(payload.wallet_address).toBe("0xabc");
			expect(payload.chain_id).toBe(8453);
			expect(payload.kyc_status).toBe(VentairyKycStatus.APPROVED);
			expect(payload.iat).toBeGreaterThan(0);
			expect(payload.exp).toBeGreaterThan(0);
		});

		it("should include user_type in the generated token", async () => {
			const token = await service.generateAccessToken(defaultParams);
			const payload = await service.verifyAccessToken(token);

			expect(payload.user_type).toBe(UserType.BUSINESS);
		});

		it("should throw UnauthorizedException for expired token", async () => {
			const expiredToken = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1LTEiLCJzaWQiOiJzLTEiLCJpYXQiOjEwMDAwMDAwMDAsImV4cCI6MTAwMDAwMDAwMX0.invalid";

			await expect(service.verifyAccessToken(expiredToken)).rejects.toThrow(UnauthorizedException);
		});

		it("should throw UnauthorizedException for malformed token", async () => {
			await expect(service.verifyAccessToken("not-a-token")).rejects.toThrow(UnauthorizedException);
		});

		it("should throw UnauthorizedException for token signed with wrong secret", async () => {
			const differentService = new JwtService(createMockConfigService("different-secret-that-is-also-long-enough-for-hs256!"));
			const token = await differentService.generateAccessToken(defaultParams);

			await expect(service.verifyAccessToken(token)).rejects.toThrow(UnauthorizedException);
		});

		it("should throw UnauthorizedException when sub is missing", async () => {
			const { SignJWT } = await import("jose");
			const secret = new TextEncoder().encode(validSecret);
			const token = await new SignJWT({ sid: "s-1", user_type: UserType.BUSINESS })
				.setProtectedHeader({ alg: "HS256" })
				.setIssuedAt()
				.setExpirationTime("900s")
				.sign(secret);

			await expect(service.verifyAccessToken(token)).rejects.toThrow(UnauthorizedException);
		});

		it("should throw UnauthorizedException when sid is missing", async () => {
			const { SignJWT } = await import("jose");
			const secret = new TextEncoder().encode(validSecret);
			const token = await new SignJWT({ sub: "u-1", user_type: UserType.BUSINESS })
				.setProtectedHeader({ alg: "HS256" })
				.setIssuedAt()
				.setExpirationTime("900s")
				.sign(secret);

			await expect(service.verifyAccessToken(token)).rejects.toThrow(UnauthorizedException);
		});

		it("should throw UnauthorizedException when user_type is missing", async () => {
			const { SignJWT } = await import("jose");
			const secret = new TextEncoder().encode(validSecret);
			const token = await new SignJWT({ sub: "u-1", sid: "s-1" })
				.setProtectedHeader({ alg: "HS256" })
				.setIssuedAt()
				.setExpirationTime("900s")
				.sign(secret);

			await expect(service.verifyAccessToken(token)).rejects.toThrow(UnauthorizedException);
		});

		it("should throw UnauthorizedException when wallet_address is missing", async () => {
			const { SignJWT } = await import("jose");
			const secret = new TextEncoder().encode(validSecret);
			const token = await new SignJWT({ sub: "u-1", sid: "s-1", user_type: UserType.BUSINESS })
				.setProtectedHeader({ alg: "HS256" })
				.setIssuedAt()
				.setExpirationTime("900s")
				.sign(secret);

			await expect(service.verifyAccessToken(token)).rejects.toThrow(UnauthorizedException);
		});

		it("should throw UnauthorizedException when kyc_status is missing", async () => {
			const { SignJWT } = await import("jose");
			const secret = new TextEncoder().encode(validSecret);
			const token = await new SignJWT({ sub: "u-1", sid: "s-1", user_type: UserType.BUSINESS, wallet_address: "0xabc" })
				.setProtectedHeader({ alg: "HS256" })
				.setIssuedAt()
				.setExpirationTime("900s")
				.sign(secret);

			await expect(service.verifyAccessToken(token)).rejects.toThrow(UnauthorizedException);
		});
	});
});
