import { HttpStatus } from "@nestjs/common";
import { ERROR_CODES } from "@shared/constants/error-codes";
import { DomainException } from "./domain.exception";

export class SignerMismatchException extends DomainException {
	constructor(expectedWalletAddress: string, actualWalletAddress: string) {
		super(
			ERROR_CODES.SIGNER_MISMATCH,
			"The wallet address recovered from the signed message does not match the requested wallet address.",
			HttpStatus.UNAUTHORIZED,
			{
				context: { expectedWalletAddress, actualWalletAddress },
				hint: "The SIWE message signer must match the wallet_address provided in the request.",
			},
		);
	}
}
