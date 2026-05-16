import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ConfigService } from "@nestjs/config";
import type { Request } from "express";
import { CryptoUtils } from "@shared/utils/crypto.utils";
import { UserType, VerificationStatus } from "@shared/enums";
import type { AtomicCall } from "@core/database";
import { AuthService } from "./auth.service";
import { SiweVerifierService } from "./verification/siwe-verifier.service";
import { UserRepository } from "@modules/user/repositories/user.repository";
import { VerificationRepository } from "@modules/verification/repositories/verification.repository";
import { JwtService } from "./jwt/jwt.service";
import { UserSessionRepository } from "./repositories/user-session.repository";
import { UserNotFoundException } from "@shared/exceptions/user-not-found.exception";
import { UserAlreadyExistsException } from "@shared/exceptions/user-already-exists.exception";
import { SessionExpiredException } from "@shared/exceptions/session-expired.exception";
import { SessionNotFoundException } from "@shared/exceptions/session-not-found.exception";

function createMockAuthServiceDeps() {
	return {
		siweVerifierService: {
			parseAndVerifyMessage: vi.fn().mockResolvedValue({
				walletAddress: "0xabc",
				chainId: 8453,
			}),
		} as unknown as SiweVerifierService,
		userRepository: {
			findByWalletAddress: vi.fn(),
			findById: vi.fn(),
			create: vi.fn(),
			create_atomicCall: vi.fn(),
		} as unknown as UserRepository,
		jwtService: {
			generateAccessToken: vi.fn().mockResolvedValue("access-token-123"),
		} as unknown as JwtService,
		userSessionRepository: {
			create: vi.fn().mockResolvedValue({ id: "s-1", user_id: "u-1" }),
			create_atomicCall: vi.fn(),
			findByRefreshTokenHash: vi.fn(),
			findById: vi.fn(),
			findByUserId: vi.fn(),
			updateRefreshTokenHash: vi.fn().mockResolvedValue({}),
			deleteById: vi.fn().mockResolvedValue(undefined),
			deleteByUserId: vi.fn().mockResolvedValue(undefined),
			deleteExpired: vi.fn().mockResolvedValue(0),
		} as unknown as UserSessionRepository,
		verificationRepository: {
			create: vi.fn().mockResolvedValue(undefined),
			create_atomicCall: vi.fn(),
			getVerificationStatus: vi.fn(),
		} as unknown as VerificationRepository,
		atomicExecutionService: {
			execute: vi.fn(),
		},
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
			deps.verificationRepository,
			deps.atomicExecutionService as any,
		);
	});

	describe("register", () => {
		const defaultUserRow = { id: "u-1", wallet_address: "0xabc", chain_id: 8453, user_type: UserType.BUSINESS, created_at: "2026-05-04T14:48:00.000Z" };
		const defaultVerificationRow = { id: "kyc-1", user_id: "u-1", verification_status: VerificationStatus.PENDING };
		const defaultParams = {
			siweMessage: "siwe-message",
			siweSignature: "0xsig",
			deviceInfo: "Mozilla" as string | undefined,
			ipAddress: "127.0.0.1" as string | undefined,
			userType: UserType.BUSINESS,
		};

		const defaultSessionRow = {
			id: "s-1",
			user_id: "u-1",
			refresh_token_hash: "hashed-raw-refresh-token-64-chars-hex-string-abcdef123456",
			device_info: "Mozilla",
			ip_address: "127.0.0.1",
			expires_at: "2026-05-15T17:00:00.000Z",
		};

		beforeEach(() => {
			deps.atomicExecutionService.execute.mockResolvedValue([defaultUserRow, defaultVerificationRow, defaultSessionRow]);
			(deps.userRepository.create_atomicCall as any).mockReturnValue({ query: "user-query", processResult: vi.fn() });
			(deps.verificationRepository.create_atomicCall as any).mockReturnValue({ query: "verification-query", processResult: vi.fn() });
			(deps.userSessionRepository.create_atomicCall as any).mockReturnValue({ query: "session-query", processResult: vi.fn() });
		});

		it("should parse and verify SIWE before creating anything", async () => {
			await service.register(defaultParams);

			expect(deps.siweVerifierService.parseAndVerifyMessage).toHaveBeenCalledWith({
				message: "siwe-message",
				signature: "0xsig",
			});
		});

		it("should not proceed to atomic execution if SIWE verification fails", async () => {
			const { InvalidSiweSignatureException } = await import("@shared/exceptions/invalid-siwe-signature.exception");
			(deps.siweVerifierService.parseAndVerifyMessage as any).mockRejectedValue(new InvalidSiweSignatureException("0xabc"));

			await expect(service.register(defaultParams)).rejects.toThrow(InvalidSiweSignatureException);

			expect(deps.atomicExecutionService.execute).not.toHaveBeenCalled();
			expect(deps.userSessionRepository.create).not.toHaveBeenCalled();
		});

		it("should create user and KYC atomic calls with correct data sharing the same userId", async () => {
			vi.spyOn(crypto, "randomUUID").mockReturnValueOnce("00000000-0000-0000-0000-000000000001").mockReturnValueOnce("00000000-0000-0000-0000-000000000002");

			await service.register(defaultParams);

			expect(deps.userRepository.create_atomicCall).toHaveBeenCalledWith({
				id: "00000000-0000-0000-0000-000000000001",
				wallet_address: "0xabc",
				chain_id: 8453,
				user_type: UserType.BUSINESS,
			});
			expect(deps.verificationRepository.create_atomicCall).toHaveBeenCalledWith({
				id: "00000000-0000-0000-0000-000000000002",
				user_id: "00000000-0000-0000-0000-000000000001",
			});
			expect(deps.atomicExecutionService.execute).toHaveBeenCalledTimes(1);
		});

		it("should run deleteExpired in parallel with the atomic batch", async () => {
			await service.register(defaultParams);

			expect(deps.userSessionRepository.deleteExpired).toHaveBeenCalledTimes(1);
		});

		it("should create a session via atomic batch and generate a JWT", async () => {
			await service.register(defaultParams);

			expect(deps.userSessionRepository.create).not.toHaveBeenCalled();
			expect(deps.userSessionRepository.create_atomicCall).toHaveBeenCalledWith(
				expect.objectContaining({
					user_id: expect.any(String),
					refresh_token_hash: expect.any(String),
					device_info: "Mozilla",
					ip_address: "127.0.0.1",
					expires_at: expect.any(String),
				}),
			);
			expect(deps.verificationRepository.getVerificationStatus).not.toHaveBeenCalled();
			expect(deps.jwtService.generateAccessToken).toHaveBeenCalledWith({
				userId: "u-1",
				sessionId: expect.any(String),
				userType: UserType.BUSINESS,
				walletAddress: "0xabc",
				chainId: 8453,
			});
		});

		it("should default deviceInfo and ipAddress to null when not provided", async () => {
			await service.register({
				siweMessage: "msg",
				siweSignature: "0xsig",
				userType: UserType.BUSINESS,
			});

			expect(deps.userSessionRepository.create_atomicCall).toHaveBeenCalledWith(
				expect.objectContaining({
					device_info: null,
					ip_address: null,
				}),
			);
		});

		it("should return the user DTO, access token, and raw refresh token on success", async () => {
			const result = await service.register(defaultParams);

			expect(result.user).toBeInstanceOf(Object);
			expect(result.user.id).toBe("u-1");
			expect(result.user.walletAddress).toBe("0xabc");
			expect(result.user.userType).toBe(UserType.BUSINESS);
			expect(result.user.verification_status).toBe(VerificationStatus.PENDING);
			expect(result.accessToken).toBe("access-token-123");
			expect(result.rawRefreshToken).toBeTruthy();
		});

		it("should throw UserAlreadyExistsException on duplicate wallet address", async () => {
			deps.atomicExecutionService.execute.mockRejectedValue(new Error("SqliteError: UNIQUE constraint failed: users.wallet_address"));

			await expect(service.register(defaultParams)).rejects.toThrow(UserAlreadyExistsException);
		});

		it("should re-throw non-unique database errors unchanged", async () => {
			const genericError = new Error("Connection timeout");
			deps.atomicExecutionService.execute.mockRejectedValue(genericError);

			await expect(service.register(defaultParams)).rejects.toThrow(genericError);
		});

		it("should propagate errors from deleteExpired", async () => {
			const deleteError = new Error("Session cleanup failed");
			(deps.userSessionRepository.deleteExpired as any).mockRejectedValue(deleteError);

			await expect(service.register(defaultParams)).rejects.toThrow("Session cleanup failed");
		});
	});

	describe("login", () => {
		it("should parse and verify SIWE, find user, create session, and return tokens", async () => {
			deps.userRepository.findByWalletAddress = vi.fn().mockResolvedValue({
				id: "u-1",
				wallet_address: "0xabc",
				chain_id: 8453,
				user_type: UserType.BUSINESS,
			});

			const result = await service.login({
				message: "siwe-message",
				signature: "0xsig",
			});

			expect(deps.siweVerifierService.parseAndVerifyMessage).toHaveBeenCalledWith({
				message: "siwe-message",
				signature: "0xsig",
			});
			expect(deps.userRepository.findByWalletAddress).toHaveBeenCalledWith("0xabc");
			expect(deps.userSessionRepository.create).toHaveBeenCalled();
			expect(deps.jwtService.generateAccessToken).toHaveBeenCalledWith({
				userId: "u-1",
				sessionId: "s-1",
				userType: UserType.BUSINESS,
				walletAddress: "0xabc",
				chainId: 8453,
			});
			expect(result.output.expiresAt).toBeTruthy();
			expect(result.accessToken).toBe("access-token-123");
			expect(result.rawRefreshToken).toBe("raw-refresh-token-64-chars-hex-string-abcdef123456");
		});

		it("should throw UserNotFoundException when user does not exist", async () => {
			deps.userRepository.findByWalletAddress = vi.fn().mockResolvedValue(null);

			await expect(
				service.login({
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
			deps.userRepository.findById = vi.fn().mockResolvedValue({
				id: "u-1",
				wallet_address: "0xabc",
				chain_id: 8453,
				user_type: UserType.BUSINESS,
			});
			const request = { headers: { cookie: "__Host-ventairy-refresh=valid-token" } } as Request;

			const result = await service.refreshTokens(request);

			expect(deps.userSessionRepository.updateRefreshTokenHash).toHaveBeenCalled();
			expect(deps.jwtService.generateAccessToken).toHaveBeenCalledWith({
				userId: "u-1",
				sessionId: "s-1",
				userType: UserType.BUSINESS,
				walletAddress: "0xabc",
				chainId: 8453,
			});
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

			await expect(service.revokeSession({ sessionId: "s-1", userId: "u-1", currentSessionId: "s-2" })).rejects.toThrow(ForbiddenException);

			expect(deps.userSessionRepository.deleteById).not.toHaveBeenCalled();
		});

		it("should throw SessionNotFoundException when session does not exist", async () => {
			deps.userSessionRepository.findById = vi.fn().mockResolvedValue(null);

			await expect(service.revokeSession({ sessionId: "nonexistent", userId: "u-1", currentSessionId: "s-1" })).rejects.toThrow(SessionNotFoundException);

			expect(deps.userSessionRepository.deleteById).not.toHaveBeenCalled();
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});
});
