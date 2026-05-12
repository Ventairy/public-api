import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { KycStatusOutputDto } from "../dto/kyc-status-output.dto";

export function ApiGetKycStatusDocs(): MethodDecorator & ClassDecorator {
	return applyDecorators(
		ApiOperation({
			summary: "Get KYC status for a user",
			description:
				"Retrieves the current KYC status for a user, including the internal processing status, submission information, and a object listing what data fields and files are still needed before KYC can be submitted. ",
		}),
		ApiResponse({
			status: HttpStatus.OK,
			description:
				"KYC status retrieved successfully. Includes ``can_submit_kyc`` and ``missing`` (fields and files that still need to be provided in order to submit KYC).",
			type: KycStatusOutputDto,
		}),
	);
}
