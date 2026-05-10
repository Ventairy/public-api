import { Inject, Injectable } from "@nestjs/common";
import { eq, lte } from "drizzle-orm";
import { DRIZZLE_DB, type DrizzleDb, type AtomicCall } from "@core/database";
import { userSessionsTable, type UserSessionRow, type NewUserSessionRow } from "@db/schema/user-sessions-table";

@Injectable()
export class UserSessionRepository {
	constructor(@Inject(DRIZZLE_DB) private readonly _db: DrizzleDb) {}

	async create(data: NewUserSessionRow): Promise<UserSessionRow> {
		const rows = await this._db.insert(userSessionsTable).values(data).returning();
		const row = rows[0];

		if (!row) throw new Error("User session insert returned no rows");
		return row;
	}

	create_atomicCall(data: NewUserSessionRow): AtomicCall<UserSessionRow> {
		const query = this._db.insert(userSessionsTable).values(data).returning();

		return {
			query,
			processResult: (rawRows: unknown[]) => {
				const rows = rawRows as UserSessionRow[];
				const row = rows[0];

				if (!row) throw new Error("User session insert returned no rows");
				return row;
			},
		};
	}

	async findByRefreshTokenHash(hash: string): Promise<UserSessionRow | undefined> {
		const rows = await this._db.select().from(userSessionsTable).where(eq(userSessionsTable.refresh_token_hash, hash));
		return rows[0];
	}

	async findById(id: string): Promise<UserSessionRow | undefined> {
		const rows = await this._db.select().from(userSessionsTable).where(eq(userSessionsTable.id, id));
		return rows[0];
	}

	async findByUserId(userId: string): Promise<UserSessionRow[]> {
		return this._db.select().from(userSessionsTable).where(eq(userSessionsTable.user_id, userId));
	}

	async updateRefreshTokenHash(params: {
		id: string;
		refreshTokenHash: string;
		expiresAt: string;
		updatedAt: string;
	}): Promise<UserSessionRow> {
		const rows = await this._db
			.update(userSessionsTable)
			.set({
				refresh_token_hash: params.refreshTokenHash,
				expires_at: params.expiresAt,
				updated_at: params.updatedAt,
			})
			.where(eq(userSessionsTable.id, params.id))
			.returning();

		const row = rows[0];

		if (!row) throw new Error(`User session ${params.id} not updated`);
		return row;
	}

	async deleteById(id: string): Promise<void> {
		await this._db.delete(userSessionsTable).where(eq(userSessionsTable.id, id));
	}

	async deleteByUserId(userId: string): Promise<void> {
		await this._db.delete(userSessionsTable).where(eq(userSessionsTable.user_id, userId));
	}

	async deleteExpired(): Promise<number> {
		const rows = await this._db
			.delete(userSessionsTable)
			.where(lte(userSessionsTable.expires_at, new Date().toISOString()))
			.returning();

		return rows.length;
	}
}
