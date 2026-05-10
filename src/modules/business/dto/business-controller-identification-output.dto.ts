import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IdentificationDocumentType } from "@shared/constants";
import { type BusinessControllerDatabaseRow } from "@db/schema/business-controllers-table";
export class BusinessControllerIdentificationOutputDto {
	static fromDatabaseRow(row: BusinessControllerDatabaseRow): BusinessControllerIdentificationOutputDto {
		return new BusinessControllerIdentificationOutputDto({
			countryCode: row.identification_country_code,
			documentType: row.identification_document_type,
		});
	}
	constructor(data: {
		countryCode: string | null;
		documentType: IdentificationDocumentType | null;
	}) {
		this.countryCode = data.countryCode;
		this.documentType = data.documentType;
	}
	@ApiProperty({
		name: "country_code",
		description: "Country code for the identification document.",
		example: "BR",
		nullable: true,
	})
	@Expose({ name: "country_code" })
	countryCode: string | null;
	@ApiProperty({
		name: "document_type",
		description: "Type of identification document.",
		enum: IdentificationDocumentType,
		nullable: true,
	})
	@Expose({ name: "document_type" })
	documentType: IdentificationDocumentType | null;
}
