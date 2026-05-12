import { Inject, Injectable } from "@nestjs/common";
import { eq, and } from "drizzle-orm";
import { DRIZZLE_DB, type DrizzleDb } from "@core/database";
import { userLiquidityProvidersTable, type UserLiquidityProviderRow } from "@db/schema/user-liquidity-providers-table";
import { LiquidityProviderStatus } from "@shared/constants";

@Injectable()
export class UserLiquidityProviderRepository {
	constructor(@Inject(DRIZZLE_DB) private readonly _db: DrizzleDb) {}

	async findByUserId(params: { userId: string }): Promise<UserLiquidityProviderRow[]> {
		return this._db
			.select()
			.from(userLiquidityProvidersTable)
			.where(eq(userLiquidityProvidersTable.user_id, params.userId));
	}

	async findActiveByUserId(params: { userId: string }): Promise<UserLiquidityProviderRow[]> {
		return this._db
			.select()
			.from(userLiquidityProvidersTable)
			.where(
				and(
					eq(userLiquidityProvidersTable.user_id, params.userId),
					eq(userLiquidityProvidersTable.status, LiquidityProviderStatus.ACTIVE),
				),
			);
	}
}
