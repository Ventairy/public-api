import { describe, it, expect } from "vitest";
import { HttpStatus } from "@nestjs/common";
import { ERROR_CODES } from "@shared/constants/error-codes";
import { FileTooLargeException } from "../file-too-large.exception";

describe("BusinessFileTooLargeException", () => {
	it("should have correct properties", () => {
		const exception = new FileTooLargeException({
			fileName: "test.png",
			fileSize: 1000,
			maxSize: 500,
		});
		expect(exception.domainCode).toBe(ERROR_CODES.FILE_TOO_LARGE);
		expect(exception.statusCode).toBe(HttpStatus.BAD_REQUEST);
		expect(exception.details).toEqual({
			fileName: "test.png",
			fileSize: 1000,
			maxSize: 500,
		});
	});
});
