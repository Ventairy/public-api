import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiConsumes, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { UploadBusinessFileOutputDto } from "../dto/upload-business-file-output.dto";

export function ApiUploadBusinessFileDocs(): MethodDecorator & ClassDecorator {
	return applyDecorators(
		ApiOperation({
			summary: "Upload a business file",
			description:
				"Uploads a business file to business storage and saves its metadata. Files must not exceed 5MB. The file_type must be one of the allowed business file type categories.",
		}),
		ApiConsumes("multipart/form-data"),
		ApiResponse({
			status: HttpStatus.CREATED,
			description: "File uploaded successfully.",
			type: UploadBusinessFileOutputDto,
		}),
		ApiResponse({
			status: HttpStatus.BAD_REQUEST,
			description: "Invalid request: File too large, missing required fields, or invalid file type.",
		}),
	);
}
