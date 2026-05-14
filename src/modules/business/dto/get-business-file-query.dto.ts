import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsEnum } from "class-validator";
import { BusinessFileType } from "@shared/enums";

export class GetBusinessFileQueryDto {
	@ApiProperty({
		name: "file_type",
		description: "Type of business file to retrieve.",
		enum: BusinessFileType,
		required: true,
	})
	@Expose({ name: "file_type" })
	@IsEnum(BusinessFileType)
	fileType!: BusinessFileType;
}
