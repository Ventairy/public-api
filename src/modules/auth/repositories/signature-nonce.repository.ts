import { Inject, Injectable } from "@nestjs/common";
import { and, eq, lte } from "drizzle-orm";
import { DRIZZLE_DB, type DrizzleDb } from "@core/database";
import {
	signatureNoncesTable,
	type SignatureNonceRow,
	type NewSignatureNonceRow,
} from "@db/schema/signature-nonces-table";

@Injectable()
export class SignatureNonceRepository {
	constructor(@Inject(DRIZZLE_DB) private readonly _db: DrizzleDb) {}

	async create(data: NewSignatureNonceRow): Promise<void> {
		await this._db.insert(signatureNoncesTable).values(data);
	}

	async findByNonce(nonce: string): Promise<SignatureNonceRow | undefined> {
		const rows = await this._db.select().from(signatureNoncesTable).where(eq(signatureNoncesTable.nonce, nonce));
		return rows[0];
	}

	async deleteByNonceAndWalletAddress(nonce: string, walletAddress: string): Promise<SignatureNonceRow | undefined> {
		const rows = await this._db
			.delete(signatureNoncesTable)
			.where(and(eq(signatureNoncesTable.nonce, nonce), eq(signatureNoncesTable.wallet_address, walletAddress)))
			.returning();

		return rows[0];
	}

	async deleteExpired(): Promise<void> {
		await this._db.delete(signatureNoncesTable).where(lte(signatureNoncesTable.expires_at, new Date().toISOString()));
	}
}
