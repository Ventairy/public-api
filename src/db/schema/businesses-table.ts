import { ProofAddressType } from "@shared/constants";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const businessesTable = sqliteTable("businesses", {
	id: text("id").primaryKey(),
	user_id: text("user_id").notNull().unique(),
	legal_name: text("legal_name"),
	fantasy_name: text("fantasy_name"),
	formation_date: text("formation_date"),
	email: text("email"),
	tax_id: text("tax_id"),
	phone_number: text("phone_number"),
	website: text("website"),
	country_code: text("country_code"),
	street: text("street"),
	city: text("city"),
	state: text("state"),
	postal_code: text("postal_code"),
	address_proof_type: text("address_proof_type").$type<ProofAddressType>(),
	created_at: text("created_at")
		.notNull()
		.$defaultFn(() => new Date().toISOString()),
});

export type BusinessDatabaseRow = typeof businessesTable.$inferSelect;
export type NewBusinessDatabaseRow = typeof businessesTable.$inferInsert;
