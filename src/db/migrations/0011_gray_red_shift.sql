CREATE TABLE `user_liquidity_providers` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`liquidity_provider` text NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_liquidity_provider_unique` ON `user_liquidity_providers` (`user_id`,`liquidity_provider`);