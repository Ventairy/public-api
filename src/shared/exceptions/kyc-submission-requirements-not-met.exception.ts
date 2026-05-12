import { HttpStatus } from "@nestjs/common";
import { DomainException } from "./domain.exception";
import { ERROR_CODES } from "@shared/constants";

export class KycSubmissionRequirementsNotMetException extends DomainException {
	constructor({ userId, missing }: { userId: string; missing: { fields: string[]; files: string[] } }) {
		super({
			domainCode: ERROR_CODES.KYC_SUBMISSION_REQUIREMENTS_NOT_MET,
			message: `Missing required KYC data for user ${userId} in order to submit KYC`,
			statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
			details: { userId, missing },
		});
	}
}
