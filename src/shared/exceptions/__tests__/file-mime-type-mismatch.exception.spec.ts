import { describe, it, expect } from "vitest";
import { HttpStatus } from "@nestjs/common";
import { FileMimeTypeMismatchException } from "../file-mime-type-mismatch.exception";
import { ERROR_CODES } from "@shared/constants";

describe("FileMimeTypeMismatchException", () => {
	const defaultParams = {
		fileName: "document.txt",
		contentType: "text/plain",
		detectedMimeType: "application/pdf",
		allowedMimeTypes: ["application/pdf", "image/jpeg"],
		fileType: "PROOF_OF_ADDRESS",
	};

	it("should have correct domainCode", () => {
		const exception = new FileMimeTypeMismatchException(defaultParams);

		expect(exception.domainCode).toBe(ERROR_CODES.FILE_MIME_TYPE_MISMATCH);
	});

	it("should have HTTP status BAD_REQUEST", () => {
		const exception = new FileMimeTypeMismatchException(defaultParams);

		expect(exception.statusCode).toBe(HttpStatus.BAD_REQUEST);
	});

	it("should have descriptive message", () => {
		const exception = new FileMimeTypeMismatchException(defaultParams);

		expect(exception.message).toBe(
			'File "document.txt" Content-Type "text/plain" does not match actual file content "application/pdf"',
		);
	});

	it("should include details with contentType and detectedMimeType", () => {
		const exception = new FileMimeTypeMismatchException(defaultParams);

		expect(exception.details).toEqual({
			fileName: "document.txt",
			contentType: "text/plain",
			detectedMimeType: "application/pdf",
			allowedMimeTypes: ["application/pdf", "image/jpeg"],
			fileType: "PROOF_OF_ADDRESS",
		});
	});
});
