import { HttpStatus } from "@nestjs/common";
import { ERROR_CODES } from "@shared/constants/error-codes";
import { DomainException } from "./domain.exception";

export class SiweMessageInvalidException extends DomainException {
	constructor(reason: string) {
		super({
			domainCode: ERROR_CODES.SIWE_MESSAGE_INVALID,
			message: `The SIWE message is invalid: ${reason}`,
			statusCode: HttpStatus.BAD_REQUEST,
			details: {
				hint: "Ensure the SIWE message conforms to ERC-4361 and matches the server-expected domain, URI, chain ID, and nonce.",
			},
		});
	}
}
