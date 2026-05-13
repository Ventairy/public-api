import { Inject, Injectable } from "@nestjs/common";
import { eq, and } from "drizzle-orm";
import { DRIZZLE_DB, type DrizzleDb } from "@core/database";
import { userLiquidityProvidersTable, type UserLiquidityProviderRow } from "@db/schema/user-liquidity-providers-table";
import { UserLiquidityProviderStatus } from "@shared/enums/user-liquidity-provider-status";

@Injectable()
export class UserLiquidityProvidersRepository {
	constructor(@Inject(DRIZZLE_DB) private readonly _db: DrizzleDb) {}

	async findActiveProvidersByUserId(params: { userId: string }): Promise<UserLiquidityProviderRow[]> {
		return this._db
			.select()
			.from(userLiquidityProvidersTable)
			.where(
				and(
					eq(userLiquidityProvidersTable.user_id, params.userId),
					eq(userLiquidityProvidersTable.status, UserLiquidityProviderStatus.ACTIVE),
				),
			);
	}
}
