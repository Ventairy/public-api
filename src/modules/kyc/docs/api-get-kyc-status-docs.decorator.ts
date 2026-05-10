import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { KycStatusOutputDto } from "../dto/kyc-status-output.dto";

export function ApiGetKycStatusDocs(): MethodDecorator & ClassDecorator {
	return applyDecorators(
		ApiOperation({
			summary: "Get KYC status for a user",
			description: "Retrieves the current KYC status for a user, including the internal processing status and submission information.",
		}),
		ApiResponse({
			status: HttpStatus.OK,
			description: "KYC status retrieved successfully.",
			type: KycStatusOutputDto,
		}),
	);
}
