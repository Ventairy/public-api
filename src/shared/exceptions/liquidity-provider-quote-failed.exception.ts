import { HttpStatus } from "@nestjs/common";
import { DomainException } from "./domain.exception";
import { ERROR_CODES } from "@shared/constants";
import type { LiquidityProviderId } from "@shared/enums";

export class LiquidityProviderQuoteFailedException extends DomainException {
	constructor(params: { providerId: LiquidityProviderId; errorMessage: string }) {
		super({
			domainCode: ERROR_CODES.LIQUIDITY_PROVIDER_QUOTE_FAILED,
			message: `Liquidity provider "${params.providerId}" failed to provide a quote: ${params.errorMessage}`,
			statusCode: HttpStatus.BAD_GATEWAY,
			details: { providerId: params.providerId, errorMessage: params.errorMessage },
		});
	}
}
