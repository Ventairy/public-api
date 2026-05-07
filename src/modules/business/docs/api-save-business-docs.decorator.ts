import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { BusinessOutputDto } from "../dto/business-output.dto";

export function ApiSaveBusinessDocs(): MethodDecorator & ClassDecorator {
	return applyDecorators(
		ApiOperation({
			summary: "Save or update business data",
			description: "Saves or updates business data and controllers. All fields are optional — send only the fields you want to update. Controllers are replaced entirely if provided.",
		}),
		ApiResponse({
			status: HttpStatus.OK,
			description: "Business data saved successfully.",
			type: BusinessOutputDto,
		}),
		ApiResponse({
			status: HttpStatus.NOT_FOUND,
			description: "User or business not found.",
		}),
		ApiResponse({
			status: HttpStatus.BAD_REQUEST,
			description: "Validation failed (field errors).",
		}),
	);
}
