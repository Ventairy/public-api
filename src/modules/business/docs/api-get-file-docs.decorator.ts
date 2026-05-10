import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiQuery, ApiProduces } from "@nestjs/swagger";
import { BusinessFileType } from "@shared/constants";

export function ApiGetFileDocs(): MethodDecorator & ClassDecorator {
	return applyDecorators(
		ApiOperation({
			summary: "Download a business file by file type",
			description:
				"Streams a business file from Cloudflare R2 storage for the authenticated user identified by file type. Returns the file with its original content type and filename.",
		}),
		ApiProduces("application/octet-stream", "application/pdf", "image/png", "image/jpeg"),
		ApiQuery({
			name: "file_type",
			description: "Type of business file to retrieve",
			enum: BusinessFileType,
		}),
		ApiResponse({
			status: HttpStatus.OK,
			description: "File stream.",
			schema: {
				type: "string",
				format: "binary",
			},
		}),
		ApiResponse({
			status: HttpStatus.NOT_FOUND,
			description: "File not found.",
		}),
	);
}
