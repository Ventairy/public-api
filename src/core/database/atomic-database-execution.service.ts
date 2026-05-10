import { Injectable, Inject } from "@nestjs/common";
import { DRIZZLE_DB, type DrizzleDb, type AtomicDatabaseCall } from "./drizzle-db.provider";

@Injectable()
export class AtomicDatabaseExecutionService {
	constructor(@Inject(DRIZZLE_DB) private readonly _db: DrizzleDb) {}

	async execute<T extends unknown[]>(...calls: { [K in keyof T]: AtomicDatabaseCall<T[K]> }): Promise<T> {
		const queries = calls.map((call) => call.query);

		const rawResults = await this._db.batch(
			queries as [AtomicDatabaseCall<unknown>["query"], ...AtomicDatabaseCall<unknown>["query"][]],
		);

		return calls.map((call, index) => {
			const batchResult = rawResults[index];

			const rows = Array.isArray(batchResult)
				? batchResult
				: ((batchResult as { rows?: unknown[] }).rows ?? batchResult);

			return call.processResult(rows);
		}) as T;
	}
}
