import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { Public } from "@shared/decorators/public.decorator";
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
	@ApiCreateUserDocs()
	public async create(
		@Body() body: CreateUserInputDto,
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response,
	): Promise<CreateUserOutputDto> {
		const { user, accessToken, rawRefreshToken } = await this._userService.createUser(
			body.walletAddress,
			body.siwe.message,
			body.siwe.signature,
			req.headers["user-agent"],
			req.ip,
		);

		CookieUtils.setAuthCookies(res, { accessToken, refreshToken: rawRefreshToken });

		return user;
	}
}
