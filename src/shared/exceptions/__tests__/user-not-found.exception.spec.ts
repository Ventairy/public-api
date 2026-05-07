import { describe, it, expect } from "vitest";
import { HttpStatus } from "@nestjs/common";
import { ERROR_CODES } from "@shared/constants/error-codes";
import { UserNotFoundException } from "../user-not-found.exception";

describe("UserNotFoundException", () => {
	it("should have correct properties", () => {
		const exception = new UserNotFoundException("user-123");
		expect(exception.domainCode).toBe(ERROR_CODES.USER_NOT_FOUND);
		expect(exception.statusCode).toBe(HttpStatus.NOT_FOUND);
		expect(exception.details?.["userId"]).toBe("user-123");
	});
});
