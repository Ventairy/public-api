import { describe, it, expect, vi, beforeEach } from "vitest";
import { PaymentService } from "./payment.service";
import { LiquidityProviderId, PaymentMethod } from "@shared/constants";
import { UserLiquidityProviderStatus } from "@shared/enums/user-liquidity-provider-status";
import { NoActiveLiquidityProviderException } from "@shared/exceptions/no-active-liquidity-provider.exception";
import type { Actor } from "@shared/types/actor.type";
import type { UserType } from "@shared/enums/user-type";
import type { ILiquidityProvider, ILiquidityProviderQuote } from "@shared/liquidity-providers";

const MOCK_USER_ID = "user-1";
const MOCK_WALLET_ADDRESS = "0x742d35cc6634c0532925a3b844bc9e7595f0beb1";
const MOCK_ACTOR: Actor = {
	id: MOCK_USER_ID,
	sessionId: "session-1",
	userType: "BUSINESS" as UserType,
	walletAddress: MOCK_WALLET_ADDRESS,
	chainId: 8453,
};

function createMockQuote(overrides: Partial<ILiquidityProviderQuote> = {}): ILiquidityProviderQuote {
	return {
		liquidityProvider: LiquidityProviderId.BLINDPAY,
		paymentMethod: PaymentMethod.PIX,
		sourceAmount: "100.00",
		targetAmount: "18.50",
		targetCurrency: "USDC",
		expiresAt: "2026-05-12T18:00:00.000Z",
		...overrides,
	};
}

function createMockProvider(overrides: Partial<ILiquidityProvider> = {}): ILiquidityProvider {
	return {
		liquidityProviderId: LiquidityProviderId.BLINDPAY,
		supportedPaymentMethods: [PaymentMethod.PIX],
		quoteReceive: vi.fn(),
		...overrides,
	};
}

function createMockUserProviderDto(overrides: Record<string, unknown> = {}) {
	return {
		userId: MOCK_ACTOR.id,
		liquidityProviderId: LiquidityProviderId.BLINDPAY,
		liquidityProviderUserId: "lp-user-1",
		status: UserLiquidityProviderStatus.ACTIVE,
		createdAt: "2026-05-04T14:48:00.000Z",
		...overrides,
	};
}

describe("PaymentService", () => {
	let service: PaymentService;
	let mockLiquidityProviderService: { getActiveLiquidityProviders: ReturnType<typeof vi.fn> };
	let mockProviders: ILiquidityProvider[];

	beforeEach(() => {
		vi.clearAllMocks();
		mockLiquidityProviderService = { getActiveLiquidityProviders: vi.fn() };
		mockProviders = [createMockProvider()];
		service = new PaymentService(mockLiquidityProviderService as any, mockProviders);
	});

	describe("getReceiveQuote", () => {
		it("should throw when user has no active providers", async () => {
			mockLiquidityProviderService.getActiveLiquidityProviders.mockResolvedValue([]);

			await expect(
				service.getReceiveQuote({ actor: MOCK_ACTOR, amount: "100.00", paymentMethod: PaymentMethod.PIX }),
			).rejects.toThrow(NoActiveLiquidityProviderException);
		});

		it("should return empty quotes when no providers support the payment method", async () => {
			mockLiquidityProviderService.getActiveLiquidityProviders.mockResolvedValue([createMockUserProviderDto()]);
			mockProviders = [createMockProvider({ supportedPaymentMethods: [] })];
			service = new PaymentService(mockLiquidityProviderService as any, mockProviders);

			const result = await service.getReceiveQuote({
				actor: MOCK_ACTOR,
				amount: "100.00",
				paymentMethod: PaymentMethod.PIX,
			});

			expect(result.quotes).toEqual([]);
		});

		it("should return quotes from eligible providers", async () => {
			const mockQuote = createMockQuote();
			mockLiquidityProviderService.getActiveLiquidityProviders.mockResolvedValue([createMockUserProviderDto()]);
			mockProviders[0]!.quoteReceive = vi.fn().mockResolvedValue(mockQuote);
			service = new PaymentService(mockLiquidityProviderService as any, mockProviders);

			const result = await service.getReceiveQuote({
				actor: MOCK_ACTOR,
				amount: "100.00",
				paymentMethod: PaymentMethod.PIX,
			});

			expect(result.quotes).toHaveLength(1);
			expect(result.quotes[0]!.targetAmount).toBe("18.50");
		});

		it("should sort quotes by target amount descending", async () => {
			mockLiquidityProviderService.getActiveLiquidityProviders.mockResolvedValue([createMockUserProviderDto()]);

			const provider = createMockProvider();
			provider.quoteReceive = vi
				.fn()
				.mockResolvedValueOnce(createMockQuote({ targetAmount: "18.00" }))
				.mockResolvedValueOnce(createMockQuote({ targetAmount: "19.00" }));

			mockProviders = [provider, provider];
			service = new PaymentService(mockLiquidityProviderService as any, mockProviders);

			const result = await service.getReceiveQuote({
				actor: MOCK_ACTOR,
				amount: "100.00",
				paymentMethod: PaymentMethod.PIX,
			});

			expect(result.quotes).toHaveLength(2);
			expect(result.quotes[0]!.targetAmount).toBe("19.00");
			expect(result.quotes[1]!.targetAmount).toBe("18.00");
		});

		it("should skip failed provider quotes and still return successful ones", async () => {
			mockLiquidityProviderService.getActiveLiquidityProviders.mockResolvedValue([createMockUserProviderDto()]);

			const failingProvider = createMockProvider();
			failingProvider.quoteReceive = vi.fn().mockRejectedValue(new Error("Provider error"));

			mockProviders = [failingProvider];
			service = new PaymentService(mockLiquidityProviderService as any, mockProviders);

			const result = await service.getReceiveQuote({
				actor: MOCK_ACTOR,
				amount: "100.00",
				paymentMethod: PaymentMethod.PIX,
			});

			expect(result.quotes).toEqual([]);
		});

		it("should skip providers without liquidity provider user id", async () => {
			const mockQuote = createMockQuote();
			mockLiquidityProviderService.getActiveLiquidityProviders.mockResolvedValue([
				createMockUserProviderDto({ liquidityProviderUserId: null }),
			]);
			mockProviders[0]!.quoteReceive = vi.fn().mockResolvedValue(mockQuote);
			service = new PaymentService(mockLiquidityProviderService as any, mockProviders);

			const result = await service.getReceiveQuote({
				actor: MOCK_ACTOR,
				amount: "100.00",
				paymentMethod: PaymentMethod.PIX,
			});

			expect(result.quotes).toEqual([]);
		});
	});
});
