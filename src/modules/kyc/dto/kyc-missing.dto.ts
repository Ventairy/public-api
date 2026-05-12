import { ApiProperty } from "@nestjs/swagger";
import { BusinessControllerFileType, BusinessFileType } from "@shared/constants";
import { Expose } from "class-transformer";

export class KycMissingDataDto {
	@ApiProperty({
		name: "fields",
		description:
			"List of data field paths that are missing for KYC submission. Uses dot notation for nested fields (e.g., 'address.country_code'). Fields that has multiple items include the IDs (e.g., 'controllers.abc-123.legal_first_name').",
		type: [String],
		example: ["business.legal_name", "business.address.country_code", "business.controllers.abc-123.legal_first_name"],
	})
	@Expose({ name: "fields" })
	fields!: string[];

	@ApiProperty({
		name: "files",
		description:
			"List of file identifiers that are missing for KYC submission. Uses dot notation for nested fields (e.g., 'business.PROOF_OF_ADDRESS'). Fields that has multiple items include the IDs (e.g., 'controllers.abc-123.PROOF_OF_ADDRESS').",
		type: [String],
		example: [
			`business.${BusinessFileType.PROOF_OF_ADDRESS}`,
			`business.${BusinessFileType.INCORPORATION_DOCUMENT}`,
			`business.controllers.abc-123.${BusinessControllerFileType.IDENTIFICATION_FRONT}`,
		],
	})
	@Expose({ name: "files" })
	files!: string[];

	constructor(data: { fields: string[]; files: string[] }) {
		this.fields = data.fields;
		this.files = data.files;
	}
}
