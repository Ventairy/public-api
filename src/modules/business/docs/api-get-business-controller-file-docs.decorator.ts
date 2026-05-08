import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiQuery, ApiParam, ApiProduces } from "@nestjs/swagger";
import { BusinessControllerFileType } from "@shared/constants";

export function ApiGetBusinessControllerFileDocs(): MethodDecorator & ClassDecorator {
	return applyDecorators(
		ApiOperation({
			summary: "Download a business controller file by user, controller, and file type",
			description:
				"Streams a business controller file from storage identified by user ID, controller ID, and file type. Returns the file with its original content type and filename.",
		}),
		ApiProduces("application/octet-stream", "application/pdf", "image/png", "image/jpeg"),
		ApiParam({ name: "user_id", description: "ID of the user who owns the business", format: "uuid" }),
		ApiParam({
			name: "controller_id",
			description: "ID of the business controller who has partial ownership of the business.",
			format: "uuid",
		}),
		ApiQuery({
			name: "file_type",
			description: "Type of business controller file to retrieve.",
			enum: BusinessControllerFileType,
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
			description: "Controller file not found.",
		}),
	);
}
