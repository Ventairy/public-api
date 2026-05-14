import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import type { SupportedBlockchain } from "@shared/blockchain";
import type { UserType } from "@shared/enums/user-type";

export const usersTable = sqliteTable("users", {
	id: text("id").primaryKey(),
	wallet_address: text("wallet_address").notNull().unique(),
	chain_id: integer("chain_id").notNull().$type<SupportedBlockchain>(),
	user_type: text("user_type").notNull().$type<UserType>(),
	created_at: text("created_at")
		.notNull()
		.$defaultFn(() => new Date().toISOString()),
});

export type UserRow = typeof usersTable.$inferSelect;
export type NewUserRow = typeof usersTable.$inferInsert;
