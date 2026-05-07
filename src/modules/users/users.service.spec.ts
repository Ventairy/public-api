import { describe, it, expect, vi, beforeEach } from "vitest";
import { VentairyKycStatus } from "@shared/enums/ventairy-kyc-status";
import { UserAlreadyExistsException } from "@shared/exceptions/user-already-exists.exception";
import { UsersService } from "./users.service";

describe("UsersService", () => {
	let service: UsersService;
	let mockDb: {
		insert: ReturnType<typeof vi.fn>;
		values: ReturnType<typeof vi.fn>;
		returning: ReturnType<typeof vi.fn>;
		select: ReturnType<typeof vi.fn>;
		from: ReturnType<typeof vi.fn>;
		where: ReturnType<typeof vi.fn>;
	};
	let mockDrizzleService: { db: typeof mockDb };
	let mockSiweVerifierService: { verify: ReturnType<typeof vi.fn> };

	beforeEach(() => {
		mockDb = {
			select: vi.fn().mockReturnThis(),
			from: vi.fn().mockReturnThis(),
			where: vi.fn(),
			insert: vi.fn().mockReturnThis(),
			values: vi.fn().mockReturnThis(),
			returning: vi.fn(),
		};
		mockDrizzleService = { db: mockDb };
		mockSiweVerifierService = { verify: vi.fn().mockResolvedValue(undefined) };
		service = new UsersService(
			mockDrizzleService as unknown as import("@core/database/drizzle.service").DrizzleService,
			mockSiweVerifierService as unknown as import("@modules/auth/verification/siwe-verifier.service").SiweVerifierService,
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
			mockDb.returning.mockResolvedValue([insertedRow]);

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
			expect(mockDb.insert).not.toHaveBeenCalled();
		});

		it("should create a user with PENDING KYC status and return mapped output after verification", async () => {
			const insertedRow = {
				id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
				wallet_address: validWalletAddress,
				created_at: "2026-05-04T14:48:00.000Z",
			};
			mockDb.returning.mockResolvedValue([insertedRow]);

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
			mockDb.returning.mockResolvedValue([insertedRow]);

			await service.createUser(validWalletAddress, validSiweMessage, validSiweSignature);

			expect(mockDb.insert).toHaveBeenCalledTimes(2);
		});

		it("should normalize wallet address to lowercase before inserting", async () => {
			const mixedCaseWallet = "0x742D35Cc6634C0532925a3b844Bc9e7595f0BEb1";
			const normalizedWallet = mixedCaseWallet.toLowerCase();

			mockDb.returning.mockResolvedValue([
				{
					id: "test-id",
					wallet_address: normalizedWallet,
					created_at: "2026-05-04T14:48:00.000Z",
				},
			]);

			await service.createUser(mixedCaseWallet, validSiweMessage, validSiweSignature);

			expect(mockDb.values).toHaveBeenCalledWith(
				expect.objectContaining({
					wallet_address: normalizedWallet,
				}),
			);
		});

		it("should generate a UUID v4 for the user id", async () => {
			const uuidSpy = vi.spyOn(crypto, "randomUUID");
			mockDb.returning.mockResolvedValue([
				{
					id: "generated-uuid",
					wallet_address: validWalletAddress,
					created_at: "2026-05-04T14:48:00.000Z",
				},
			]);

			await service.createUser(validWalletAddress, validSiweMessage, validSiweSignature);

			expect(uuidSpy).toHaveBeenCalledTimes(2);
		});

		it("should throw UserAlreadyExistsException on unique constraint violation", async () => {
			mockDb.returning.mockRejectedValue(new Error("SqliteError: UNIQUE constraint failed: users.wallet_address"));

			await expect(service.createUser(validWalletAddress, validSiweMessage, validSiweSignature)).rejects.toThrow(
				UserAlreadyExistsException,
			);
			await expect(service.createUser(validWalletAddress, validSiweMessage, validSiweSignature)).rejects.toThrow(
				`A user with wallet address ${validWalletAddress} already exists`,
			);
		});

		it("should re-throw non-unique-constraint database errors unchanged", async () => {
			const genericError = new Error("Connection timeout");
			mockDb.returning.mockRejectedValue(genericError);

			await expect(service.createUser(validWalletAddress, validSiweMessage, validSiweSignature)).rejects.toThrow(
				genericError,
			);
		});

		it("should throw when insert returns an empty array", async () => {
			mockDb.returning.mockResolvedValue([]);

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
			mockDb.where.mockResolvedValue([mockUser]);

			const result = await service.getUserDatabaseRow("user-123");

			expect(result).toEqual(mockUser);
			expect(mockDb.select).toHaveBeenCalled();
			expect(mockDb.from).toHaveBeenCalled();
			expect(mockDb.where).toHaveBeenCalled();
		});

		it("should return null when user does not exist", async () => {
			mockDb.where.mockResolvedValue([]);

			const result = await service.getUserDatabaseRow("nonexistent");

			expect(result).toBeNull();
		});

		it("should return the first user when multiple rows match (should not happen with unique id)", async () => {
			const mockUser1 = {
				id: "user-1",
				wallet_address: "0x1111",
				created_at: "2026-05-04T14:48:00.000Z",
			};
			const mockUser2 = {
				id: "user-2",
				wallet_address: "0x2222",
				created_at: "2026-05-04T14:48:00.000Z",
			};
			mockDb.where.mockResolvedValue([mockUser1, mockUser2]);

			const result = await service.getUserDatabaseRow("user-1");

			expect(result).toEqual(mockUser1);
		});
	});
});
