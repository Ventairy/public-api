import { HttpStatus } from "@nestjs/common";
import { ERROR_CODES } from "@shared/constants/error-codes";
import { DomainException } from "./domain.exception";

export class SignerMismatchException extends DomainException {
	constructor({ expectedWalletAddress, actualWalletAddress }: { expectedWalletAddress: string; actualWalletAddress: string }) {
		super({
			domainCode: ERROR_CODES.SIGNER_MISMATCH,
			message: "The wallet address recovered from the signed message does not match the requested wallet address.",
			statusCode: HttpStatus.UNAUTHORIZED,
			details: {
				context: { expectedWalletAddress, actualWalletAddress },
				hint: "The SIWE message signer must match the wallet_address provided in the request.",
			},
		});
	}
}
