import { HttpStatus } from "@nestjs/common";
import { ERROR_CODES } from "@shared/constants/error-codes";
import { DomainException } from "./domain.exception";
import type { FieldError } from "@shared/errors/error-response.types";

export class ValidationException extends DomainException {
	public readonly fieldErrors: FieldError[];

	constructor(fieldErrors: FieldError[]) {
		const errorCount = fieldErrors.length;
		const summary =
			errorCount === 1
				? "Request validation failed: 1 field has an invalid value."
				: `Request validation failed: ${errorCount} fields have invalid values.`;

		super(ERROR_CODES.VALIDATION_FAILED, summary, HttpStatus.BAD_REQUEST, { errors: fieldErrors });

		this.fieldErrors = fieldErrors;
	}
}
