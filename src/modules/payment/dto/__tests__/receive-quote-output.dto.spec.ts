import { describe, it, expect } from "vitest";
import { ReceiveQuoteOutputDto } from "../receive-quote-output.dto";
import { LiquidityProviderQuoteDto } from "../liquidity-provider-quote-output.dto";
import { LiquidityProviderId, PaymentMethod } from "@shared/enums";
import type { ILiquidityProviderQuote } from "@shared/liquidity-providers/interfaces";

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

describe("ProviderQuoteDto", () => {
	it("should map from quote data correctly", () => {
		const dto = new LiquidityProviderQuoteDto({
			liquidityProvider: LiquidityProviderId.BLINDPAY,
			paymentMethod: PaymentMethod.PIX,
			sourceAmount: "100.00",
			targetAmount: "18.50",
			targetCurrency: "USDC",
			expiresAt: "2026-05-12T18:00:00.000Z",
		});

		expect(dto.liquidityProviderId).toBe(LiquidityProviderId.BLINDPAY);
		expect(dto.paymentMethod).toBe(PaymentMethod.PIX);
		expect(dto.sourceAmount).toBe("100.00");
		expect(dto.targetAmount).toBe("18.50");
		expect(dto.targetCurrency).toBe("USDC");
		expect(dto.expiresAt).toBe("2026-05-12T18:00:00.000Z");
	});
});

describe("ReceiveQuoteOutputDto", () => {
	it("should create from quotes correctly", () => {
		const quotes = [createMockQuote()];

		const dto = ReceiveQuoteOutputDto.fromLiquidityProvidersQuotes(quotes);

		expect(dto.quotes).toHaveLength(1);
		const quote = dto.quotes[0]!;
		expect(quote.liquidityProviderId).toBe(LiquidityProviderId.BLINDPAY);
		expect(quote.sourceAmount).toBe("100.00");
		expect(quote.targetAmount).toBe("18.50");
	});

	it("should handle empty quotes array", () => {
		const dto = ReceiveQuoteOutputDto.fromLiquidityProvidersQuotes([]);

		expect(dto.quotes).toEqual([]);
	});

	it("should handle multiple quotes", () => {
		const quotes = [
			createMockQuote({ liquidityProvider: LiquidityProviderId.BLINDPAY, targetAmount: "18.00" }),
			createMockQuote({ liquidityProvider: LiquidityProviderId.BLINDPAY, targetAmount: "18.50" }),
		];

		const dto = ReceiveQuoteOutputDto.fromLiquidityProvidersQuotes(quotes);

		expect(dto.quotes).toHaveLength(2);
	});
});
