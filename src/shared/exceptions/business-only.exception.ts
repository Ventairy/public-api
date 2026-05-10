import { HttpStatus } from "@nestjs/common";
import { DomainException } from "./domain.exception";
import { ERROR_CODES } from "@shared/constants";

export class BusinessOnlyException extends DomainException {
	constructor() {
		super({
			domainCode: ERROR_CODES.BUSINESS_ONLY,
			message: "This resource is only available for business accounts. Please register as a business user.",
			statusCode: HttpStatus.FORBIDDEN,
		});
	}
}
