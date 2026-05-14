import { describe, it, expect } from "vitest";
import { type BusinessControllerDatabaseRow } from "@db/schema/business-controllers-table";
import {
	BusinessFileType,
	BusinessControllerFileType,
	ProofAddressType,
	ControllerRole,
	IdentificationDocumentType,
} from "@shared/enums";
import { BusinessControllerOutputDto } from "../business-controller-output.dto";
import { BusinessControllerAddressOutputDto } from "../business-controller-address-output.dto";
import { BusinessControllerIdentificationOutputDto } from "../business-controller-identification-output.dto";

describe("ControllerOutputDto", () => {
	it("should map from database row correctly", () => {
		const mockRow: BusinessControllerDatabaseRow = {
			id: "c-1",
			business_id: "b-1",
			role: ControllerRole.CONTROLLING_PERSON,
			ownership_percentage: 50,
			title: "Boss",
			legal_first_name: "Jane",
			legal_last_name: "Doe",
			date_of_birth: "1990-01-01",
			tax_id: "789",
			identification_country_code: "UK",
			identification_document_type: IdentificationDocumentType.PASSPORT,
			address_country_code: "UK",
			address_street: "Baker St",
			address_city: "London",
			address_state: null,
			address_postal_code: "NW1 6XE",
			address_proof_type: ProofAddressType.BANK_STATEMENT,
			created_at: "2026-05-01T00:00:00.000Z",
		};

		const result = BusinessControllerOutputDto.fromDatabaseRow(mockRow, [
			BusinessControllerFileType.IDENTIFICATION_FRONT,
		]);

		expect(result.id).toBe("c-1");
		expect(result.legalFirstName).toBe("Jane");
		expect(result.identification.countryCode).toBe("UK");
		expect(result.address.city).toBe("London");
		expect(result.fileTypesUploaded).toEqual([BusinessControllerFileType.IDENTIFICATION_FRONT]);
	});
});

describe("ControllerAddressOutputDto", () => {
	it("should map from database row correctly", () => {
		const mockRow = {
			address_country_code: "BR",
			address_street: "Avenida",
			address_city: "Rio",
			address_state: "RJ",
			address_postal_code: "20000-000",
			address_proof_type: ProofAddressType.UTILITY_BILL,
		} as BusinessControllerDatabaseRow;

		const result = BusinessControllerAddressOutputDto.fromDatabaseRow(mockRow);
		expect(result.countryCode).toBe("BR");
		expect(result.city).toBe("Rio");
	});
});

describe("ControllerIdentificationOutputDto", () => {
	it("should map from database row correctly", () => {
		const mockRow = {
			identification_country_code: "US",
			identification_document_type: IdentificationDocumentType.ID_CARD,
		} as unknown as BusinessControllerDatabaseRow;

		const result = BusinessControllerIdentificationOutputDto.fromDatabaseRow(mockRow);
		expect(result.countryCode).toBe("US");
		expect(result.documentType).toBe(IdentificationDocumentType.ID_CARD);
	});
});
