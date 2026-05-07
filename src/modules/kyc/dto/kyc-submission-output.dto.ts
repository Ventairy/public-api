import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { VentairyKycStatus } from "@shared/constants";
import { DatabaseOutputDto } from "@shared/dto";
import { type KycRow } from "@db/schema/kyc-table";

export class KycSubmissionOutputDto extends DatabaseOutputDto {
	static override fromDatabaseRow(row: KycRow): KycSubmissionOutputDto {
		return {
			id: row.id,
			userId: row.user_id,
			ventairyKycStatus: row.ventairy_kyc_status,
			submittedAt: row.kyc_submitted_at,
			createdAt: row.created_at,
		};
	}

	@ApiProperty({
		name: "id",
		description: "Unique ID of the KYC submission.",
		format: "uuid",
		example: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
	})
	@Expose({ name: "id" })
	id!: string;

	@ApiProperty({ name: "user_id", description: "ID of the user this KYC submission belongs to.", format: "uuid" })
	@Expose({ name: "user_id" })
	userId!: string;

	@ApiProperty({
		name: "ventairy_kyc_status",
		description: "Current Ventairy KYC processing status.",
		enum: VentairyKycStatus,
	})
	@Expose({ name: "ventairy_kyc_status" })
	ventairyKycStatus!: VentairyKycStatus;

	@ApiPropertyOptional({
		name: "submitted_at",
		description: "ISO-8601 timestamp when the KYC was submitted, null if still in draft.",
		format: "date-time",
	})
	@Expose({ name: "submitted_at" })
	submittedAt!: string | null;

	@ApiProperty({
		name: "created_at",
		description: "ISO-8601 timestamp when the KYC submission was created.",
		format: "date-time",
	})
	@Expose({ name: "created_at" })
	createdAt!: string;
}
