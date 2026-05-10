import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
	drizzle,
	type SqliteRemoteDatabase,
	type AsyncRemoteCallback,
	type AsyncBatchRemoteCallback,
} from "drizzle-orm/sqlite-proxy";
import * as schema from "@db/schema";
import { DATABASE_CONFIG_KEY, type DatabaseConfig } from "../config";

const SELECT_COLUMN_NAMES_REGEX = /(?:select|returning)\s+([\s\S]+?)(?:\s+from|\s*$)/i;

@Injectable()
export class DrizzleService implements OnModuleDestroy {
	public readonly db: SqliteRemoteDatabase<typeof schema>;

	private readonly accountId: string;
	private readonly databaseId: string;
	private readonly apiToken: string;

	constructor(private readonly configService: ConfigService) {
		const dbConfig = this.configService.get<DatabaseConfig>(DATABASE_CONFIG_KEY);

		if (!dbConfig) throw new Error("Database configuration is missing");

		this.accountId = dbConfig.cloudflareAccountId;
		this.databaseId = dbConfig.databaseId;
		this.apiToken = dbConfig.apiToken;

		const remoteCallback: AsyncRemoteCallback = async (sql, params, method) => {
			const result = await this.executeD1Query(sql, params, method);
			const positionalRows = this._toPositionalRows(sql, result);
			return { rows: positionalRows };
		};

		const batchCallback: AsyncBatchRemoteCallback = async (batch) => {
			const queries = batch.map((query) => ({
				sql: query.sql,
				params: query.params,
			}));

			const rawResults = await this.executeD1Batch(queries);

			return rawResults.map((rawResult, index) => {
				if (!rawResult.success) {
					throw new Error(`D1 batch query statement ${index} returned unsuccessful result`);
				}
				const batchQuery = batch[index]!;
				const positionalRows = this._toPositionalRows(batchQuery.sql, rawResult.results);
				return { rows: positionalRows };
			});
		};

		this.db = drizzle<typeof schema>(remoteCallback, batchCallback, { schema });
	}

	private async executeD1Batch(
		queries: readonly { sql: string; params: unknown[] }[],
	): Promise<{ results: unknown[]; success: boolean; meta?: unknown }[]> {
		const url = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/d1/database/${this.databaseId}/query`;

		const response = await fetch(url, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${this.apiToken}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ batch: queries }),
		});

		if (!response.ok) {
			const errorBody = await response.text();
			throw new Error(`D1 batch query failed: ${response.status} ${response.statusText} — ${errorBody}`);
		}

		const body = (await response.json()) as {
			result: { results: unknown[]; success: boolean; meta?: unknown }[];
		};

		return body.result;
	}

	private async executeD1Query(sql: string, parameters: unknown[], _method: string): Promise<unknown[]> {
		const url = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/d1/database/${this.databaseId}/query`;

		const response = await fetch(url, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${this.apiToken}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ sql, params: parameters }),
		});

		if (!response.ok) {
			const errorBody = await response.text();
			throw new Error(`D1 query failed: ${response.status} ${response.statusText} — ${errorBody}`);
		}

		const body = (await response.json()) as {
			result: { results: unknown[]; success: boolean }[];
		};

		const firstResult = body.result[0];
		if (!firstResult?.success) {
			throw new Error("D1 query returned unsuccessful result");
		}

		return firstResult.results;
	}

	private _toPositionalRows(sql: string, namedRows: unknown[]): unknown[] {
		if (!namedRows || namedRows.length === 0) {
			return namedRows;
		}

		const columnNames = this._extractColumnNames(sql);
		if (columnNames.length === 0) {
			const firstRow = namedRows[0] as Record<string, unknown> | undefined;
			if (!firstRow) return namedRows;

			const inferredColumns = Object.keys(firstRow);
			return namedRows.map((row) => {
				const namedRow = row as Record<string, unknown>;
				return inferredColumns.map((col) => namedRow[col]);
			});
		}

		return namedRows.map((row) => {
			const namedRow = row as Record<string, unknown>;
			return columnNames.map((columnName) => namedRow[columnName]);
		});
	}

	private _extractColumnNames(sql: string): string[] {
		const columnsMatch = sql.match(SELECT_COLUMN_NAMES_REGEX);
		if (!columnsMatch?.[1]) return [];

		const columnsFragment = columnsMatch[1];
		const columnNames: string[] = [];
		const COLUMN_NAME_REGEX = /"?(\w+)"?(?:\s+as\s+"?(\w+)"?)?/gi;
		let match: RegExpExecArray | null = null;

		while ((match = COLUMN_NAME_REGEX.exec(columnsFragment)) !== null) {
			const name = match[1];
			const alias = match[2];

			if (!name) continue;
			if (name.toLowerCase() === "as") continue;

			columnNames.push(alias || name);
		}

		return columnNames;
	}

	async onModuleDestroy(): Promise<void> {
		// No persistent connection to close for HTTP-based D1 access
	}
}
