import type { LiquidityProviderId } from "@shared/enums/liquidity-provider-id";
import type { PaymentMethod } from "@shared/enums/payment-method";
import type { ILiquidityProviderQuote } from "./liquidity-provider-quote.interface";
import { SupportedBlockchain } from "@shared/blockchain";

export interface ILiquidityProvider {
	readonly liquidityProviderId: LiquidityProviderId;
	readonly supportedPaymentMethods: PaymentMethod[];

	quoteReceive(params: {
		liquidityProviderUserId: string;
		receiverWalletAddress: string;
		chainId: SupportedBlockchain;
		amount: string;
		paymentMethod: PaymentMethod;
	}): Promise<ILiquidityProviderQuote>;
}
