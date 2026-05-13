import { Injectable } from "@nestjs/common";
import { UserLiquidityProvidersRepository } from "./repositories/user-liquidity-providers.repository";

import { UserLiquidityProviderOutputDto } from "./dto/user-liquidity-provider-output.dto";

@Injectable()
export class UserLiquidityProvidersService {
	constructor(private readonly _userLiquidityProviderRepository: UserLiquidityProvidersRepository) {}

	public async getActiveLiquidityProviders(params: { userId: string }): Promise<UserLiquidityProviderOutputDto[]> {
		const rows = await this._userLiquidityProviderRepository.findActiveProvidersByUserId({
			userId: params.userId,
		});

		return rows.map((row) => UserLiquidityProviderOutputDto.fromDatabaseRow(row));
	}
}
