import { HttpStatus } from "@nestjs/common";
import { DomainException } from "./domain.exception";
import { ERROR_CODES } from "@shared/constants";

export class BusinessFieldImmutableException extends DomainException {
	constructor() {
		super({
			domainCode: ERROR_CODES.BUSINESS_FIELD_IMMUTABLE,
			message:
				"Cannot modify business fields that have already been set. Only fields that are currently unset can be updated.",
			statusCode: HttpStatus.CONFLICT,
		});
	}
}
