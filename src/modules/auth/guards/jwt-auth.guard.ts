import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { IS_PUBLIC_KEY } from "@shared/decorators/public.decorator";
import { JwtService } from "../jwt/jwt.service";
import { ACCESS_COOKIE_NAME } from "../constants/token.constants";
import { CookieUtils } from "../utils/cookie.utils";

@Injectable()
export class JwtAuthGuard implements CanActivate {
	constructor(
		private readonly _reflector: Reflector,
		private readonly _jwtService: JwtService,
	) {}

	public async canActivate(context: ExecutionContext): Promise<boolean> {
		const isPublic = this._reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		if (isPublic) return true;

		const request = context.switchToHttp().getRequest<Request>();
		const accessToken = CookieUtils.extractCookie(request, ACCESS_COOKIE_NAME);

		if (!accessToken) throw new UnauthorizedException("Access token is missing");

		const payload = await this._jwtService.verifyAccessToken(accessToken);

		request.user = { id: payload.sub, sessionId: payload.sid };

		return true;
	}
}
