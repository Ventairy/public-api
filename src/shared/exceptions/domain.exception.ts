import { HttpException, HttpStatus } from "@nestjs/common";
import { ErrorCode } from "../constants";

export abstract class DomainException extends HttpException {
	public readonly domainCode: ErrorCode;
	public readonly statusCode: HttpStatus;
	public readonly details?: Record<string, unknown>;

	constructor({
		domainCode,
		message,
		statusCode = HttpStatus.BAD_REQUEST,
		details,
	}: {
		domainCode: ErrorCode;
		message: string;
		statusCode?: HttpStatus;
		details?: Record<string, unknown>;
	}) {
		super({ statusCode, code: domainCode, message, details }, statusCode);
		this.message = message;
		this.domainCode = domainCode;
		this.statusCode = statusCode;
		this.details = details;
		this.name = this.constructor.name;
	}
}
