PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_business_controllers` (
	`id` text PRIMARY KEY NOT NULL,
	`business_id` text NOT NULL,
	`role` text,
	`ownership_percentage` real,
	`title` text,
	`legal_first_name` text,
	`legal_last_name` text,
	`date_of_birth` text,
	`tax_id` text,
	`identification_country_code` text,
	`identification_document_type` text,
	`identification_front_file_id` text,
	`identification_back_file_id` text,
	`address_country_code` text,
	`address_street` text,
	`address_city` text,
	`address_state` text,
	`address_postal_code` text,
	`address_proof_type` text,
	`address_proof_file_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_business_controllers`("id", "business_id", "role", "ownership_percentage", "title", "legal_first_name", "legal_last_name", "date_of_birth", "tax_id", "identification_country_code", "identification_document_type", "identification_front_file_id", "identification_back_file_id", "address_country_code", "address_street", "address_city", "address_state", "address_postal_code", "address_proof_type", "address_proof_file_id", "created_at", "updated_at") SELECT "id", "business_id", "role", "ownership_percentage", "title", "legal_first_name", "legal_last_name", "date_of_birth", "tax_id", "identification_country_code", "identification_document_type", "identification_front_file_id", "identification_back_file_id", "address_country_code", "address_street", "address_city", "address_state", "address_postal_code", "address_proof_type", "address_proof_file_id", "created_at", "updated_at" FROM `business_controllers`;--> statement-breakpoint
DROP TABLE `business_controllers`;--> statement-breakpoint
ALTER TABLE `__new_business_controllers` RENAME TO `business_controllers`;--> statement-breakpoint
PRAGMA foreign_keys=ON;