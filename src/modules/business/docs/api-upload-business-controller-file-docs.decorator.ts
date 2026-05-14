import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { BusinessControllerFileType } from "@shared/enums";
import { UploadBusinessControllerFileOutputDto } from "../dto/upload-business-controller-file-output.dto";

export function ApiUploadBusinessControllerFileDocs(): MethodDecorator & ClassDecorator {
	return applyDecorators(
		ApiOperation({
			summary: "Upload a controller file",
			description:
				"Uploads a file for a business controller to Cloudflare R2 storage and saves its metadata. Files must not exceed 5MB. The file_type must be one of the allowed controller file type categories.",
		}),
		ApiConsumes("multipart/form-data"),
		ApiBody({
			schema: {
				type: "object",
				properties: {
					file: {
						type: "string",
						format: "binary",
						description: "The controller file to upload.",
					},
					file_type: {
						type: "string",
						enum: Object.values(BusinessControllerFileType),
						description: "Type category of the controller file being uploaded.",
					},
				},
				required: ["file", "file_type"],
			},
		}),
		ApiParam({ name: "controller_id", description: "ID of the controller", format: "uuid" }),
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
