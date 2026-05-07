import { HttpStatus } from "@nestjs/common";
import { ERROR_CODES } from "@shared/constants/error-codes";
import { DomainException } from "./domain.exception";

export class InvalidSiweSignatureException extends DomainException {
	constructor(walletAddress: string) {
		super({
			domainCode: ERROR_CODES.INVALID_SIGNATURE,
			message: "The provided signature is invalid for the given message and wallet address.",
			statusCode: HttpStatus.UNAUTHORIZED,
			details: {
				context: { walletAddress },
				hint: "The cryptographic signature does not correspond to the wallet address. Ensure the correct private key signed the exact SIWE message.",
			},
		});
	}
}
