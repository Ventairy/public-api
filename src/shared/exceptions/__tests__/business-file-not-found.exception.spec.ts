import { describe, it, expect } from "vitest";
import { HttpStatus } from "@nestjs/common";
import { ERROR_CODES } from "@shared/constants/error-codes";
import { BusinessFileNotFoundException } from "../business-file-not-found.exception";

describe("BusinessFileNotFoundException", () => {
	it("should have correct properties", () => {
		const exception = new BusinessFileNotFoundException("user-123", "PASSPORT");
		expect(exception.domainCode).toBe(ERROR_CODES.BUSINESS_FILE_NOT_FOUND);
		expect(exception.statusCode).toBe(HttpStatus.NOT_FOUND);
		expect(exception.details?.["userId"]).toBe("user-123");
		expect(exception.details?.["fileType"]).toBe("PASSPORT");
	});
});
