import { HttpException, HttpStatus } from "@nestjs/common";
import { ErrorCode } from "../constants";

export abstract class DomainException extends HttpException {
	constructor(
		public readonly domainCode: ErrorCode,
		message: string,
		statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
		public readonly details?: Record<string, unknown>,
	) {
		super({ statusCode, code: domainCode, message, details }, statusCode);
	}
}
