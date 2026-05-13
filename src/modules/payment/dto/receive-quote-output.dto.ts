import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import type { ILiquidityProviderQuote } from "@shared/liquidity-providers/interfaces";
import { LiquidityProviderQuoteDto } from "./liquidity-provider-quote-output.dto";

export class ReceiveQuoteOutputDto {
	constructor(data: { quotes: LiquidityProviderQuoteDto[] }) {
		this.quotes = data.quotes;
	}

	static fromLiquidityProvidersQuotes(quotes: ILiquidityProviderQuote[]): ReceiveQuoteOutputDto {
		return new ReceiveQuoteOutputDto({
			quotes: quotes.map(
				(q) =>
					new LiquidityProviderQuoteDto({
						liquidityProvider: q.liquidityProvider,
						paymentMethod: q.paymentMethod,
						sourceAmount: q.sourceAmount,
						targetAmount: q.targetAmount,
						targetCurrency: q.targetCurrency,
						expiresAt: q.expiresAt,
					}),
			),
		});
	}

	@ApiProperty({
		name: "quotes",
		description:
			"List of quotes from all available liquidity providers matching the request. Sorted by best rate first (highest output amount). ",
		type: [LiquidityProviderQuoteDto],
	})
	@Expose({ name: "quotes" })
	quotes: LiquidityProviderQuoteDto[];
}
