import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiBadRequestResponse, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { NonceOutputDto } from "../dto/nonce-output.dto";

export function ApiCreateNonceDocs(): MethodDecorator & ClassDecorator {
	return applyDecorators(
		ApiOperation({
			summary: "Generate SIWE wallet nonce",
			description:
				"Creates a single-use, wallet-bound nonce for ERC-4361 (Sign-In with Ethereum) message signing. The nonce expires after some time.",
		}),
		ApiResponse({
			status: HttpStatus.CREATED,
			description: "Nonce successfully generated.",
			type: NonceOutputDto,
		}),
		ApiBadRequestResponse({
			description: "Request body validation failed (e.g., missing or malformed wallet_address).",
		}),
	);
}
