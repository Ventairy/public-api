import { describe, it, expect } from "vitest";
import { instanceToPlain } from "class-transformer";
import { KycMissingDataDto } from "../kyc-missing.dto";

describe("KycMissingDto", () => {
	it("should create with provided fields and files", () => {
		const dto = new KycMissingDataDto({
			fields: ["business.legal_name", "business.address.country_code"],
			files: ["business.PROOF_OF_ADDRESS", "business.INCORPORATION_DOCUMENT"],
		});

		expect(dto.fields).toEqual(["business.legal_name", "business.address.country_code"]);
		expect(dto.files).toEqual(["business.PROOF_OF_ADDRESS", "business.INCORPORATION_DOCUMENT"]);
	});

	it("should create with empty arrays", () => {
		const dto = new KycMissingDataDto({ fields: [], files: [] });

		expect(dto.fields).toEqual([]);
		expect(dto.files).toEqual([]);
	});

	it("should serialize to snake_case using class-transformer", () => {
		const dto = new KycMissingDataDto({
			fields: ["business.legal_name"],
			files: ["business.PROOF_OF_ADDRESS"],
		});

		const plain = instanceToPlain(dto);

		expect(plain).toEqual({
			fields: ["business.legal_name"],
			files: ["business.PROOF_OF_ADDRESS"],
		});
	});
});
