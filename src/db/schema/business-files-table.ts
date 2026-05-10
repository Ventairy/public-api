import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";
import { type BusinessFileType } from "@shared/constants";

export const businessFilesTable = sqliteTable(
	"business_files",
	{
		id: text("id").primaryKey(),
		user_id: text("user_id").notNull(),
		file_name: text("file_name").notNull(),
		file_size: integer("file_size").notNull(),
		mime_type: text("mime_type").notNull(),
		file_type: text("file_type").notNull().$type<BusinessFileType>(),
		r2_key: text("r2_key").notNull(),
		created_at: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
	},
	(table) => [
		uniqueIndex("business_files_user_id_file_type_unique").on(table.user_id, table.file_type),
	],
);

export type BusinessFileRow = typeof businessFilesTable.$inferSelect;
export type NewBusinessFileRow = typeof businessFilesTable.$inferInsert;
