import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { IsEnum, IsNumber, IsOptional, IsString, Max, Min, ValidateNested } from "class-validator";
import { ControllerRole } from "@shared/constants";
import { BusinessControllerIdentificationInputDto } from "./business-controller-identification-input.dto";
import { BusinessControllerAddressInputDto } from "./business-controller-address-input.dto";

export class BusinessControllerInputDto {
	@ApiProperty({
		name: "id",
		description:
			"Unique ID of an existing controller (omit for new controllers). In case of providing an ID, the controller will be updated with the provided values.",
		format: "uuid",
		required: false,
	})
	@Expose({ name: "id" })
	@IsOptional()
	@IsString()
	id?: string;

	@ApiProperty({ name: "role", description: "Role of the controller.", enum: ControllerRole, required: false })
	@Expose({ name: "role" })
	@IsOptional()
	@IsEnum(ControllerRole)
	role?: ControllerRole;

	@ApiProperty({
		name: "ownership_percentage",
		description: "Ownership percentage (0-100).",
		example: 35.5,
		required: false,
	})
	@Expose({ name: "ownership_percentage" })
	@IsOptional()
	@IsNumber()
	@Min(0)
	@Max(100)
	ownershipPercentage?: number;

	@ApiProperty({
		name: "title",
		description: "Title or position within the business.",
		example: "CEO",
		required: false,
	})
	@Expose({ name: "title" })
	@IsOptional()
	@IsString()
	title?: string;

	@ApiProperty({ name: "legal_first_name", description: "Legal first name.", example: "João", required: false })
	@Expose({ name: "legal_first_name" })
	@IsOptional()
	@IsString()
	legalFirstName?: string;

	@ApiProperty({ name: "legal_last_name", description: "Legal last name.", example: "Silva", required: false })
	@Expose({ name: "legal_last_name" })
	@IsOptional()
	@IsString()
	legalLastName?: string;

	@ApiProperty({
		name: "date_of_birth",
		description: "Date of birth (ISO 8601).",
		example: "1985-03-20",
		required: false,
	})
	@Expose({ name: "date_of_birth" })
	@IsOptional()
	@IsString()
	dateOfBirth?: string;

	@ApiProperty({
		name: "tax_id",
		description: "Tax identification number.",
		example: "123.456.789-00",
		required: false,
	})
	@Expose({ name: "tax_id" })
	@IsOptional()
	@IsString()
	taxId?: string;

	@ApiProperty({
		name: "identification",
		description: "Identification document details.",
		type: BusinessControllerIdentificationInputDto,
		required: false,
	})
	@Expose({ name: "identification" })
	@IsOptional()
	@ValidateNested()
	@Type(() => BusinessControllerIdentificationInputDto)
	identification?: BusinessControllerIdentificationInputDto;

	@ApiProperty({
		name: "address",
		description: "Personal address details.",
		type: BusinessControllerAddressInputDto,
		required: false,
	})
	@Expose({ name: "address" })
	@IsOptional()
	@ValidateNested()
	@Type(() => BusinessControllerAddressInputDto)
	address?: BusinessControllerAddressInputDto;
}
