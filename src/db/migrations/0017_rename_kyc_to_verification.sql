ALTER TABLE `kyc` RENAME TO `verifications`;
ALTER TABLE `verifications` RENAME COLUMN `ventairy_kyc_status` TO `verification_status`;
ALTER TABLE `verifications` RENAME COLUMN `kyc_submitted_at` TO `verification_submitted_at`;
DROP INDEX IF EXISTS `kyc_user_id_unique`;
CREATE UNIQUE INDEX `verifications_user_id_unique` ON `verifications` (`user_id`);
