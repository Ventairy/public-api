import { HttpStatus } from "@nestjs/common";
import { ERROR_CODES } from "@shared/constants/error-codes";
import { DomainException } from "./domain.exception";

export class NonceExpiredException extends DomainException {
	constructor({ nonce, ttlSeconds }: { nonce: string; ttlSeconds: number }) {
		const minutes = Math.floor(ttlSeconds / 60);
		const timeString = minutes > 0 ? `${minutes} minute${minutes === 1 ? "" : "s"}` : `${ttlSeconds} seconds`;

		super({
			domainCode: ERROR_CODES.NONCE_EXPIRED,
			message: "The provided nonce has expired.",
			statusCode: HttpStatus.UNAUTHORIZED,
			details: {
				context: { nonce, ttlSeconds },
				hint: `Nonces expire after ${timeString}. Request a new nonce and sign it promptly.`,
			},
		});
	}
}
