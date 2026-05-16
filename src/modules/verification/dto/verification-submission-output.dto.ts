import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { VerificationStatus } from "@shared/enums";
import { type VerificationDatabaseRow } from "@db/schema/verifications-table";

export class VerificationSubmissionOutputDto {
	static fromDatabaseRow(row: VerificationDatabaseRow): VerificationSubmissionOutputDto {
		return new VerificationSubmissionOutputDto({
			id: row.id,
			userId: row.user_id,
			verificationStatus: row.verification_status,
			submittedAt: row.verification_submitted_at,
			createdAt: row.created_at,
		});
	}
	constructor(data: { id: string; userId: string; verificationStatus: VerificationStatus; submittedAt: string | null; createdAt: string }) {
		this.id = data.id;
		this.userId = data.userId;
		this.verificationStatus = data.verificationStatus;
		this.submittedAt = data.submittedAt;
		this.createdAt = data.createdAt;
	}
	@ApiProperty({
		name: "id",
		description: "Unique ID of the verification submission.",
		format: "uuid",
		example: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
	})
	@Expose({ name: "id" })
	id: string;
	@ApiProperty({ name: "user_id", description: "ID of the user this verification submission belongs to.", format: "uuid" })
	@Expose({ name: "user_id" })
	userId: string;

	@ApiProperty({
		name: "verification_status",
		description: "Current Ventairy Verification processing status.",
		enum: VerificationStatus,
	})
	@Expose({ name: "verification_status" })
	verificationStatus: VerificationStatus;

	@ApiPropertyOptional({
		name: "submitted_at",
		description: "ISO-8601 timestamp when the verification was submitted, null if still in draft.",
		format: "date-time",
	})
	@Expose({ name: "submitted_at" })
	submittedAt: string | null;

	@ApiProperty({
		name: "created_at",
		description: "ISO-8601 timestamp when the verification submission was created.",
		format: "date-time",
	})
	@Expose({ name: "created_at" })
	createdAt: string;
}
