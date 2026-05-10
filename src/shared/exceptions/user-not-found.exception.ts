import { HttpStatus } from "@nestjs/common";
import { DomainException } from "./domain.exception";
import { ERROR_CODES } from "@shared/constants";

export class UserNotFoundException extends DomainException {
	constructor(userId: string) {
		super({
			domainCode: ERROR_CODES.USER_NOT_FOUND,
			message: `User "${userId}" not found`,
			statusCode: HttpStatus.NOT_FOUND,
			details: { userId },
		});
	}
}
