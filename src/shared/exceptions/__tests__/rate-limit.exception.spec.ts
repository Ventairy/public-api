import { describe, it, expect } from "vitest";
import { HttpStatus } from "@nestjs/common";
import { ERROR_CODES } from "@shared/constants/error-codes";
import { RateLimitException } from "../rate-limit.exception";

describe("RateLimitException", () => {
	it("should have correct properties with default retryAfter", () => {
		const exception = new RateLimitException();
		expect(exception.domainCode).toBe(ERROR_CODES.RATE_LIMITED);
		expect(exception.statusCode).toBe(HttpStatus.TOO_MANY_REQUESTS);
		expect(exception.details).toEqual({ retryAfterSeconds: 60 });
		expect(exception.message).toBe("Too many requests. Please try again in 60 seconds.");
	});

	it("should include retryAfterSeconds in details and message", () => {
		const exception = new RateLimitException({ retryAfterSeconds: 30 });
		expect(exception.details).toEqual({ retryAfterSeconds: 30 });
		expect(exception.message).toBe("Too many requests. Please try again in 30 seconds.");
	});

	it("should handle singular retryAfterSeconds", () => {
		const exception = new RateLimitException({ retryAfterSeconds: 1 });
		expect(exception.message).toBe("Too many requests. Please try again in 1 second.");
	});
});
