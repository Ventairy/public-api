CREATE TABLE `signature_nonces` (
	`id` text PRIMARY KEY NOT NULL,
	`nonce` text NOT NULL,
	`wallet_address` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `signature_nonces_nonce_unique` ON `signature_nonces` (`nonce`);