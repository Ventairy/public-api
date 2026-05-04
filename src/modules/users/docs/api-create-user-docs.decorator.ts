import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiBadRequestResponse, ApiConflictResponse, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { CreateUserOutputDto } from "../dto/create-user-output.dto";

export function ApiCreateUserDocs(): MethodDecorator & ClassDecorator {
	return applyDecorators(
		ApiOperation({
			summary: "Create a new Ventairy user",
			description: "Registers a new user with the provided EVM wallet address",
		}),
		ApiResponse({
			status: HttpStatus.CREATED,
			description: "User successfully created.",
			type: CreateUserOutputDto,
		}),
		ApiBadRequestResponse({
			description: "Request body validation failed (e.g., missing or malformed wallet_address).",
		}),
		ApiConflictResponse({
			description: "A user with the supplied wallet_address already exists.",
		}),
	);
}
