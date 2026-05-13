import type { LiquidityProviderId } from "@shared/enums/liquidity-provider-id";
import type { PaymentMethod } from "@shared/enums/payment-method";

export interface ILiquidityProviderQuote {
	liquidityProvider: LiquidityProviderId;
	paymentMethod: PaymentMethod;
	sourceAmount: string;
	targetAmount: string;
	targetCurrency: string;
	expiresAt: string;
}
