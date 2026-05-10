import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SIWE_CONFIG_KEY, type SiweConfig } from "@core/config";
import { WalletNonceService } from "./wallet-nonce.service";
import { NonceOutputDto } from "../dto/nonce-output.dto";

@Injectable()
export class WalletAuthService {
	constructor(
		private readonly nonceService: WalletNonceService,
		private readonly configService: ConfigService,
	) {}

	public async createNonce(walletAddress: string): Promise<NonceOutputDto> {
		const siweConfig = this.configService.get<SiweConfig>(SIWE_CONFIG_KEY);
		if (!siweConfig) throw new Error("SIWE configuration is missing");

		this._cleanupExpiredNonces();

		return this.nonceService.createNonce(walletAddress, siweConfig.nonceTtlSeconds);
	}

	private async _cleanupExpiredNonces(): Promise<void> {
		await this.nonceService.cleanupExpired().catch(() => {
			//
		});
	}
}
