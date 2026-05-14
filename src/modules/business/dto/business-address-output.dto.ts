import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { ProofAddressType } from "@shared/enums";
import { type BusinessDatabaseRow } from "@db/schema/businesses-table";
export class BusinessAddressOutputDto {
	static fromDatabaseRow(row: BusinessDatabaseRow): BusinessAddressOutputDto {
		return new BusinessAddressOutputDto({
			countryCode: row.country_code,
			street: row.street,
			city: row.city,
			state: row.state,
			postalCode: row.postal_code,
			addressProofType: row.address_proof_type,
		});
	}
	constructor(data: {
		countryCode: string | null;
		street: string | null;
		city: string | null;
		state: string | null;
		postalCode: string | null;
		addressProofType: ProofAddressType | null;
	}) {
		this.countryCode = data.countryCode;
		this.street = data.street;
		this.city = data.city;
		this.state = data.state;
		this.postalCode = data.postalCode;
		this.addressProofType = data.addressProofType;
	}
	@ApiProperty({
		name: "country_code",
		description: "Country code (ISO 3166-1 alpha-2).",
		example: "BR",
		nullable: true,
	})
	@Expose({ name: "country_code" })
	countryCode: string | null;
	@ApiProperty({ name: "street", description: "Street address.", example: "123 Main St", nullable: true })
	@Expose({ name: "street" })
	street: string | null;
	@ApiProperty({ name: "city", description: "City.", example: "Sao Paulo", nullable: true })
	@Expose({ name: "city" })
	city: string | null;
	@ApiProperty({ name: "state", description: "State, province, or region.", example: "SP", nullable: true })
	@Expose({ name: "state" })
	state: string | null;
	@ApiProperty({ name: "postal_code", description: "Postal code.", example: "01310-100", nullable: true })
	@Expose({ name: "postal_code" })
	postalCode: string | null;
	@ApiProperty({
		name: "address_proof_type",
		description: "Type of proof of address document.",
		enum: ProofAddressType,
		nullable: true,
	})
	@Expose({ name: "address_proof_type" })
	addressProofType: ProofAddressType | null;
}
