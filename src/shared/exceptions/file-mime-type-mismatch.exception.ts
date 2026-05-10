import { HttpStatus } from "@nestjs/common";
import { DomainException } from "./domain.exception";
import { ERROR_CODES } from "@shared/constants";

export class FileMimeTypeMismatchException extends DomainException {
	constructor({
		fileName,
		contentType,
		detectedMimeType,
		allowedMimeTypes,
		fileType,
	}: {
		fileName: string;
		contentType: string;
		detectedMimeType: string;
		allowedMimeTypes: readonly string[];
		fileType: string;
	}) {
		super({
			domainCode: ERROR_CODES.FILE_MIME_TYPE_MISMATCH,
			message: `File "${fileName}" Content-Type "${contentType}" does not match actual file content "${detectedMimeType}"`,
			statusCode: HttpStatus.BAD_REQUEST,
			details: { fileName, contentType, detectedMimeType, allowedMimeTypes, fileType },
		});
	}
}
