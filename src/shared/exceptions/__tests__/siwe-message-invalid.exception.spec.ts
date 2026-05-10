import { describe, it, expect } from "vitest";
import { HttpStatus } from "@nestjs/common";
import { ERROR_CODES } from "@shared/constants/error-codes";
import { SiweMessageInvalidException } from "../siwe-message-invalid.exception";

describe("SiweMessageInvalidException", () => {
	it("should have correct properties", () => {
		const exception = new SiweMessageInvalidException("Invalid format");
		expect(exception.domainCode).toBe(ERROR_CODES.SIWE_MESSAGE_INVALID);
		expect(exception.statusCode).toBe(HttpStatus.BAD_REQUEST);
		expect(exception.message).toContain("Invalid format");
	});
});
