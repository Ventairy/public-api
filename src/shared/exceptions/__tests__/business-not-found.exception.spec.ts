import { describe, it, expect } from "vitest";
import { HttpStatus } from "@nestjs/common";
import { ERROR_CODES } from "@shared/constants/error-codes";
import { BusinessNotFoundException } from "../business-not-found.exception";

describe("BusinessNotFoundException", () => {
	it("should have correct properties", () => {
		const exception = new BusinessNotFoundException("user-123");
		expect(exception.domainCode).toBe(ERROR_CODES.BUSINESS_NOT_FOUND);
		expect(exception.statusCode).toBe(HttpStatus.NOT_FOUND);
		expect(exception.details?.["userId"]).toBe("user-123");
	});
});
