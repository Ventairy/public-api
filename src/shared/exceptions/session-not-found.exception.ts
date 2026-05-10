import { HttpStatus } from "@nestjs/common";
import { DomainException } from "./domain.exception";
import { ERROR_CODES } from "@shared/constants";

export class SessionNotFoundException extends DomainException {
	constructor(sessionId: string) {
		super({
			domainCode: ERROR_CODES.SESSION_NOT_FOUND,
			message: `Session "${sessionId}" not found`,
			statusCode: HttpStatus.NOT_FOUND,
			details: { sessionId },
		});
	}
}
