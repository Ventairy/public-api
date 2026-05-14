import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { Public } from "@shared/decorators/public.decorator";
import { RateLimit } from "@shared/rate-limit/rate-limit.decorator";
import { CreateUserInputDto } from "./dto/create-user-input.dto";
import { CreateUserOutputDto } from "./dto/create-user-output.dto";
import { ApiCreateUserDocs } from "./docs/api-create-user-docs.decorator";
import { UserService } from "./user.service";
import { CookieUtils } from "@modules/auth/utils/cookie.utils";

@Controller("user")
export class UserController {
	constructor(private readonly _userService: UserService) {}

	@Post("create")
	@HttpCode(HttpStatus.CREATED)
	@Public()
	@RateLimit({ limit: 5, ttlSeconds: 60 })
	@ApiCreateUserDocs()
	public async create(
		@Body() body: CreateUserInputDto,
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response,
	): Promise<CreateUserOutputDto> {
		const { user, accessToken, rawRefreshToken } = await this._userService.createUser({
			siweMessage: body.siwe.message,
			siweSignature: body.siwe.signature,
			deviceInfo: req.headers["user-agent"],
			ipAddress: req.ip,
			userType: body.userType,
		});

		CookieUtils.setAuthCookies(res, { accessToken, refreshToken: rawRefreshToken });

		return user;
	}
}
