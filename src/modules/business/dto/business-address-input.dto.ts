import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsEnum, IsISO31661Alpha2, IsOptional, IsString } from "class-validator";
import { ProofAddressType, UserType } from "@shared/enums";
import { RequiredForVerification } from "@shared/decorators/required-for-verification.decorator";
import { Immutable } from "@shared/decorators/immutable.decorator";
import { type BusinessDatabaseRow } from "@db/schema/businesses-table";

export class BusinessAddressInputDto {
	static fromDatabaseRow(row: BusinessDatabaseRow): BusinessAddressInputDto {
		return new BusinessAddressInputDto({
			countryCode: row.country_code,
			street: row.street,
			city: row.city,
			state: row.state,
			postalCode: row.postal_code,
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
	@RequiredForVerification([UserType.BUSINESS])
	@IsOptional()
	@IsString()
	@IsISO31661Alpha2()
	countryCode: string | null;

	@ApiProperty({ name: "street", description: "Street address.", example: "123 Main St", required: false })
	@Expose({ name: "street" })
	@Immutable()
	@RequiredForVerification([UserType.BUSINESS])
	@IsOptional()
	@IsString()
	street: string | null;

	@ApiProperty({ name: "city", description: "City.", example: "Sao Paulo", required: false })
	@Expose({ name: "city" })
	@Immutable()
	@RequiredForVerification([UserType.BUSINESS])
	@IsOptional()
	@IsString()
	city: string | null;

	@ApiProperty({ name: "state", description: "State, province, or region.", example: "SP", required: false })
	@Expose({ name: "state" })
	@Immutable()
	@RequiredForVerification([UserType.BUSINESS])
	@IsOptional()
	@IsString()
	state: string | null;

	@ApiProperty({ name: "postal_code", description: "Postal code.", example: "01310-100", required: false })
	@Expose({ name: "postal_code" })
	@Immutable()
	@RequiredForVerification([UserType.BUSINESS])
	@IsOptional()
	@IsString()
	postalCode: string | null;

	@ApiProperty({
		name: "address_proof_type",
		description: "Type of proof of address document uploaded for the business.",
		enum: ProofAddressType,
		required: false,
	})
	@Expose({ name: "address_proof_type" })
	@Immutable()
	@RequiredForVerification([UserType.BUSINESS])
	@IsOptional()
	@IsEnum(ProofAddressType)
	addressProofType: ProofAddressType | null;
}
