import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { IsArray, IsEmail, IsOptional, IsString, ValidateNested } from "class-validator";
import { UserType } from "@shared/enums";
import { RequiredForVerification } from "@shared/decorators/required-for-verification.decorator";
import { Immutable } from "@shared/decorators/immutable.decorator";
import { BusinessAddressInputDto } from "./business-address-input.dto";
import { BusinessControllerInputDto } from "./business-controller-input.dto";
import { type BusinessDatabaseRow } from "@db/schema/businesses-table";
import { type BusinessControllerDatabaseRow } from "@db/schema/business-controllers-table";

export class BusinessInputDto {
	static fromDatabaseRow(row: BusinessDatabaseRow, controllers: BusinessControllerDatabaseRow[]): BusinessInputDto {
		return new BusinessInputDto({
			legalName: row.legal_name,
			fantasyName: row.fantasy_name,
			formationDate: row.formation_date,
			email: row.email,
			taxId: row.tax_id,
			phoneNumber: row.phone_number,
			website: row.website,
			address: BusinessAddressInputDto.fromDatabaseRow(row),
			controllers: controllers.map((controller) => BusinessControllerInputDto.fromDatabaseRow(controller)),
		});
	}

	constructor(params?: {
		legalName: string | null;
		fantasyName: string | null;
		formationDate: string | null;
		email: string | null;
		taxId: string | null;
		phoneNumber: string | null;
		website: string | null;
		address: BusinessAddressInputDto | null;
		controllers: BusinessControllerInputDto[] | null;
	}) {
		this.legalName = params?.legalName ?? null;
		this.fantasyName = params?.fantasyName ?? null;
		this.formationDate = params?.formationDate ?? null;
		this.email = params?.email ?? null;
		this.taxId = params?.taxId ?? null;
		this.phoneNumber = params?.phoneNumber ?? null;
		this.website = params?.website ?? null;
		this.address = params?.address ?? null;
		this.controllers = params?.controllers ?? null;
	}

	@ApiProperty({
		name: "legal_name",
		description: "Legal name of the business.",
		example: "Acme Corporation Ltd.",
		required: false,
	})
	@Expose({ name: "legal_name" })
	@Immutable()
	@RequiredForVerification([UserType.BUSINESS])
	@IsOptional()
	@IsString()
	legalName: string | null;

	@ApiProperty({
		name: "fantasy_name",
		description: "Doing-business-as (fantasy) name. Optional.",
		example: "Acme",
		required: false,
	})
	@Expose({ name: "fantasy_name" })
	@Immutable()
	@IsOptional()
	@IsString()
	fantasyName: string | null;

	@ApiProperty({
		name: "formation_date",
		description: "Date the business was formed (ISO 8601).",
		example: "2020-01-15",
		required: false,
	})
	@Expose({ name: "formation_date" })
	@Immutable()
	@RequiredForVerification([UserType.BUSINESS])
	@IsOptional()
	@IsString()
	formationDate: string | null;

	@ApiProperty({ name: "email", description: "Business email address.", example: "contact@acme.com", required: false })
	@Expose({ name: "email" })
	@Immutable()
	@RequiredForVerification([UserType.BUSINESS])
	@IsOptional()
	@IsEmail()
	email: string | null;

	@ApiProperty({
		name: "tax_id",
		description: "Business tax identification number.",
		example: "12.345.678/0001-90",
		required: false,
	})
	@Expose({ name: "tax_id" })
	@Immutable()
	@RequiredForVerification([UserType.BUSINESS])
	@IsOptional()
	@IsString()
	taxId: string | null;

	@ApiProperty({
		name: "phone_number",
		description: "Business phone number.",
		example: "+5511999990000",
		required: false,
	})
	@Expose({ name: "phone_number" })
	@Immutable()
	@RequiredForVerification([UserType.BUSINESS])
	@IsOptional()
	@IsString()
	phoneNumber: string | null;

	@ApiProperty({ name: "website", description: "Business website URL.", example: "https://acme.com", required: false })
	@Expose({ name: "website" })
	@Immutable()
	@RequiredForVerification([UserType.BUSINESS])
	@IsOptional()
	@IsString()
	website: string | null;

	@ApiProperty({
		name: "address",
		description: "Business address details.",
		type: BusinessAddressInputDto,
		required: false,
	})
	@Expose({ name: "address" })
	@Immutable()
	@RequiredForVerification([UserType.BUSINESS])
	@IsOptional()
	@ValidateNested()
	@Type(() => BusinessAddressInputDto)
	address: BusinessAddressInputDto | null;

	@ApiProperty({
		name: "controllers",
		description:
			"List of all shareholders or partners who own more than 25% of the company and/or are responsible for the management of the company.",
		type: [BusinessControllerInputDto],
		required: false,
	})
	@Expose({ name: "controllers" })
	@Immutable()
	@RequiredForVerification([UserType.BUSINESS])
	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => BusinessControllerInputDto)
	controllers: BusinessControllerInputDto[] | null;
}
