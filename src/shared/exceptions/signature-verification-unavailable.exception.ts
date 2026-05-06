import { HttpStatus } from "@nestjs/common";
import { ERROR_CODES } from "@shared/constants/error-codes";
import { DomainException } from "./domain.exception";

export class SignatureVerificationUnavailableException extends DomainException {
	constructor() {
		super(
			ERROR_CODES.SIGNATURE_VERIFICATION_UNAVAILABLE,
			"Signature verification is currently unavailable due to a blockchain RPC failure.",
			HttpStatus.SERVICE_UNAVAILABLE,
			{
				hint: "The blockchain RPC nodes could not be reached. Retry the request after a short delay.",
			},
		);
	}
}
