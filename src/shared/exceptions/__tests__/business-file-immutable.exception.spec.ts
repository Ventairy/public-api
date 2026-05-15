import { describe, it, expect } from "vitest";
import { HttpStatus } from "@nestjs/common";
import { BusinessFileImmutableException } from "../business-file-immutable.exception";
import { ERROR_CODES } from "@shared/constants";

describe("BusinessFileImmutableException", () => {
	it("should have status code 409 (CONFLICT)", () => {
		const exception = new BusinessFileImmutableException({ fileType: "PROOF_OF_ADDRESS" });
		expect(exception.statusCode).toBe(HttpStatus.CONFLICT);
	});

	it("should have the correct error code", () => {
		const exception = new BusinessFileImmutableException({ fileType: "PROOF_OF_ADDRESS" });
		expect(exception.domainCode).toBe(ERROR_CODES.BUSINESS_FILE_IMMUTABLE);
	});

	it("should have the correct error message containing the file type", () => {
		const exception = new BusinessFileImmutableException({ fileType: "PROOF_OF_ADDRESS" });
		expect(exception.message).toContain("PROOF_OF_ADDRESS");
		expect(exception.message).toContain("immutable after KYC approval");
	});

	it("should include file_type in details", () => {
		const exception = new BusinessFileImmutableException({ fileType: "INCORPORATION_DOCUMENT" });
		expect(exception.details).toBeDefined();
		expect(exception.details!["file_type"]).toBe("INCORPORATION_DOCUMENT");
	});

	it("should include the exact file type passed to constructor in details", () => {
		const exception = new BusinessFileImmutableException({ fileType: "IDENTIFICATION_FRONT" });
		expect(exception.details).toEqual({ file_type: "IDENTIFICATION_FRONT" });
	});
});
