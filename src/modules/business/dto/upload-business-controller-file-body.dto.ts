import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsEnum } from "class-validator";
import { BusinessControllerFileType } from "@shared/constants";

export class UploadBusinessControllerFileBodyDto {
	@ApiProperty({
		name: "file_type",
		description: "Type category of the controller file being uploaded.",
		enum: BusinessControllerFileType,
		example: BusinessControllerFileType.IDENTIFICATION_FRONT,
		required: true,
	})
	@Expose({ name: "file_type" })
	@IsEnum(BusinessControllerFileType)
	fileType!: BusinessControllerFileType;
}
