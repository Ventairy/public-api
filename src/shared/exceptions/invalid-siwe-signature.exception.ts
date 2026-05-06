import { HttpStatus } from "@nestjs/common";
import { ERROR_CODES } from "@shared/constants/error-codes";
import { DomainException } from "./domain.exception";

export class InvalidSiweSignatureException extends DomainException {
	constructor(walletAddress: string) {
		super(
			ERROR_CODES.INVALID_SIGNATURE,
			"The provided signature is invalid for the given message and wallet address.",
			HttpStatus.UNAUTHORIZED,
			{
				context: { walletAddress },
				hint: "The cryptographic signature does not correspond to the wallet address. Ensure the correct private key signed the exact SIWE message.",
			},
		);
	}
}
