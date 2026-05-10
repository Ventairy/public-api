import { applyDecorators, HttpStatus } from "@nestjs/common";
import {
	ApiBadRequestResponse,
	ApiNotFoundResponse,
	ApiOperation,
	ApiResponse,
	ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { LoginOutputDto } from "../dto/login-output.dto";

export function ApiLoginDocs(): MethodDecorator & ClassDecorator {
	return applyDecorators(
		ApiOperation({
			summary: "Authenticate with SIWE and start a session",
			description:
				"Verifies a SIWE (Sign-In with Ethereum) message and signature to prove wallet ownership. On success, creates a new session and issues both an access token (15-minute TTL) and a refresh token (7-day TTL) via HTTP-only cookies (`__Host-ventairy-access` and `__Host-ventairy-refresh`). Both cookies are SameSite=Strict and Secure, meaning they are only sent on same-site requests over HTTPS and are never readable by JavaScript. " +
				"The user must already exist (use POST /user/create first).",
		}),
		ApiResponse({
			status: HttpStatus.OK,
			description: "Login successful. Access and refresh tokens have been set as HTTP-only cookies.",
			type: LoginOutputDto,
		}),
		ApiBadRequestResponse({
			description:
				"Request body validation failed (e.g., missing or malformed wallet_address, invalid siwe structure).",
		}),
		ApiUnauthorizedResponse({
			description:
				"SIWE signature verification failed. The message signature does not match the wallet address, or the nonce is invalid or expired.",
		}),
		ApiNotFoundResponse({
			description:
				"No user found for the given wallet address. The wallet must first create an account via POST /user/create.",
		}),
	);
}
