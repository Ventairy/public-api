import { HttpStatus } from "@nestjs/common";
import { DomainException } from "./domain.exception";
import { ERROR_CODES } from "@shared/constants";

export class FileTooLargeException extends DomainException {
	constructor({ fileName, fileSize, maxSize }: { fileName: string; fileSize: number; maxSize: number }) {
		super({
			domainCode: ERROR_CODES.FILE_TOO_LARGE,
			message: `File "${fileName}" exceeds the maximum size of ${maxSize} bytes (received ${fileSize} bytes)`,
			statusCode: HttpStatus.BAD_REQUEST,
			details: { fileName, fileSize, maxSize },
		});
	}
}
