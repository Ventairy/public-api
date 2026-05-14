import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { BusinessFileType } from "@shared/enums";
import { type BusinessFileRow } from "@db/schema/business-files-table";
export class BusinessFileOutputDto {
	static fromDatabaseRow(row: BusinessFileRow): BusinessFileOutputDto {
		return new BusinessFileOutputDto({
			id: row.id,
			fileName: row.file_name,
			fileSize: row.file_size,
			mimeType: row.mime_type,
			fileType: row.file_type,
			createdAt: row.created_at,
		});
	}
	constructor(data: {
		id: string;
		fileName: string;
		fileSize: number;
		mimeType: string;
		fileType: BusinessFileType;
		createdAt: string;
	}) {
		this.id = data.id;
		this.fileName = data.fileName;
		this.fileSize = data.fileSize;
		this.mimeType = data.mimeType;
		this.fileType = data.fileType;
		this.createdAt = data.createdAt;
	}
	@ApiProperty({ name: "id", description: "Unique ID of the file.", format: "uuid" })
	@Expose({ name: "id" })
	id: string;
	@ApiProperty({ name: "file_name", description: "Original file name.", example: "passport_front.jpg" })
	@Expose({ name: "file_name" })
	fileName: string;
	@ApiProperty({ name: "file_size", description: "File size in bytes.", example: 2048000 })
	@Expose({ name: "file_size" })
	fileSize: number;
	@ApiProperty({ name: "mime_type", description: "MIME type of the file.", example: "image/jpeg" })
	@Expose({ name: "mime_type" })
	mimeType: string;
	@ApiProperty({ name: "file_type", description: "Type category of the business file.", enum: BusinessFileType })
	@Expose({ name: "file_type" })
	fileType: BusinessFileType;
	@ApiProperty({ name: "created_at", description: "ISO-8601 timestamp when the file was uploaded.", format: "date-time" })
	@Expose({ name: "created_at" })
	createdAt: string;
}
