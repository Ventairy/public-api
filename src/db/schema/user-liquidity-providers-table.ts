import { sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import type { LiquidityProvider } from "@shared/enums/liquidity-provider";
import type { LiquidityProviderStatus } from "@shared/enums/liquidity-provider-status";
import { LiquidityProviderStatus as LiquidityProviderStatusEnum } from "@shared/enums/liquidity-provider-status";

export const userLiquidityProvidersTable = sqliteTable(
	"user_liquidity_providers",
	{
		id: text("id").primaryKey(),
		user_id: text("user_id").notNull(),
		liquidity_provider: text("liquidity_provider").notNull().$type<LiquidityProvider>(),
		status: text("status").notNull().$type<LiquidityProviderStatus>().default(LiquidityProviderStatusEnum.PENDING),
		created_at: text("created_at")
			.notNull()
			.$defaultFn(() => new Date().toISOString()),
		updated_at: text("updated_at")
			.notNull()
			.$defaultFn(() => new Date().toISOString()),
	},
	(table) => [uniqueIndex("user_liquidity_provider_unique").on(table.user_id, table.liquidity_provider)],
);

export type UserLiquidityProviderRow = typeof userLiquidityProvidersTable.$inferSelect;
export type NewUserLiquidityProviderRow = typeof userLiquidityProvidersTable.$inferInsert;
