import { describe, it, expect, vi, beforeEach } from "vitest";
import { SupportedBlockchain } from "@shared/blockchain";
import { WalletNonceService } from "./wallet-nonce.service";

describe("WalletNonceService", () => {
	let service: WalletNonceService;
	let mockSignatureNonceRepository: {
		create: ReturnType<typeof vi.fn>;
		findByNonce: ReturnType<typeof vi.fn>;
		deleteByNonceAndWalletAddress: ReturnType<typeof vi.fn>;
		deleteExpired: ReturnType<typeof vi.fn>;
	};

	beforeEach(() => {
		mockSignatureNonceRepository = {
			create: vi.fn().mockResolvedValue(undefined),
			findByNonce: vi.fn(),
			deleteByNonceAndWalletAddress: vi.fn(),
			deleteExpired: vi.fn().mockResolvedValue(undefined),
		};
		service = new WalletNonceService(mockSignatureNonceRepository as any);
	});

	describe("createNonce", () => {
		const validWalletAddress = "0x742d35cc6634c0532925a3b844bc9e7595f0beb1";
		const validChainId = SupportedBlockchain.BASE;

		it("should insert a nonce row and return nonce output", async () => {
			const result = await service.createNonce(validWalletAddress, validChainId, 180);

			expect(mockSignatureNonceRepository.create).toHaveBeenCalledWith(
				expect.objectContaining({
					nonce: expect.any(String),
					wallet_address: validWalletAddress,
					chain_id: validChainId,
					expires_at: expect.any(String),
				}),
			);
			expect(result).toEqual({
				nonce: expect.any(String),
				expiresAt: expect.any(String),
				walletAddress: validWalletAddress,
				chainId: validChainId,
			});
		});

		it("should normalize wallet address to lowercase", async () => {
			const mixedCaseWallet = "0x742D35Cc6634C0532925a3b844Bc9e7595f0BEb1";
			await service.createNonce(mixedCaseWallet, validChainId, 180);

			expect(mockSignatureNonceRepository.create).toHaveBeenCalledWith(
				expect.objectContaining({
					chain_id: validChainId,
					wallet_address: mixedCaseWallet.toLowerCase(),
				}),
			);
		});

		it("should generate a nonce matching the SIWE regex (alphanumeric, 8+ chars)", async () => {
			const result = await service.createNonce(validWalletAddress, validChainId, 180);

			expect(result.nonce).toMatch(/^[a-zA-Z0-9]{8,}$/);
		});

		it("should set expires_at based on ttlSeconds", async () => {
			const beforeCreate = Date.now();
			const ttlMs = 180 * 1000;

			const result = await service.createNonce(validWalletAddress, validChainId, 180);

			const expiresAtMs = new Date(result.expiresAt).getTime();
			expect(expiresAtMs).toBeGreaterThanOrEqual(beforeCreate + ttlMs - 1000);
			expect(expiresAtMs).toBeLessThanOrEqual(beforeCreate + ttlMs + 2000);
		});

		it("should generate different nonces on successive calls", async () => {
			const result1 = await service.createNonce(validWalletAddress, validChainId, 180);
			const result2 = await service.createNonce(validWalletAddress, validChainId, 180);

			expect(result1.nonce).not.toBe(result2.nonce);
		});

		it("should generate UUID for nonce row id", async () => {
			const uuidSpy = vi.spyOn(crypto, "randomUUID");

			await service.createNonce(validWalletAddress, validChainId, 180);

			expect(uuidSpy).toHaveBeenCalledTimes(1);
		});
	});

	describe("findByNonce", () => {
		it("should return nonce row when found", async () => {
			const expectedRow = {
				id: "1",
				nonce: "TESTNONCE",
				wallet_address: "0xabc",
				expires_at: "2026-01-01T00:00:00.000Z",
				created_at: "2026-01-01T00:00:00.000Z",
			};
			mockSignatureNonceRepository.findByNonce.mockResolvedValue(expectedRow);

			const result = await service.findNonce("TESTNONCE");

			expect(result).toEqual(expectedRow);
		});

		it("should return undefined when nonce not found", async () => {
			mockSignatureNonceRepository.findByNonce.mockResolvedValue(undefined);

			const result = await service.findNonce("NONEXISTENT");

			expect(result).toBeUndefined();
		});
	});

	describe("consumeNonce", () => {
		it("should delete nonce row when found", async () => {
			mockSignatureNonceRepository.deleteByNonceAndWalletAddress.mockResolvedValue({ id: "1" });

			await expect(service.deleteNonce("TESTNONCE", "0xabc")).resolves.toBeUndefined();
		});

		it("should throw NonceNotFoundException when nonce not found", async () => {
			mockSignatureNonceRepository.deleteByNonceAndWalletAddress.mockResolvedValue(undefined);

			await expect(service.deleteNonce("TESTNONCE", "0xabc")).rejects.toThrow("The provided nonce does not exist");
		});
	});

	describe("cleanupExpired", () => {
		it("should delete rows where expires_at is in the past", async () => {
			await service.cleanupExpired();

			expect(mockSignatureNonceRepository.deleteExpired).toHaveBeenCalledTimes(1);
		});
	});
});
