import { Module } from "@nestjs/common";
import { UserLiquidityProvidersService } from "./user-liquidity-providers.service";
import { UserLiquidityProvidersRepository } from "./repositories/user-liquidity-providers.repository";
import { BlindpayLiquidityProvider } from "@shared/liquidity-providers/implementations/blindpay/blindpay-liquidity-provider";

export const AVAILABLE_LIQUIDITY_PROVIDERS_INJECTION_TOKEN = Symbol("LIQUIDITY_PROVIDERS");

@Module({
	providers: [
		UserLiquidityProvidersService,
		UserLiquidityProvidersRepository,
		BlindpayLiquidityProvider,
		{
			provide: AVAILABLE_LIQUIDITY_PROVIDERS_INJECTION_TOKEN,
			useFactory: (blindpayProvider: BlindpayLiquidityProvider) => [blindpayProvider],
			inject: [BlindpayLiquidityProvider],
		},
	],
	exports: [
		UserLiquidityProvidersService,
		UserLiquidityProvidersRepository,
		AVAILABLE_LIQUIDITY_PROVIDERS_INJECTION_TOKEN,
	],
})
export class UserLiquidityProvidersModule {}
