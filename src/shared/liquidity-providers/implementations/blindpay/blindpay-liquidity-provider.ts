import { LiquidityProviderId } from "@shared/enums/liquidity-provider-id";
import { PaymentMethod } from "@shared/enums/payment-method";
import type { ILiquidityProvider, ILiquidityProviderQuote } from "../../interfaces";

export class BlindpayLiquidityProvider implements ILiquidityProvider {
	public readonly liquidityProviderId = LiquidityProviderId.BLINDPAY;
	public readonly supportedPaymentMethods: PaymentMethod[] = [PaymentMethod.PIX];

	public async quote(_params: {
		liquidityProviderUserId: string;
		amount: string;
		paymentMethod: PaymentMethod;
	}): Promise<ILiquidityProviderQuote> {
		throw new Error("BlindpayProvider.quote not implemented");
	}
}
