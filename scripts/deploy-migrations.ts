import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
const DATABASE_ID = process.env.CF_D1_DATABASE_ID;
const API_TOKEN = process.env.CF_D1_API_TOKEN;

if (!ACCOUNT_ID || !DATABASE_ID || !API_TOKEN) {
	console.error("Missing required env vars: CF_ACCOUNT_ID, CF_D1_DATABASE_ID, CF_D1_API_TOKEN");
	process.exit(1);
}

const MIGRATIONS_DIR = resolve(import.meta.dirname, "../src/db/migrations");
const API_BASE = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`;

interface MigrationEntry {
	idx: number;
	version: string;
	when: number;
	tag: string;
	breakpoints: boolean;
}

interface Journal {
	version: string;
	dialect: string;
	entries: MigrationEntry[];
}

async function executeD1Query(sql: string): Promise<void> {
	const response = await fetch(API_BASE, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${API_TOKEN}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ sql }),
	});

	if (!response.ok) {
		const errorBody = await response.text();
		throw new Error(`D1 query failed: ${response.status} ${response.statusText} — ${errorBody}`);
	}

	const body = (await response.json()) as {
		result: { success: boolean; error?: string }[];
		errors: { code: number; message: string }[];
	};

	if (body.errors.length > 0) {
		throw new Error(`D1 error: ${body.errors.map((e) => e.message).join(", ")}`);
	}

	const firstResult = body.result[0];
	if (!firstResult?.success) {
		throw new Error(`D1 query unsuccessful: ${firstResult?.error ?? "unknown"}`);
	}
}

async function getAppliedMigrations(): Promise<Set<string>> {
	const response = await fetch(API_BASE, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${API_TOKEN}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			sql: "SELECT name FROM sqlite_master WHERE type='table' AND name='_drizzle_migrations'",
		}),
	});

	const body = (await response.json()) as { result: { results: { name?: string }[] }[] };
	const tableExists = body.result?.[0]?.results?.length > 0;

	if (!tableExists) {
		await executeD1Query(
			"CREATE TABLE IF NOT EXISTS _drizzle_migrations (id TEXT PRIMARY KEY, applied_at TEXT NOT NULL)",
		);
		return new Set();
	}

	const resultsResponse = await fetch(API_BASE, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${API_TOKEN}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			sql: "SELECT id FROM _drizzle_migrations",
		}),
	});

	const resultsBody = (await resultsResponse.json()) as { result: { results: { id: string }[] }[] };
	return new Set(resultsBody.result?.[0]?.results?.map((r) => r.id) ?? []);
}

async function recordMigration(tag: string): Promise<void> {
	await executeD1Query(
		`INSERT INTO _drizzle_migrations (id, applied_at) VALUES ('${tag}', '${new Date().toISOString()}')`,
	);
}

async function main() {
	console.log("🚀 Ventairy D1 Migration Deployer\n");

	const journalPath = resolve(MIGRATIONS_DIR, "meta/_journal.json");
	const journal: Journal = JSON.parse(readFileSync(journalPath, "utf-8"));

	console.log(`Found ${journal.entries.length} migration(s) in journal`);

	const appliedMigrations = await getAppliedMigrations();
	console.log(`${appliedMigrations.size} migration(s) already applied\n`);

	const pendingMigrations = journal.entries.filter((entry) => !appliedMigrations.has(entry.tag));

	if (pendingMigrations.length === 0) {
		console.log("✅ Database is up to date — no pending migrations");
		return;
	}

	for (const entry of pendingMigrations) {
		const sqlPath = resolve(MIGRATIONS_DIR, `${entry.tag}.sql`);
		const sqlContent = readFileSync(sqlPath, "utf-8");

		const statements = sqlContent
			.split("--> statement-breakpoint")
			.map((s) => s.trim())
			.filter((s) => s.length > 0);

		console.log(`Applying migration ${entry.tag} (${statements.length} statement(s))...`);

		for (const statement of statements) {
			try {
				await executeD1Query(statement);
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error);
				if (message.includes("already exists") || message.includes("duplicate column name") || message.includes("no such column")) {
					console.log(`   ⏭️  Skipped (already applied): ${statement.slice(0, 60)}...`);
				} else {
					console.error(`❌ Failed on statement: ${statement.slice(0, 80)}...`);
					throw error;
				}
			}
		}

		await recordMigration(entry.tag);
		console.log(`✅ ${entry.tag} applied successfully`);
	}

	console.log(`\n🎉 All ${pendingMigrations.length} migration(s) deployed successfully`);
}

main().catch((error) => {
	console.error("💥 Migration failed:", error.message);
	process.exit(1);
});
