import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { VerificationStatus } from "@shared/enums";
import { type VerificationDatabaseRow } from "@db/schema/verifications-table";
import { VerificationMissingDataDto } from "./verification-missing.dto";

export class VerificationStatusOutputDto {
	static fromDatabaseRow(row: VerificationDatabaseRow, canSubmit: boolean, missing: VerificationMissingDataDto): VerificationStatusOutputDto {
		return new VerificationStatusOutputDto({
			userId: row.user_id,
			verificationStatus: row.verification_status,
			submittedAt: row.verification_submitted_at,
			canSubmit,
			missing,
		});
	}
	constructor(data: { userId: string; verificationStatus: VerificationStatus; submittedAt: string | null; canSubmit: boolean; missing: VerificationMissingDataDto }) {
		this.userId = data.userId;
		this.verificationStatus = data.verificationStatus;
		this.submittedAt = data.submittedAt;
		this.canSubmit = data.canSubmit;
		this.missing = data.missing;
	}
	@ApiProperty({ name: "user_id", description: "ID of the user.", format: "uuid" })
	@Expose({ name: "user_id" })
	userId: string;

	@ApiProperty({ name: "verification_status", description: "Current Verification processing status.", enum: VerificationStatus })
	@Expose({ name: "verification_status" })
	verificationStatus: VerificationStatus;

	@ApiProperty({
		name: "can_submit",
		description: "Whether the user can submit their verification. True only when all required fields and files are provided AND the verification status is PENDING.",
	})
	@Expose({ name: "can_submit" })
	canSubmit: boolean;

	@ApiPropertyOptional({
		name: "submitted_at",
		description: "ISO-8601 timestamp when the verification was submitted, null if still in draft.",
		format: "date-time",
	})
	@Expose({ name: "submitted_at" })
	submittedAt: string | null;

	@ApiProperty({
		name: "missing",
		description:
			"The data fields and files that are missing for verification submission. Fields are prefixed with the object related (e.g., ``business.``, ``business.controllers.<controller_id>.``) to indicate the context. When empty, all data requirements are met.",
		type: VerificationMissingDataDto,
	})
	@Expose({ name: "missing" })
	missing: VerificationMissingDataDto;
}
