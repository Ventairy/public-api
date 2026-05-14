import { ApiProperty } from "@nestjs/swagger";
import { Expose } from "class-transformer";
import { ProofAddressType } from "@shared/enums";
import { type BusinessControllerDatabaseRow } from "@db/schema/business-controllers-table";
export class BusinessControllerAddressOutputDto {
	static fromDatabaseRow(row: BusinessControllerDatabaseRow): BusinessControllerAddressOutputDto {
		return new BusinessControllerAddressOutputDto({
			countryCode: row.address_country_code,
			street: row.address_street,
			city: row.address_city,
			state: row.address_state,
			postalCode: row.address_postal_code,
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
	@ApiProperty({ name: "country_code", description: "Country code.", example: "BR", nullable: true })
	@Expose({ name: "country_code" })
	countryCode: string | null;
	@ApiProperty({ name: "street", description: "Street address.", example: "456 Oak Ave", nullable: true })
	@Expose({ name: "street" })
	street: string | null;
	@ApiProperty({ name: "city", description: "City.", example: "Rio de Janeiro", nullable: true })
	@Expose({ name: "city" })
	city: string | null;
	@ApiProperty({ name: "state", description: "State, province, or region.", example: "RJ", nullable: true })
	@Expose({ name: "state" })
	state: string | null;
	@ApiProperty({ name: "postal_code", description: "Postal code.", example: "20040-020", nullable: true })
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
