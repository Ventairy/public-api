import { HttpStatus } from "@nestjs/common";
import { DomainException } from "./domain.exception";
import { ERROR_CODES } from "@shared/constants";

export class UserVerificationNotFoundException extends DomainException {
	constructor(userId: string) {
		super({
			domainCode: ERROR_CODES.VERIFICATION_NOT_FOUND,
			message: `Verification record not found for user "${userId}"`,
			statusCode: HttpStatus.NOT_FOUND,
			details: { userId },
		});
	}
}