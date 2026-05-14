import { describe, it, expect } from "vitest";
import { BusinessFileType } from "@shared/enums";
import { MimeType } from "@shared/enums/mime-type";
import { BusinessFileTypeUtils } from "../business-file-type.utils";

describe("BusinessFileTypeUtils", () => {
	describe("allowedMimeTypes", () => {
		it("should return all allowed MIME types for PROOF_OF_ADDRESS", () => {
			const result = BusinessFileTypeUtils.allowedMimeTypes(BusinessFileType.PROOF_OF_ADDRESS);

			expect(result).toEqual([MimeType.PDF, MimeType.JPEG, MimeType.PNG, MimeType.HEIC, MimeType.WEBP, MimeType.AVIF]);
		});

		it("should return all allowed MIME types for INCORPORATION_DOCUMENT", () => {
			const result = BusinessFileTypeUtils.allowedMimeTypes(BusinessFileType.INCORPORATION_DOCUMENT);

			expect(result).toEqual([MimeType.PDF, MimeType.JPEG, MimeType.PNG, MimeType.HEIC, MimeType.WEBP, MimeType.AVIF]);
		});

		it("should return all allowed MIME types for PROOF_OF_OWNERSHIP", () => {
			const result = BusinessFileTypeUtils.allowedMimeTypes(BusinessFileType.PROOF_OF_OWNERSHIP);

			expect(result).toEqual([MimeType.PDF, MimeType.JPEG, MimeType.PNG, MimeType.HEIC, MimeType.WEBP, MimeType.AVIF]);
		});
	});
});
