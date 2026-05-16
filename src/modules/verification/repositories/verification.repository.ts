import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DRIZZLE_DB, type DrizzleDb, type AtomicCall } from "@core/database";
import { verificationTable, type VerificationDatabaseRow, type NewVerificationDatabaseRow } from "@db/schema/verifications-table";
import { VerificationStatus } from "@shared/enums";

@Injectable()
export class VerificationRepository {
	constructor(@Inject(DRIZZLE_DB) private readonly _db: DrizzleDb) {}

	async findByUserId(userId: string): Promise<VerificationDatabaseRow | undefined> {
		const rows = await this._db.select().from(verificationTable).where(eq(verificationTable.user_id, userId));
		return rows[0];
	}

	async getVerificationStatus(userId: string): Promise<VerificationStatus> {
		const rows = await this._db.select({ verification_status: verificationTable.verification_status }).from(verificationTable).where(eq(verificationTable.user_id, userId));

		if (!rows[0]) throw new Error(`Verification row not found for user ${userId}`);

		return rows[0].verification_status;
	}

	async create(data: NewVerificationDatabaseRow): Promise<VerificationDatabaseRow> {
		const rows = await this._db.insert(verificationTable).values(data).returning();
		const row = rows[0];

		if (!row) throw new Error("Verification insert returned no rows");
		return row;
	}

	create_atomicCall(data: NewVerificationDatabaseRow): AtomicCall<VerificationDatabaseRow> {
		const query = this._db.insert(verificationTable).values(data).returning();

		return {
			query,
			processResult: (rawRows: unknown[]) => {
				const rows = rawRows as VerificationDatabaseRow[];
				const row = rows[0];

				if (!row) throw new Error("Verification insert returned no rows");
				return row;
			},
		};
	}

	async updateStatusByUserId(params: { userId: string; status: VerificationStatus; submittedAt?: string }): Promise<VerificationDatabaseRow> {
		const data: Partial<VerificationDatabaseRow> = { verification_status: params.status };
		if (params.submittedAt !== undefined) data.verification_submitted_at = params.submittedAt;

		const rows = await this._db.update(verificationTable).set(data).where(eq(verificationTable.user_id, params.userId)).returning();
		if (!rows[0]) throw new Error(`Verification row not found after update for user`);

		return rows[0];
	}
}
