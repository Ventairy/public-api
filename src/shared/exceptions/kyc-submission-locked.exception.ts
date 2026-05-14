import { HttpStatus } from "@nestjs/common";
import { DomainException } from "./domain.exception";
import { ERROR_CODES } from "@shared/constants";
import { VentairyKycStatus } from "@shared/enums";

export class KycSubmissionLockedException extends DomainException {
	constructor({ userId, kycStatus }: { userId: string; kycStatus: VentairyKycStatus }) {
		super({
			domainCode: ERROR_CODES.KYC_SUBMISSION_LOCKED,
			message: `KYC submission for user "${userId}" is locked (status: ${kycStatus})`,
			statusCode: HttpStatus.FORBIDDEN,
			details: { userId, kycStatus },
		});
	}
}
