import { HttpStatus } from "@nestjs/common";
import { DomainException } from "./domain.exception";
import { ERROR_CODES } from "@shared/constants";

export class BusinessControllerFileNotFoundException extends DomainException {
	constructor(userId: string, controllerId: string) {
		super({
			domainCode: ERROR_CODES.BUSINESS_CONTROLLER_FILE_NOT_FOUND,
			message: `Controller file for user "${userId}" controller "${controllerId}" not found`,
			statusCode: HttpStatus.NOT_FOUND,
			details: { userId, controllerId },
		});
	}
}
