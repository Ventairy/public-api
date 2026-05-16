import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { VerificationStatus } from "@shared/enums";
import { VerificationNotApprovedException } from "@shared/exceptions";
import type { Actor } from "@shared/types/actor.type";

@Injectable()
export class VerificationGuard implements CanActivate {
	public canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest();
		const actor: Actor | undefined = request.user;

		if (actor && actor.verificationStatus === VerificationStatus.VERIFIED) return true;

		throw new VerificationNotApprovedException({ verificationStatus: actor!.verificationStatus });
	}
}
