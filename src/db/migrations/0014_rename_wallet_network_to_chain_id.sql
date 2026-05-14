ALTER TABLE `users` ADD COLUMN `chain_id` integer;
--> statement-breakpoint
UPDATE `users` SET `chain_id` = CAST(COALESCE(`wallet_network`, '8453') AS integer);
--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `wallet_network`;
