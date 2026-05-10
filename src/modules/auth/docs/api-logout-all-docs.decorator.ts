import { applyDecorators } from "@nestjs/common";
import { ApiNoContentResponse, ApiOperation } from "@nestjs/swagger";

export function ApiLogoutOthersDocs(): MethodDecorator & ClassDecorator {
	return applyDecorators(
		ApiOperation({
			summary: "Revoke all other sessions except the current one",
			description:
				"Deletes every session for the authenticated user except the session that is making this request. " +
				"After this operation, all other devices and browsers will be logged out and must re-authenticate. " +
				"The current session remains active — its auth cookies are NOT cleared. To also end the current session, call POST /auth/logout afterwards. " +
				"This is useful when a user suspects unauthorized access on another device.",
		}),
		ApiNoContentResponse({
			description: "All other sessions revoked. Current session remains active.",
		}),
	);
}
