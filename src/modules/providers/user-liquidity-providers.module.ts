import { Module } from "@nestjs/common";
import { UserLiquidityProvidersService } from "./user-liquidity-providers.service";
import { UserLiquidityProvidersRepository } from "./repositories/user-liquidity-providers.repository";
import { BlindpayLiquidityProvider } from "@shared/liquidity-providers/implementations/blindpay/blindpay-liquidity-provider";

export const AVAILABLE_LIQUIDITY_PROVIDERS_INJECTION_TOKEN = Symbol("LIQUIDITY_PROVIDERS");

@Module({
	providers: [
		UserLiquidityProvidersService,
		UserLiquidityProvidersRepository,
		{ provide: AVAILABLE_LIQUIDITY_PROVIDERS_INJECTION_TOKEN, useValue: [new BlindpayLiquidityProvider()] },
	],
	exports: [
		UserLiquidityProvidersService,
		UserLiquidityProvidersRepository,
		AVAILABLE_LIQUIDITY_PROVIDERS_INJECTION_TOKEN,
	],
})
export class UserLiquidityProvidersModule {}
