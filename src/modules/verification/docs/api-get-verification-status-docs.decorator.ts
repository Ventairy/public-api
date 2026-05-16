import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { VerificationStatusOutputDto } from "../dto/verification-status-output.dto";

export function ApiGetVerificationStatusDocs(): MethodDecorator & ClassDecorator {
	return applyDecorators(
		ApiOperation({
			summary: "Get verification status for a user",
			description:
				"Retrieves the current verification status for a user, including the internal processing status, submission information, and a object listing what data fields and files are still needed before verification can be submitted. ",
		}),
		ApiResponse({
			status: HttpStatus.OK,
			description:
				"verification status retrieved successfully. Includes ``can_submit`` and ``missing`` (fields and files that still need to be provided in order to submit verification).",
			type: VerificationStatusOutputDto,
		}),
	);
}
