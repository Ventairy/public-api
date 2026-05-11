import { HttpStatus } from "@nestjs/common";
import { DomainException } from "./domain.exception";
import { ERROR_CODES } from "@shared/constants";

export class RateLimitException extends DomainException {
	constructor({ retryAfterSeconds }: { retryAfterSeconds: number } = { retryAfterSeconds: 60 }) {
		super({
			domainCode: ERROR_CODES.RATE_LIMITED,
			message: `Too many requests. Please try again in ${retryAfterSeconds} second${retryAfterSeconds === 1 ? "" : "s"}.`,
			statusCode: HttpStatus.TOO_MANY_REQUESTS,
			details: { retryAfterSeconds },
		});
	}
}
