import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiConsumes, ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { UploadBusinessControllerFileOutputDto } from "../dto/upload-business-controller-file-output.dto";

export function ApiUploadBusinessControllerFileDocs(): MethodDecorator & ClassDecorator {
	return applyDecorators(
		ApiOperation({
			summary: "Upload a controller file",
			description: "Uploads a file for a business controller to Cloudflare R2 storage and saves its metadata. Files must not exceed 5MB. The file_type must be one of the allowed controller file type categories.",
		}),
		ApiConsumes("multipart/form-data"),
		ApiParam({ name: "userId", description: "ID of the user who owns the business", format: "uuid" }),
		ApiParam({ name: "controllerId", description: "ID of the controller", format: "uuid" }),
		ApiResponse({
			status: HttpStatus.CREATED,
			description: "File uploaded successfully.",
			type: UploadBusinessControllerFileOutputDto,
		}),
		ApiResponse({
			status: HttpStatus.BAD_REQUEST,
			description: "Invalid request: File too large, missing required fields, or invalid file type.",
		}),
	);
}
