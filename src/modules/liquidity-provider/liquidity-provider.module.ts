import { Module } from "@nestjs/common";
import { LiquidityProviderService } from "./liquidity-provider.service";
import { UserLiquidityProviderRepository } from "./repositories/user-liquidity-provider.repository";

@Module({
	providers: [LiquidityProviderService, UserLiquidityProviderRepository],
	exports: [LiquidityProviderService, UserLiquidityProviderRepository],
})
export class LiquidityProviderModule {}
