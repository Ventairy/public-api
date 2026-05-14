import { Inject, Injectable } from "@nestjs/common";
import { and, eq, inArray } from "drizzle-orm";
import { DRIZZLE_DB, type DrizzleDb } from "@core/database";
import { businessesTable, type BusinessDatabaseRow, type NewBusinessDatabaseRow } from "@db/schema/businesses-table";
import {
	businessControllersTable,
	type BusinessControllerDatabaseRow,
	type NewBusinessControllerDatabaseRow,
} from "@db/schema/business-controllers-table";
import { businessFilesTable, type BusinessFileRow, type NewBusinessFileRow } from "@db/schema/business-files-table";
import {
	businessControllerFilesTable,
	type BusinessControllerFileRow,
	type NewBusinessControllerFileRow,
} from "@db/schema/business-controller-files-table";
import { type BusinessFileType, type BusinessControllerFileType } from "@shared/enums";

@Injectable()
export class BusinessRepository {
	constructor(@Inject(DRIZZLE_DB) private readonly _db: DrizzleDb) {}

	async findBusinessByUserId(userId: string): Promise<BusinessDatabaseRow | null> {
		const rows = await this._db.select().from(businessesTable).where(eq(businessesTable.user_id, userId));
		return rows[0] ?? null;
	}

	async insertBusiness(data: NewBusinessDatabaseRow): Promise<BusinessDatabaseRow> {
		const rows = await this._db.insert(businessesTable).values(data).returning();
		const row = rows[0];
		if (!row) throw new Error("Business insert returned no rows");
		return row;
	}

	async updateBusiness(id: string, data: Partial<BusinessDatabaseRow>): Promise<BusinessDatabaseRow> {
		const rows = await this._db.update(businessesTable).set(data).where(eq(businessesTable.id, id)).returning();
		const row = rows[0];

		if (!row) throw new Error(`Business ${id} not updated`);
		return row;
	}

	async findControllersByBusinessId(businessId: string): Promise<BusinessControllerDatabaseRow[]> {
		return this._db.select().from(businessControllersTable).where(eq(businessControllersTable.business_id, businessId));
	}

	async findBusinessControllerById(controllerId: string): Promise<BusinessControllerDatabaseRow | null> {
		const rows = await this._db
			.select()
			.from(businessControllersTable)
			.where(eq(businessControllersTable.id, controllerId));

		return rows[0] ?? null;
	}

	async insertBusinessController(data: NewBusinessControllerDatabaseRow): Promise<BusinessControllerDatabaseRow> {
		const rows = await this._db.insert(businessControllersTable).values(data).returning();
		const row = rows[0];

		if (!row) throw new Error("Controller insert returned no rows");
		return row;
	}

	async updateBusinessController(
		id: string,
		data: Partial<BusinessControllerDatabaseRow>,
	): Promise<BusinessControllerDatabaseRow> {
		const rows = await this._db
			.update(businessControllersTable)
			.set(data)
			.where(eq(businessControllersTable.id, id))
			.returning();

		const row = rows[0];

		if (!row) throw new Error(`Business controller ${id} not updated`);
		return row;
	}

	async insertBusinessFile(data: NewBusinessFileRow): Promise<BusinessFileRow> {
		const rows = await this._db.insert(businessFilesTable).values(data).returning();
		const row = rows[0];

		if (!row) throw new Error("File insert returned no rows");
		return row;
	}

	async updateBusinessFile(
		id: string,
		data: Omit<BusinessFileRow, "id" | "created_at" | "file_type" | "user_id">,
	): Promise<BusinessFileRow> {
		const rows = await this._db.update(businessFilesTable).set(data).where(eq(businessFilesTable.id, id)).returning();
		const row = rows[0];

		if (!row) throw new Error(`Business file ${id} not updated`);
		return row;
	}

	async findBusinessFile(userId: string, fileType: BusinessFileType): Promise<BusinessFileRow | undefined> {
		const rows = await this._db
			.select()
			.from(businessFilesTable)
			.where(and(eq(businessFilesTable.user_id, userId), eq(businessFilesTable.file_type, fileType)));

		return rows[0];
	}

	async findBusinessFileTypesByUserId(userId: string): Promise<BusinessFileType[]> {
		const rows = await this._db
			.select({ file_type: businessFilesTable.file_type })
			.from(businessFilesTable)
			.where(eq(businessFilesTable.user_id, userId));

		return rows.map((r) => r.file_type);
	}

	async insertBusinessControllerFile(data: NewBusinessControllerFileRow): Promise<BusinessControllerFileRow> {
		const rows = await this._db.insert(businessControllerFilesTable).values(data).returning();
		const row = rows[0];
		if (!row) throw new Error("Controller file insert returned no rows");
		return row;
	}

	async updateBusinessControllerFile(
		id: string,
		data: Omit<BusinessControllerFileRow, "id" | "created_at" | "controller_id" | "user_id" | "file_type">,
	): Promise<BusinessControllerFileRow> {
		const rows = await this._db
			.update(businessControllerFilesTable)
			.set(data)
			.where(eq(businessControllerFilesTable.id, id))
			.returning();

		const row = rows[0];

		if (!row) throw new Error(`Business controller file ${id} not updated`);
		return row;
	}

	async findBusinessControllerFile(
		userId: string,
		controllerId: string,
		fileType: BusinessControllerFileType,
	): Promise<BusinessControllerFileRow | undefined> {
		const rows = await this._db
			.select()
			.from(businessControllerFilesTable)
			.where(
				and(
					eq(businessControllerFilesTable.user_id, userId),
					eq(businessControllerFilesTable.controller_id, controllerId),
					eq(businessControllerFilesTable.file_type, fileType),
				),
			);
		return rows[0];
	}

	async findBusinessControllerFileTypesByControllerIds(
		controllerIds: string[],
	): Promise<Map<string, BusinessControllerFileType[]>> {
		const map = new Map<string, BusinessControllerFileType[]>();
		if (controllerIds.length === 0) return map;

		const rows = await this._db
			.select({
				controller_id: businessControllerFilesTable.controller_id,
				file_type: businessControllerFilesTable.file_type,
			})
			.from(businessControllerFilesTable)
			.where(inArray(businessControllerFilesTable.controller_id, controllerIds));

		for (const row of rows) {
			const existing = map.get(row.controller_id) ?? [];
			map.set(row.controller_id, [...existing, row.file_type]);
		}

		return map;
	}
}
