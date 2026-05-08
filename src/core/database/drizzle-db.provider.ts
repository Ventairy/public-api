import { type SqliteRemoteDatabase } from "drizzle-orm/sqlite-proxy";
import * as schema from "@db/schema";

export const DRIZZLE_DB = Symbol("DRIZZLE_DB");

export type DrizzleDb = SqliteRemoteDatabase<typeof schema>;
