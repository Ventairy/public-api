import { describe, it, expect } from "vitest";
import { UploadBusinessControllerFileOutputDto } from "../upload-business-controller-file-output.dto";
import { type BusinessControllerFileRow } from "@db/schema/business-controller-files-table";
import { BusinessControllerFileType } from "@shared/enums";

describe("UploadBusinessControllerFileOutputDto", () => {
	it("should map from database row correctly", () => {
		const mockRow: BusinessControllerFileRow = {
			id: "cf-1",
			controller_id: "c-1",
			user_id: "u-1",
			file_name: "passport.jpg",
			file_size: 2048,
			mime_type: "image/jpeg",
			file_type: BusinessControllerFileType.IDENTIFICATION_FRONT,
			r2_key: "r2-key-cf",
			created_at: "2026-05-01T00:00:00.000Z",
		};

		const result = UploadBusinessControllerFileOutputDto.fromDatabaseRow(mockRow);

		expect(result.id).toBe("cf-1");
		expect(result.fileName).toBe("passport.jpg");
		expect(result.fileSize).toBe(2048);
		expect(result.mimeType).toBe("image/jpeg");
		expect(result.fileType).toBe(BusinessControllerFileType.IDENTIFICATION_FRONT);
		expect(result.createdAt).toBe("2026-05-01T00:00:00.000Z");
	});
});
