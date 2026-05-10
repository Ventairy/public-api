import { HttpStatus } from "@nestjs/common";
import { DomainException } from "./domain.exception";
import { ERROR_CODES, type VentairyKycStatus } from "@shared/constants";

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
