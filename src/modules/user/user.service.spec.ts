import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CryptoUtils } from "@shared/utils/crypto.utils";
import { UserType } from "@shared/enums/user-type";
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
	let mockAtomicExecutionService: { execute: ReturnType<typeof vi.fn> };

	const defaultCreateParams = {
		walletAddress: validWalletAddress,
		siweMessage: validSiweMessage,
		siweSignature: validSiweSignature,
		userType: UserType.BUSINESS as UserType,
	};

	beforeEach(() => {
		vi.spyOn(CryptoUtils, "generateSecureRandom").mockReturnValue("raw-refresh-token");
		vi.spyOn(CryptoUtils, "hashSha256").mockReturnValue("hashed-refresh-token");
		mockUserRepository = {
			findById: vi.fn(),
			create: vi.fn(),
			create_atomicCall: vi.fn(),
		} as any;
		mockKycRepository = {
			findByUserId: vi.fn(),
			create: vi.fn().mockResolvedValue(undefined),
			create_atomicCall: vi.fn(),
			updateStatusByUserId: vi.fn(),
		} as any;
		mockSiweVerifierService = { verify: vi.fn().mockResolvedValue(undefined) };
		mockJwtService = { generateAccessToken: vi.fn().mockResolvedValue("access-token-123") } as any;
		mockUserSessionRepository = {
			create: vi.fn().mockResolvedValue({ id: "s-1", user_id: "new-user-id" }),
			create_atomicCall: vi.fn(),
			deleteExpired: vi.fn().mockResolvedValue(0),
		} as any;
		mockAtomicExecutionService = { execute: vi.fn() };
		service = new UserService(
			mockUserRepository,
			mockKycRepository,
			mockSiweVerifierService as any,
			mockJwtService as any,
			mockUserSessionRepository as any,
			mockAtomicExecutionService as any,
		);
	});

	describe("createUser", () => {
		const createRowDefaults = {
			user_type: UserType.BUSINESS,
		};

		const defaultInsertedRow = {
			id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
			wallet_address: validWalletAddress,
			created_at: "2026-05-04T14:48:00.000Z",
			...createRowDefaults,
		};

		const defaultSessionRow = { id: "s-1", user_id: defaultInsertedRow.id };

		const defaultBatchResult = [defaultInsertedRow, defaultSessionRow, undefined] as const;

		it("should verify SIWE before creating a user", async () => {
			mockAtomicExecutionService.execute.mockResolvedValue(defaultBatchResult);

			await service.createUser(defaultCreateParams);

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

			await expect(service.createUser(defaultCreateParams)).rejects.toThrow(
				InvalidSiweSignatureException,
			);
			expect(mockAtomicExecutionService.execute).not.toHaveBeenCalled();
		});

		it("should create a user with PENDING KYC, session, tokens and return result", async () => {
			mockAtomicExecutionService.execute.mockResolvedValue(defaultBatchResult);

			const result = await service.createUser(defaultCreateParams);

			expect(result.user).toEqual({
				id: defaultInsertedRow.id,
				walletAddress: validWalletAddress,
				userType: UserType.BUSINESS,
				ventairyKycStatus: VentairyKycStatus.PENDING,
				createdAt: defaultInsertedRow.created_at,
			});
			expect(result.accessToken).toBe("access-token-123");
			expect(result.rawRefreshToken).toBe("raw-refresh-token");
		});

		it("should batch user, session, and KYC inserts atomically", async () => {
			const uuidSpy = vi.spyOn(crypto, "randomUUID");
			uuidSpy
				.mockReturnValueOnce("00000000-0000-0000-0000-000000000001")      // userId
				.mockReturnValueOnce("00000000-0000-0000-0000-000000000002")      // sessionId
				.mockReturnValueOnce("00000000-0000-0000-0000-000000000003");     // kycId

			mockUserRepository.create_atomicCall.mockReturnValue({ query: "user-query", processResult: vi.fn() } as any);
			mockUserSessionRepository.create_atomicCall.mockReturnValue({ query: "session-query", processResult: vi.fn() } as any);
			mockKycRepository.create_atomicCall.mockReturnValue({ query: "kyc-query", processResult: vi.fn() } as any);
			mockAtomicExecutionService.execute.mockResolvedValue([
				{
					id: "00000000-0000-0000-0000-000000000001",
					wallet_address: validWalletAddress,
					created_at: "2026-05-04T14:48:00.000Z",
					...createRowDefaults,
				},
				{
					id: "00000000-0000-0000-0000-000000000002",
					user_id: "00000000-0000-0000-0000-000000000001",
				},
				undefined,
			] as const);

			await service.createUser(defaultCreateParams);

			expect(mockUserRepository.create_atomicCall).toHaveBeenCalledWith({
				id: "00000000-0000-0000-0000-000000000001",
				wallet_address: validWalletAddress.toLowerCase(),
				user_type: UserType.BUSINESS,
			});
			expect(mockUserSessionRepository.create_atomicCall).toHaveBeenCalledWith(
				expect.objectContaining({
					id: "00000000-0000-0000-0000-000000000002",
					user_id: "00000000-0000-0000-0000-000000000001",
					refresh_token_hash: "hashed-refresh-token",
				}),
			);
			expect(mockKycRepository.create_atomicCall).toHaveBeenCalledWith({
				id: "00000000-0000-0000-0000-000000000003",
				user_id: "00000000-0000-0000-0000-000000000001",
			});
			expect(mockAtomicExecutionService.execute).toHaveBeenCalledTimes(1);
			expect(mockAtomicExecutionService.execute.mock.calls[0]!.length).toBe(3);
		});

		it("should run deleteExpired in parallel with the atomic batch", async () => {
			mockAtomicExecutionService.execute.mockResolvedValue(defaultBatchResult);

			await service.createUser(defaultCreateParams);

			expect(mockUserSessionRepository.deleteExpired).toHaveBeenCalledTimes(1);
		});

		it("should pass device info and ip address to session create_atomicCall", async () => {
			mockAtomicExecutionService.execute.mockResolvedValue(defaultBatchResult);

			await service.createUser({
				...defaultCreateParams,
				deviceInfo: "Mozilla/5.0",
				ipAddress: "127.0.0.1",
			});

			expect(mockUserSessionRepository.create_atomicCall).toHaveBeenCalledWith(
				expect.objectContaining({
					device_info: "Mozilla/5.0",
					ip_address: "127.0.0.1",
				}),
			);
		});

		it("should normalize wallet address to lowercase before inserting", async () => {
			const mixedCaseWallet = "0x742D35Cc6634C0532925a3b844Bc9e7595f0BEb1";
			const normalizedWallet = mixedCaseWallet.toLowerCase();
			mockAtomicExecutionService.execute.mockResolvedValue([
				{ id: "test-id", wallet_address: normalizedWallet, created_at: "2026-05-04T14:48:00.000Z", ...createRowDefaults },
				defaultSessionRow,
				undefined,
			] as const);

			await service.createUser({ ...defaultCreateParams, walletAddress: mixedCaseWallet });

			expect(mockUserRepository.create_atomicCall).toHaveBeenCalledWith(
				expect.objectContaining({
					wallet_address: normalizedWallet,
				}),
			);
		});

		it("should generate UUIDs for user, session, and KYC IDs", async () => {
			const uuidSpy = vi.spyOn(crypto, "randomUUID");
			mockAtomicExecutionService.execute.mockResolvedValue(defaultBatchResult);

			await service.createUser(defaultCreateParams);

			expect(uuidSpy).toHaveBeenCalledTimes(3);
		});

		it("should throw UserAlreadyExistsException on unique constraint violation", async () => {
			mockAtomicExecutionService.execute.mockRejectedValue(
				new Error("SqliteError: UNIQUE constraint failed: users.wallet_address"),
			);

			await expect(service.createUser(defaultCreateParams)).rejects.toThrow(
				UserAlreadyExistsException,
			);
			await expect(service.createUser(defaultCreateParams)).rejects.toThrow(
				`A user with wallet address ${validWalletAddress} already exists`,
			);
		});

		it("should re-throw non-unique-constraint database errors unchanged", async () => {
			const genericError = new Error("Connection timeout");
			mockAtomicExecutionService.execute.mockRejectedValue(genericError);

			await expect(service.createUser(defaultCreateParams)).rejects.toThrow(
				genericError,
			);
		});

		it("should propagate nonce-related exceptions from SIWE verifier", async () => {
			const { NonceNotFoundException } = await import("@shared/exceptions/nonce-not-found.exception");
			mockSiweVerifierService.verify.mockRejectedValue(new NonceNotFoundException("abc123"));

			await expect(service.createUser(defaultCreateParams)).rejects.toThrow(
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
