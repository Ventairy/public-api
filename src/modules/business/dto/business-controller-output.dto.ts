import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { BusinessControllerFileType, ControllerRole } from "@shared/constants";
import { DatabaseOutputDto } from "@shared/dto";
import { type BusinessControllerDatabaseRow } from "@db/schema/business-controllers-table";

import { BusinessControllerIdentificationOutputDto } from "./business-controller-identification-output.dto";
import { BusinessControllerAddressOutputDto } from "./business-controller-address-output.dto";

export class BusinessControllerOutputDto extends DatabaseOutputDto {
	static override fromDatabaseRow(
		row: BusinessControllerDatabaseRow,
		fileTypesUploaded: BusinessControllerFileType[],
	): BusinessControllerOutputDto {
		return {
			id: row.id,
			role: row.role,
			ownershipPercentage: row.ownership_percentage,
			title: row.title,
			legalFirstName: row.legal_first_name,
			legalLastName: row.legal_last_name,
			dateOfBirth: row.date_of_birth,
			taxId: row.tax_id,
			identification: BusinessControllerIdentificationOutputDto.fromDatabaseRow(row),
			address: BusinessControllerAddressOutputDto.fromDatabaseRow(row),
			fileTypesUploaded: fileTypesUploaded,
			createdAt: row.created_at,
		};
	}
	@ApiProperty({ name: "id", description: "Unique ID of the controller record.", format: "uuid" })
	@Expose({ name: "id" })
	id!: string;

	@ApiProperty({ name: "role", description: "Role of the controller.", enum: ControllerRole, nullable: true })
	@Expose({ name: "role" })
	role!: ControllerRole | null;

	@ApiProperty({
		name: "ownership_percentage",
		description: "Ownership percentage (0-100).",
		example: 35.5,
		nullable: true,
	})
	@Expose({ name: "ownership_percentage" })
	ownershipPercentage!: number | null;

	@ApiProperty({ name: "title", description: "Title or position within the business.", example: "CEO", nullable: true })
	@Expose({ name: "title" })
	title!: string | null;

	@ApiProperty({ name: "legal_first_name", description: "Legal first name.", example: "Joao", nullable: true })
	@Expose({ name: "legal_first_name" })
	legalFirstName!: string | null;

	@ApiProperty({ name: "legal_last_name", description: "Legal last name.", example: "Silva", nullable: true })
	@Expose({ name: "legal_last_name" })
	legalLastName!: string | null;

	@ApiProperty({
		name: "date_of_birth",
		description: "Date of birth (ISO 8601).",
		example: "1985-03-20",
		nullable: true,
	})
	@Expose({ name: "date_of_birth" })
	dateOfBirth!: string | null;

	@ApiProperty({ name: "tax_id", description: "Tax identification number.", example: "123.456.789-00", nullable: true })
	@Expose({ name: "tax_id" })
	taxId!: string | null;

	@ApiProperty({
		name: "identification",
		description: "Identification document details.",
		type: BusinessControllerIdentificationOutputDto,
		nullable: true,
	})
	@Expose({ name: "identification" })
	identification!: BusinessControllerIdentificationOutputDto;

	@ApiProperty({
		name: "address",
		description: "Personal address details.",
		type: BusinessControllerAddressOutputDto,
		nullable: true,
	})
	@Expose({ name: "address" })
	address!: BusinessControllerAddressOutputDto;

	@ApiProperty({
		name: "file_types_uploaded",
		description: "List of controller file types that have been uploaded.",
		type: [String],
		enum: BusinessControllerFileType,
	})
	@Expose({ name: "file_types_uploaded" })
	fileTypesUploaded!: BusinessControllerFileType[];

	@ApiProperty({
		name: "created_at",
		description: "ISO-8601 timestamp when the controller was created.",
		format: "date-time",
	})
	@Expose({ name: "created_at" })
	createdAt!: string;

}
