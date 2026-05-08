import { describe, it, expect } from "vitest";
import { HttpStatus } from "@nestjs/common";
import { InvalidFileMimeTypeException } from "../invalid-file-mime-type.exception";
import { ERROR_CODES } from "@shared/constants";

describe("InvalidFileMimeTypeException", () => {
	const defaultParams = {
		fileName: "test.pdf",
		mimeType: "image/gif",
		allowedMimeTypes: ["image/jpeg", "image/png"],
		fileType: "IDENTIFICATION_FRONT",
	};

	it("should have correct domainCode", () => {
		const exception = new InvalidFileMimeTypeException(defaultParams);

		expect(exception.domainCode).toBe(ERROR_CODES.INVALID_FILE_MIME_TYPE);
	});

	it("should have HTTP status BAD_REQUEST", () => {
		const exception = new InvalidFileMimeTypeException(defaultParams);

		expect(exception.statusCode).toBe(HttpStatus.BAD_REQUEST);
	});

	it("should have descriptive message", () => {
		const exception = new InvalidFileMimeTypeException(defaultParams);

		expect(exception.message).toBe(
			'File "test.pdf" has unsupported MIME type "image/gif" for file type "IDENTIFICATION_FRONT". Allowed types: image/jpeg, image/png',
		);
	});

	it("should include details", () => {
		const exception = new InvalidFileMimeTypeException(defaultParams);

		expect(exception.details).toEqual({
			fileName: "test.pdf",
			mimeType: "image/gif",
			allowedMimeTypes: ["image/jpeg", "image/png"],
			fileType: "IDENTIFICATION_FRONT",
		});
	});
});
