import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { BusinessFileType } from "@shared/constants";

export class UploadBusinessFileBodyDto {
	@ApiProperty({
		name: "file_type",
		description: "Type category of the business file being uploaded.",
		enum: BusinessFileType,
		example: BusinessFileType.PROOF_OF_ADDRESS,
		required: true,
	})
	@IsEnum(BusinessFileType)
	fileType!: BusinessFileType;
}
