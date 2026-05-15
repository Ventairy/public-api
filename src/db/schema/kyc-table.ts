import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { VentairyKycStatus } from "@shared/enums/ventairy-kyc-status";

export const kycTable = sqliteTable("kyc", {
	id: text("id").primaryKey(),
	user_id: text("user_id").notNull().unique(),
	ventairy_kyc_status: text("ventairy_kyc_status").notNull().$type<VentairyKycStatus>().default(VentairyKycStatus.PENDING),
	kyc_submitted_at: text("kyc_submitted_at"),
	created_at: text("created_at")
		.notNull()
		.$defaultFn(() => new Date().toISOString()),
});

export type KycDatabaseRow = typeof kycTable.$inferSelect;
export type NewKycDatabaseRow = typeof kycTable.$inferInsert;
