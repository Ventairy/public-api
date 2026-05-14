import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsEnum } from "class-validator";
import { BusinessFileType } from "@shared/enums";

export class UploadBusinessFileBodyDto {
	@ApiProperty({
		name: "file_type",
		description: "Type category of the business file being uploaded.",
		enum: BusinessFileType,
		example: BusinessFileType.PROOF_OF_ADDRESS,
		required: true,
	})
	@Expose({ name: "file_type" })
	@IsEnum(BusinessFileType)
	fileType!: BusinessFileType;
}
