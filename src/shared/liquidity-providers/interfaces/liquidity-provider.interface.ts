import type { LiquidityProviderId } from "@shared/enums/liquidity-provider-id";
import type { PaymentMethod } from "@shared/enums/payment-method";
import type { ILiquidityProviderQuote } from "./liquidity-provider-quote.interface";

export interface ILiquidityProvider {
	readonly liquidityProviderId: LiquidityProviderId;
	readonly supportedPaymentMethods: PaymentMethod[];

	quote(params: {
		liquidityProviderUserId: string;
		amount: string;
		paymentMethod: PaymentMethod;
	}): Promise<ILiquidityProviderQuote>;
}
