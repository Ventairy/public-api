import { HttpStatus } from "@nestjs/common";
import { DomainException } from "./domain.exception";
import { ERROR_CODES } from "@shared/constants";
import { VentairyKycStatus } from "@shared/enums";

export class KycStatusNotAllowedException extends DomainException {
	constructor({ kycStatus }: { kycStatus: VentairyKycStatus }) {
		super({
			domainCode: ERROR_CODES.KYC_STATUS_NOT_ALLOWED,
			message: `Your current KYC status (${kycStatus}) does not allow access to this resource.`,
			statusCode: HttpStatus.FORBIDDEN,
			details: { kycStatus },
		});
	}
}
