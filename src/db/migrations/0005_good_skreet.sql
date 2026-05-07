CREATE TABLE `kyc` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`ventairy_kyc_status` text DEFAULT 'PENDING' NOT NULL,
	`kyc_submitted_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `kyc_user_id_unique` ON `kyc` (`user_id`);--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `ventairy_kyc_status`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `kyc_submitted_at`;