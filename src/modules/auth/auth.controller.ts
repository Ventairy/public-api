import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { WalletAuthService } from "./wallet/wallet-auth.service";
import { NonceInputDto } from "./dto/nonce-input.dto";
import { NonceOutputDto } from "./dto/nonce-output.dto";
import { ApiCreateNonceDocs } from "./docs/api-create-nonce-docs.decorator";

@Controller("auth")
export class AuthController {
	constructor(private readonly walletAuthService: WalletAuthService) {}

	@Post("wallet/nonce/create")
	@HttpCode(HttpStatus.CREATED)
	@ApiCreateNonceDocs()
	public async createNonce(@Body() body: NonceInputDto): Promise<NonceOutputDto> {
		return this.walletAuthService.createNonce(body.walletAddress);
	}
}
