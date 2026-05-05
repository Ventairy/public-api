import { describe, it, expect, vi, beforeEach } from "vitest";
import { VENTAIRY_KYC_STATUS } from "@shared/constants/ventairy-kyc-status";
import { UserAlreadyExistsException } from "@shared/exceptions/user-already-exists.exception";
import { UsersService } from "./users.service";

describe("UsersService", () => {
	let service: UsersService;
	let mockDb: {
		insert: ReturnType<typeof vi.fn>;
		values: ReturnType<typeof vi.fn>;
		returning: ReturnType<typeof vi.fn>;
	};
	let mockDrizzleService: { db: typeof mockDb };

	beforeEach(() => {
		mockDb = {
			insert: vi.fn().mockReturnThis(),
			values: vi.fn().mockReturnThis(),
			returning: vi.fn(),
		};
		mockDrizzleService = { db: mockDb };
		service = new UsersService(
			mockDrizzleService as unknown as import("@core/database/drizzle.service").DrizzleService,
		);
	});

	describe("createUser", () => {
		const validWalletAddress = "0x742d35cc6634c0532925a3b844bc9e7595f0beb1";

		it("should create a user with PENDING KYC status and return mapped output", async () => {
			const insertedRow = {
				id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
				wallet_address: validWalletAddress,
				ventairy_kyc_status: VENTAIRY_KYC_STATUS.PENDING,
				created_at: "2026-05-04T14:48:00.000Z",
				updated_at: "2026-05-04T14:48:00.000Z",
			};
			mockDb.returning.mockResolvedValue([insertedRow]);

			const result = await service.createUser(validWalletAddress);

			expect(result).toEqual({
				id: insertedRow.id,
				wallet_address: validWalletAddress,
				ventairy_kyc_status: VENTAIRY_KYC_STATUS.PENDING,
				created_at: insertedRow.created_at,
				updated_at: insertedRow.updated_at,
			});
		});

		it("should normalize wallet address to lowercase before inserting", async () => {
			const mixedCaseWallet = "0x742D35Cc6634C0532925a3b844Bc9e7595f0BEb1";
			const normalizedWallet = mixedCaseWallet.toLowerCase();

			mockDb.returning.mockResolvedValue([
				{
					id: "test-id",
					wallet_address: normalizedWallet,
					ventairy_kyc_status: VENTAIRY_KYC_STATUS.PENDING,
					created_at: "2026-05-04T14:48:00.000Z",
					updated_at: "2026-05-04T14:48:00.000Z",
				},
			]);

			await service.createUser(mixedCaseWallet);

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
					ventairy_kyc_status: VENTAIRY_KYC_STATUS.PENDING,
					created_at: "2026-05-04T14:48:00.000Z",
					updated_at: "2026-05-04T14:48:00.000Z",
				},
			]);

			await service.createUser(validWalletAddress);

			expect(uuidSpy).toHaveBeenCalledTimes(1);
		});

		it("should throw UserAlreadyExistsException on unique constraint violation", async () => {
			mockDb.returning.mockRejectedValue(new Error("SqliteError: UNIQUE constraint failed: users.wallet_address"));

			await expect(service.createUser(validWalletAddress)).rejects.toThrow(UserAlreadyExistsException);
			await expect(service.createUser(validWalletAddress)).rejects.toThrow(
				`A user with wallet address ${validWalletAddress} already exists`,
			);
		});

		it("should re-throw non-unique-constraint database errors unchanged", async () => {
			const genericError = new Error("Connection timeout");
			mockDb.returning.mockRejectedValue(genericError);

			await expect(service.createUser(validWalletAddress)).rejects.toThrow(genericError);
		});

		it("should throw when insert returns an empty array", async () => {
			mockDb.returning.mockResolvedValue([]);

			await expect(service.createUser(validWalletAddress)).rejects.toThrow("User insert returned no rows");
		});
	});
});
