import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { type BusinessControllerFileType } from "@shared/constants";

export const businessControllerFilesTable = sqliteTable("business_controller_files", {
	id: text("id").primaryKey(),
	controller_id: text("controller_id").notNull(),
	file_name: text("file_name").notNull(),
	file_size: integer("file_size").notNull(),
	mime_type: text("mime_type").notNull(),
	file_type: text("file_type").notNull().$type<BusinessControllerFileType>(),
	r2_key: text("r2_key").notNull(),
	created_at: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export type BusinessControllerFileRow = typeof businessControllerFilesTable.$inferSelect;
export type NewBusinessControllerFileRow = typeof businessControllerFilesTable.$inferInsert;
