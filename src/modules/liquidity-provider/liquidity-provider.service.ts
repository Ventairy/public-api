import { Injectable } from "@nestjs/common";
import { UserLiquidityProviderRepository } from "./repositories/user-liquidity-provider.repository";
import { LiquidityProvider } from "@shared/constants";

@Injectable()
export class LiquidityProviderService {
	constructor(private readonly _userLiquidityProviderRepository: UserLiquidityProviderRepository) {}

	public async getActiveLiquidityProvidersForUser(params: { userId: string }): Promise<LiquidityProvider[]> {
		const rows = await this._userLiquidityProviderRepository.findActiveByUserId({
			userId: params.userId,
		});

		return rows.map((row) => row.liquidity_provider);
	}
}
