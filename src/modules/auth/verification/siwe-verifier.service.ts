import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SiweMessage } from "siwe";
import { createPublicClient, fallback, http, type Hex } from "viem";
import { SIWE_CONFIG_KEY, type SiweConfig } from "@core/config";
import { parseAndValidateSiweMessage } from "@shared/siwe/siwe-utils";
import { getBlockchainByChainId, SupportedBlockchain } from "@shared/blockchain";
import { WalletNonceService } from "@modules/auth/wallet/wallet-nonce.service";
import { InvalidSiweSignatureException } from "@shared/exceptions/invalid-siwe-signature.exception";
import { NonceExpiredException } from "@shared/exceptions/nonce-expired.exception";
import { NonceNotFoundException } from "@shared/exceptions/nonce-not-found.exception";
import { NonceWalletMismatchException } from "@shared/exceptions/nonce-wallet-mismatch.exception";
import { SignatureVerificationUnavailableException } from "@shared/exceptions/signature-verification-unavailable.exception";
import { SiweMessageInvalidException } from "@shared/exceptions/siwe-message-invalid.exception";
import { NonceChainIdMismatchException } from "@shared/exceptions/nonce-chain-id-mismatch.exception";

@Injectable()
export class SiweVerifierService {
	constructor(
		private readonly nonceService: WalletNonceService,
		private readonly configService: ConfigService,
	) {}

	public async parseAndVerifyMessage(params: {
		message: string;
		signature: string;
	}): Promise<{ walletAddress: string; chainId: SupportedBlockchain }> {
		const siweConfig = this.configService.get<SiweConfig>(SIWE_CONFIG_KEY);
		if (!siweConfig) throw new Error("SIWE configuration is missing");

		const siweMessage = parseAndValidateSiweMessage(params.message, { siweConfig });

		const nonceRow = await this.nonceService.findNonce(siweMessage.nonce);
		if (!nonceRow) throw new NonceNotFoundException(siweMessage.nonce);

		if (nonceRow.wallet_address !== siweMessage.address.toLowerCase()) {
			throw new NonceWalletMismatchException({
				requestedWalletAddress: siweMessage.address.toLowerCase(),
				nonceWalletAddress: nonceRow.wallet_address,
			});
		}

		if (nonceRow.chain_id !== siweMessage.chainId) {
			throw new NonceChainIdMismatchException({
				nonceChainId: nonceRow.chain_id,
				messageChainId: siweMessage.chainId,
			});
		}

		const expiresAt = new Date(nonceRow.expires_at);

		if (expiresAt.getTime() < Date.now()) {
			throw new NonceExpiredException({ nonce: siweMessage.nonce, ttlSeconds: siweConfig.nonceTtlSeconds });
		}

		await this._verifySignatureOnChain(siweMessage, params.signature as Hex);

		await this.nonceService.deleteNonce(siweMessage.nonce, siweMessage.address.toLowerCase());

		return {
			walletAddress: siweMessage.address.toLowerCase(),
			chainId: siweMessage.chainId as SupportedBlockchain,
		};
	}

	private async _verifySignatureOnChain(siweMessage: SiweMessage, signature: Hex): Promise<void> {
		const messageBlockchainMetadata = getBlockchainByChainId(siweMessage.chainId);

		if (!messageBlockchainMetadata) {
			throw new SiweMessageInvalidException(`unsupported chain ID: ${siweMessage.chainId}`);
		}

		const client = createPublicClient({
			chain: messageBlockchainMetadata.viemChain,
			transport: fallback(messageBlockchainMetadata.publicRpcUrls.map((url) => http(url, { timeout: 5_000 }))),
		});

		try {
			const valid = await client.verifyMessage({
				address: siweMessage.address as Hex,
				message: siweMessage.prepareMessage(),
				chain: messageBlockchainMetadata.viemChain,
				signature,
			});

			if (!valid) throw new InvalidSiweSignatureException(siweMessage.address);
		} catch (error) {
			if (error instanceof InvalidSiweSignatureException) throw error;
			throw new SignatureVerificationUnavailableException();
		}
	}
}
