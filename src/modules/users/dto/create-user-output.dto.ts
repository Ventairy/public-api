import { ApiProperty } from "@nestjs/swagger";
import { VENTAIRY_KYC_STATUS, type VentairyKycStatus } from "@shared/constants/ventairy-kyc-status";

export class CreateUserOutputDto {
	@ApiProperty({
		description: "Ventairy-issued unique identifier for the user. UUID v4 generated server-side.",
		format: "uuid",
		example: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
	})
	id!: string;

	@ApiProperty({
		description:
			"Lowercased EVM wallet address associated with the user account. Used as the receiving wallet for stablecoin settlements.",
		example: "0x742d35cc6634c0532925a3b844bc9e7595f0beb1",
	})
	wallet_address!: string;

	@ApiProperty({
		description:
			"Current Ventairy KYC review status. PENDING = not submitted, VERIFYING = under review, APPROVED = cleared, REJECTED = denied. New users always start as PENDING.",
		enum: Object.values(VENTAIRY_KYC_STATUS),
		example: VENTAIRY_KYC_STATUS.PENDING,
	})
	ventairy_kyc_status!: VentairyKycStatus;

	@ApiProperty({
		description: "ISO-8601 timestamp marking when the user was created.",
		format: "date-time",
		example: "2026-05-04T14:48:00.000Z",
	})
	created_at!: string;

	@ApiProperty({
		description: "ISO-8601 timestamp of the most recent mutation to the user record. Equal to created_at on creation.",
		format: "date-time",
		example: "2026-05-04T14:48:00.000Z",
	})
	updated_at!: string;
}
