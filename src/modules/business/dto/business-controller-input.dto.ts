import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { IsEnum, IsNumber, IsOptional, IsString, Max, Min, ValidateNested } from "class-validator";
import { ControllerRole, UserType } from "@shared/enums";
import { RequiredForVerification } from "@shared/decorators/required-for-verification.decorator";
import { Immutable } from "@shared/decorators/immutable.decorator";
import { BusinessControllerIdentificationInputDto } from "./business-controller-identification-input.dto";
import { BusinessControllerAddressInputDto } from "./business-controller-address-input.dto";
import { type BusinessControllerDatabaseRow } from "@db/schema/business-controllers-table";

export class BusinessControllerInputDto {
	static fromDatabaseRow(row: BusinessControllerDatabaseRow): BusinessControllerInputDto {
		return new BusinessControllerInputDto({
			id: row.id,
			role: row.role,
			ownershipPercentage: row.ownership_percentage,
			title: row.title,
			legalFirstName: row.legal_first_name,
			legalLastName: row.legal_last_name,
			dateOfBirth: row.date_of_birth,
			taxId: row.tax_id,
			identification: BusinessControllerIdentificationInputDto.fromDatabaseRow(row),
			address: BusinessControllerAddressInputDto.fromDatabaseRow(row),
		});
	}

	constructor(params?: {
		id?: string;
		role: ControllerRole | null;
		ownershipPercentage: number | null;
		title: string | null;
		legalFirstName: string | null;
		legalLastName: string | null;
		dateOfBirth: string | null;
		taxId: string | null;
		identification: BusinessControllerIdentificationInputDto | null;
		address: BusinessControllerAddressInputDto | null;
	}) {
		this.id = params?.id;
		this.role = params?.role ?? null;
		this.ownershipPercentage = params?.ownershipPercentage ?? null;
		this.title = params?.title ?? null;
		this.legalFirstName = params?.legalFirstName ?? null;
		this.legalLastName = params?.legalLastName ?? null;
		this.dateOfBirth = params?.dateOfBirth ?? null;
		this.taxId = params?.taxId ?? null;
		this.identification = params?.identification ?? null;
		this.address = params?.address ?? null;
	}

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
	@Immutable()
	@RequiredForVerification([UserType.BUSINESS])
	@IsOptional()
	@IsEnum(ControllerRole)
	role: ControllerRole | null;

	@ApiProperty({
		name: "ownership_percentage",
		description: "Ownership percentage (0-100).",
		example: 35.5,
		required: false,
	})
	@Expose({ name: "ownership_percentage" })
	@Immutable()
	@RequiredForVerification([UserType.BUSINESS])
	@IsOptional()
	@IsNumber()
	@Min(0)
	@Max(100)
	ownershipPercentage: number | null;

	@ApiProperty({
		name: "title",
		description: "Title or position within the business.",
		example: "CEO",
		required: false,
	})
	@Expose({ name: "title" })
	@Immutable()
	@RequiredForVerification([UserType.BUSINESS])
	@IsOptional()
	@IsString()
	title: string | null;

	@ApiProperty({ name: "legal_first_name", description: "Legal first name.", example: "João", required: false })
	@Expose({ name: "legal_first_name" })
	@Immutable()
	@RequiredForVerification([UserType.BUSINESS])
	@IsOptional()
	@IsString()
	legalFirstName: string | null;

	@ApiProperty({ name: "legal_last_name", description: "Legal last name.", example: "Silva", required: false })
	@Expose({ name: "legal_last_name" })
	@Immutable()
	@RequiredForVerification([UserType.BUSINESS])
	@IsOptional()
	@IsString()
	legalLastName: string | null;

	@ApiProperty({
		name: "date_of_birth",
		description: "Date of birth (ISO 8601).",
		example: "1985-03-20",
		required: false,
	})
	@Expose({ name: "date_of_birth" })
	@Immutable()
	@RequiredForVerification([UserType.BUSINESS])
	@IsOptional()
	@IsString()
	dateOfBirth: string | null;

	@ApiProperty({
		name: "tax_id",
		description: "Tax identification number.",
		example: "123.456.789-00",
		required: false,
	})
	@Expose({ name: "tax_id" })
	@Immutable()
	@RequiredForVerification([UserType.BUSINESS])
	@IsOptional()
	@IsString()
	taxId: string | null;

	@ApiProperty({
		name: "identification",
		description: "Identification document details.",
		type: BusinessControllerIdentificationInputDto,
		required: false,
	})
	@Expose({ name: "identification" })
	@Immutable()
	@RequiredForVerification([UserType.BUSINESS])
	@IsOptional()
	@ValidateNested()
	@Type(() => BusinessControllerIdentificationInputDto)
	identification: BusinessControllerIdentificationInputDto | null;

	@ApiProperty({
		name: "address",
		description: "Personal address details.",
		type: BusinessControllerAddressInputDto,
		required: false,
	})
	@Expose({ name: "address" })
	@Immutable()
	@RequiredForVerification([UserType.BUSINESS])
	@IsOptional()
	@ValidateNested()
	@Type(() => BusinessControllerAddressInputDto)
	address: BusinessControllerAddressInputDto | null;
}
