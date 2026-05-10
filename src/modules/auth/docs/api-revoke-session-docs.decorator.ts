import { applyDecorators } from "@nestjs/common";
import {
	ApiNoContentResponse,
	ApiNotFoundResponse,
	ApiOperation,
	ApiParam,
	ApiUnauthorizedResponse,
} from "@nestjs/swagger";

export function ApiRevokeSessionDocs(): MethodDecorator & ClassDecorator {
	return applyDecorators(
		ApiOperation({
			summary: "Revoke a specific session",
			description:
				"Deletes a session by its ID, effectively logging out that device. " +
				"The session ID must belong to the authenticated user — sessions belonging to other users are ignored (the endpoint still returns 204). " +
				"If the revoked session is the current session (the one making the request), auth cookies are cleared, requiring re-authentication. " +
				"Use GET /auth/sessions to discover session IDs.",
		}),
		ApiParam({ name: "session_id", description: "UUID of the session to revoke.", format: "uuid" }),
		ApiNoContentResponse({
			description: "Session revoked. If it was the current session, auth cookies have been cleared.",
		}),
		ApiNotFoundResponse({
			description: "Session not found (or does not belong to this user).",
		}),
		ApiUnauthorizedResponse({
			description: "Access token is missing, expired, or invalid.",
		}),
	);
}
