import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { VentairyKycStatus } from "@shared/enums";
import { type KycDatabaseRow } from "@db/schema/kyc-table";
import { KycMissingDataDto } from "./kyc-missing.dto";
export class KycStatusOutputDto {
	static fromDatabaseRow(row: KycDatabaseRow, canSubmitKyc: boolean, missing: KycMissingDataDto): KycStatusOutputDto {
		return new KycStatusOutputDto({
			userId: row.user_id,
			ventairyKycStatus: row.ventairy_kyc_status,
			submittedAt: row.kyc_submitted_at,
			canSubmitKyc,
			missing,
		});
	}
	constructor(data: { userId: string; ventairyKycStatus: VentairyKycStatus; submittedAt: string | null; canSubmitKyc: boolean; missing: KycMissingDataDto }) {
		this.userId = data.userId;
		this.ventairyKycStatus = data.ventairyKycStatus;
		this.submittedAt = data.submittedAt;
		this.canSubmitKyc = data.canSubmitKyc;
		this.missing = data.missing;
	}
	@ApiProperty({ name: "user_id", description: "ID of the user.", format: "uuid" })
	@Expose({ name: "user_id" })
	userId: string;

	@ApiProperty({ name: "ventairy_kyc_status", description: "Current KYC processing status.", enum: VentairyKycStatus })
	@Expose({ name: "ventairy_kyc_status" })
	ventairyKycStatus: VentairyKycStatus;

	@ApiProperty({
		name: "can_submit_kyc",
		description: "Whether the user can submit their KYC. True only when all required fields and files are provided AND the KYC status is PENDING.",
	})
	@Expose({ name: "can_submit_kyc" })
	canSubmitKyc: boolean;

	@ApiPropertyOptional({
		name: "submitted_at",
		description: "ISO-8601 timestamp when the KYC was submitted, null if still in draft.",
		format: "date-time",
	})
	@Expose({ name: "submitted_at" })
	submittedAt: string | null;

	@ApiProperty({
		name: "missing",
		description:
			"The data fields and files that are missing for KYC submission. Fields are prefixed with the object related (e.g., ``business.``, ``business.controllers.<controller_id>.``) to indicate the context. When empty, all data requirements are met.",
		type: KycMissingDataDto,
	})
	@Expose({ name: "missing" })
	missing: KycMissingDataDto;
}
