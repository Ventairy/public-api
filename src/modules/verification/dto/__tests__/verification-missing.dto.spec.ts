import { describe, it, expect } from "vitest";
import { instanceToPlain } from "class-transformer";
import { VerificationMissingDataDto } from "../verification-missing.dto";

describe("VerificationMissingDto", () => {
	it("should create with provided fields and files", () => {
		const dto = new VerificationMissingDataDto({
			fields: ["business.legal_name", "business.address.country_code"],
			files: ["business.PROOF_OF_ADDRESS", "business.INCORPORATION_DOCUMENT"],
		});

		expect(dto.fields).toEqual(["business.legal_name", "business.address.country_code"]);
		expect(dto.files).toEqual(["business.PROOF_OF_ADDRESS", "business.INCORPORATION_DOCUMENT"]);
	});

	it("should create with empty arrays", () => {
		const dto = new VerificationMissingDataDto({ fields: [], files: [] });

		expect(dto.fields).toEqual([]);
		expect(dto.files).toEqual([]);
	});

	it("should serialize to snake_case using class-transformer", () => {
		const dto = new VerificationMissingDataDto({
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
