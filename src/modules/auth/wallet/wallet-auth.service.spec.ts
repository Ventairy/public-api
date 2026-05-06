import { describe, it, expect, vi, beforeEach } from "vitest";
import { WalletAuthService } from "./wallet-auth.service";
import { WalletNonceService } from "./wallet-nonce.service";

describe("WalletAuthService", () => {
	let service: WalletAuthService;
	let mockNonceService: {
		createNonce: ReturnType<typeof vi.fn>;
		cleanupExpired: ReturnType<typeof vi.fn>;
	};
	let mockConfigService: { get: ReturnType<typeof vi.fn> };

	beforeEach(() => {
		mockNonceService = {
			createNonce: vi.fn(),
			cleanupExpired: vi.fn().mockResolvedValue(undefined),
		};
		mockConfigService = {
			get: vi.fn().mockReturnValue({
				domain: "ventairy.com",
				uri: "https://ventairy.com",
				nonceTtlSeconds: 180,
			}),
		};
		service = new WalletAuthService(
			mockNonceService as unknown as WalletNonceService,
			mockConfigService as unknown as import("@nestjs/config").ConfigService,
		);
	});

	describe("createNonce", () => {
		const validWalletAddress = "0x742d35cc6634c0532925a3b844bc9e7595f0beb1";

		it("should delegate to WalletNonceService and return nonce output", async () => {
			const expectedOutput = {
				nonce: "TESTNONCE123",
				expires_at: "2026-05-05T12:00:00.000Z",
				wallet_address: validWalletAddress,
			};
			mockNonceService.createNonce.mockResolvedValue(expectedOutput);

			const result = await service.createNonce(validWalletAddress);

			expect(mockNonceService.createNonce).toHaveBeenCalledWith(validWalletAddress, 180);
			expect(result).toEqual(expectedOutput);
		});

		it("should trigger fire-and-forget cleanup", async () => {
			mockNonceService.createNonce.mockResolvedValue({
				nonce: "TESTNONCE123",
				expires_at: "2026-05-05T12:00:00.000Z",
				wallet_address: validWalletAddress,
			});

			await service.createNonce(validWalletAddress);

			expect(mockNonceService.cleanupExpired).toHaveBeenCalled();
		});

		it("should throw if SIWE config is missing", async () => {
			mockConfigService.get.mockReturnValue(undefined);

			await expect(service.createNonce(validWalletAddress)).rejects.toThrow("SIWE configuration is missing");
		});
	});
});
