import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SiweMessage } from "siwe";
import { createPublicClient, fallback, http, type Hex } from "viem";
import { SIWE_CONFIG_KEY, type SiweConfig } from "@core/config";
import { parseAndValidateSiweMessage } from "@shared/siwe/siwe-utils";
import { getBlockchainByChainId } from "@shared/blockchain";
import { WalletNonceService } from "@modules/auth/wallet/wallet-nonce.service";
import { InvalidSiweSignatureException } from "@shared/exceptions/invalid-siwe-signature.exception";
import { NonceExpiredException } from "@shared/exceptions/nonce-expired.exception";
import { NonceNotFoundException } from "@shared/exceptions/nonce-not-found.exception";
import { SignerMismatchException } from "@shared/exceptions/signer-mismatch.exception";
import { NonceWalletMismatchException } from "@shared/exceptions/nonce-wallet-mismatch.exception";
import { SignatureVerificationUnavailableException } from "@shared/exceptions/signature-verification-unavailable.exception";
import { SiweMessageInvalidException } from "@shared/exceptions/siwe-message-invalid.exception";

@Injectable()
export class SiweVerifierService {
	constructor(
		private readonly nonceService: WalletNonceService,
		private readonly configService: ConfigService,
	) {}

	public async verify(params: {
		expectedSignerWalletAddress: string;
		message: string;
		signature: string;
	}): Promise<void> {
		const siweConfig = this.configService.get<SiweConfig>(SIWE_CONFIG_KEY);
		if (!siweConfig) throw new Error("SIWE configuration is missing");

		const lowercasedExpectedSignerAddress = params.expectedSignerWalletAddress.toLowerCase();

		const siweMessage = parseAndValidateSiweMessage(params.message, {
			siweConfig,
			expectedWalletAddress: lowercasedExpectedSignerAddress,
		});

		const nonceRow = await this.nonceService.findNonce(siweMessage.nonce);
		if (!nonceRow) throw new NonceNotFoundException(siweMessage.nonce);

		if (nonceRow.wallet_address !== lowercasedExpectedSignerAddress) {
			throw new NonceWalletMismatchException({
				requestedWalletAddress: lowercasedExpectedSignerAddress,
				nonceWalletAddress: nonceRow.wallet_address,
			});
		}

		const expiresAt = new Date(nonceRow.expires_at);
		if (expiresAt.getTime() < Date.now())
			throw new NonceExpiredException({ nonce: siweMessage.nonce, ttlSeconds: siweConfig.nonceTtlSeconds });

		await this._verifySignatureOnChain(siweMessage, params.signature as Hex);

		if (siweMessage.address.toLowerCase() !== lowercasedExpectedSignerAddress) {
			throw new SignerMismatchException({
				expectedWalletAddress: lowercasedExpectedSignerAddress,
				actualWalletAddress: siweMessage.address.toLowerCase(),
			});
		}

		await this.nonceService.deleteNonce(siweMessage.nonce, lowercasedExpectedSignerAddress);
	}

	private async _verifySignatureOnChain(siweMessage: SiweMessage, signature: Hex): Promise<void> {
		const blockchainDescriptor = getBlockchainByChainId(siweMessage.chainId);
		if (!blockchainDescriptor) throw new SiweMessageInvalidException(`unsupported chain ID: ${siweMessage.chainId}`);

		const client = createPublicClient({
			chain: blockchainDescriptor.chain,
			transport: fallback(blockchainDescriptor.publicRpcUrls.map((url) => http(url, { timeout: 5_000 }))),
		});

		try {
			const valid = await client.verifyMessage({
				address: siweMessage.address as Hex,
				message: siweMessage.prepareMessage(),
				signature,
			});

			if (!valid) throw new InvalidSiweSignatureException(siweMessage.address);
		} catch (error) {
			if (error instanceof InvalidSiweSignatureException) throw error;
			throw new SignatureVerificationUnavailableException();
		}
	}
}
