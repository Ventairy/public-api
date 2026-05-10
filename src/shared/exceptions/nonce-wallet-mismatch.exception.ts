import { HttpStatus } from "@nestjs/common";
import { ERROR_CODES } from "@shared/constants/error-codes";
import { DomainException } from "./domain.exception";

export class NonceWalletMismatchException extends DomainException {
	constructor({ requestedWalletAddress, nonceWalletAddress }: { requestedWalletAddress: string; nonceWalletAddress: string }) {
		super({
			domainCode: ERROR_CODES.NONCE_WALLET_MISMATCH,
			message: `The nonce was generated for a different wallet address. Requested: ${requestedWalletAddress}, Nonce belongs to: ${nonceWalletAddress}.`,
			statusCode: HttpStatus.BAD_REQUEST,
			details: {
				context: { requestedWalletAddress, nonceWalletAddress },
				hint: "Generate a new nonce for the wallet address you are trying to register.",
			},
		});
	}
}
