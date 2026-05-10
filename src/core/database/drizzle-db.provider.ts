import { type SqliteRemoteDatabase } from "drizzle-orm/sqlite-proxy";
import type { BatchItem } from "drizzle-orm/batch";
import * as schema from "@db/schema";

export const DRIZZLE_DB = Symbol("DRIZZLE_DB");

export type DrizzleDb = SqliteRemoteDatabase<typeof schema>;

export interface AtomicDatabaseCall<TResult> {
	readonly query: BatchItem<"sqlite">;
	readonly processResult: (rawRows: unknown[]) => TResult;
}
