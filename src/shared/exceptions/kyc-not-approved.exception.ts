import { HttpStatus } from "@nestjs/common";
import { DomainException } from "./domain.exception";
import { ERROR_CODES } from "@shared/constants";
import { VentairyKycStatus } from "@shared/enums";

export class KycNotApprovedException extends DomainException {
	constructor({ kycStatus }: { kycStatus: VentairyKycStatus }) {
		const message = KycNotApprovedException._buildMessage(kycStatus);
		super({
			domainCode: ERROR_CODES.KYC_NOT_APPROVED,
			message,
			statusCode: HttpStatus.FORBIDDEN,
			details: { kycStatus },
		});
	}

	private static _buildMessage(kycStatus: VentairyKycStatus): string {
		switch (kycStatus) {
			case VentairyKycStatus.PENDING:
				return "KYC approval is required to access this resource. Your KYC application has not been submitted yet.";
			case VentairyKycStatus.VERIFYING:
				return "KYC approval is required to access this resource. Your KYC application is currently under review.";
			case VentairyKycStatus.REJECTED:
				return "KYC approval is required to access this resource. Your KYC application has been rejected.";
			default:
				return "KYC approval is required to access this resource.";
		}
	}
}
