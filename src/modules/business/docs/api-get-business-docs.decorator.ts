import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse } from "@nestjs/swagger";
import { BusinessOutputDto } from "../dto/business-output.dto";

export function ApiGetBusinessDocs(): MethodDecorator & ClassDecorator {
	return applyDecorators(
		ApiOperation({
			summary: "Get business data for a user",
			description: "Retrieves the business data for a user, including business information and embedded file metadata.",
		}),
		ApiParam({ name: "user_id", description: "ID of the user who owns the business", format: "uuid" }),
		ApiResponse({
			status: HttpStatus.OK,
			description: "Business data retrieved successfully.",
			type: BusinessOutputDto,
		}),
		ApiResponse({
			status: HttpStatus.NOT_FOUND,
			description: "Business not found.",
		}),
	);
}
