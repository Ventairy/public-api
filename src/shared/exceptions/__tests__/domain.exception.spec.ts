import { describe, it, expect } from "vitest";
import { HttpStatus } from "@nestjs/common";
import { ERROR_CODES } from "@shared/constants/error-codes";
import { DomainException } from "../domain.exception";

describe("DomainException", () => {
	class TestException extends DomainException {
		constructor() {
			super({
				domainCode: ERROR_CODES.BAD_REQUEST,
				message: "Test message",
				statusCode: HttpStatus.BAD_REQUEST,
				details: { foo: "bar" },
			});
		}
	}

	it("should correctly initialize with provided values", () => {
		const exception = new TestException();
		expect(exception.domainCode).toBe(ERROR_CODES.BAD_REQUEST);
		expect(exception.statusCode).toBe(HttpStatus.BAD_REQUEST);
		expect(exception.message).toBe("Test message");
		expect(exception.details).toEqual({ foo: "bar" });
		expect(exception.name).toBe("TestException");
	});

	it("should work without details", () => {
		class NoDetailsException extends DomainException {
			constructor() {
				super({
					domainCode: ERROR_CODES.BAD_REQUEST,
					message: "No details",
					statusCode: HttpStatus.BAD_REQUEST,
				});
			}
		}
		const exception = new NoDetailsException();
		expect(exception.details).toBeUndefined();
		const response = exception.getResponse() as any;
		expect(response.details).toBeUndefined();
	});

	it("should return the correct response object", () => {
		const exception = new TestException();
		const response = exception.getResponse() as any;
		expect(response.code).toBe(ERROR_CODES.BAD_REQUEST);
		expect(response.message).toBe("Test message");
		expect(response.statusCode).toBe(HttpStatus.BAD_REQUEST);
		expect(response.details).toEqual({ foo: "bar" });
	});
});
