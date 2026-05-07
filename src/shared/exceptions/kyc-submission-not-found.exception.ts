import { HttpStatus } from "@nestjs/common";
import { DomainException } from "./domain.exception";
import { ERROR_CODES } from "@shared/constants";

export class KycSubmissionNotFoundException extends DomainException {
	constructor(userId: string) {
		super({
			domainCode: ERROR_CODES.KYC_SUBMISSION_NOT_FOUND,
			message: `No KYC submission found for user "${userId}"`,
			statusCode: HttpStatus.NOT_FOUND,
			details: { userId },
		});
	}
}
