import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { KycSubmissionOutputDto } from "../dto/kyc-submission-output.dto";

export function ApiSubmitKycDocs(): MethodDecorator & ClassDecorator {
	return applyDecorators(
		ApiOperation({
			summary: "Submit KYC for verification",
			description:
				"Submits the KYC data for verification. Changes the user's KYC status to VERIFYING. " +
				"Submission is only allowed when status is PENDING and all required fields and files are present. " +
				"If requirements are not met, a 422 error is returned with details about what is missing. " +
				"Resubmission is not allowed when the status is APPROVED or REJECTED.",
		}),
		ApiResponse({
			status: HttpStatus.OK,
			description: "KYC submitted successfully for verification.",
			type: KycSubmissionOutputDto,
		}),
		ApiResponse({
			status: HttpStatus.FORBIDDEN,
			description: "KYC submission is locked because the user's KYC status is already APPROVED or REJECTED.",
		}),
		ApiResponse({
			status: HttpStatus.UNPROCESSABLE_ENTITY,
			description:
				"KYC submission cannot proceed because required data or files are missing. " +
				"The response body includes a 'missing' object with 'fields' and 'files' arrays " +
				"detailing exactly which data paths and file types must be provided before submission is allowed.",
		}),
	);
}
