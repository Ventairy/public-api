import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { BusinessFileType, BusinessControllerFileType } from "@shared/constants";
import { BusinessControllerOutputDto } from "./business-controller-output.dto";
import { BusinessAddressOutputDto } from "./business-address-output.dto";
import { type BusinessDatabaseRow } from "@db/schema/businesses-table";
import { type BusinessControllerDatabaseRow } from "@db/schema/business-controllers-table";

export class BusinessOutputDto {
	static fromDatabaseRow(
		row: BusinessDatabaseRow,
		controllers: BusinessControllerDatabaseRow[],
		businessFileTypes: BusinessFileType[],
		controllerFileTypes: Map<string, BusinessControllerFileType[]>,
	): BusinessOutputDto {
		return new BusinessOutputDto({
			id: row.id,
			legalName: row.legal_name,
			fantasyName: row.fantasy_name,
			formationDate: row.formation_date,
			email: row.email,
			taxId: row.tax_id,
			phoneNumber: row.phone_number,
			website: row.website,
			address: BusinessAddressOutputDto.fromDatabaseRow(row),
			fileTypesUploaded: businessFileTypes,
			controllers: controllers.map((controller) =>
				BusinessControllerOutputDto.fromDatabaseRow(controller, controllerFileTypes.get(controller.id) ?? []),
			),
			createdAt: row.created_at,
		});
	}
	constructor(data: {
		id: string;
		legalName: string | null;
		fantasyName: string | null;
		formationDate: string | null;
		email: string | null;
		taxId: string | null;
		phoneNumber: string | null;
		website: string | null;
		address: BusinessAddressOutputDto | null;
		fileTypesUploaded: BusinessFileType[];
		controllers: BusinessControllerOutputDto[];
		createdAt: string;
	}) {
		this.id = data.id;
		this.legalName = data.legalName;
		this.fantasyName = data.fantasyName;
		this.formationDate = data.formationDate;
		this.email = data.email;
		this.taxId = data.taxId;
		this.phoneNumber = data.phoneNumber;
		this.website = data.website;
		this.address = data.address;
		this.fileTypesUploaded = data.fileTypesUploaded;
		this.controllers = data.controllers;
		this.createdAt = data.createdAt;
	}
	@ApiProperty({ name: "id", description: "Unique ID of the business record.", format: "uuid" })
	@Expose({ name: "id" })
	id: string;
	@ApiProperty({ name: "legal_name", description: "Legal name of the business.", example: "Acme Corporation Ltd." })
	@Expose({ name: "legal_name" })
	legalName: string | null;
	@ApiProperty({
		name: "fantasy_name",
		description: "Doing-business-as (fantasy) name.",
		example: "Acme",
		nullable: true,
	})
	@Expose({ name: "fantasy_name" })
	fantasyName: string | null;
	@ApiProperty({
		name: "formation_date",
		description: "Date the business was formed (ISO 8601).",
		example: "2020-01-15",
		nullable: true,
	})
	@Expose({ name: "formation_date" })
	formationDate: string | null;
	@ApiProperty({ name: "email", description: "Business email address.", example: "contact@acme.com", nullable: true })
	@Expose({ name: "email" })
	email: string | null;
	@ApiProperty({
		name: "tax_id",
		description: "Business tax identification number.",
		example: "12.345.678/0001-90",
		nullable: true,
	})
	@Expose({ name: "tax_id" })
	taxId: string | null;
	@ApiProperty({
		name: "phone_number",
		description: "Business phone number.",
		example: "+5511999990000",
		nullable: true,
	})
	@Expose({ name: "phone_number" })
	phoneNumber: string | null;
	@ApiProperty({ name: "website", description: "Business website URL.", example: "https://acme.com", nullable: true })
	@Expose({ name: "website" })
	website: string | null;
	@ApiProperty({
		name: "address",
		description: "Business address details.",
		type: BusinessAddressOutputDto,
		nullable: true,
	})
	@Expose({ name: "address" })
	address: BusinessAddressOutputDto | null;
	@ApiProperty({
		name: "file_types_uploaded",
		description: "List of business file types that have been uploaded already.",
		type: [String],
		enum: BusinessFileType,
	})
	@Expose({ name: "file_types_uploaded" })
	fileTypesUploaded: BusinessFileType[];
	@ApiProperty({
		name: "controllers",
		description:
			"List of all registered shareholders or partners who own more than 25% of the company and/or are responsible for the management of the company.",
		type: [BusinessControllerOutputDto],
	})
	@Expose({ name: "controllers" })
	controllers: BusinessControllerOutputDto[];
	@ApiProperty({
		name: "created_at",
		description: "ISO-8601 timestamp when the business record was created.",
		format: "date-time",
	})
	@Expose({ name: "created_at" })
	createdAt: string;
}
