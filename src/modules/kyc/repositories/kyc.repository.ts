import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DRIZZLE_DB, type DrizzleDb, type AtomicCall } from "@core/database";
import { kycTable, type KycRow, type NewKycRow } from "@db/schema/kyc-table";
import { VentairyKycStatus } from "@shared/constants";

@Injectable()
export class KycRepository {
	constructor(@Inject(DRIZZLE_DB) private readonly _db: DrizzleDb) {}

	async findByUserId(userId: string): Promise<KycRow | undefined> {
		const rows = await this._db.select().from(kycTable).where(eq(kycTable.user_id, userId));
		return rows[0];
	}

	async create(data: NewKycRow): Promise<void> {
		await this._db.insert(kycTable).values(data);
	}

	create_atomicCall(data: NewKycRow): AtomicCall<void> {
		const query = this._db.insert(kycTable).values(data);

		return {
			query,
			processResult: () => undefined,
		};
	}

	async updateStatusByUserId(params: {
		userId: string;
		status: VentairyKycStatus;
		submittedAt?: string;
	}): Promise<KycRow> {
		const data: Partial<KycRow> = { ventairy_kyc_status: params.status };
		if (params.submittedAt !== undefined) data.kyc_submitted_at = params.submittedAt;

		const rows = await this._db.update(kycTable).set(data).where(eq(kycTable.user_id, params.userId)).returning();
		if (!rows[0]) throw new Error(`KYC row not found after update for user`);

		return rows[0];
	}
}
