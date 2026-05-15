import "reflect-metadata";
import { describe, it, expect } from "vitest";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { BusinessControllerInputDto } from "../business-controller-input.dto";
import type { BusinessControllerDatabaseRow } from "@db/schema/business-controllers-table";

describe("ControllerInputDto", () => {
	describe("fromDatabaseRow", () => {
		it("should map all non-null fields from the database row", () => {
			const row = {
				id: "ctrl-1",
				role: "CONTROLLING_PERSON",
				ownership_percentage: 50.5,
				title: "CEO",
				legal_first_name: "João",
				legal_last_name: "Silva",
				date_of_birth: "1985-03-20",
				tax_id: "123.456.789-00",
				identification_country_code: "BR",
				identification_document_type: "PASSPORT",
				address_country_code: "BR",
				address_street: "456 Oak Ave",
				address_city: "Rio de Janeiro",
				address_state: "RJ",
				address_postal_code: "20040-020",
				address_proof_type: "UTILITY_BILL",
			} as BusinessControllerDatabaseRow;

			const dto = BusinessControllerInputDto.fromDatabaseRow(row);

			expect(dto.id).toBe("ctrl-1");
			expect(dto.role).toBe("CONTROLLING_PERSON");
			expect(dto.ownershipPercentage).toBe(50.5);
			expect(dto.title).toBe("CEO");
			expect(dto.legalFirstName).toBe("João");
			expect(dto.legalLastName).toBe("Silva");
			expect(dto.dateOfBirth).toBe("1985-03-20");
			expect(dto.taxId).toBe("123.456.789-00");
			expect(dto.identification?.countryCode).toBe("BR");
			expect(dto.identification?.documentType).toBe("PASSPORT");
			expect(dto.address?.countryCode).toBe("BR");
			expect(dto.address?.street).toBe("456 Oak Ave");
			expect(dto.address?.city).toBe("Rio de Janeiro");
			expect(dto.address?.state).toBe("RJ");
			expect(dto.address?.postalCode).toBe("20040-020");
			expect(dto.address?.addressProofType).toBe("UTILITY_BILL");
		});

		it("should convert null DB values to null", () => {
			const row = { id: "ctrl-1" } as BusinessControllerDatabaseRow;

			const dto = BusinessControllerInputDto.fromDatabaseRow(row);

			expect(dto.role).toBeNull();
			expect(dto.legalFirstName).toBeNull();
			expect(dto.identification?.countryCode).toBeNull();
			expect(dto.address?.street).toBeNull();
		});

		it("should handle mixed null and non-null fields", () => {
			const row = {
				id: "ctrl-1",
				legal_first_name: "João",
				tax_id: "123.456.789-00",
			} as BusinessControllerDatabaseRow;

			const dto = BusinessControllerInputDto.fromDatabaseRow(row);

			expect(dto.legalFirstName).toBe("João");
			expect(dto.taxId).toBe("123.456.789-00");
			expect(dto.role).toBeNull();
			expect(dto.legalLastName).toBeNull();
		});
	});

	it("should validate an empty dto (since all fields are optional)", async () => {
		const input = {};
		const dto = plainToInstance(BusinessControllerInputDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBe(0);
	});

	it("should validate a correct dto with all fields", async () => {
		const input = {
			id: "1234-5678",
			role: "CONTROLLING_PERSON",
			ownership_percentage: 50.5,
			title: "CEO",
			legal_first_name: "John",
			legal_last_name: "Doe",
			date_of_birth: "1990-01-01",
			tax_id: "12345",
			identification: {
				country_code: "US",
			},
			address: {
				country_code: "US",
			},
		};

		const dto = plainToInstance(BusinessControllerInputDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBe(0);
	});

	it("should fail validation if role is invalid", async () => {
		const input = {
			role: "INVALID_ROLE",
		};

		const dto = plainToInstance(BusinessControllerInputDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBeGreaterThan(0);
		expect(errors[0]!.property).toBe("role");
	});

	it("should fail validation if ownership_percentage is out of bounds", async () => {
		const input = {
			ownership_percentage: 150,
		};

		const dto = plainToInstance(BusinessControllerInputDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBeGreaterThan(0);
		expect(errors[0]!.property).toBe("ownershipPercentage");
	});

	it("should fail validation if identification is not an object", async () => {
		const input = {
			identification: "not-an-object",
		};

		const dto = plainToInstance(BusinessControllerInputDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBeGreaterThan(0);
		expect(errors[0]!.property).toBe("identification");
	});
});
