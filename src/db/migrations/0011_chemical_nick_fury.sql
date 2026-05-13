CREATE TABLE `user_liquidity_providers` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`liquidity_provider_id` text NOT NULL,
	`liquidity_provider_user_id` text,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_liquidity_provider_unique` ON `user_liquidity_providers` (`user_id`,`liquidity_provider_id`);