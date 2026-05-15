import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiBadRequestResponse, ApiConflictResponse, ApiOperation, ApiResponse, ApiUnauthorizedResponse, ApiServiceUnavailableResponse } from "@nestjs/swagger";
import { RegisterOutputDto } from "../dto/register-output.dto";

export function ApiRegisterDocs(): MethodDecorator & ClassDecorator {
	return applyDecorators(
		ApiOperation({
			summary: "Register a new Ventairy user",
			description:
				"Registers a new user and returns authentication tokens. The wallet address and chain ID are extracted from the ERC-4361 (SIWE) message. " +
				"The SIWE signature proves wallet ownership before account creation. On success, sets access cookies (so no need to login again).",
		}),
		ApiResponse({
			status: HttpStatus.CREATED,
			description: "User successfully created and authenticated.",
			type: RegisterOutputDto,
		}),
		ApiBadRequestResponse({
			description: "Request body validation failed (e.g., missing or malformed fields, invalid SIWE message).",
		}),
		ApiUnauthorizedResponse({
			description: "SIWE signature verification failed, nonce expired, signer does not match wallet address, or nonce was already consumed.",
		}),
		ApiConflictResponse({
			description: "A user with the extracted wallet_address already exists.",
		}),
		ApiServiceUnavailableResponse({
			description: "Blockchain RPC nodes are unreachable; signature verification could not be performed.",
		}),
	);
}
