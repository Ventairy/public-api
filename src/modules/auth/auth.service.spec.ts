import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ConfigService } from "@nestjs/config";
import type { Request } from "express";
import { CryptoUtils } from "@shared/utils/crypto.utils";
import { AuthService } from "./auth.service";
import { SiweVerifierService } from "./verification/siwe-verifier.service";
import { UserRepository } from "@modules/users/repositories/user.repository";
import { JwtService } from "./jwt/jwt.service";
import { UserSessionRepository } from "./repositories/user-session.repository";
import { UserNotFoundException } from "@shared/exceptions/user-not-found.exception";
import { SessionExpiredException } from "@shared/exceptions/session-expired.exception";
import { SessionNotFoundException } from "@shared/exceptions/session-not-found.exception";

function createMockAuthServiceDeps() {
	return {
		siweVerifierService: { verify: vi.fn().mockResolvedValue(undefined) } as unknown as SiweVerifierService,
		userRepository: {
			findByWalletAddress: vi.fn(),
		} as unknown as UserRepository,
		jwtService: {
			generateAccessToken: vi.fn().mockResolvedValue("access-token-123"),
		} as unknown as JwtService,
		userSessionRepository: {
			create: vi.fn().mockResolvedValue({ id: "s-1", user_id: "u-1" }),
			findByRefreshTokenHash: vi.fn(),
			findById: vi.fn(),
			findByUserId: vi.fn(),
			updateRefreshTokenHash: vi.fn().mockResolvedValue({}),
			deleteById: vi.fn().mockResolvedValue(undefined),
			deleteByUserId: vi.fn().mockResolvedValue(undefined),
			deleteExpired: vi.fn().mockResolvedValue(0),
		} as unknown as UserSessionRepository,
		configService: {} as ConfigService,
	};
}

