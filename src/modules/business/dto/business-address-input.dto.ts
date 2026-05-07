import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsEnum, IsISO31661Alpha2, IsOptional, IsString } from "class-validator";
import { ProofAddressType } from "@shared/constants";

export class BusinessAddressInputDto {
	@ApiProperty({
		name: "country_code",
		description: "Country code (ISO 3166-1 alpha-2).",
		example: "BR",
		required: false,
	})
	@Expose({ name: "country_code" })
	@IsOptional()
	@IsString()
	@IsISO31661Alpha2()
	countryCode?: string;

	@ApiProperty({ name: "street", description: "Street address.", example: "123 Main St", required: false })
	@Expose({ name: "street" })
	@IsOptional()
	@IsString()
	street?: string;

	@ApiProperty({ name: "city", description: "City.", example: "Sao Paulo", required: false })
	@Expose({ name: "city" })
	@IsOptional()
	@IsString()
	city?: string;

	@ApiProperty({ name: "state", description: "State, province, or region.", example: "SP", required: false })
	@Expose({ name: "state" })
	@IsOptional()
	@IsString()
	state?: string;

	@ApiProperty({ name: "postal_code", description: "Postal code.", example: "01310-100", required: false })
	@Expose({ name: "postal_code" })
	@IsOptional()
	@IsString()
	postalCode?: string;

	@ApiProperty({
		name: "address_proof_type",
		description: "Type of proof of address document uploaded for the business.",
		enum: ProofAddressType,
		required: false,
	})
	@Expose({ name: "address_proof_type" })
	@IsOptional()
	@IsEnum(ProofAddressType)
	addressProofType?: ProofAddressType;
}
