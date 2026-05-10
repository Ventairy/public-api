CREATE TABLE `business_controllers` (
	`id` text PRIMARY KEY NOT NULL,
	`business_id` text NOT NULL,
	`role` text NOT NULL,
	`ownership_percentage` real NOT NULL,
	`title` text NOT NULL,
	`legal_first_name` text NOT NULL,
	`legal_last_name` text NOT NULL,
	`date_of_birth` text NOT NULL,
	`tax_id` text NOT NULL,
	`identification_country_code` text NOT NULL,
	`identification_document_type` text NOT NULL,
	`identification_front_file_id` text,
	`identification_back_file_id` text,
	`address_country_code` text NOT NULL,
	`address_street` text NOT NULL,
	`address_city` text NOT NULL,
	`address_state` text NOT NULL,
	`address_postal_code` text NOT NULL,
	`address_proof_type` text,
	`address_proof_file_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `business_files` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`file_name` text NOT NULL,
	`file_size` integer NOT NULL,
	`mime_type` text NOT NULL,
	`file_type` text NOT NULL,
	`r2_key` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `businesses` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`legal_name` text,
	`fantasy_name` text,
	`formation_date` text,
	`email` text,
	`tax_id` text,
	`phone_number` text,
	`website` text,
	`country_code` text,
	`street` text,
	`city` text,
	`state` text,
	`postal_code` text,
	`proof_address_type` text,
	`proof_address_file_id` text,
	`incorporation_document_file_id` text,
	`proof_ownership_file_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `businesses_user_id_unique` ON `businesses` (`user_id`);--> statement-breakpoint
ALTER TABLE `users` ADD `business_id` text;--> statement-breakpoint
ALTER TABLE `users` ADD `kyc_submitted_at` text;