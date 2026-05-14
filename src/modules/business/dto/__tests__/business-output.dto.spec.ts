import { describe, it, expect } from "vitest";
import { instanceToPlain } from "class-transformer";
import { BusinessOutputDto } from "../business-output.dto";
import { BusinessAddressOutputDto } from "../business-address-output.dto";
import { type BusinessDatabaseRow } from "@db/schema/businesses-table";
import { type BusinessControllerDatabaseRow } from "@db/schema/business-controllers-table";
import {
	BusinessFileType,
	BusinessControllerFileType,
	ProofAddressType,
	ControllerRole,
	IdentificationDocumentType,
} from "@shared/enums";

describe("BusinessOutputDto", () => {
	it("should map from database row correctly", () => {
		const mockBusinessRow: BusinessDatabaseRow = {
			id: "b-1",
			user_id: "u-1",
			legal_name: "Acme",
			fantasy_name: "Acme Corp",
			formation_date: "2020-01-01",
			email: "acme@test.com",
			tax_id: "123",
			phone_number: "999",
			website: "acme.com",
			country_code: "US",
			street: "Main St",
			city: "New York",
			state: "NY",
			postal_code: "10001",
			address_proof_type: ProofAddressType.UTILITY_BILL,
			created_at: "2026-05-01T00:00:00.000Z",
		};

		const mockControllerRow: BusinessControllerDatabaseRow = {
			id: "c-1",
			business_id: "b-1",
			role: ControllerRole.CONTROLLING_PERSON,
			ownership_percentage: 100,
			title: "Boss",
			legal_first_name: "John",
			legal_last_name: "Doe",
			date_of_birth: "1980-01-01",
			tax_id: "456",
			identification_country_code: "US",
			identification_document_type: IdentificationDocumentType.PASSPORT,
			address_country_code: "US",
			address_street: "Second St",
			address_city: "New York",
			address_state: "NY",
			address_postal_code: "10002",
			address_proof_type: ProofAddressType.BANK_STATEMENT,
			created_at: "2026-05-01T00:00:00.000Z",
		};

		const controllerFileTypesMap = new Map<string, BusinessControllerFileType[]>();
		controllerFileTypesMap.set("c-1", [BusinessControllerFileType.IDENTIFICATION_FRONT]);

		const result = BusinessOutputDto.fromDatabaseRow(
			mockBusinessRow,
			[mockControllerRow],
			[BusinessFileType.INCORPORATION_DOCUMENT],
			controllerFileTypesMap,
		);

		expect(result.id).toBe("b-1");
		expect(result.legalName).toBe("Acme");
		expect(result.address?.city).toBe("New York");
		expect(result.fileTypesUploaded).toEqual([BusinessFileType.INCORPORATION_DOCUMENT]);
		expect(result.controllers).toHaveLength(1);
		expect(result.controllers![0]!.id).toBe("c-1");
		expect(result.controllers![0]!.fileTypesUploaded).toEqual([BusinessControllerFileType.IDENTIFICATION_FRONT]);
	});

	it("should serialize to snake_case keys via instanceToPlain", () => {
		const mockBusinessRow: BusinessDatabaseRow = {
			id: "b-1",
			user_id: "u-1",
			legal_name: "Acme",
			fantasy_name: "Acme Corp",
			formation_date: "2020-01-01",
			email: "acme@test.com",
			tax_id: "123",
			phone_number: "999",
			website: "acme.com",
			country_code: "US",
			street: "Main St",
			city: "New York",
			state: "NY",
			postal_code: "10001",
			address_proof_type: ProofAddressType.UTILITY_BILL,
			created_at: "2026-05-01T00:00:00.000Z",
		};

		const mockControllerRow: BusinessControllerDatabaseRow = {
			id: "c-1",
			business_id: "b-1",
			role: ControllerRole.CONTROLLING_PERSON,
			ownership_percentage: 100,
			title: "Boss",
			legal_first_name: "John",
			legal_last_name: "Doe",
			date_of_birth: "1980-01-01",
			tax_id: "456",
			identification_country_code: "US",
			identification_document_type: IdentificationDocumentType.PASSPORT,
			address_country_code: "US",
			address_street: "Second St",
			address_city: "New York",
			address_state: "NY",
			address_postal_code: "10002",
			address_proof_type: ProofAddressType.BANK_STATEMENT,
			created_at: "2026-05-01T00:00:00.000Z",
		};

		const controllerFileTypesMap = new Map<string, BusinessControllerFileType[]>();
		controllerFileTypesMap.set("c-1", [BusinessControllerFileType.IDENTIFICATION_FRONT]);

		const result = BusinessOutputDto.fromDatabaseRow(
			mockBusinessRow,
			[mockControllerRow],
			[BusinessFileType.INCORPORATION_DOCUMENT],
			controllerFileTypesMap,
		);

		const plain = instanceToPlain(result) as Record<string, unknown>;

		expect(plain).toHaveProperty("legal_name");
		expect(plain).toHaveProperty("fantasy_name");
		expect(plain).toHaveProperty("formation_date");
		expect(plain).toHaveProperty("tax_id");
		expect(plain).toHaveProperty("phone_number");
		expect(plain).toHaveProperty("file_types_uploaded");
		expect(plain).toHaveProperty("created_at");
		expect(plain).not.toHaveProperty("legalName");
		expect(plain).not.toHaveProperty("fantasyName");
		expect(plain).not.toHaveProperty("createdAt");

		// Verify nested address is also snake_case
		const address = plain["address"] as Record<string, unknown>;
		expect(address).toHaveProperty("country_code");
		expect(address).toHaveProperty("address_proof_type");
		expect(address).not.toHaveProperty("countryCode");

		// Verify nested controllers are also snake_case
		const controllers = plain["controllers"] as Array<Record<string, unknown>>;
		expect(controllers[0]).toHaveProperty("legal_first_name");
		expect(controllers[0]).toHaveProperty("legal_last_name");
		expect(controllers[0]).toHaveProperty("ownership_percentage");
		expect(controllers[0]).toHaveProperty("date_of_birth");
		expect(controllers[0]).not.toHaveProperty("legalFirstName");
	});
});

