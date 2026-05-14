import { HttpStatus } from "@nestjs/common";
import { DomainException } from "./domain.exception";
import { ERROR_CODES } from "@shared/constants";
import type { LiquidityProviderId } from "@shared/constants";
import { SupportedBlockchain } from "@shared/blockchain";

export class WalletNotFoundAtLiquidityProviderException extends DomainException {
	constructor(params: {
		liquidityProviderId: LiquidityProviderId;
		walletAddress: string;
		chainId: SupportedBlockchain;
	}) {
		super({
			domainCode: ERROR_CODES.WALLET_NOT_FOUND_AT_LIQUIDITY_PROVIDER,
			message: `User Wallet "${params.walletAddress}" at chain "${params.chainId}" not found at liquidity provider "${params.liquidityProviderId}".`,
			statusCode: HttpStatus.NOT_FOUND,
			details: {
				liquidityProviderId: params.liquidityProviderId,
				walletAddress: params.walletAddress,
				chainId: params.chainId,
			},
		});
	}
}
