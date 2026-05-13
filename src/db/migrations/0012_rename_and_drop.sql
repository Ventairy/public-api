ALTER TABLE `user_liquidity_providers` RENAME COLUMN `liquidity_provider` TO `liquidity_provider_id`;
--> statement-breakpoint
ALTER TABLE `user_liquidity_providers` DROP COLUMN `updated_at`;
