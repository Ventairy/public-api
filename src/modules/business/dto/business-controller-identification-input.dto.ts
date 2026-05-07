import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsEnum, IsISO31661Alpha2, IsOptional, IsString } from "class-validator";
import { IdentificationDocumentType } from "@shared/constants";

export class BusinessControllerIdentificationInputDto {
	@ApiProperty({
		name: "country_code",
		description: "Country code for the identification document (ISO 3166-1 alpha-2).",
		example: "BR",
		required: false,
	})
	@Expose({ name: "country_code" })
	@IsOptional()
	@IsString()
	@IsISO31661Alpha2()
	countryCode?: string;

	@ApiProperty({
		name: "document_type",
		description: "Type of identification document.",
		enum: IdentificationDocumentType,
		required: false,
	})
	@Expose({ name: "document_type" })
	@IsOptional()
	@IsEnum(IdentificationDocumentType)
	documentType?: IdentificationDocumentType;
}
