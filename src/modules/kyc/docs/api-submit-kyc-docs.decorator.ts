import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { KycSubmissionOutputDto } from "../dto/kyc-submission-output.dto";

export function ApiSubmitKycDocs(): MethodDecorator & ClassDecorator {
	return applyDecorators(
		ApiOperation({
			summary: "Submit KYC for verification",
			description:
				"Submits the KYC data for verification. Changes the user's KYC status to VERIFYING. Resubmission is not allowed when the status is APPROVED or REJECTED.",
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
	);
}
