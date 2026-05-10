import { HttpStatus } from "@nestjs/common";
import { DomainException } from "./domain.exception";
import { ERROR_CODES } from "@shared/constants";

export class InvalidFileMimeTypeException extends DomainException {
	constructor({
		fileName,
		mimeType,
		allowedMimeTypes,
		fileType,
	}: {
		fileName: string;
		mimeType: string;
		allowedMimeTypes: readonly string[];
		fileType: string;
	}) {
		super({
			domainCode: ERROR_CODES.INVALID_FILE_MIME_TYPE,
			message: `File "${fileName}" has unsupported MIME type "${mimeType}" for file type "${fileType}". Allowed types: ${allowedMimeTypes.join(", ")}`,
			statusCode: HttpStatus.BAD_REQUEST,
			details: { fileName, mimeType, allowedMimeTypes, fileType },
		});
	}
}
