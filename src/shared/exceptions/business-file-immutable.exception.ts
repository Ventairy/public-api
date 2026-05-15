import { HttpStatus } from "@nestjs/common";
import { DomainException } from "./domain.exception";
import { ERROR_CODES } from "@shared/constants";

export class BusinessFileImmutableException extends DomainException {
	constructor(params: { fileType: string }) {
		super({
			domainCode: ERROR_CODES.BUSINESS_FILE_IMMUTABLE,
			message: `Cannot replace file of type "${params.fileType}" that has already been uploaded. Files become immutable after KYC approval.`,
			statusCode: HttpStatus.CONFLICT,
			details: { file_type: params.fileType },
		});
	}
}
