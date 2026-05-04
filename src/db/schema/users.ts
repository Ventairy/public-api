import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { VENTAIRY_KYC_STATUS, type VentairyKycStatus } from "@shared/constants/ventairy-kyc-status";

export const usersTable = sqliteTable("users", {
	id: text("id").primaryKey(),
	wallet_address: text("wallet_address").notNull().unique(),
	ventairy_kyc_status: text("ventairy_kyc_status")
		.notNull()
		.$type<VentairyKycStatus>()
		.default(VENTAIRY_KYC_STATUS.PENDING),
	created_at: text("created_at")
		.notNull()
		.$defaultFn(() => new Date().toISOString()),
	updated_at: text("updated_at")
		.notNull()
		.$defaultFn(() => new Date().toISOString()),
});

export type UserRow = typeof usersTable.$inferSelect;
export type NewUserRow = typeof usersTable.$inferInsert;
