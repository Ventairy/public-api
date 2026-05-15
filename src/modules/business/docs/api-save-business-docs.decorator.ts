import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { BusinessOutputDto } from "../dto/business-output.dto";

export function ApiSaveBusinessDocs(): MethodDecorator & ClassDecorator {
	return applyDecorators(
		ApiOperation({
			summary: "Save or update business data",
			description:
				"Saves or updates business data and controllers for the authenticated user. All fields are optional — send only the fields you want to update. Controllers are replaced entirely if provided. After KYC is approved, previously-set fields become immutable and cannot be changed; only fields that are currently unset can be updated.",
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
		ApiResponse({
			status: HttpStatus.CONFLICT,
			description: `One or more immutable business fields are being changed. Businesses with approved KYC can only update fields that are currently unset. Previously-set fields cannot be modified.`,
		}),
	);
}
