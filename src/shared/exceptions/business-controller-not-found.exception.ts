import { HttpStatus } from "@nestjs/common";
import { DomainException } from "./domain.exception";
import { ERROR_CODES } from "@shared/constants";

export class BusinessControllerNotFoundException extends DomainException {
	constructor(userId: string, controllerId: string) {
		super({
			domainCode: ERROR_CODES.BUSINESS_CONTROLLER_NOT_FOUND,
			message: `Controller "${controllerId}" not found for user "${userId}"`,
			statusCode: HttpStatus.NOT_FOUND,
			details: { userId, controllerId },
		});
	}
}
