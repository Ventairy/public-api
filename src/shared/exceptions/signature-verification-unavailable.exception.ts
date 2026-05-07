import { HttpStatus } from "@nestjs/common";
import { ERROR_CODES } from "@shared/constants/error-codes";
import { DomainException } from "./domain.exception";

export class SignatureVerificationUnavailableException extends DomainException {
	constructor() {
		super({
			domainCode: ERROR_CODES.SIGNATURE_VERIFICATION_UNAVAILABLE,
			message: "Signature verification is currently unavailable due to a blockchain RPC failure.",
			statusCode: HttpStatus.SERVICE_UNAVAILABLE,
			details: {
				hint: "The blockchain RPC nodes could not be reached. Retry the request after a short delay.",
			},
		});
	}
}
