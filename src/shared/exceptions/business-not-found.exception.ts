import { HttpStatus } from "@nestjs/common";
import { DomainException } from "./domain.exception";
import { ERROR_CODES } from "@shared/constants";

export class BusinessNotFoundException extends DomainException {
	constructor(userId: string) {
		super({
			domainCode: ERROR_CODES.BUSINESS_NOT_FOUND,
			message: `No business found for user "${userId}"`,
			statusCode: HttpStatus.NOT_FOUND,
			details: { userId },
		});
	}
}
