import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSiweMessageConstructor = vi.fn();
const mockVerifyMessage = vi.fn();
const mockCreatePublicClient = vi.fn().mockReturnValue({ verifyMessage: mockVerifyMessage });

vi.mock("siwe", () => ({
	SiweMessage: function (...args: any[]) { return mockSiweMessageConstructor(...args); },
}));

vi.mock("viem", () => ({
	createPublicClient: (...args: any[]) => mockCreatePublicClient(...args),
	fallback: vi.fn().mockReturnValue("mocked-transport"),
	http: vi.fn().mockReturnValue("mocked-http"),
}));

import { SiweVerifierService } from "./siwe-verifier.service";
import { WalletNonceService } from "@modules/auth/wallet/wallet-nonce.service";

const VALID_SIWE_CONFIG = {
	domain: "ventairy.com",
	uri: "https://ventairy.com",
	nonceTtlSeconds: 180,
};

const WALLET_ADDRESS = "0x742d35cc6634c0532925a3b844bc9e7595f0beb1";

function createMockSiweMessage(overrides: Record<string, unknown> = {}) {
	return {
		domain: "ventairy.com",
		uri: "https://ventairy.com",
		address: WALLET_ADDRESS,
		chainId: 8453,
		nonce: "ABCDEFGH12345678",
		expirationTime: new Date(Date.now() + 600_000).toISOString(),
		prepareMessage: vi.fn().mockReturnValue("ventairy.com wants you to sign in..."),
		...overrides,
	};
}

