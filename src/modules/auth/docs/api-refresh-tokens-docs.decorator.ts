import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { RefreshTokensOutputDto } from "../dto/refresh-tokens-output.dto";

export function ApiRefreshTokensDocs(): MethodDecorator & ClassDecorator {
	return applyDecorators(
		ApiOperation({
			summary: "Refresh access and refresh tokens",
			description:
				"Accepts the existing cookies and issues a new access token and a new refresh token via HTTP-only cookies. " +
				"This endpoint implements refresh token rotation: the old refresh token is invalidated and a new one is issued. ",
		}),
		ApiResponse({
			status: HttpStatus.OK,
			description: "Tokens refreshed successfully. New access and refresh cookies have been set.",
			type: RefreshTokensOutputDto,
		}),
		ApiUnauthorizedResponse({
			description: "Refresh token is missing, expired, or invalid.",
		}),
	);
}
