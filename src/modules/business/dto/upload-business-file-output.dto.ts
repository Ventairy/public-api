import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { BusinessFileType } from "@shared/constants";
import { DatabaseOutputDto } from "@shared/dto";
import { type BusinessFileRow } from "@db/schema/business-files-table";

export class UploadBusinessFileOutputDto extends DatabaseOutputDto {
	static override fromDatabaseRow(row: BusinessFileRow): UploadBusinessFileOutputDto {
		return {
			id: row.id,
			fileName: row.file_name,
			fileSize: row.file_size,
			mimeType: row.mime_type,
			fileType: row.file_type,
			createdAt: row.created_at,
		};
	}

	@ApiProperty({
		name: "id",
		description: "Unique ID of the uploaded file.",
		format: "uuid",
		example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
	})
	@Expose({ name: "id" })
	id!: string;

	@ApiProperty({ name: "file_name", description: "Original file name.", example: "utility_bill.pdf" })
	@Expose({ name: "file_name" })
	fileName!: string;

	@ApiProperty({ name: "file_size", description: "File size in bytes.", example: 1024000 })
	@Expose({ name: "file_size" })
	fileSize!: number;

	@ApiProperty({ name: "mime_type", description: "MIME type of the file.", example: "application/pdf" })
	@Expose({ name: "mime_type" })
	mimeType!: string;

	@ApiProperty({
		name: "file_type",
		description: "Type category of the business file.",
		enum: BusinessFileType,
		example: BusinessFileType.PROOF_OF_ADDRESS,
	})
	@Expose({ name: "file_type" })
	fileType!: BusinessFileType;

	@ApiProperty({
		name: "created_at",
		description: "ISO-8601 timestamp when the file was uploaded.",
		format: "date-time",
		example: "2026-05-04T14:48:00.000Z",
	})
	@Expose({ name: "created_at" })
	createdAt!: string;
}
