import { describe, it, expect, vi, beforeEach } from "vitest";
import { ConfigService } from "@nestjs/config";
import { BlindPay } from "@blindpay/node";
import { BlindpayLiquidityProvider } from "./blindpay-liquidity-provider";
import { LiquidityProviderId, PaymentMethod } from "@shared/enums";
import { LiquidityProviderApiException, LiquidityProviderQuoteFailedException, WalletAtLiquidityProviderMismatchException } from "@shared/exceptions";

const mockBlindPayInstance = {
	wallets: {
		blockchain: {
			list: vi.fn(),
		},
	},
	payins: {
		quotes: {
			create: vi.fn(),
		},
	},
	verifyWebhookSignature: vi.fn(),
};

vi.mock("@blindpay/node", () => ({
	BlindPay: vi.fn(() => mockBlindPayInstance),
}));

function createMockConfigService(): ConfigService {
	return {
		get: vi.fn().mockImplementation((key: string) => {
			if (key === "blindpay") return { apiKey: "test-api-key", instanceId: "test-instance-id" };
			return undefined;
		}),
	} as unknown as ConfigService;
}

function createMockConfigServiceWithoutBlindpay(): ConfigService {
	return {
		get: vi.fn().mockReturnValue(undefined),
	} as unknown as ConfigService;
}

const DEFAULT_QUOTE_PARAMS = {
	liquidityProviderUserId: "receiver-123",
	receiverWalletAddress: "0x742d35cc6634c0532925a3b844bc9e7595f0beb1",
	chainId: 8453,
	amount: "100.00",
	paymentMethod: PaymentMethod.PIX as PaymentMethod,
};

function createMockWallet(overrides: Record<string, unknown> = {}) {
	return {
		id: "wallet-001",
		name: "Test Wallet",
		network: "base",
		address: "0x742d35cc6634c0532925a3b844bc9e7595f0beb1",
		signature_tx_hash: undefined,
		is_account_abstraction: true,
		receiver_id: "receiver-123",
		...overrides,
	};
}

function createMockQuoteResponse(overrides: Record<string, unknown> = {}) {
	return {
		id: "payin_quote_001",
		expires_at: 1715536800000,
		commercial_quotation: 5.4,
		blindpay_quotation: 5.45,
		receiver_amount: 1850,
		sender_amount: 10000,
		flat_fee: 100,
		partner_fee_amount: null,
		is_otc: null,
		...overrides,
	};
}

