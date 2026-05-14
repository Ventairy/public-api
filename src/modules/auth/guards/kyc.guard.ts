import { Injectable, CanActivate, ForbiddenException, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { KYC_REQUIRED_DECORATOR_KEY } from "@shared/decorators/kyc-required.decorator";
import { ALLOWED_KYC_STATUSES_DECORATOR_KEY } from "@shared/decorators/kyc-status.decorator";
import { VentairyKycStatus } from "@shared/enums";
import { KycNotApprovedException, KycStatusNotAllowedException } from "@shared/exceptions";
import type { Actor } from "@shared/types/actor.type";

@Injectable()
export class KYCGuard implements CanActivate {
	constructor(private readonly _reflector: Reflector) {}

	public canActivate(context: ExecutionContext): boolean {
		const isKycRequired = this._reflector.getAllAndOverride<boolean>(KYC_REQUIRED_DECORATOR_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		const allowedKycStatuses = this._reflector.getAllAndOverride<VentairyKycStatus[]>(
			ALLOWED_KYC_STATUSES_DECORATOR_KEY,
			[context.getHandler(), context.getClass()],
		);

		if (!isKycRequired && (!allowedKycStatuses || allowedKycStatuses.length === 0)) {
			return true;
		}

		const request = context.switchToHttp().getRequest();
		const actor: Actor | undefined = request.user;

		if (!actor) throw new ForbiddenException("Authentication required to access this resource");

		if (isKycRequired) {
			if (actor.kycStatus !== VentairyKycStatus.APPROVED) {
				throw new KycNotApprovedException({ kycStatus: actor.kycStatus });
			}

			return true;
		}

		if (allowedKycStatuses && !allowedKycStatuses.includes(actor.kycStatus)) {
			throw new KycStatusNotAllowedException({ kycStatus: actor.kycStatus });
		}

		return true;
	}
}
