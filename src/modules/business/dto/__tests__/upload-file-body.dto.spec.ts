import { describe, it, expect } from "vitest";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { BusinessFileType } from "@shared/enums";
import { UploadBusinessFileBodyDto } from "../upload-business-file-body.dto";

describe("UploadFileBodyDto", () => {
	it("should validate a correct dto", async () => {
		const input = {
			file_type: BusinessFileType.INCORPORATION_DOCUMENT,
		};

		const dto = plainToInstance(UploadBusinessFileBodyDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBe(0);
	});

	it("should fail validation if fileType is missing", async () => {
		const input = {};

		const dto = plainToInstance(UploadBusinessFileBodyDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBeGreaterThan(0);
		expect(errors[0]!.property).toBe("fileType");
	});

	it("should fail validation if fileType is invalid", async () => {
		const input = {
			fileType: "INVALID_TYPE",
		};

		const dto = plainToInstance(UploadBusinessFileBodyDto, input);
		const errors = await validate(dto);
		expect(errors.length).toBeGreaterThan(0);
		expect(errors[0]!.property).toBe("fileType");
	});
});
