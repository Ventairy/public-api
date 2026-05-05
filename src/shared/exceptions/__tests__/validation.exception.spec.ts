import { describe, it, expect, beforeEach } from "vitest";
import { HttpStatus } from "@nestjs/common";
import { ValidationException } from "@shared/exceptions/validation.exception";
import { ERROR_CODES } from "@shared/constants/error-codes";
import type { FieldError } from "@shared/errors/error-response.types";

const getMockFieldError = (overrides?: Partial<FieldError>): FieldError => ({
	path: "wallet_address",
	constraint: "isEthereumAddress",
	message: "wallet_address must be an Ethereum address",
	hint: "Provide a 0x-prefixed 40-character hexadecimal string.",
	received: "KULE",
	...overrides,
});

describe("ValidationException", () => {
	it("carries the correct domain code", () => {
		const errors = [getMockFieldError()];
		const exception = new ValidationException(errors);
		expect(exception.domainCode).toBe(ERROR_CODES.VALIDATION_FAILED);
	});

	it("sets status code to 400 BAD_REQUEST", () => {
		const errors = [getMockFieldError()];
		const exception = new ValidationException(errors);
		expect(exception.getStatus()).toBe(HttpStatus.BAD_REQUEST);
	});

	it("stores field errors on the instance", () => {
		const errors = [getMockFieldError(), getMockFieldError({ path: "email" })];
		const exception = new ValidationException(errors);
		expect(exception.fieldErrors).toHaveLength(2);
		expect(exception.fieldErrors[0]!.path).toBe("wallet_address");
		expect(exception.fieldErrors[1]!.path).toBe("email");
	});

	it("generates a singular summary message for one error", () => {
		const errors = [getMockFieldError()];
		const exception = new ValidationException(errors);
		expect(exception.message).toBe(
			"Request validation failed: 1 field has an invalid value.",
		);
	});

	it("generates a plural summary message for multiple errors", () => {
		const errors = [getMockFieldError(), getMockFieldError({ path: "email" })];
		const exception = new ValidationException(errors);
		expect(exception.message).toBe(
			"Request validation failed: 2 fields have invalid values.",
		);
	});

	it("embeds errors in the HTTP response body as details", () => {
		const errors = [getMockFieldError()];
		const exception = new ValidationException(errors);
		const response = exception.getResponse();
		expect(typeof response).toBe("object");
		expect(response).not.toBeNull();
		const body = response as Record<string, unknown>;
		expect(body["code"]).toBe(ERROR_CODES.VALIDATION_FAILED);
		expect(body["details"]).toBeDefined();
		expect((body["details"] as Record<string, unknown>)["errors"]).toHaveLength(1);
	});
});
