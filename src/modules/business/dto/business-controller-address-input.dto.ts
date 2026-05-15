import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsEnum, IsISO31661Alpha2, IsOptional, IsString } from "class-validator";
import { ProofAddressType, UserType } from "@shared/enums";
import { RequiredForKYC } from "@shared/decorators/required-for-kyc.decorator";
import { Immutable } from "@shared/decorators/immutable.decorator";
import { type BusinessControllerDatabaseRow } from "@db/schema/business-controllers-table";

export class BusinessControllerAddressInputDto {
	static fromDatabaseRow(row: BusinessControllerDatabaseRow): BusinessControllerAddressInputDto {
		return new BusinessControllerAddressInputDto({
			countryCode: row.address_country_code,
			street: row.address_street,
			city: row.address_city,
			state: row.address_state,
			postalCode: row.address_postal_code,
			addressProofType: row.address_proof_type,
		});
	}

	constructor(params?: {
		countryCode: string | null;
		street: string | null;
		city: string | null;
		state: string | null;
		postalCode: string | null;
		addressProofType: ProofAddressType | null;
	}) {
		this.countryCode = params?.countryCode ?? null;
		this.street = params?.street ?? null;
		this.city = params?.city ?? null;
		this.state = params?.state ?? null;
		this.postalCode = params?.postalCode ?? null;
		this.addressProofType = params?.addressProofType ?? null;
	}

	@ApiProperty({
		name: "country_code",
		description: "Country code (ISO 3166-1 alpha-2).",
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

	@ApiProperty({ name: "street", description: "Street address.", example: "456 Oak Ave", required: false })
	@Expose({ name: "street" })
	@Immutable()
	@RequiredForKYC([UserType.BUSINESS])
	@IsOptional()
	@IsString()
	street: string | null;

	@ApiProperty({ name: "city", description: "City.", example: "Rio de Janeiro", required: false })
	@Expose({ name: "city" })
	@Immutable()
	@RequiredForKYC([UserType.BUSINESS])
	@IsOptional()
	@IsString()
	city: string | null;

	@ApiProperty({ name: "state", description: "State, province, or region.", example: "RJ", required: false })
	@Expose({ name: "state" })
	@Immutable()
	@RequiredForKYC([UserType.BUSINESS])
	@IsOptional()
	@IsString()
	state: string | null;

	@ApiProperty({ name: "postal_code", description: "Postal code.", example: "20040-020", required: false })
	@Expose({ name: "postal_code" })
	@Immutable()
	@RequiredForKYC([UserType.BUSINESS])
	@IsOptional()
	@IsString()
	postalCode: string | null;

	@ApiProperty({
		name: "address_proof_type",
		description: "Type of proof of address document.",
		enum: ProofAddressType,
		required: false,
	})
	@Expose({ name: "address_proof_type" })
	@Immutable()
	@RequiredForKYC([UserType.BUSINESS])
	@IsOptional()
	@IsEnum(ProofAddressType)
	addressProofType: ProofAddressType | null;
}
