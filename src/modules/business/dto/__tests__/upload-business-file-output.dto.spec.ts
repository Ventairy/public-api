import { describe, it, expect } from "vitest";
import { UploadBusinessFileOutputDto } from "../upload-business-file-output.dto";
import { type BusinessFileRow } from "@db/schema/business-files-table";
import { BusinessFileType } from "@shared/enums";

describe("UploadBusinessFileOutputDto", () => {
	it("should map from database row correctly", () => {
		const mockRow: BusinessFileRow = {
			id: "f-1",
			user_id: "u-1",
			file_name: "doc.pdf",
			file_size: 1024,
			mime_type: "application/pdf",
			file_type: BusinessFileType.PROOF_OF_ADDRESS,
			r2_key: "r2-key",
			created_at: "2026-05-01T00:00:00.000Z",
		};

		const result = UploadBusinessFileOutputDto.fromDatabaseRow(mockRow);

		expect(result.id).toBe("f-1");
		expect(result.fileName).toBe("doc.pdf");
		expect(result.fileSize).toBe(1024);
		expect(result.mimeType).toBe("application/pdf");
		expect(result.fileType).toBe(BusinessFileType.PROOF_OF_ADDRESS);
		expect(result.createdAt).toBe("2026-05-01T00:00:00.000Z");
	});
});
