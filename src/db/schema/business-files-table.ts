import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { type BusinessFileType } from "@shared/constants";

export const businessFilesTable = sqliteTable("business_files", {
	id: text("id").primaryKey(),
	user_id: text("user_id").notNull(),
	file_name: text("file_name").notNull(),
	file_size: integer("file_size").notNull(),
	mime_type: text("mime_type").notNull(),
	file_type: text("file_type").notNull().$type<BusinessFileType>(),
	r2_key: text("r2_key").notNull(),
	created_at: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export type BusinessFileRow = typeof businessFilesTable.$inferSelect;
export type NewBusinessFileRow = typeof businessFilesTable.$inferInsert;
