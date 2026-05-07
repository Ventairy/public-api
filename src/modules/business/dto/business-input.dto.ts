import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { IsArray, IsEmail, IsOptional, IsString, ValidateNested } from "class-validator";
import { BusinessAddressInputDto } from "./business-address-input.dto";
import { BusinessControllerInputDto } from "./business-controller-input.dto";

export class BusinessInputDto {
	@ApiProperty({
		name: "legal_name",
		description: "Legal name of the business.",
		example: "Acme Corporation Ltd.",
		required: false,
	})
	@Expose({ name: "legal_name" })
	@IsOptional()
	@IsString()
	legalName?: string;

	@ApiProperty({
		name: "fantasy_name",
		description: "Doing-business-as (fantasy) name. Optional.",
		example: "Acme",
		required: false,
	})
	@Expose({ name: "fantasy_name" })
	@IsOptional()
	@IsString()
	fantasyName?: string;

	@ApiProperty({
		name: "formation_date",
		description: "Date the business was formed (ISO 8601).",
		example: "2020-01-15",
		required: false,
	})
	@Expose({ name: "formation_date" })
	@IsOptional()
	@IsString()
	formationDate?: string;

	@ApiProperty({ name: "email", description: "Business email address.", example: "contact@acme.com", required: false })
	@Expose({ name: "email" })
	@IsOptional()
	@IsEmail()
	email?: string;

	@ApiProperty({
		name: "tax_id",
		description: "Business tax identification number.",
		example: "12.345.678/0001-90",
		required: false,
	})
	@Expose({ name: "tax_id" })
	@IsOptional()
	@IsString()
	taxId?: string;

	@ApiProperty({
		name: "phone_number",
		description: "Business phone number.",
		example: "+5511999990000",
		required: false,
	})
	@Expose({ name: "phone_number" })
	@IsOptional()
	@IsString()
	phoneNumber?: string;

	@ApiProperty({ name: "website", description: "Business website URL.", example: "https://acme.com", required: false })
	@Expose({ name: "website" })
	@IsOptional()
	@IsString()
	website?: string;

	@ApiProperty({
		name: "address",
		description: "Business address details.",
		type: BusinessAddressInputDto,
		required: false,
	})
	@Expose({ name: "address" })
	@IsOptional()
	@ValidateNested()
	@Type(() => BusinessAddressInputDto)
	address?: BusinessAddressInputDto;

	@ApiProperty({
		name: "controllers",
		description:
			"List of all shareholders or partners who own more than 25% of the company and/or are responsible for the management of the company.",
		type: [BusinessControllerInputDto],
		required: false,
	})
	@Expose({ name: "controllers" })
	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => BusinessControllerInputDto)
	controllers?: BusinessControllerInputDto[];
}
