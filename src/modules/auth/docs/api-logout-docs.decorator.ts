import { applyDecorators } from "@nestjs/common";
import { ApiNoContentResponse, ApiOperation } from "@nestjs/swagger";

export function ApiLogoutDocs(): MethodDecorator & ClassDecorator {
	return applyDecorators(
		ApiOperation({
			summary: "End the current session and clear auth cookies",
			description:
				"Identifies the current session, deletes it from the database, and clears auth cookies from the browser. " +
				"If no refresh cookie is present (e.g., already expired), the endpoint still succeeds — all cookies are cleared as a safety measure. " +
				"After logout, the client must re-authenticate to obtain new tokens.",
		}),
		ApiNoContentResponse({
			description: "Logout successful. Session deleted and cookies cleared.",
		}),
	);
}
