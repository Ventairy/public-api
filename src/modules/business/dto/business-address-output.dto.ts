import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { ProofAddressType } from "@shared/constants";
import { DatabaseOutputDto } from "@shared/dto";
import { type BusinessRow } from "@db/schema/businesses-table";

export class BusinessAddressOutputDto extends DatabaseOutputDto {
	static override fromDatabaseRow(row: BusinessRow): BusinessAddressOutputDto | null {
		return {
			countryCode: row.country_code,
			street: row.street,
			city: row.city,
			state: row.state,
			postalCode: row.postal_code,
			addressProofType: row.address_proof_type,
		};
	}

	@ApiProperty({
		name: "country_code",
		description: "Country code (ISO 3166-1 alpha-2).",
		example: "BR",
		nullable: true,
	})
	@Expose({ name: "country_code" })
	countryCode!: string | null;

	@ApiProperty({ name: "street", description: "Street address.", example: "123 Main St", nullable: true })
	@Expose({ name: "street" })
	street!: string | null;

	@ApiProperty({ name: "city", description: "City.", example: "Sao Paulo", nullable: true })
	@Expose({ name: "city" })
	city!: string | null;

	@ApiProperty({ name: "state", description: "State, province, or region.", example: "SP", nullable: true })
	@Expose({ name: "state" })
	state!: string | null;

	@ApiProperty({ name: "postal_code", description: "Postal code.", example: "01310-100", nullable: true })
	@Expose({ name: "postal_code" })
	postalCode!: string | null;

	@ApiProperty({
		name: "address_proof_type",
		description: "Type of proof of address document.",
		enum: ProofAddressType,
		nullable: true,
	})
	@Expose({ name: "address_proof_type" })
	addressProofType!: ProofAddressType | null;
}
