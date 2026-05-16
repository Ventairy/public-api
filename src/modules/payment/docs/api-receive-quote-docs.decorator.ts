import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ReceiveQuoteOutputDto } from "../dto/receive-quote-output.dto";

export function ApiReceiveQuoteDocs(): MethodDecorator & ClassDecorator {
	return applyDecorators(
		ApiOperation({
			summary: "Request a receive quote",
			description: "Requests real-time quotes from all active liquidity providers for the authenticated user. Returns quotes sorted by best rate (highest output amount first).",
		}),
		ApiResponse({
			status: HttpStatus.OK,
			description: "List of quotes from available liquidity providers, sorted by best rate. Each quote contains the source amount, target amount, currencies, and expiry time.",
			type: ReceiveQuoteOutputDto,
		}),
		ApiResponse({
			status: HttpStatus.FORBIDDEN,
			description: "Verification approval is required to access this resource. ",
		}),
		ApiResponse({
			status: HttpStatus.UNPROCESSABLE_ENTITY,
			description: "User has no active liquidity providers.",
		}),
	);
}
