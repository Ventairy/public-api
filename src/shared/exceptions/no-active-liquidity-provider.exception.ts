import { HttpStatus } from "@nestjs/common";
import { DomainException } from "./domain.exception";
import { ERROR_CODES } from "@shared/constants";

export class NoActiveLiquidityProviderException extends DomainException {
	constructor(userId: string) {
		super({
			domainCode: ERROR_CODES.NO_ACTIVE_LIQUIDITY_PROVIDER,
			message: `User "${userId}" has no active liquidity providers to process payments.`,
			statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
			details: { userId },
		});
	}
}
