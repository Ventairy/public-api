import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsEnum, IsISO31661Alpha2, IsOptional, IsString } from "class-validator";
import { IdentificationDocumentType, UserType } from "@shared/enums";
import { RequiredForKYC } from "@shared/decorators/required-for-kyc.decorator";
import { Immutable } from "@shared/decorators/immutable.decorator";
import { type BusinessControllerDatabaseRow } from "@db/schema/business-controllers-table";

export class BusinessControllerIdentificationInputDto {
	static fromDatabaseRow(row: BusinessControllerDatabaseRow): BusinessControllerIdentificationInputDto {
		return new BusinessControllerIdentificationInputDto({
			countryCode: row.identification_country_code,
			documentType: row.identification_document_type,
		});
	}

	constructor(params?: {
		countryCode: string | null;
		documentType: IdentificationDocumentType | null;
	}) {
		this.countryCode = params?.countryCode ?? null;
		this.documentType = params?.documentType ?? null;
	}

	@ApiProperty({
		name: "country_code",
		description: "Country code for the identification document (ISO 3166-1 alpha-2).",
		example: "BR",
		required: false,
	})
	@Expose({ name: "country_code" })
	@Immutable()
	@RequiredForKYC([UserType.BUSINESS])
	@IsOptional()
	@IsString()
	@IsISO31661Alpha2()
	countryCode: string | null;

	@ApiProperty({
		name: "document_type",
		description: "Type of identification document.",
		enum: IdentificationDocumentType,
		required: false,
	})
	@Expose({ name: "document_type" })
	@Immutable()
	@RequiredForKYC([UserType.BUSINESS])
	@IsOptional()
	@IsEnum(IdentificationDocumentType)
	documentType: IdentificationDocumentType | null;
}
