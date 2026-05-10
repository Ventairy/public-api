import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger, Injectable } from "@nestjs/common";
import type { Response, Request } from "express";
import { ClsService } from "nestjs-cls";

import { DomainException } from "@shared/exceptions/domain.exception";
import { ValidationException } from "@shared/exceptions/validation.exception";
import { mapHttpStatusToErrorCode } from "@shared/constants/error-codes";
import type { ErrorResponse, ErrorDetails, FieldError } from "@shared/errors/error-response.types";

@Catch()
@Injectable()
export class AllExceptionsFilter implements ExceptionFilter {
	private readonly logger = new Logger("AllExceptionsFilter");

	constructor(private readonly clsService: ClsService) {}

	catch(exception: unknown, host: ArgumentsHost): void {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();

		const statusCode = this.resolveStatusCode(exception);
		const requestId = this.clsService.getId() ?? "unknown";
		const path = request.url;
		const method = request.method;

		const errorResponse = this.buildErrorResponse(exception, statusCode, path, method, requestId);

		if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) this.logServerError(exception, request, requestId, statusCode);

		response.setHeader("X-Request-Id", requestId);
		response.status(statusCode).json(errorResponse);
	}

	private resolveStatusCode(exception: unknown): number {
		if (exception instanceof HttpException) return exception.getStatus();

		return HttpStatus.INTERNAL_SERVER_ERROR;
	}

	private buildErrorResponse(
		exception: unknown,
		statusCode: number,
		path: string,
		method: string,
		requestId: string,
	): ErrorResponse {
		const base: Omit<ErrorResponse, "details"> = {
			statusCode,
			code: this.deriveErrorCode(exception, statusCode),
			message: this.resolveMessage(exception, statusCode),
			requestId,
			timestamp: new Date().toISOString(),
			path,
			method,
		};

		if (exception instanceof ValidationException) {
			return {
				...base,
				details: {
					errors: exception.fieldErrors,
				},
			};
		}

		if (exception instanceof DomainException) {
			const details = this.extractDomainDetails(exception);
			return {
				...base,
				details,
			};
		}

		if (exception instanceof HttpException) {
			const details = this.extractHttpExceptionDetails(exception);
			return {
				...base,
				details,
			};
		}

		return {
			...base,
			details: this.buildInternalErrorDetails(requestId),
		};
	}

	private deriveErrorCode(exception: unknown, statusCode: number): string {
		if (exception instanceof DomainException) {
			return exception.domainCode;
		}

		if (exception instanceof HttpException) {
			const response = exception.getResponse();
			if (typeof response === "object" && response !== null && "code" in response) {
				return (response as Record<string, unknown>)["code"] as string;
			}
		}

		return mapHttpStatusToErrorCode(statusCode);
	}

	private resolveMessage(exception: unknown, statusCode: number): string {
		if (exception instanceof DomainException) {
			return exception.message;
		}

		if (exception instanceof HttpException) {
			const response = exception.getResponse();
			if (typeof response === "object" && response !== null && "message" in response) {
				const message = (response as Record<string, unknown>)["message"];
				if (Array.isArray(message)) {
					return message.join("; ");
				}
				if (typeof message === "string") {
					return message;
				}
			}
			return exception.message;
		}

		if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
			return "An internal error occurred. The incident has been logged.";
		}

		return "An unexpected error occurred.";
	}

	private extractDomainDetails(exception: DomainException): ErrorDetails | undefined {
		if (!exception.details) {
			return undefined;
		}

		const details: ErrorDetails = {};

		if ("errors" in exception.details && Array.isArray(exception.details["errors"])) {
			details.errors = exception.details["errors"] as FieldError[];
		}

		if ("context" in exception.details) {
			details.context = exception.details["context"] as Record<string, unknown>;
		}

		if ("hint" in exception.details && typeof exception.details["hint"] === "string") {
			details.hint = exception.details["hint"];
		}

		if (Object.keys(details).length === 0) {
			return undefined;
		}

		return details;
	}

	private extractHttpExceptionDetails(exception: HttpException): ErrorDetails | undefined {
		const response = exception.getResponse();
		if (typeof response !== "object" || response === null) {
			return undefined;
		}

		const details: ErrorDetails = {};

		if ("message" in response && Array.isArray((response as Record<string, unknown>)["message"])) {
			const messages = (response as Record<string, unknown>)["message"] as string[];
			details.hint = messages.join("; ");
		}

		if (Object.keys(details).length === 0) {
			return undefined;
		}

		return details;
	}

	private buildInternalErrorDetails(requestId: string): ErrorDetails {
		return {
			hint: "Reference requestId when contacting support. No action required from the client — the team has been notified.",
			incidentId: requestId,
		};
	}

	private logServerError(exception: unknown, request: Request, requestId: string, statusCode: number): void {
		const errorDetails = {
			requestId,
			code: this.deriveErrorCode(exception, statusCode),
			statusCode,
			path: request.url,
			method: request.method,
			userAgent: request.headers["user-agent"],
		};

		if (exception instanceof Error) {
			this.logger.error(
				`${request.method} ${request.url} — ${statusCode}`,
				`${exception.stack}${exception.cause ? `\nCaused by: ${exception.cause}` : ""}`,
				JSON.stringify(errorDetails),
			);
		} else {
			this.logger.error(
				`${request.method} ${request.url} — ${statusCode}`,
				String(exception),
				JSON.stringify(errorDetails),
			);
		}
	}
}
