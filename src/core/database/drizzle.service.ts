import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
	drizzle,
	type SqliteRemoteDatabase,
	type AsyncRemoteCallback,
} from "drizzle-orm/sqlite-proxy";
import * as schema from "@db/schema";
import { type DatabaseConfig, databaseConfig } from "../config";

@Injectable()
export class DrizzleService implements OnModuleDestroy {
	public readonly db: SqliteRemoteDatabase<typeof schema>;

	private readonly accountId: string;
	private readonly databaseId: string;
	private readonly apiToken: string;

	constructor(private readonly configService: ConfigService) {
		const dbConfig = this.configService.get<DatabaseConfig>(databaseConfig.KEY);

		if (!dbConfig) throw new Error("Database configuration is missing");

		this.accountId = dbConfig.cloudflareAccountId;
		this.databaseId = dbConfig.databaseId;
		this.apiToken = dbConfig.apiToken;

		const remoteCallback: AsyncRemoteCallback = async (sql, params, method) => {
			const result = await this.executeD1Query(sql, params, method);
			return { rows: result };
		};

		this.db = drizzle<typeof schema>(remoteCallback, { schema });
	}

	private async executeD1Query(
		sql: string,
		parameters: unknown[],
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		_method: string,
	): Promise<unknown[]> {
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

	async onModuleDestroy(): Promise<void> {
		// No persistent connection to close for HTTP-based D1 access
	}
}
