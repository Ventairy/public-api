import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { LiquidityProviderId, PaymentMethod } from "@shared/enums";

export class LiquidityProviderQuoteDto {
	constructor(data: {
		liquidityProvider: LiquidityProviderId;
		paymentMethod: PaymentMethod;
		sourceAmount: string;
		targetAmount: string;
		targetCurrency: string;
		expiresAt: string;
	}) {
		this.liquidityProviderId = data.liquidityProvider;
		this.paymentMethod = data.paymentMethod;
		this.sourceAmount = data.sourceAmount;
		this.targetAmount = data.targetAmount;
		this.targetCurrency = data.targetCurrency;
		this.expiresAt = data.expiresAt;
	}

	@ApiProperty({
		name: "liquidity_provider_id",
		description: "The liquidity provider offering this quote",
		enum: LiquidityProviderId,
		example: LiquidityProviderId.BLINDPAY,
	})
	@Expose({ name: "liquidity_provider_id" })
	liquidityProviderId: LiquidityProviderId;

	@ApiProperty({
		name: "payment_method",
		description:
			"The domestic payment method this quote is for. Determines the source currency and settlement rails used by the provider.",
		enum: PaymentMethod,
		example: PaymentMethod.PIX,
	})
	@Expose({ name: "payment_method" })
	paymentMethod: PaymentMethod;

	@ApiProperty({
		name: "source_amount",
		description: "The amount in the source fiat currency the payer needs to send",
		example: "100.00",
	})
	@Expose({ name: "source_amount" })
	sourceAmount: string;

	@ApiProperty({
		name: "target_amount",
		description: "The exact amount of stablecoin that will be sent to the wallet.",
		example: "18.50",
	})
	@Expose({ name: "target_amount" })
	targetAmount: string;

	@ApiProperty({
		name: "target_currency",
		description: "The currency code for the target stablecoin",
		example: "USDC",
	})
	@Expose({ name: "target_currency" })
	targetCurrency: string;

	@ApiProperty({
		name: "expires_at",
		description:
			"ISO-8601 timestamp indicating when this quote expires and can no longer be executed. Quotes are time-sensitive because exchange rates fluctuate in real-time. After this timestamp, the user must request a new quote.",
		format: "date-time",
		example: "2026-05-12T18:00:00.000Z",
	})
	@Expose({ name: "expires_at" })
	expiresAt: string;
}