describe("BlindpayLiquidityProvider", () => {
	let provider: BlindpayLiquidityProvider;

	beforeEach(() => {
		vi.clearAllMocks();
		const configService = createMockConfigService();
		provider = new BlindpayLiquidityProvider(configService);
	});

	it("should have provider set to BLINDPAY", () => {
		expect(provider.liquidityProviderId).toBe(LiquidityProviderId.BLINDPAY);
	});

	it("should support PIX payment method", () => {
		expect(provider.supportedPaymentMethods).toEqual([PaymentMethod.PIX]);
	});

	it("should throw Error when config is missing", () => {
		const configService = createMockConfigServiceWithoutBlindpay();
		expect(() => new BlindpayLiquidityProvider(configService)).toThrow("BlindPay configuration is missing");
	});

	describe("quote", () => {
		it("should return a successful quote when wallet matches and payin quote succeeds", async () => {
			const mockWallet = createMockWallet();
			const mockQuote = createMockQuoteResponse();

			mockBlindPayInstance.wallets.blockchain.list.mockResolvedValue({ data: [mockWallet], error: null });
			mockBlindPayInstance.payins.quotes.create.mockResolvedValue({ data: mockQuote, error: null });

			const result = await provider.quoteReceive(DEFAULT_QUOTE_PARAMS);

			expect(result.liquidityProvider).toBe(LiquidityProviderId.BLINDPAY);
			expect(result.paymentMethod).toBe(PaymentMethod.PIX);
			expect(result.sourceAmount).toBe("100.00");
			expect(result.targetAmount).toBe("18.50");
			expect(result.targetCurrency).toBe("USDC");
			expect(result.expiresAt).toBe("2024-05-12T18:00:00.000Z");
		});

		it("should call BlindPay blockchain wallet list with the correct receiver id", async () => {
			mockBlindPayInstance.wallets.blockchain.list.mockResolvedValue({ data: [createMockWallet()], error: null });
			mockBlindPayInstance.payins.quotes.create.mockResolvedValue({
				data: createMockQuoteResponse(),
				error: null,
			});

			await provider.quoteReceive(DEFAULT_QUOTE_PARAMS);

			expect(mockBlindPayInstance.wallets.blockchain.list).toHaveBeenCalledWith("receiver-123");
		});

		it("should call BlindPay payin quotes create with correct parameters", async () => {
			mockBlindPayInstance.wallets.blockchain.list.mockResolvedValue({ data: [createMockWallet()], error: null });
			mockBlindPayInstance.payins.quotes.create.mockResolvedValue({
				data: createMockQuoteResponse(),
				error: null,
			});

			await provider.quoteReceive(DEFAULT_QUOTE_PARAMS);

			expect(mockBlindPayInstance.payins.quotes.create).toHaveBeenCalledWith({
				blockchain_wallet_id: "wallet-001",
				currency_type: "sender",
				cover_fees: false,
				request_amount: 10000,
				payment_method: "pix",
				token: "USDC",
				partner_fee_id: null,
			});
		});

		it("should throw WalletAtLiquidityProviderMismatchException when receiver has wallets but none match the Ventairy address", async () => {
			mockBlindPayInstance.wallets.blockchain.list.mockResolvedValue({
				data: [createMockWallet({ address: "0xdifferent" })],
				error: null,
			});

			await expect(provider.quoteReceive(DEFAULT_QUOTE_PARAMS)).rejects.toThrow(
				WalletAtLiquidityProviderMismatchException,
			);
		});

		it("should throw LiquidityProviderApiException when wallet list API returns error", async () => {
			mockBlindPayInstance.wallets.blockchain.list.mockResolvedValue({
				data: null,
				error: { message: "API authorization failed" },
			});

			await expect(provider.quoteReceive(DEFAULT_QUOTE_PARAMS)).rejects.toThrow(LiquidityProviderApiException);
		});

		it("should throw LiquidityProviderQuoteFailedException when payin quote API returns error", async () => {
			mockBlindPayInstance.wallets.blockchain.list.mockResolvedValue({ data: [createMockWallet()], error: null });
			mockBlindPayInstance.payins.quotes.create.mockResolvedValue({
				data: null,
				error: { message: "quote_expired" },
			});

			await expect(provider.quoteReceive(DEFAULT_QUOTE_PARAMS)).rejects.toThrow(LiquidityProviderQuoteFailedException);
		});

		it("should match wallet addresses case-insensitively", async () => {
			const mockWallet = createMockWallet({ address: "0x742D35cc6634C0532925A3b844BC9E7595F0BEB1" });
			mockBlindPayInstance.wallets.blockchain.list.mockResolvedValue({ data: [mockWallet], error: null });
			mockBlindPayInstance.payins.quotes.create.mockResolvedValue({
				data: createMockQuoteResponse(),
				error: null,
			});

			const result = await provider.quoteReceive(DEFAULT_QUOTE_PARAMS);

			expect(result.targetAmount).toBe("18.50");
		});

		it("should skip wallets with null address when matching", async () => {
			const wallets = [
				createMockWallet({ id: "wallet-null-addr", address: null }),
				createMockWallet({ id: "wallet-matched", address: DEFAULT_QUOTE_PARAMS.receiverWalletAddress }),
			];
			mockBlindPayInstance.wallets.blockchain.list.mockResolvedValue({ data: wallets, error: null });
			mockBlindPayInstance.payins.quotes.create.mockResolvedValue({
				data: createMockQuoteResponse(),
				error: null,
			});

			await provider.quoteReceive(DEFAULT_QUOTE_PARAMS);

			expect(mockBlindPayInstance.payins.quotes.create).toHaveBeenCalledWith(
				expect.objectContaining({ blockchain_wallet_id: "wallet-matched" }),
			);
		});

		it("should not match wallet with unsupported network and throw WalletAtLiquidityProviderMismatchException", async () => {
			mockBlindPayInstance.wallets.blockchain.list.mockResolvedValue({
				data: [createMockWallet({ network: "sepolia" })],
				error: null,
			});

			await expect(provider.quoteReceive(DEFAULT_QUOTE_PARAMS)).rejects.toThrow(WalletAtLiquidityProviderMismatchException);
		});

		it("should map payment method PIX to pix", async () => {
			mockBlindPayInstance.wallets.blockchain.list.mockResolvedValue({ data: [createMockWallet()], error: null });
			mockBlindPayInstance.payins.quotes.create.mockResolvedValue({
				data: createMockQuoteResponse(),
				error: null,
			});

			await provider.quoteReceive(DEFAULT_QUOTE_PARAMS);

			expect(mockBlindPayInstance.payins.quotes.create).toHaveBeenCalledWith(
				expect.objectContaining({ payment_method: "pix" }),
			);
		});

		it("should convert amounts correctly", async () => {
			mockBlindPayInstance.wallets.blockchain.list.mockResolvedValue({ data: [createMockWallet()], error: null });
			mockBlindPayInstance.payins.quotes.create.mockResolvedValue({
				data: createMockQuoteResponse({ sender_amount: 5000, receiver_amount: 925 }),
				error: null,
			});

			const result = await provider.quoteReceive({ ...DEFAULT_QUOTE_PARAMS, amount: "50.00" });

			expect(result.sourceAmount).toBe("50.00");
			expect(result.targetAmount).toBe("9.25");
		});

		it("should handle zero decimal amounts", async () => {
			mockBlindPayInstance.wallets.blockchain.list.mockResolvedValue({ data: [createMockWallet()], error: null });
			mockBlindPayInstance.payins.quotes.create.mockResolvedValue({
				data: createMockQuoteResponse({ sender_amount: 5000, receiver_amount: 0 }),
				error: null,
			});

			const result = await provider.quoteReceive({ ...DEFAULT_QUOTE_PARAMS, amount: "50.00" });

			expect(result.targetAmount).toBe("0.00");
		});

		it("should map BASE chain ID to USDC token and set targetCurrency to USDC", async () => {
			mockBlindPayInstance.wallets.blockchain.list.mockResolvedValue({ data: [createMockWallet()], error: null });
			mockBlindPayInstance.payins.quotes.create.mockResolvedValue({
				data: createMockQuoteResponse(),
				error: null,
			});

			await provider.quoteReceive(DEFAULT_QUOTE_PARAMS);

			expect(mockBlindPayInstance.payins.quotes.create).toHaveBeenCalledWith(
				expect.objectContaining({ token: "USDC" }),
			);
		});

		it("should map BASE_SEPOLIA chain ID to USDB token and set targetCurrency to USDB", async () => {
			mockBlindPayInstance.wallets.blockchain.list.mockResolvedValue({
				data: [createMockWallet({ network: "base_sepolia" })],
				error: null,
			});
			mockBlindPayInstance.payins.quotes.create.mockResolvedValue({
				data: createMockQuoteResponse(),
				error: null,
			});

			const result = await provider.quoteReceive({
				...DEFAULT_QUOTE_PARAMS,
				chainId: 84532,
			});

			expect(mockBlindPayInstance.payins.quotes.create).toHaveBeenCalledWith(
				expect.objectContaining({ token: "USDB" }),
			);
			expect(result.targetCurrency).toBe("USDB");
		});

		it("should convert unix timestamp to ISO string", async () => {
			mockBlindPayInstance.wallets.blockchain.list.mockResolvedValue({ data: [createMockWallet()], error: null });
			mockBlindPayInstance.payins.quotes.create.mockResolvedValue({
				data: createMockQuoteResponse({ expires_at: 1715536800000 }),
				error: null,
			});

			const result = await provider.quoteReceive(DEFAULT_QUOTE_PARAMS);

			expect(result.expiresAt).toBe("2024-05-12T18:00:00.000Z");
		});
	});
});