describe("SiweVerifierService", () => {
	let service: SiweVerifierService;
	let mockNonceService: {
		findNonce: ReturnType<typeof vi.fn>;
		deleteNonce: ReturnType<typeof vi.fn>;
	};
	let mockConfigService: { get: ReturnType<typeof vi.fn> };

	beforeEach(() => {
		vi.clearAllMocks();

		mockNonceService = {
			findNonce: vi.fn(),
			deleteNonce: vi.fn(),
		};
		mockConfigService = { get: vi.fn().mockReturnValue(VALID_SIWE_CONFIG) };

		service = new SiweVerifierService(
			mockNonceService as unknown as WalletNonceService,
			mockConfigService as unknown as import("@nestjs/config").ConfigService,
		);
	});

	describe("parseAndVerifyMessage", () => {
		const validNonce = "ABCDEFGH12345678";
		const validSignature =
			"0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e";

		function setupNonceFound(walletAddress: string, expiresAt: string, overrides: Record<string, unknown> = {}) {
			mockNonceService.findNonce.mockResolvedValueOnce({
				id: "nonce-id",
				nonce: validNonce,
				wallet_address: walletAddress,
				chain_id: 8453,
				expires_at: expiresAt,
				created_at: new Date().toISOString(),
				...overrides,
			});
		}

		function setupNonceRow(overrides: Record<string, unknown> = {}) {
			mockNonceService.findNonce.mockResolvedValueOnce({
				id: "nonce-id",
				nonce: validNonce,
				wallet_address: WALLET_ADDRESS,
				chain_id: 8453,
				expires_at: new Date(Date.now() + 180_000).toISOString(),
				created_at: new Date().toISOString(),
				...overrides,
			});
		}

		it("should throw SiweMessageInvalidException for unparseable message", async () => {
			mockSiweMessageConstructor.mockImplementation(() => {
				throw new Error("parse error");
			});

			await expect(
				service.parseAndVerifyMessage({
					message: "not-a-valid-siwe-message",
					signature: validSignature,
				}),
			).rejects.toThrow("The SIWE message is invalid");
		});

		it("should throw SiweMessageInvalidException when domain mismatches", async () => {
			mockSiweMessageConstructor.mockReturnValue(createMockSiweMessage({ domain: "evil.com" }));

			await expect(
				service.parseAndVerifyMessage({
					message: "some-message",
					signature: validSignature,
				}),
			).rejects.toThrow("domain mismatch");
		});

		it("should throw SiweMessageInvalidException when uri mismatches", async () => {
			mockSiweMessageConstructor.mockReturnValue(createMockSiweMessage({ uri: "https://evil.com" }));

			await expect(
				service.parseAndVerifyMessage({
					message: "some-message",
					signature: validSignature,
				}),
			).rejects.toThrow("uri mismatch");
		});

		it("should throw SiweMessageInvalidException for unsupported chain ID", async () => {
			mockSiweMessageConstructor.mockReturnValue(createMockSiweMessage({ chainId: 1 }));

			await expect(
				service.parseAndVerifyMessage({
					message: "some-message",
					signature: validSignature,
				}),
			).rejects.toThrow("unsupported chain ID");
		});

		it("should throw SiweMessageInvalidException when message is expired", async () => {
			mockSiweMessageConstructor.mockReturnValue(
				createMockSiweMessage({ expirationTime: new Date(Date.now() - 60_000).toISOString() }),
			);

			await expect(
				service.parseAndVerifyMessage({
					message: "some-message",
					signature: validSignature,
				}),
			).rejects.toThrow("message has expired");
		});

		it("should throw SiweMessageInvalidException when nonce is too short", async () => {
			mockSiweMessageConstructor.mockReturnValue(createMockSiweMessage({ nonce: "AB" }));

			await expect(
				service.parseAndVerifyMessage({
					message: "some-message",
					signature: validSignature,
				}),
			).rejects.toThrow("nonce is missing or too short");
		});

		it("should throw NonceNotFoundException when nonce does not exist in DB", async () => {
			mockSiweMessageConstructor.mockReturnValue(createMockSiweMessage());
			mockNonceService.findNonce.mockResolvedValueOnce(undefined);

			await expect(
				service.parseAndVerifyMessage({
					message: "some-message",
					signature: validSignature,
				}),
			).rejects.toThrow("The provided nonce does not exist");
		});

		it("should throw NonceWalletMismatchException when nonce belongs to a different wallet", async () => {
			mockSiweMessageConstructor.mockReturnValue(createMockSiweMessage());
			setupNonceRow({
				wallet_address: "0xdifferentcc6634c0532925a3b844bc9e7595f0beb1",
			});

			await expect(
				service.parseAndVerifyMessage({
					message: "some-message",
					signature: validSignature,
				}),
			).rejects.toThrow("The nonce was generated for a different wallet address.");
		});

		it("should throw NonceExpiredException when nonce has expired in DB", async () => {
			mockSiweMessageConstructor.mockReturnValue(createMockSiweMessage());
			setupNonceRow({
				expires_at: new Date(Date.now() - 60_000).toISOString(),
			});

			await expect(
				service.parseAndVerifyMessage({
					message: "some-message",
					signature: validSignature,
				}),
			).rejects.toThrow("The provided nonce has expired");
		});

		it("should throw InvalidSignatureException when on-chain verification returns false", async () => {
			mockSiweMessageConstructor.mockReturnValue(createMockSiweMessage());
			setupNonceFound(WALLET_ADDRESS, new Date(Date.now() + 180_000).toISOString());
			mockVerifyMessage.mockResolvedValue(false);

			await expect(
				service.parseAndVerifyMessage({
					message: "some-message",
					signature: validSignature,
				}),
			).rejects.toThrow("The provided signature is invalid");
		});

		it("should throw SignatureVerificationUnavailableException when RPC fails", async () => {
			mockSiweMessageConstructor.mockReturnValue(createMockSiweMessage());
			setupNonceFound(WALLET_ADDRESS, new Date(Date.now() + 180_000).toISOString());
			mockVerifyMessage.mockRejectedValue(new Error("RPC timeout"));

			await expect(
				service.parseAndVerifyMessage({
					message: "some-message",
					signature: validSignature,
				}),
			).rejects.toThrow("Signature verification is currently unavailable");
		});

		it("should not block verification when nonce deletion fails (fire-and-forget)", async () => {
			mockSiweMessageConstructor.mockReturnValue(createMockSiweMessage());
			setupNonceFound(WALLET_ADDRESS, new Date(Date.now() + 180_000).toISOString());
			mockVerifyMessage.mockResolvedValue(true);
			mockNonceService.deleteNonce.mockRejectedValueOnce(new Error("The provided nonce does not exist"));

			const result = await service.parseAndVerifyMessage({
				message: "some-message",
				signature: validSignature,
			});

			expect(result).toEqual({
				walletAddress: WALLET_ADDRESS,
				chainId: 8453,
			});
		});

		it("should successfully verify, consume nonce, and return wallet + chainId when all checks pass", async () => {
			mockSiweMessageConstructor.mockReturnValue(createMockSiweMessage());
			setupNonceFound(WALLET_ADDRESS, new Date(Date.now() + 180_000).toISOString());
			mockVerifyMessage.mockResolvedValue(true);
			mockNonceService.deleteNonce.mockResolvedValueOnce(undefined);

			const result = await service.parseAndVerifyMessage({
				message: "some-message",
				signature: validSignature,
			});

			expect(result).toEqual({
				walletAddress: WALLET_ADDRESS,
				chainId: 8453,
			});
			expect(mockNonceService.deleteNonce).toHaveBeenCalledWith(validNonce, WALLET_ADDRESS);
		});

		it("should throw if SIWE config is missing", async () => {
			mockConfigService.get.mockReturnValue(undefined);

			await expect(
				service.parseAndVerifyMessage({
					message: "any-message",
					signature: validSignature,
				}),
			).rejects.toThrow("SIWE configuration is missing");
		});

		it("should not throw when expirationTime is undefined (optional field)", async () => {
			mockSiweMessageConstructor.mockReturnValue(createMockSiweMessage({ expirationTime: undefined }));
			setupNonceFound(WALLET_ADDRESS, new Date(Date.now() + 180_000).toISOString());
			mockVerifyMessage.mockResolvedValue(true);
			mockNonceService.deleteNonce.mockResolvedValueOnce(undefined);

			const result = await service.parseAndVerifyMessage({
				message: "some-message",
				signature: validSignature,
			});

			expect(result).toEqual({
				walletAddress: WALLET_ADDRESS,
				chainId: 8453,
			});
		});
	});
});
