import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { VerificationSubmissionOutputDto } from "../dto/verification-submission-output.dto";

export function ApiSubmitVerificationDocs(): MethodDecorator & ClassDecorator {
	return applyDecorators(
		ApiOperation({
			summary: "Submit verification for user",
			description:
				"Submits the verification data for verification. Changes the user's verification status to VERIFYING. " +
				"Submission is only allowed when status is PENDING and all required fields and files are present. " +
				"If requirements are not met, a 422 error is returned with details about what is missing. " +
				"Resubmission is not allowed when the status is APPROVED or REJECTED.",
		}),
		ApiResponse({
			status: HttpStatus.OK,
			description: "verification submitted successfully.",
			type: VerificationSubmissionOutputDto,
		}),
		ApiResponse({
			status: HttpStatus.FORBIDDEN,
			description: "verification submission is locked because the user's verification status is already APPROVED or REJECTED.",
		}),
		ApiResponse({
			status: HttpStatus.UNPROCESSABLE_ENTITY,
			description:
				"verification submission cannot proceed because required data or files are missing. " +
				"The response body includes a 'missing' object with 'fields' and 'files' arrays " +
				"detailing exactly which data paths and file types must be provided before submission is allowed.",
		}),
	);
}
