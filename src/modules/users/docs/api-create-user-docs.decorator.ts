import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiBadRequestResponse, ApiConflictResponse, ApiOperation, ApiResponse, ApiUnauthorizedResponse, ApiServiceUnavailableResponse } from "@nestjs/swagger";
import { CreateUserOutputDto } from "../dto/create-user-output.dto";

export function ApiCreateUserDocs(): MethodDecorator & ClassDecorator {
	return applyDecorators(
		ApiOperation({
			summary: "Create a new Ventairy user",
			description: "Registers a new user with the provided EVM wallet address after verifying wallet ownership via ERC-4361 (SIWE) signature.",
		}),
		ApiResponse({
			status: HttpStatus.CREATED,
			description: "User successfully created.",
			type: CreateUserOutputDto,
		}),
		ApiBadRequestResponse({
			description: "Request body validation failed (e.g., missing or malformed wallet_address, invalid SIWE message).",
		}),
		ApiUnauthorizedResponse({
			description: "SIWE signature verification failed, nonce expired, signer does not match wallet address, or nonce was already consumed.",
		}),
		ApiConflictResponse({
			description: "A user with the supplied wallet_address already exists.",
		}),
		ApiServiceUnavailableResponse({
			description: "Blockchain RPC nodes are unreachable; signature verification could not be performed.",
		}),
	);
}
