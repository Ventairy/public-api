import { ApiProperty } from "@nestjs/swagger";
import { BusinessControllerFileType, BusinessFileType } from "@shared/constants";
import { Expose } from "class-transformer";

export class KycMissingDataDto {
	@ApiProperty({
		name: "fields",
		description:
			"List of data field paths that are missing for KYC submission. Uses dot notation for nested fields (e.g., 'address.country_code'). Controller fields include the controller ID (e.g., 'controllers.abc-123.legal_first_name'). If no controllers exist, 'controllers' appears alone.",
		type: [String],
		example: ["business.legal_name", "business.address.country_code", "business.controllers.abc-123.legal_first_name"],
	})
	@Expose({ name: "fields" })
	fields!: string[];

	@ApiProperty({
		name: "files",
		description:
			"List of file identifiers that are missing for KYC submission. Business-level files use the enum value (e.g., 'PROOF_OF_ADDRESS'). Controller files include the controller ID (e.g., 'controllers.abc-123.IDENTIFICATION_FRONT').",
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
