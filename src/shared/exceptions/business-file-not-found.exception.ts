import { HttpStatus } from "@nestjs/common";
import { DomainException } from "./domain.exception";
import { ERROR_CODES } from "@shared/constants";

export class BusinessFileNotFoundException extends DomainException {
	constructor(userId: string, fileType: string) {
		super({
			domainCode: ERROR_CODES.BUSINESS_FILE_NOT_FOUND,
			message: `Business file for user "${userId}" with type "${fileType}" not found`,
			statusCode: HttpStatus.NOT_FOUND,
			details: { userId, fileType },
		});
	}
}
