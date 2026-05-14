import { HttpStatus } from "@nestjs/common";
import { ERROR_CODES } from "@shared/constants/error-codes";
import { DomainException } from "./domain.exception";

export class NonceChainIdMismatchException extends DomainException {
	constructor({ nonceChainId, messageChainId }: { nonceChainId: number; messageChainId: number }) {
		super({
			domainCode: ERROR_CODES.NONCE_CHAIN_ID_MISMATCH,
			message: `The nonce was created for chain ${nonceChainId} but the SIWE message was signed for chain ${messageChainId}.`,
			statusCode: HttpStatus.BAD_REQUEST,
			details: {
				context: { nonceChainId, messageChainId },
				hint: "Generate a new nonce for the correct chain ID and sign a new SIWE message with the matching chain ID.",
			},
		});
	}
}