describe("BusinessAddressOutputDto", () => {
	it("should map from database row correctly", () => {
		const mockBusinessRow: BusinessDatabaseRow = {
			id: "b-1",
			user_id: "u-1",
			legal_name: null,
			fantasy_name: null,
			formation_date: null,
			email: null,
			tax_id: null,
			phone_number: null,
			website: null,
			country_code: "BR",
			street: "Rua 1",
			city: "SP",
			state: "SP",
			postal_code: "01000-000",
			address_proof_type: ProofAddressType.UTILITY_BILL,
			created_at: "2026-05-01T00:00:00.000Z",
		};

		const result = BusinessAddressOutputDto.fromDatabaseRow(mockBusinessRow);
		expect(result).not.toBeNull();
		expect(result?.countryCode).toBe("BR");
		expect(result?.street).toBe("Rua 1");
	});

	it("should map from database row correctly even if address data is missing", () => {
		const mockBusinessRow: BusinessDatabaseRow = {
			id: "b-1",
			user_id: "u-1",
			legal_name: "Acme",
			fantasy_name: null,
			formation_date: null,
			email: null,
			tax_id: null,
			phone_number: null,
			website: null,
			country_code: null,
			street: null,
			city: null,
			state: null,
			postal_code: null,
			address_proof_type: null,
			created_at: "2026-05-01T00:00:00.000Z",
		};

		const result = BusinessAddressOutputDto.fromDatabaseRow(mockBusinessRow);
		expect(result).toEqual({
			countryCode: null,
			street: null,
			city: null,
			state: null,
			postalCode: null,
			addressProofType: null,
		});
	});
});
