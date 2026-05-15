import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { Public } from "@shared/decorators/public.decorator";
import { CurrentActor } from "@shared/decorators/current-actor.decorator";
import { RateLimit } from "@shared/rate-limit/rate-limit.decorator";
import type { Actor } from "@shared/types/actor.type";
import { WalletAuthService } from "./wallet/wallet-auth.service";
import { AuthService } from "./auth.service";
import { NonceInputDto } from "./dto/nonce-input.dto";
import { NonceOutputDto } from "./dto/nonce-output.dto";
import { LoginInputDto } from "./dto/login-input.dto";
import { LoginOutputDto } from "./dto/login-output.dto";
import { RegisterOutputDto } from "./dto/register-output.dto";
import { RefreshTokensOutputDto } from "./dto/refresh-tokens-output.dto";
import { SessionsListOutputDto } from "./dto/session-output.dto";
import { CookieUtils } from "./utils/cookie.utils";
import { CreateUserInputDto } from "@modules/user/dto/create-user-input.dto";
import { ApiCreateNonceDocs } from "./docs/api-create-nonce-docs.decorator";
import { ApiLoginDocs } from "./docs/api-login-docs.decorator";
import { ApiRegisterDocs } from "./docs/api-register-docs.decorator";
import { ApiRefreshTokensDocs } from "./docs/api-refresh-tokens-docs.decorator";
import { ApiLogoutDocs } from "./docs/api-logout-docs.decorator";
import { ApiListSessionsDocs } from "./docs/api-list-sessions-docs.decorator";
import { ApiRevokeSessionDocs } from "./docs/api-revoke-session-docs.decorator";
import { ApiLogoutOthersDocs } from "./docs/api-logout-all-docs.decorator";

@Controller("auth")
export class AuthController {
	constructor(
		private readonly _walletAuthService: WalletAuthService,
		private readonly _authService: AuthService,
	) {}

	@Post("register")
	@HttpCode(HttpStatus.CREATED)
	@Public()
	@RateLimit({ limit: 5, ttlSeconds: 60 })
	@ApiRegisterDocs()
	public async register(
		@Body() body: CreateUserInputDto,
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response,
	): Promise<RegisterOutputDto> {
		const { user, accessToken, rawRefreshToken } = await this._authService.register({
			siweMessage: body.siwe.message,
			siweSignature: body.siwe.signature,
			deviceInfo: req.headers["user-agent"],
			ipAddress: req.ip,
			userType: body.userType,
		});

		CookieUtils.setAuthCookies(res, { accessToken, refreshToken: rawRefreshToken });

		return user;
	}

	@Post("wallet/nonce/create")
	@HttpCode(HttpStatus.CREATED)
	@Public()
	@RateLimit({ limit: 10, ttlSeconds: 60 })
	@ApiCreateNonceDocs()
	public async createNonce(@Body() body: NonceInputDto): Promise<NonceOutputDto> {
		return this._walletAuthService.createNonce(body.walletAddress, body.chainId);
	}

	@Post("login")
	@HttpCode(HttpStatus.OK)
	@Public()
	@RateLimit({ limit: 5, ttlSeconds: 300 })
	@ApiLoginDocs()
	public async login(
		@Body() body: LoginInputDto,
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response,
	): Promise<LoginOutputDto> {
		const { output, accessToken, rawRefreshToken } = await this._authService.login({
			message: body.siwe.message,
			signature: body.siwe.signature,
			deviceInfo: req.headers["user-agent"],
			ipAddress: req.ip,
		});

		CookieUtils.setAuthCookies(res, { accessToken, refreshToken: rawRefreshToken });

		return output;
	}

	@Post("refresh")
	@HttpCode(HttpStatus.OK)
	@Public()
	@RateLimit({ limit: 20, ttlSeconds: 3600 })
	@ApiRefreshTokensDocs()
	public async refresh(
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response,
	): Promise<RefreshTokensOutputDto> {
		const { output, accessToken, newRawRefreshToken } = await this._authService.refreshTokens(req);

		CookieUtils.setAuthCookies(res, { accessToken, refreshToken: newRawRefreshToken });

		return output;
	}

	@Post("logout")
	@HttpCode(HttpStatus.NO_CONTENT)
	@RateLimit({ limit: 10, ttlSeconds: 60 })
	@ApiLogoutDocs()
	public async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
		await this._authService.logout(req);

		CookieUtils.clearAuthCookies(res);
	}

	@Get("sessions")
	@HttpCode(HttpStatus.OK)
	@RateLimit({ limit: 10, ttlSeconds: 60 })
	@ApiListSessionsDocs()
	public async listSessions(@CurrentActor() actor: Actor): Promise<SessionsListOutputDto> {
		return this._authService.listSessions(actor.id, actor.sessionId);
	}

	@Delete("sessions/:session_id")
	@HttpCode(HttpStatus.NO_CONTENT)
	@RateLimit({ limit: 10, ttlSeconds: 60 })
	@ApiRevokeSessionDocs()
	public async revokeSession(
		@CurrentActor() actor: Actor,
		@Param("session_id") sessionId: string,
		@Res({ passthrough: true }) res: Response,
	): Promise<void> {
		const { isCurrentSession } = await this._authService.revokeSession({
			sessionId,
			userId: actor.id,
			currentSessionId: actor.sessionId,
		});

		if (isCurrentSession) CookieUtils.clearAuthCookies(res);
	}

	@Post("logout/others")
	@HttpCode(HttpStatus.NO_CONTENT)
	@RateLimit({ limit: 5, ttlSeconds: 60 })
	@ApiLogoutOthersDocs()
	public async logoutOthers(@CurrentActor() actor: Actor, @Res({ passthrough: true }) res: Response): Promise<void> {
		await this._authService.logoutOthers(actor.id, actor.sessionId);

		CookieUtils.clearAuthCookies(res);
	}
}
