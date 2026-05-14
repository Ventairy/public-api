import { HttpStatus } from "@nestjs/common";
import { DomainException } from "./domain.exception";
import { ERROR_CODES } from "@shared/constants";
import type { LiquidityProviderId } from "@shared/enums";

export class LiquidityProviderApiException extends DomainException {
	constructor(params: { liquidityProviderId: LiquidityProviderId; errorMessage: string }) {
		super({
			domainCode: ERROR_CODES.LIQUIDITY_PROVIDER_API_ERROR,
			message: `Liquidity provider "${params.liquidityProviderId}" API error: ${params.errorMessage}`,
			statusCode: HttpStatus.BAD_GATEWAY,
			details: {
				liquidityProviderId: params.liquidityProviderId,
				errorMessage: params.errorMessage,
			},
		});
	}
}
