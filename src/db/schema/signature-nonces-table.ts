import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import type { SupportedBlockchain } from "@shared/blockchain";

export const signatureNoncesTable = sqliteTable("signature_nonces", {
	id: text("id").primaryKey(),
	nonce: text("nonce").notNull(),
	wallet_address: text("wallet_address").notNull(),
	chain_id: integer("chain_id").notNull().$type<SupportedBlockchain>(),
	expires_at: text("expires_at").notNull(),
	created_at: text("created_at")
		.notNull()
		.$defaultFn(() => new Date().toISOString()),
}, (table) => [
	uniqueIndex("signature_nonces_nonce_unique").on(table.nonce),
]);

export type SignatureNonceRow = typeof signatureNoncesTable.$inferSelect;
export type NewSignatureNonceRow = typeof signatureNoncesTable.$inferInsert;
