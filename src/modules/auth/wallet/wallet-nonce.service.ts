import { Injectable } from "@nestjs/common";
import type { SupportedBlockchain } from "@shared/blockchain";
import { SignatureNonceRepository } from "../repositories/signature-nonce.repository";
import { NONCE_BYTE_LENGTH, NONCE_BASE32_CHARSET } from "../constants";
import { NonceNotFoundException } from "@shared/exceptions/nonce-not-found.exception";
import type { SignatureNonceRow } from "@db/schema/signature-nonces-table";

@Injectable()
export class WalletNonceService {
	constructor(private readonly _signatureNonceRepository: SignatureNonceRepository) {}

	public async createNonce(
		walletAddress: string,
		chainId: SupportedBlockchain,
		ttlSeconds: number,
	): Promise<{
		nonce: string;
		expiresAt: string;
		walletAddress: string;
		chainId: SupportedBlockchain;
	}> {
		const normalizedWalletAddress = walletAddress.toLowerCase();
		const nonce = this._generateNonce();
		const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

		await this._signatureNonceRepository.create({
			id: crypto.randomUUID(),
			nonce,
			wallet_address: normalizedWalletAddress,
			chain_id: chainId,
			expires_at: expiresAt.toISOString(),
		});

		return {
			nonce,
			expiresAt: expiresAt.toISOString(),
			walletAddress: normalizedWalletAddress,
			chainId,
		};
	}

	public async findNonce(nonce: string): Promise<SignatureNonceRow | undefined> {
		return this._signatureNonceRepository.findByNonce(nonce);
	}

	public async deleteNonce(nonce: string, walletAddress: string): Promise<void> {
		const deleted = await this._signatureNonceRepository.deleteByNonceAndWalletAddress(nonce, walletAddress);

		if (!deleted) throw new NonceNotFoundException(nonce);
	}

	public async cleanupExpired(): Promise<void> {
		await this._signatureNonceRepository.deleteExpired();
	}

	private _generateNonce(): string {
		const bytes = new Uint8Array(NONCE_BYTE_LENGTH);
		crypto.getRandomValues(bytes);

		let result = "";
		for (const byte of bytes) result += NONCE_BASE32_CHARSET[byte % NONCE_BASE32_CHARSET.length];

		return result;
	}
}
