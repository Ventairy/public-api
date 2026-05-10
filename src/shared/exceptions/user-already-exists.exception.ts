import { HttpStatus } from "@nestjs/common";
import { ERROR_CODES } from "@shared/constants/error-codes";
import { DomainException } from "./domain.exception";

export class UserAlreadyExistsException extends DomainException {
	constructor(walletAddress: string) {
		super({
			domainCode: ERROR_CODES.CONFLICT,
			message: `A user with wallet address ${walletAddress} already exists`,
			statusCode: HttpStatus.CONFLICT,
			details: {
				context: { walletAddress },
				hint: "A user with this wallet address is already registered. Use the existing account or choose a different wallet.",
			},
		});
	}
}
