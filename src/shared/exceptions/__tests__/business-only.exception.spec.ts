import { describe, it, expect } from "vitest";
import { HttpStatus } from "@nestjs/common";
import { ERROR_CODES } from "@shared/constants/error-codes";
import { BusinessOnlyException } from "../business-only.exception";

describe("BusinessOnlyException", () => {
	it("should have correct properties", () => {
		const exception = new BusinessOnlyException();
		expect(exception.domainCode).toBe(ERROR_CODES.BUSINESS_ONLY);
		expect(exception.statusCode).toBe(HttpStatus.FORBIDDEN);
	});
});
