import { HttpStatus } from "@nestjs/common";
import { DomainException } from "./domain.exception";
import { ERROR_CODES } from "@shared/constants";

export class SessionExpiredException extends DomainException {
	constructor() {
		super({
			domainCode: ERROR_CODES.SESSION_EXPIRED,
			message: "Session has expired",
			statusCode: HttpStatus.UNAUTHORIZED,
		});
	}
}
