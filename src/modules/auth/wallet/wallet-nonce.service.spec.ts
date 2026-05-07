import { describe, it, expect, vi, beforeEach } from "vitest";
import { WalletNonceService } from "./wallet-nonce.service";

describe("WalletNonceService", () => {
	let service: WalletNonceService;
	let mockDb: {
		values: ReturnType<typeof vi.fn>;
		insert: ReturnType<typeof vi.fn>;
		select: ReturnType<typeof vi.fn>;
		delete: ReturnType<typeof vi.fn>;
	};
	let mockDrizzleService: { db: typeof mockDb };

	beforeEach(() => {
		mockDb = {
			insert: vi.fn().mockReturnThis(),
			values: vi.fn().mockReturnThis(),
			select: vi.fn().mockReturnThis(),
			delete: vi.fn().mockReturnThis(),
		};
		mockDrizzleService = { db: mockDb };
		service = new WalletNonceService(
			mockDrizzleService as unknown as import("@core/database/drizzle.service").DrizzleService,
		);
	});

	describe("createNonce", () => {
		const validWalletAddress = "0x742d35cc6634c0532925a3b844bc9e7595f0beb1";

		it("should insert a nonce row and return nonce output", async () => {
			const result = await service.createNonce(validWalletAddress, 180);

			expect(mockDb.insert).toHaveBeenCalled();
			expect(mockDb.values).toHaveBeenCalledWith(
				expect.objectContaining({
					nonce: expect.any(String),
					wallet_address: validWalletAddress,
					expires_at: expect.any(String),
				}),
			);
			expect(result).toEqual({
				nonce: expect.any(String),
				expiresAt: expect.any(String),
				walletAddress: validWalletAddress,
			});
		});

		it("should normalize wallet address to lowercase", async () => {
			const mixedCaseWallet = "0x742D35Cc6634C0532925a3b844Bc9e7595f0BEb1";
			await service.createNonce(mixedCaseWallet, 180);

			expect(mockDb.values).toHaveBeenCalledWith(
				expect.objectContaining({
					wallet_address: mixedCaseWallet.toLowerCase(),
				}),
			);
		});

		it("should generate a nonce matching the SIWE regex (alphanumeric, 8+ chars)", async () => {
			const result = await service.createNonce(validWalletAddress, 180);

			expect(result.nonce).toMatch(/^[a-zA-Z0-9]{8,}$/);
		});

		it("should set expires_at based on ttlSeconds", async () => {
			const beforeCreate = Date.now();
			const ttlMs = 180 * 1000;

			const result = await service.createNonce(validWalletAddress, 180);

			const expiresAtMs = new Date(result.expiresAt).getTime();
			expect(expiresAtMs).toBeGreaterThanOrEqual(beforeCreate + ttlMs - 1000);
			expect(expiresAtMs).toBeLessThanOrEqual(beforeCreate + ttlMs + 2000);
		});

		it("should generate different nonces on successive calls", async () => {
			const result1 = await service.createNonce(validWalletAddress, 180);
			const result2 = await service.createNonce(validWalletAddress, 180);

			expect(result1.nonce).not.toBe(result2.nonce);
		});

		it("should generate UUID for nonce row id", async () => {
			const uuidSpy = vi.spyOn(crypto, "randomUUID");

			await service.createNonce(validWalletAddress, 180);

			expect(uuidSpy).toHaveBeenCalledTimes(1);
		});
	});

	describe("findByNonce", () => {
		it("should return nonce row when found", async () => {
			const selectBuilder = { from: vi.fn().mockReturnThis(), where: vi.fn() };
			mockDb.select.mockReturnValue(selectBuilder);
			const expectedRow = {
				id: "1",
				nonce: "TESTNONCE",
				wallet_address: "0xabc",
				expires_at: "2026-01-01T00:00:00.000Z",
				created_at: "2026-01-01T00:00:00.000Z",
			};
			selectBuilder.where.mockResolvedValueOnce([expectedRow]);

			const result = await service.findNonce("TESTNONCE");

			expect(result).toEqual(expectedRow);
		});

		it("should return undefined when nonce not found", async () => {
			const selectBuilder = { from: vi.fn().mockReturnThis(), where: vi.fn() };
			mockDb.select.mockReturnValue(selectBuilder);
			selectBuilder.where.mockResolvedValueOnce([]);

			const result = await service.findNonce("NONEXISTENT");

			expect(result).toBeUndefined();
		});
	});

	describe("consumeNonce", () => {
		it("should delete nonce row when found", async () => {
			const deleteBuilder = { where: vi.fn().mockReturnThis(), returning: vi.fn() };
			mockDb.delete.mockReturnValue(deleteBuilder);
			deleteBuilder.returning.mockResolvedValueOnce([{ id: "1" }]);

			await expect(service.deleteNonce("TESTNONCE", "0xabc")).resolves.toBeUndefined();
		});

		it("should throw NonceNotFoundException when nonce not found", async () => {
			const deleteBuilder = { where: vi.fn().mockReturnThis(), returning: vi.fn() };
			mockDb.delete.mockReturnValue(deleteBuilder);
			deleteBuilder.returning.mockResolvedValueOnce([]);

			await expect(service.deleteNonce("TESTNONCE", "0xabc")).rejects.toThrow("The provided nonce does not exist");
		});
	});

	describe("cleanupExpired", () => {
		it("should delete rows where expires_at is in the past", async () => {
			const deleteBuilder = { where: vi.fn().mockReturnThis() };
			mockDb.delete.mockReturnValue(deleteBuilder);

			await service.cleanupExpired();

			expect(mockDb.delete).toHaveBeenCalled();
			expect(deleteBuilder.where).toHaveBeenCalled();
		});
	});
});
