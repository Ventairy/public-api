import { Injectable } from "@nestjs/common";
import { and, eq, lte } from "drizzle-orm";
import {
	signatureNoncesTable,
	type NewSignatureNonceRow,
	type SignatureNonceRow,
} from "@db/schema/signature-nonces-table";
import { DrizzleService } from "@core/database/drizzle.service";
import { NONCE_BYTE_LENGTH, NONCE_BASE32_CHARSET } from "../constants";
import { NonceNotFoundException } from "@shared/exceptions/nonce-not-found.exception";

@Injectable()
export class WalletNonceService {
	constructor(private readonly drizzleService: DrizzleService) {}

	public async createNonce(
		walletAddress: string,
		ttlSeconds: number,
	): Promise<{
		nonce: string;
		expiresAt: string;
		walletAddress: string;
	}> {
		const normalizedWalletAddress = walletAddress.toLowerCase();
		const nonce = this._generateNonce();
		const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

		const newRow: NewSignatureNonceRow = {
			id: crypto.randomUUID(),
			nonce,
			wallet_address: normalizedWalletAddress,
			expires_at: expiresAt.toISOString(),
		};

		await this.drizzleService.db.insert(signatureNoncesTable).values(newRow);

		return {
			nonce,
			expiresAt: expiresAt.toISOString(),
			walletAddress: normalizedWalletAddress,
		};
	}


	public async findNonce(nonce: string): Promise<SignatureNonceRow | undefined> {
		const rows = await this.drizzleService.db
			.select()
			.from(signatureNoncesTable)
			.where(eq(signatureNoncesTable.nonce, nonce));

		return rows[0];
	}

	public async deleteNonce(nonce: string, walletAddress: string): Promise<void> {
		const rows = await this.drizzleService.db
			.delete(signatureNoncesTable)
			.where(and(eq(signatureNoncesTable.nonce, nonce), eq(signatureNoncesTable.wallet_address, walletAddress)))
			.returning();

		if (rows.length === 0) throw new NonceNotFoundException(nonce);
	}

	public async cleanupExpired(): Promise<void> {
		await this.drizzleService.db
			.delete(signatureNoncesTable)
			.where(lte(signatureNoncesTable.expires_at, new Date().toISOString()));
	}

	private _generateNonce(): string {
		const bytes = new Uint8Array(NONCE_BYTE_LENGTH);
		crypto.getRandomValues(bytes);

		let result = "";
		for (const byte of bytes) result += NONCE_BASE32_CHARSET[byte % NONCE_BASE32_CHARSET.length];

		return result;
	}
}
