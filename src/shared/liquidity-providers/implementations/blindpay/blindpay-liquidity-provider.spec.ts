import { describe, it, expect, beforeEach } from "vitest";
import { BlindpayLiquidityProvider } from "./blindpay-liquidity-provider";
import { LiquidityProviderId, PaymentMethod } from "@shared/constants";

describe("BlindpayProvider", () => {
	let provider: BlindpayLiquidityProvider;

	beforeEach(() => {
		provider = new BlindpayLiquidityProvider();
	});

	it("should have provider set to BLINDPAY", () => {
		expect(provider.liquidityProviderId).toBe(LiquidityProviderId.BLINDPAY);
	});

	it("should support PIX payment method", () => {
		expect(provider.supportedPaymentMethods).toEqual([PaymentMethod.PIX]);
	});

	it("should throw not implemented on quote", async () => {
		await expect(
			provider.quote({
				liquidityProviderUserId: "user-1",
				amount: "100.00",
				paymentMethod: PaymentMethod.PIX,
			}),
		).rejects.toThrow("BlindpayProvider.quote not implemented");
	});
});
