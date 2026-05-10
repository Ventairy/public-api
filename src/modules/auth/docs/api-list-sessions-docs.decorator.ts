import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { SessionsListOutputDto } from "../dto/session-output.dto";

export function ApiListSessionsDocs(): MethodDecorator & ClassDecorator {
	return applyDecorators(
		ApiOperation({
			summary: "List all active sessions for the authenticated user",
			description:
				"Returns all non-expired sessions for the authenticated user, including device info (User-Agent), IP address, creation and last rotation timestamps, and expiration date. " +
				"The current session is flagged with `is_current: true`. Expired sessions are silently cleaned up before the list is returned. " +
				"This is useful for displaying a 'manage devices' screen where users can see where they are logged in and revoke sessions they don't recognize.",
		}),
		ApiResponse({
			status: HttpStatus.OK,
			description: "Active session list retrieved successfully.",
			type: SessionsListOutputDto,
		}),
	);
}
