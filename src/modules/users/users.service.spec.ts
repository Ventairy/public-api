import { describe, it, expect, vi, beforeEach } from "vitest";
import { VentairyKycStatus } from "@shared/enums/ventairy-kyc-status";
import { UserAlreadyExistsException } from "@shared/exceptions/user-already-exists.exception";
import { UsersService } from "./users.service";

describe("UsersService", () => {
	let service: UsersService;
	let mockUserRepository: any;
	let mockKycRepository: any;
	let mockSiweVerifierService: { verify: ReturnType<typeof vi.fn> };

	beforeEach(() => {
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
		service = new UsersService(mockUserRepository, mockKycRepository, mockSiweVerifierService as any);
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

		it("should create a user with PENDING KYC status and return mapped output after verification", async () => {
			const insertedRow = {
				id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
				wallet_address: validWalletAddress,
				created_at: "2026-05-04T14:48:00.000Z",
			};
			mockUserRepository.create.mockResolvedValue(insertedRow);

			const result = await service.createUser(validWalletAddress, validSiweMessage, validSiweSignature);

			expect(result).toEqual({
				id: insertedRow.id,
				walletAddress: validWalletAddress,
				ventairyKycStatus: VentairyKycStatus.PENDING,
				createdAt: insertedRow.created_at,
			});
		});

		it("should insert a kyc record after user creation", async () => {
			const insertedRow = {
				id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
				wallet_address: validWalletAddress,
				created_at: "2026-05-04T14:48:00.000Z",
			};
			mockUserRepository.create.mockResolvedValue(insertedRow);

			await service.createUser(validWalletAddress, validSiweMessage, validSiweSignature);

			expect(mockKycRepository.create).toHaveBeenCalledTimes(1);
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

		it("should throw when insert returns an empty array", async () => {
			mockUserRepository.create.mockRejectedValue(new Error("User insert returned no rows"));

			await expect(service.createUser(validWalletAddress, validSiweMessage, validSiweSignature)).rejects.toThrow(
				"User insert returned no rows",
			);
		});

		it("should propagate nonce-related exceptions from SIWE verifier", async () => {
			const { NonceNotFoundException } = await import("@shared/exceptions/nonce-not-found.exception");
			mockSiweVerifierService.verify.mockRejectedValue(new NonceNotFoundException("abc123"));

			await expect(service.createUser(validWalletAddress, validSiweMessage, validSiweSignature)).rejects.toThrow(
				NonceNotFoundException,
			);
		});

		it("should propagate signer mismatch exceptions from SIWE verifier", async () => {
			const { SignerMismatchException } = await import("@shared/exceptions/signer-mismatch.exception");
			mockSiweVerifierService.verify.mockRejectedValue(
				new SignerMismatchException({ expectedWalletAddress: validWalletAddress, actualWalletAddress: "0xdifferent" }),
			);

			await expect(service.createUser(validWalletAddress, validSiweMessage, validSiweSignature)).rejects.toThrow(
				SignerMismatchException,
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
});
