import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CryptoUtils } from "@shared/utils/crypto.utils";
import { UserService } from "./user.service";
import { UserAlreadyExistsException } from "@shared/exceptions";
import { VentairyKycStatus } from "@shared/constants";

const validWalletAddress = "0x742d35cc6634c0532925a3b844bc9e7595f0beb1";
const validSiweMessage = "example.com wants you to sign in with your Ethereum account...";
const validSiweSignature = "0x1234567890abcdef";

describe("UserService", () => {
	let service: UserService;
	let mockUserRepository: any;
	let mockKycRepository: any;
	let mockSiweVerifierService: { verify: ReturnType<typeof vi.fn> };
	let mockJwtService: { generateAccessToken: ReturnType<typeof vi.fn> };
	let mockUserSessionRepository: any;

	beforeEach(() => {
		vi.spyOn(CryptoUtils, "generateSecureRandom").mockReturnValue("raw-refresh-token");
		vi.spyOn(CryptoUtils, "hashSha256").mockReturnValue("hashed-refresh-token");
		mockUserRepository = {
			findById: vi.fn(),
			create: vi.fn(),
		} as any;
		mockKycRepository = {
			findByUserId: vi.fn(),
			create: vi.fn().mockResolvedValue(undefined),
			updateStatusByUserId: vi.fn(),
		} as any;
		mockSiweVerifierService = { verify: vi.fn().mockResolvedValue(undefined) };
		mockJwtService = { generateAccessToken: vi.fn().mockResolvedValue("access-token-123") } as any;
		mockUserSessionRepository = {
			create: vi.fn().mockResolvedValue({ id: "s-1", user_id: "new-user-id" }),
			deleteExpired: vi.fn().mockResolvedValue(0),
		} as any;
		service = new UserService(
			mockUserRepository,
			mockKycRepository,
			mockSiweVerifierService as any,
			mockJwtService as any,
			mockUserSessionRepository as any,
		);
	});

	describe("createUser", () => {
		const validWalletAddress = "0x742d35cc6634c0532925a3b844bc9e7595f0beb1";
		const validSiweMessage = "ventairy.com wants you to sign in with your Ethereum account...";
		const validSiweSignature =
			"0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e";

		it("should verify SIWE before creating a user", async () => {
			const insertedRow = {
				id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
				wallet_address: validWalletAddress,
				created_at: "2026-05-04T14:48:00.000Z",
			};
			mockUserRepository.create.mockResolvedValue(insertedRow);

			await service.createUser(validWalletAddress, validSiweMessage, validSiweSignature);

			expect(mockSiweVerifierService.verify).toHaveBeenCalledWith({
				expectedSignerWalletAddress: validWalletAddress,
				message: validSiweMessage,
				signature: validSiweSignature,
			});
		});

		it("should not insert user if SIWE verification fails", async () => {
			const { InvalidSiweSignatureException: InvalidSiweSignatureException } = await import(
				"@shared/exceptions/invalid-siwe-signature.exception"
			);
			mockSiweVerifierService.verify.mockRejectedValue(new InvalidSiweSignatureException(validWalletAddress));

			await expect(service.createUser(validWalletAddress, validSiweMessage, validSiweSignature)).rejects.toThrow(
				InvalidSiweSignatureException,
			);
			expect(mockUserRepository.create).not.toHaveBeenCalled();
		});

		it("should create a user with PENDING KYC, session, tokens and return result", async () => {
			const insertedRow = {
				id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
				wallet_address: validWalletAddress,
				created_at: "2026-05-04T14:48:00.000Z",
			};
			mockUserRepository.create.mockResolvedValue(insertedRow);

			const result = await service.createUser(validWalletAddress, validSiweMessage, validSiweSignature);

			expect(result.user).toEqual({
				id: insertedRow.id,
				walletAddress: validWalletAddress,
				ventairyKycStatus: VentairyKycStatus.PENDING,
				createdAt: insertedRow.created_at,
			});
			expect(result.accessToken).toBe("access-token-123");
			expect(result.rawRefreshToken).toBe("raw-refresh-token");
		});

		it("should create a session after user creation", async () => {
			const uuidSpy = vi.spyOn(crypto, "randomUUID");
			uuidSpy
				.mockReturnValueOnce("00000000-0000-0000-0000-000000000001" as any)
				.mockReturnValueOnce("00000000-0000-0000-0000-000000000002" as any)
				.mockReturnValueOnce("00000000-0000-0000-0000-000000000003" as any);
			mockUserSessionRepository.create.mockResolvedValue({
				id: "00000000-0000-0000-0000-000000000003",
				user_id: "00000000-0000-0000-0000-000000000001",
			});
			mockUserRepository.create.mockResolvedValue({
				id: "00000000-0000-0000-0000-000000000001",
				wallet_address: validWalletAddress,
				created_at: "2026-05-04T14:48:00.000Z",
			});

			await service.createUser(validWalletAddress, validSiweMessage, validSiweSignature);

			expect(mockKycRepository.create).toHaveBeenCalledTimes(1);
			expect(mockUserSessionRepository.deleteExpired).toHaveBeenCalledTimes(1);
			expect(CryptoUtils.generateSecureRandom).toHaveBeenCalled();
			expect(CryptoUtils.hashSha256).toHaveBeenCalledWith("raw-refresh-token");
			expect(mockUserSessionRepository.create).toHaveBeenCalledWith(
				expect.objectContaining({
					user_id: "00000000-0000-0000-0000-000000000001",
					refresh_token_hash: "hashed-refresh-token",
				}),
			);
			expect(mockJwtService.generateAccessToken).toHaveBeenCalledWith({
				userId: "00000000-0000-0000-0000-000000000001",
				sessionId: "00000000-0000-0000-0000-000000000003",
			});
		});

		it("should pass device info and ip address to session creation", async () => {
			mockUserRepository.create.mockResolvedValue({
				id: "new-user-id",
				wallet_address: validWalletAddress,
				created_at: "2026-05-04T14:48:00.000Z",
			});

			await service.createUser(validWalletAddress, validSiweMessage, validSiweSignature, "Mozilla/5.0", "127.0.0.1");

			expect(mockUserSessionRepository.create).toHaveBeenCalledWith(
				expect.objectContaining({
					device_info: "Mozilla/5.0",
					ip_address: "127.0.0.1",
				}),
			);
		});

		it("should normalize wallet address to lowercase before inserting", async () => {
			const mixedCaseWallet = "0x742D35Cc6634C0532925a3b844Bc9e7595f0BEb1";
			const normalizedWallet = mixedCaseWallet.toLowerCase();

			mockUserRepository.create.mockResolvedValue({
				id: "test-id",
				wallet_address: normalizedWallet,
				created_at: "2026-05-04T14:48:00.000Z",
			});

			await service.createUser(mixedCaseWallet, validSiweMessage, validSiweSignature);

			expect(mockUserRepository.create).toHaveBeenCalledWith(
				expect.objectContaining({
					wallet_address: normalizedWallet,
				}),
			);
		});

		it("should generate a UUID v4 for the user id", async () => {
			const uuidSpy = vi.spyOn(crypto, "randomUUID");
			mockUserRepository.create.mockResolvedValue({
				id: "generated-uuid",
				wallet_address: validWalletAddress,
				created_at: "2026-05-04T14:48:00.000Z",
			});

			await service.createUser(validWalletAddress, validSiweMessage, validSiweSignature);

			expect(uuidSpy).toHaveBeenCalled();
		});

		it("should throw UserAlreadyExistsException on unique constraint violation", async () => {
			mockUserRepository.create.mockRejectedValue(
				new Error("SqliteError: UNIQUE constraint failed: users.wallet_address"),
			);

			await expect(service.createUser(validWalletAddress, validSiweMessage, validSiweSignature)).rejects.toThrow(
				UserAlreadyExistsException,
			);
			await expect(service.createUser(validWalletAddress, validSiweMessage, validSiweSignature)).rejects.toThrow(
				`A user with wallet address ${validWalletAddress} already exists`,
			);
		});

		it("should re-throw non-unique-constraint database errors unchanged", async () => {
			const genericError = new Error("Connection timeout");
			mockUserRepository.create.mockRejectedValue(genericError);

			await expect(service.createUser(validWalletAddress, validSiweMessage, validSiweSignature)).rejects.toThrow(
				genericError,
			);
		});

		it("should propagate nonce-related exceptions from SIWE verifier", async () => {
			const { NonceNotFoundException } = await import("@shared/exceptions/nonce-not-found.exception");
			mockSiweVerifierService.verify.mockRejectedValue(new NonceNotFoundException("abc123"));

			await expect(service.createUser(validWalletAddress, validSiweMessage, validSiweSignature)).rejects.toThrow(
				NonceNotFoundException,
			);
		});
	});

	describe("getUser", () => {
		it("should return user when user exists", async () => {
			const mockUser = {
				id: "user-123",
				wallet_address: "0x742d35cc6634c0532925a3b844bc9e7595f0beb1",
				created_at: "2026-05-04T14:48:00.000Z",
			};
			mockUserRepository.findById.mockResolvedValue(mockUser);

			const result = await service.getUserDatabaseRow("user-123");

			expect(result).toEqual(mockUser);
		});

		it("should return null when user does not exist", async () => {
			mockUserRepository.findById.mockResolvedValue(null);

			const result = await service.getUserDatabaseRow("nonexistent");

			expect(result).toBeNull();
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});
});
