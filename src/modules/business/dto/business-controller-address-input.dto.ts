import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { IsEnum, IsISO31661Alpha2, IsOptional, IsString } from "class-validator";
import { ProofAddressType, UserType } from "@shared/constants";
import { RequiredForKYC } from "@shared/decorators/required-for-kyc.decorator";

export class BusinessControllerAddressInputDto {
	@ApiProperty({
		name: "country_code",
		description: "Country code (ISO 3166-1 alpha-2).",
		example: "BR",
		required: false,
	})
	@Expose({ name: "country_code" })
	@RequiredForKYC([UserType.BUSINESS])
	@IsOptional()
	@IsString()
	@IsISO31661Alpha2()
	countryCode?: string;

	@ApiProperty({ name: "street", description: "Street address.", example: "456 Oak Ave", required: false })
	@Expose({ name: "street" })
	@RequiredForKYC([UserType.BUSINESS])
	@IsOptional()
	@IsString()
	street?: string;

	@ApiProperty({ name: "city", description: "City.", example: "Rio de Janeiro", required: false })
	@Expose({ name: "city" })
	@RequiredForKYC([UserType.BUSINESS])
	@IsOptional()
	@IsString()
	city?: string;

	@ApiProperty({ name: "state", description: "State, province, or region.", example: "RJ", required: false })
	@Expose({ name: "state" })
	@RequiredForKYC([UserType.BUSINESS])
	@IsOptional()
	@IsString()
	state?: string;

	@ApiProperty({ name: "postal_code", description: "Postal code.", example: "20040-020", required: false })
	@Expose({ name: "postal_code" })
	@RequiredForKYC([UserType.BUSINESS])
	@IsOptional()
	@IsString()
	postalCode?: string;

	@ApiProperty({
		name: "address_proof_type",
		description: "Type of proof of address document.",
		enum: ProofAddressType,
		required: false,
	})
	@Expose({ name: "address_proof_type" })
	@RequiredForKYC([UserType.BUSINESS])
	@IsOptional()
	@IsEnum(ProofAddressType)
	addressProofType?: ProofAddressType;
}
