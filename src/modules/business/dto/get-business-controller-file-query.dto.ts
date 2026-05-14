import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsEnum } from "class-validator";
import { BusinessControllerFileType } from "@shared/enums";

export class GetBusinessControllerFileQueryDto {
	@ApiProperty({
		name: "file_type",
		description: "Type of business controller file to retrieve.",
		enum: BusinessControllerFileType,
		required: true,
	})
	@Expose({ name: "file_type" })
	@IsEnum(BusinessControllerFileType)
	fileType!: BusinessControllerFileType;
}
