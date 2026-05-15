import { describe, it, expect } from "vitest";
import { HttpStatus } from "@nestjs/common";
import { BusinessFieldImmutableException } from "../business-field-immutable.exception";
import { ERROR_CODES } from "@shared/constants";

describe("BusinessFieldImmutableException", () => {
	it("should have status code 409 (CONFLICT)", () => {
		const exception = new BusinessFieldImmutableException();
		expect(exception.statusCode).toBe(HttpStatus.CONFLICT);
	});

	it("should have the correct error code", () => {
		const exception = new BusinessFieldImmutableException();
		expect(exception.domainCode).toBe(ERROR_CODES.BUSINESS_FIELD_IMMUTABLE);
	});

	it("should have the correct error message", () => {
		const exception = new BusinessFieldImmutableException();
		expect(exception.message).toContain("already been set");
		expect(exception.message).toContain("currently unset");
	});

	it("should have no details", () => {
		const exception = new BusinessFieldImmutableException();
		expect(exception.details).toBeUndefined();
	});
});
