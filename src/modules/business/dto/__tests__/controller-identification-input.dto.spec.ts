import "reflect-metadata";
import { describe, it, expect } from "vitest";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { BusinessControllerIdentificationInputDto } from "../business-controller-identification-input.dto";
import type { BusinessControllerDatabaseRow } from "@db/schema/business-controllers-table";

describe("ControllerIdentificationInputDto", () => {
	describe("fromDatabaseRow", () => {
		it("should map non-null fields from the database row", () => {
			const row = {
				identification_country_code: "BR",
				identification_document_type: "PASSPORT",
			} as BusinessControllerDatabaseRow;

			const dto = BusinessControllerIdentificationInputDto.fromDatabaseRow(row);

			expect(dto.countryCode).toBe("BR");
			expect(dto.documentType).toBe("PASSPORT");
		});

		it("should convert null DB values to null", () => {
			const row = {} as BusinessControllerDatabaseRow;

			const dto = BusinessControllerIdentificationInputDto.fromDatabaseRow(row);

			expect(dto.countryCode).toBeNull();
			expect(dto.documentType).toBeNull();
		});
	});

	it("should validate an empty dto (since all fields are optional)", async () => {
		const input = {};
		const dto = plainToInstance(BusinessControllerIdentificationInputDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBe(0);
	});

	it("should fail validation if country_code is not a valid ISO 3166-1 alpha-2 code", async () => {
		const input = {
			country_code: "INVALID",
		};
		const dto = plainToInstance(BusinessControllerIdentificationInputDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBeGreaterThan(0);
		expect(errors[0]!.property).toBe("countryCode");
	});

	it("should validate a correct dto with all fields", async () => {
		const input = {
			country_code: "US",
			document_type: "PASSPORT",
		};

		const dto = plainToInstance(BusinessControllerIdentificationInputDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBe(0);
	});

	it("should fail validation if document_type is invalid", async () => {
		const input = {
			document_type: "INVALID_TYPE",
		};

		const dto = plainToInstance(BusinessControllerIdentificationInputDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBeGreaterThan(0);
		expect(errors[0]!.property).toBe("documentType");
	});
});
