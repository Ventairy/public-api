import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { VerificationStatus } from "@shared/enums/verification-status";

export const verificationTable = sqliteTable("verifications", {
	id: text("id").primaryKey(),
	user_id: text("user_id").notNull().unique(),
	verification_status: text("verification_status").notNull().$type<VerificationStatus>().default(VerificationStatus.PENDING),
	verification_submitted_at: text("verification_submitted_at"),
	created_at: text("created_at")
		.notNull()
		.$defaultFn(() => new Date().toISOString()),
});

export type VerificationDatabaseRow = typeof verificationTable.$inferSelect;
export type NewVerificationDatabaseRow = typeof verificationTable.$inferInsert;