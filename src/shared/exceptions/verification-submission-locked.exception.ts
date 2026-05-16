import { HttpStatus } from "@nestjs/common";
import { DomainException } from "./domain.exception";
import { ERROR_CODES } from "@shared/constants";
import { VerificationStatus } from "@shared/enums";

export class VerificationSubmissionLockedException extends DomainException {
	constructor({ userId, verificationStatus }: { userId: string; verificationStatus: VerificationStatus }) {
		super({
			domainCode: ERROR_CODES.VERIFICATION_SUBMISSION_LOCKED,
			message: `Verification submission for user "${userId}" is locked (status: ${verificationStatus})`,
			statusCode: HttpStatus.FORBIDDEN,
			details: { userId, verificationStatus },
		});
	}
}