describe("AuthService", () => {
	let service: AuthService;
	let deps: ReturnType<typeof createMockAuthServiceDeps>;

	beforeEach(() => {
		vi.clearAllMocks();
		vi.spyOn(CryptoUtils, "generateSecureRandom").mockReturnValue("raw-refresh-token-64-chars-hex-string-abcdef123456");
		vi.spyOn(CryptoUtils, "hashSha256").mockImplementation((token: string) => `hashed-${token}`);
		deps = createMockAuthServiceDeps();
		service = new AuthService(
			deps.siweVerifierService,
			deps.userRepository,
			deps.jwtService,
			deps.userSessionRepository,
			deps.configService,
		);
	});

	describe("login", () => {
		it("should verify SIWE, find user, create session, and return tokens", async () => {
			deps.userRepository.findByWalletAddress = vi.fn().mockResolvedValue({ id: "u-1", wallet_address: "0xabc" });

			const result = await service.login({
				walletAddress: "0xabc",
				message: "siwe-message",
				signature: "0xsig",
			});

			expect(deps.siweVerifierService.verify).toHaveBeenCalledWith({
				expectedSignerWalletAddress: "0xabc",
				message: "siwe-message",
				signature: "0xsig",
			});
			expect(deps.userRepository.findByWalletAddress).toHaveBeenCalledWith("0xabc");
			expect(deps.userSessionRepository.create).toHaveBeenCalled();
			expect(deps.jwtService.generateAccessToken).toHaveBeenCalledWith({ userId: "u-1", sessionId: "s-1" });
			expect(result.output.expiresAt).toBeTruthy();
			expect(result.accessToken).toBe("access-token-123");
			expect(result.rawRefreshToken).toBe("raw-refresh-token-64-chars-hex-string-abcdef123456");
		});

		it("should throw UserNotFoundException when user does not exist", async () => {
			deps.userRepository.findByWalletAddress = vi.fn().mockResolvedValue(null);

			await expect(
				service.login({
					walletAddress: "0xnonexistent",
					message: "msg",
					signature: "0xsig",
				}),
			).rejects.toThrow(UserNotFoundException);
		});
	});

	describe("refresh", () => {
		it("should throw UnauthorizedException when no refresh cookie", async () => {
			const { UnauthorizedException } = await import("@nestjs/common");
			const request = { headers: {} } as Request;

			await expect(service.refreshTokens(request)).rejects.toThrow(UnauthorizedException);
		});

		it("should throw UnauthorizedException when session not found for hash", async () => {
			const { UnauthorizedException } = await import("@nestjs/common");
			deps.userSessionRepository.findByRefreshTokenHash = vi.fn().mockResolvedValue(undefined);
			const request = { headers: { cookie: "__Host-ventairy-refresh=some-token" } } as Request;

			await expect(service.refreshTokens(request)).rejects.toThrow(UnauthorizedException);
		});

		it("regression: refresh after session revocation should not trigger global logout", async () => {
			const { UnauthorizedException } = await import("@nestjs/common");
			deps.userSessionRepository.findByRefreshTokenHash = vi.fn().mockResolvedValue(undefined);
			const request = { headers: { cookie: "__Host-ventairy-refresh=revoked-session-token" } } as Request;

			try {
				await service.refreshTokens(request);
			} catch {
				// expected
			}

			expect(deps.userSessionRepository.deleteByUserId).not.toHaveBeenCalled();
			expect(deps.userSessionRepository.deleteById).not.toHaveBeenCalled();
		});

		it("should throw SessionExpiredException when session is expired", async () => {
			deps.userSessionRepository.findByRefreshTokenHash = vi.fn().mockResolvedValue({
				id: "s-1",
				user_id: "u-1",
				expires_at: "2020-01-01T00:00:00.000Z",
			});
			const request = { headers: { cookie: "__Host-ventairy-refresh=some-token" } } as Request;

			await expect(service.refreshTokens(request)).rejects.toThrow(SessionExpiredException);
		});

		it("should rotate tokens and return new ones", async () => {
			const futureDate = new Date(Date.now() + 86400000).toISOString();
			deps.userSessionRepository.findByRefreshTokenHash = vi.fn().mockResolvedValue({
				id: "s-1",
				user_id: "u-1",
				expires_at: futureDate,
			});
			const request = { headers: { cookie: "__Host-ventairy-refresh=valid-token" } } as Request;

			const result = await service.refreshTokens(request);

			expect(deps.userSessionRepository.updateRefreshTokenHash).toHaveBeenCalled();
			expect(deps.jwtService.generateAccessToken).toHaveBeenCalledWith({ userId: "u-1", sessionId: "s-1" });
			expect(result.accessToken).toBe("access-token-123");
			expect(result.output.expiresAt).toBeTruthy();
		});
	});

	describe("logout", () => {
		it("should delete session if refresh token exists", async () => {
			deps.userSessionRepository.findByRefreshTokenHash = vi.fn().mockResolvedValue({ id: "s-1" });
			const request = { headers: { cookie: "__Host-ventairy-refresh=some-token" } } as Request;

			await service.logout(request);

			expect(deps.userSessionRepository.deleteById).toHaveBeenCalledWith("s-1");
		});

		it("should do nothing if no refresh cookie", async () => {
			const request = { headers: {} } as Request;

			await service.logout(request);

			expect(deps.userSessionRepository.deleteById).not.toHaveBeenCalled();
		});
	});

	describe("listSessions", () => {
		it("should return active sessions filtered by user ID", async () => {
			const futureDate = new Date(Date.now() + 86400000).toISOString();
			deps.userSessionRepository.findByUserId = vi.fn().mockResolvedValue([
				{
					id: "s-1",
					user_id: "u-1",
					device_info: "Mozilla",
					ip_address: "127.0.0.1",
					created_at: "2026-01-01T00:00:00.000Z",
					updated_at: "2026-01-01T00:00:00.000Z",
					expires_at: futureDate,
				},
				{
					id: "s-2",
					user_id: "u-1",
					device_info: null,
					ip_address: null,
					created_at: "2026-01-01T00:00:00.000Z",
					updated_at: "2026-01-01T00:00:00.000Z",
					expires_at: futureDate,
				},
			]);

			const result = await service.listSessions("u-1", "s-1");

			expect(result.sessions).toHaveLength(2);
			expect(result.sessions[0]!.isCurrent).toBe(true);
			expect(result.sessions[1]!.isCurrent).toBe(false);
		});

		it("should exclude expired sessions", async () => {
			const pastDate = "2020-01-01T00:00:00.000Z";
			deps.userSessionRepository.findByUserId = vi.fn().mockResolvedValue([
				{
					id: "s-1",
					user_id: "u-1",
					device_info: null,
					ip_address: null,
					created_at: "2020-01-01T00:00:00.000Z",
					updated_at: "2020-01-01T00:00:00.000Z",
					expires_at: pastDate,
				},
			]);

			const result = await service.listSessions("u-1", "s-1");

			expect(result.sessions).toHaveLength(0);
		});
	});

	describe("revokeSession", () => {
		it("should delete session if it belongs to the user", async () => {
			deps.userSessionRepository.findById = vi.fn().mockResolvedValue({ id: "s-1", user_id: "u-1" });

			const result = await service.revokeSession({ sessionId: "s-1", userId: "u-1", currentSessionId: "s-2" });

			expect(deps.userSessionRepository.deleteById).toHaveBeenCalledWith("s-1");
			expect(result.isCurrentSession).toBe(false);
		});

		it("should return isCurrentSession=true when revoking own session", async () => {
			deps.userSessionRepository.findById = vi.fn().mockResolvedValue({ id: "s-1", user_id: "u-1" });

			const result = await service.revokeSession({ sessionId: "s-1", userId: "u-1", currentSessionId: "s-1" });

			expect(result.isCurrentSession).toBe(true);
		});

		it("should throw ForbiddenException when session belongs to another user", async () => {
			const { ForbiddenException } = await import("@nestjs/common");
			deps.userSessionRepository.findById = vi.fn().mockResolvedValue({ id: "s-1", user_id: "u-2" });

			await expect(service.revokeSession({ sessionId: "s-1", userId: "u-1", currentSessionId: "s-2" })).rejects.toThrow(
				ForbiddenException,
			);

			expect(deps.userSessionRepository.deleteById).not.toHaveBeenCalled();
		});

		it("should throw SessionNotFoundException when session does not exist", async () => {
			deps.userSessionRepository.findById = vi.fn().mockResolvedValue(null);

			await expect(
				service.revokeSession({ sessionId: "nonexistent", userId: "u-1", currentSessionId: "s-1" }),
			).rejects.toThrow(SessionNotFoundException);

			expect(deps.userSessionRepository.deleteById).not.toHaveBeenCalled();
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});
});
