import { describe, it, expect, vi, beforeEach } from "vitest";
import { ConfigService } from "@nestjs/config";
import { UnauthorizedException } from "@nestjs/common";
import { JwtService } from "./jwt.service";

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

	describe("generateAccessToken", () => {
		it("should generate a valid JWT string", async () => {
			const token = await service.generateAccessToken({ userId: "u-1", sessionId: "s-1" });

			expect(token).toBeTruthy();
			expect(typeof token).toBe("string");
			expect(token.split(".")).toHaveLength(3);
		});
	});

	describe("verifyAccessToken", () => {
		it("should return payload for valid token", async () => {
			const token = await service.generateAccessToken({ userId: "u-1", sessionId: "s-1" });
			const payload = await service.verifyAccessToken(token);

			expect(payload.sub).toBe("u-1");
			expect(payload.sid).toBe("s-1");
			expect(payload.iat).toBeGreaterThan(0);
			expect(payload.exp).toBeGreaterThan(0);
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
			const token = await differentService.generateAccessToken({ userId: "u-1", sessionId: "s-1" });

			await expect(service.verifyAccessToken(token)).rejects.toThrow(UnauthorizedException);
		});

		it("should throw UnauthorizedException when sub is missing", async () => {
			const { SignJWT } = await import("jose");
			const secret = new TextEncoder().encode(validSecret);
			const token = await new SignJWT({ sid: "s-1" })
				.setProtectedHeader({ alg: "HS256" })
				.setIssuedAt()
				.setExpirationTime("900s")
				.sign(secret);

			await expect(service.verifyAccessToken(token)).rejects.toThrow(UnauthorizedException);
		});

		it("should throw UnauthorizedException when sid is missing", async () => {
			const { SignJWT } = await import("jose");
			const secret = new TextEncoder().encode(validSecret);
			const token = await new SignJWT({ sub: "u-1" })
				.setProtectedHeader({ alg: "HS256" })
				.setIssuedAt()
				.setExpirationTime("900s")
				.sign(secret);

			await expect(service.verifyAccessToken(token)).rejects.toThrow(UnauthorizedException);
		});
	});
});
