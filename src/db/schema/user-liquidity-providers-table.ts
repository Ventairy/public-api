import { sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import type { LiquidityProviderId } from "@shared/enums/liquidity-provider-id";
import type { UserLiquidityProviderStatus } from "@shared/enums/user-liquidity-provider-status";
import { UserLiquidityProviderStatus as LiquidityProviderStatusEnum } from "@shared/enums/user-liquidity-provider-status";

export const userLiquidityProvidersTable = sqliteTable(
	"user_liquidity_providers",
	{
		id: text("id").primaryKey(),
		user_id: text("user_id").notNull(),
		liquidity_provider_id: text("liquidity_provider_id").notNull().$type<LiquidityProviderId>(),
		liquidity_provider_user_id: text("liquidity_provider_user_id"),
		status: text("status").notNull().$type<UserLiquidityProviderStatus>().default(LiquidityProviderStatusEnum.PENDING),
		created_at: text("created_at")
			.notNull()
			.$defaultFn(() => new Date().toISOString()),
	},
	(table) => [uniqueIndex("user_liquidity_provider_unique").on(table.user_id, table.liquidity_provider_id)],
);

export type UserLiquidityProviderRow = typeof userLiquidityProvidersTable.$inferSelect;
export type NewUserLiquidityProviderRow = typeof userLiquidityProvidersTable.$inferInsert;
