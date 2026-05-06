import { HttpStatus } from "@nestjs/common";
import { ERROR_CODES } from "@shared/constants/error-codes";
import { DomainException } from "./domain.exception";

export class NonceNotFoundException extends DomainException {
	constructor(nonce: string) {
		super(
			ERROR_CODES.NONCE_NOT_FOUND,
			"The provided nonce does not exist or has already been consumed.",
			HttpStatus.NOT_FOUND,
			{
				context: { nonce },
				hint: "Request a new nonce before attempting user creation. Each nonce is single-use.",
			},
		);
	}
}
