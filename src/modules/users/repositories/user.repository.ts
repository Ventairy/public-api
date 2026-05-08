import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { DRIZZLE_DB, type DrizzleDb } from "@core/database";
import { usersTable, type UserRow, type NewUserRow } from "@db/schema/users-table";

@Injectable()
export class UserRepository {
	constructor(@Inject(DRIZZLE_DB) private readonly _db: DrizzleDb) {}

	async findById(id: string): Promise<UserRow | null> {
		const rows = await this._db.select().from(usersTable).where(eq(usersTable.id, id));
		return rows[0] ?? null;
	}

	async create(data: NewUserRow): Promise<UserRow> {
		const rows = await this._db.insert(usersTable).values(data).returning();
		const row = rows[0];

		if (!row) throw new Error("User insert returned no rows");
		return row;
	}
}
