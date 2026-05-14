import { HttpStatus } from "@nestjs/common";
import { DomainException } from "./domain.exception";
import { ERROR_CODES } from "@shared/constants";

export class UserKycNotFoundException extends DomainException {
	constructor(userId: string) {
		super({
			domainCode: ERROR_CODES.KYC_NOT_FOUND,
			message: `KYC record not found for user "${userId}"`,
			statusCode: HttpStatus.NOT_FOUND,
			details: { userId },
		});
	}
}
