import { HttpStatus } from "@nestjs/common";
import { DomainException } from "./domain.exception";
import { ERROR_CODES } from "@shared/constants";
import { VerificationStatus } from "@shared/enums";

export class VerificationStatusNotAllowedException extends DomainException {
	constructor({ verificationStatus }: { verificationStatus: VerificationStatus }) {
		super({
			domainCode: ERROR_CODES.VERIFICATION_STATUS_NOT_ALLOWED,
			message: `Your current verification status (${verificationStatus}) does not allow access to this resource.`,
			statusCode: HttpStatus.FORBIDDEN,
			details: { verificationStatus },
		});
	}
}
