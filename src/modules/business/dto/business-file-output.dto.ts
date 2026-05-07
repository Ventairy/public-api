import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { BusinessFileType } from "@shared/constants";

export class BusinessFileOutputDto {
	@ApiProperty({ name: "id", description: "Unique ID of the file.", format: "uuid" })
	@Expose({ name: "id" })
	id!: string;

	@ApiProperty({ name: "file_name", description: "Original file name.", example: "passport_front.jpg" })
	@Expose({ name: "file_name" })
	fileName!: string;

	@ApiProperty({ name: "file_size", description: "File size in bytes.", example: 2048000 })
	@Expose({ name: "file_size" })
	fileSize!: number;

	@ApiProperty({ name: "mime_type", description: "MIME type of the file.", example: "image/jpeg" })
	@Expose({ name: "mime_type" })
	mimeType!: string;

	@ApiProperty({ name: "file_type", description: "Type category of the business file.", enum: BusinessFileType })
	@Expose({ name: "file_type" })
	fileType!: BusinessFileType;

	@ApiProperty({ name: "created_at", description: "ISO-8601 timestamp when the file was uploaded.", format: "date-time" })
	@Expose({ name: "created_at" })
	createdAt!: string;
}
