import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { VerificationStatus } from "@shared/enums";
import { VerificationNotApprovedException } from "@shared/exceptions";
import type { Actor } from "@shared/types/actor.type";
import { VerificationRepository } from "../repositories/verification.repository";

@Injectable()
export class VerificationGuard implements CanActivate {
	constructor(private readonly _verificationRepository: VerificationRepository) {}

	public async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		const actor: Actor | undefined = request.user;

		const verificationStatus = await this._verificationRepository.getVerificationStatus(actor!.id);

		if (verificationStatus === VerificationStatus.VERIFIED) return true;

		throw new VerificationNotApprovedException({ verificationStatus });
	}
}
