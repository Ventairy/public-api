import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { VentairyKycStatus } from "@shared/constants";
import { type KycRow } from "@db/schema/kyc-table";

export class KycStatusOutputDto {
	static fromDatabaseRow(row: KycRow): KycStatusOutputDto {
		return {
			userId: row.user_id,
			ventairyKycStatus: row.ventairy_kyc_status,
			submittedAt: row.kyc_submitted_at,
			createdAt: row.created_at,
		};
	}

	@ApiProperty({ name: "user_id", description: "ID of the user.", format: "uuid" })
	@Expose({ name: "user_id" })
	userId!: string;

	@ApiProperty({ name: "ventairy_kyc_status", description: "Current KYC processing status.", enum: VentairyKycStatus })
	@Expose({ name: "ventairy_kyc_status" })
	ventairyKycStatus!: VentairyKycStatus;

	@ApiPropertyOptional({ name: "submitted_at", description: "ISO-8601 timestamp when the KYC was submitted, null if still in draft.", format: "date-time" })
	@Expose({ name: "submitted_at" })
	submittedAt!: string | null;

	@ApiProperty({ name: "created_at", description: "ISO-8601 timestamp when the KYC record was created.", format: "date-time" })
	@Expose({ name: "created_at" })
	createdAt!: string;
}
