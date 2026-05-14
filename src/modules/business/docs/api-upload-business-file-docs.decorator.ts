import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiBody, ApiConsumes, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { BusinessFileType } from "@shared/enums";
import { UploadBusinessFileOutputDto } from "../dto/upload-business-file-output.dto";

export function ApiUploadBusinessFileDocs(): MethodDecorator & ClassDecorator {
	return applyDecorators(
		ApiOperation({
			summary: "Upload a business file",
			description:
				"Uploads a business file to business storage for the authenticated user and saves its metadata. Files must not exceed 5MB. The file_type must be one of the allowed business file type categories.",
		}),
		ApiConsumes("multipart/form-data"),
		ApiBody({
			schema: {
				type: "object",
				properties: {
					file: {
						type: "string",
						format: "binary",
						description: "The business file to upload.",
					},
					file_type: {
						type: "string",
						enum: Object.values(BusinessFileType),
						description: "Type category of the business file being uploaded.",
					},
				},
				required: ["file", "file_type"],
			},
		}),
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
