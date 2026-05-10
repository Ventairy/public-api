import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ALLOWED_USER_TYPES_DECORATOR_KEY } from "@shared/decorators/user-type.decorator";
import type { UserType } from "@shared/enums/user-type";
import type { Actor } from "@shared/types/actor.type";
import { BusinessOnlyException } from "@shared/exceptions/business-only.exception";

@Injectable()
export class UserTypeGuard implements CanActivate {
	constructor(private readonly _reflector: Reflector) {}

	public canActivate(context: ExecutionContext): boolean {
		const allowedUserTypes = this._reflector.getAllAndOverride<UserType[]>(ALLOWED_USER_TYPES_DECORATOR_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		if (!allowedUserTypes || allowedUserTypes.length === 0) return true;

		const request = context.switchToHttp().getRequest();
		const actor: Actor | undefined = request.user;

		if (!actor) throw new ForbiddenException("Authentication required to access this resource");
		if (!allowedUserTypes.includes(actor.userType)) throw new BusinessOnlyException();

		return true;
	}
}
