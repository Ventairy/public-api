ALTER TABLE `businesses` RENAME COLUMN "proof_address_type" TO "address_proof_type";--> statement-breakpoint
CREATE TABLE `business_controller_files` (
	`id` text PRIMARY KEY NOT NULL,
	`controller_id` text NOT NULL,
	`file_name` text NOT NULL,
	`file_size` integer NOT NULL,
	`mime_type` text NOT NULL,
	`file_type` text NOT NULL,
	`r2_key` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `businesses` DROP COLUMN `proof_address_file_id`;--> statement-breakpoint
ALTER TABLE `businesses` DROP COLUMN `incorporation_document_file_id`;--> statement-breakpoint
ALTER TABLE `businesses` DROP COLUMN `proof_ownership_file_id`;--> statement-breakpoint
ALTER TABLE `businesses` DROP COLUMN `updated_at`;--> statement-breakpoint
ALTER TABLE `business_controllers` DROP COLUMN `identification_front_file_id`;--> statement-breakpoint
ALTER TABLE `business_controllers` DROP COLUMN `identification_back_file_id`;--> statement-breakpoint
ALTER TABLE `business_controllers` DROP COLUMN `address_proof_file_id`;--> statement-breakpoint
ALTER TABLE `business_controllers` DROP COLUMN `updated_at`;--> statement-breakpoint
ALTER TABLE `kyc` DROP COLUMN `updated_at`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `business_id`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `updated_at`;