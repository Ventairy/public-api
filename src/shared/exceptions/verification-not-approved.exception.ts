import { HttpStatus } from "@nestjs/common";
import { DomainException } from "./domain.exception";
import { ERROR_CODES } from "@shared/constants";
import { VerificationStatus } from "@shared/enums";

export class VerificationNotApprovedException extends DomainException {
	constructor({ verificationStatus }: { verificationStatus: VerificationStatus }) {
		const message = VerificationNotApprovedException._buildMessage(verificationStatus);
		super({
			domainCode: ERROR_CODES.VERIFICATION_NOT_APPROVED,
			message,
			statusCode: HttpStatus.FORBIDDEN,
			details: { verificationStatus },
		});
	}

	private static _buildMessage(verificationStatus: VerificationStatus): string {
		switch (verificationStatus) {
			case VerificationStatus.PENDING:
				return "Verification approval is required to access this resource. Your verification has not been submitted yet.";
			case VerificationStatus.VERIFYING:
				return "Verification approval is required to access this resource. Your verification is currently under review.";
			case VerificationStatus.REJECTED:
				return "Verification approval is required to access this resource. Your verification has been rejected.";
			default:
				return "Verification approval is required to access this resource.";
		}
	}
}
