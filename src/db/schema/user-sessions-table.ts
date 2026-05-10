import { sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const userSessionsTable = sqliteTable("user_sessions", {
	id: text("id").primaryKey(),
	user_id: text("user_id").notNull(),
	refresh_token_hash: text("refresh_token_hash").notNull(),
	device_info: text("device_info"),
	ip_address: text("ip_address"),
	expires_at: text("expires_at").notNull(),
	created_at: text("created_at")
		.notNull()
		.$defaultFn(() => new Date().toISOString()),
	updated_at: text("updated_at")
		.notNull()
		.$defaultFn(() => new Date().toISOString()),
}, (table) => [
	uniqueIndex("user_sessions_refresh_token_hash_unique").on(table.refresh_token_hash),
]);

export type UserSessionRow = typeof userSessionsTable.$inferSelect;
export type NewUserSessionRow = typeof userSessionsTable.$inferInsert;
