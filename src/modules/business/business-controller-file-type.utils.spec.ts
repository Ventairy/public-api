import { describe, it, expect } from "vitest";
import { BusinessControllerFileType } from "@shared/enums";
import { MimeType } from "@shared/enums/mime-type";
import { BusinessControllerFileTypeUtils } from "./business-controller-file-type.utils";

describe("BusinessControllerFileTypeUtils", () => {
	describe("allowedMimeTypes", () => {
		it("should return allowed MIME types for IDENTIFICATION_FRONT (no PDF)", () => {
			const result = BusinessControllerFileTypeUtils.allowedMimeTypes(
				BusinessControllerFileType.IDENTIFICATION_FRONT,
			);

			expect(result).toEqual([MimeType.JPEG, MimeType.PNG, MimeType.HEIC, MimeType.WEBP, MimeType.AVIF]);
			expect(result).not.toContain(MimeType.PDF);
		});

		it("should return allowed MIME types for IDENTIFICATION_BACK (no PDF)", () => {
			const result = BusinessControllerFileTypeUtils.allowedMimeTypes(
				BusinessControllerFileType.IDENTIFICATION_BACK,
			);

			expect(result).toEqual([MimeType.JPEG, MimeType.PNG, MimeType.HEIC, MimeType.WEBP, MimeType.AVIF]);
			expect(result).not.toContain(MimeType.PDF);
		});

		it("should return all allowed MIME types for PROOF_OF_ADDRESS (includes PDF)", () => {
			const result = BusinessControllerFileTypeUtils.allowedMimeTypes(
				BusinessControllerFileType.PROOF_OF_ADDRESS,
			);

			expect(result).toEqual([MimeType.PDF, MimeType.JPEG, MimeType.PNG, MimeType.HEIC, MimeType.WEBP, MimeType.AVIF]);
		});
	});


});
