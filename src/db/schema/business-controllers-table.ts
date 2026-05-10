import { sqliteTable, text, real } from "drizzle-orm/sqlite-core";
import { type BusinessControllerRole } from "@shared/enums/business-controller-role";
import { type PersonalIdentificationDocumentType } from "@shared/enums/personal-identification-document-type";
import { ProofAddressType } from "@shared/constants";

export const businessControllersTable = sqliteTable("business_controllers", {
	id: text("id").primaryKey(),
	business_id: text("business_id").notNull(),
	role: text("role").$type<BusinessControllerRole | null>(),
	ownership_percentage: real("ownership_percentage").$type<number | null>(),
	title: text("title").$type<string | null>(),
	legal_first_name: text("legal_first_name").$type<string | null>(),
	legal_last_name: text("legal_last_name").$type<string | null>(),
	date_of_birth: text("date_of_birth").$type<string | null>(),
	tax_id: text("tax_id").$type<string | null>(),
	identification_country_code: text("identification_country_code").$type<string | null>(),
	identification_document_type: text("identification_document_type").$type<PersonalIdentificationDocumentType | null>(),
	address_country_code: text("address_country_code").$type<string | null>(),
	address_street: text("address_street").$type<string | null>(),
	address_city: text("address_city").$type<string | null>(),
	address_state: text("address_state").$type<string | null>(),
	address_postal_code: text("address_postal_code").$type<string | null>(),
	address_proof_type: text("address_proof_type").$type<ProofAddressType | null>(),
	created_at: text("created_at")
		.notNull()
		.$defaultFn(() => new Date().toISOString()),
});

export type BusinessControllerDatabaseRow = typeof businessControllersTable.$inferSelect;
export type NewBusinessControllerDatabaseRow = typeof businessControllersTable.$inferInsert;
