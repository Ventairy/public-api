import { describe, it, expect, vi, beforeEach } from "vitest";
import { ConfigService } from "@nestjs/config";
import { DrizzleService } from "../drizzle.service";

describe("DrizzleService", () => {
	let service: DrizzleService;
	let mockConfigService: Partial<ConfigService>;
	let fetchMock: ReturnType<typeof vi.fn>;

	const mockDbConfig = {
		cloudflareAccountId: "test-account-id",
		databaseId: "test-database-id",
		apiToken: "test-api-token",
	};

	beforeEach(() => {
		fetchMock = vi.fn();
		globalThis.fetch = fetchMock as any;
		
		mockConfigService = {
			get: vi.fn().mockReturnValue(mockDbConfig),
		};
	});

	it("should initialize correctly with valid config", () => {
		service = new DrizzleService(mockConfigService as ConfigService);
		expect(service.db).toBeDefined();
		expect(mockConfigService.get).toHaveBeenCalled();
	});

	it("should throw if config is missing", () => {
		mockConfigService.get = vi.fn().mockReturnValue(undefined);
		expect(() => new DrizzleService(mockConfigService as ConfigService)).toThrow("Database configuration is missing");
	});

	describe("executeD1Query", () => {
		it("should execute a query successfully", async () => {
			const mockResults = [{ id: 1, name: "Test" }];
			fetchMock.mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({
					result: [{ success: true, results: mockResults }]
				}),
			});

			service = new DrizzleService(mockConfigService as ConfigService);
			
			const result = await (service as any).executeD1Query("SELECT * FROM users", [], "all");
			
			expect(result).toBe(mockResults);
			expect(fetchMock).toHaveBeenCalledWith(
				expect.stringContaining("test-account-id/d1/database/test-database-id/query"),
				expect.objectContaining({
					method: "POST",
					headers: expect.objectContaining({
						Authorization: "Bearer test-api-token",
					}),
				})
			);
		});

		it("should throw if fetch fails", async () => {
			fetchMock.mockResolvedValue({
				ok: false,
				status: 500,
				statusText: "Internal Server Error",
				text: () => Promise.resolve("D1 is down"),
			});

			service = new DrizzleService(mockConfigService as ConfigService);
			
			await expect((service as any).executeD1Query("SELECT", [], "all")).rejects.toThrow("D1 query failed: 500 Internal Server Error — D1 is down");
		});

		it("should throw if query result success is false", async () => {
			fetchMock.mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({
					result: [{ success: false }]
				}),
			});

			service = new DrizzleService(mockConfigService as ConfigService);
			
			await expect((service as any).executeD1Query("SELECT", [], "all")).rejects.toThrow("D1 query returned unsuccessful result");
		});
	});

	describe("_toPositionalRows", () => {
		it("should convert named rows to positional rows for SELECT queries", async () => {
			const mockResults = [{ id: 1, name: "Test" }];
			fetchMock.mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({
					result: [{ success: true, results: mockResults }]
				}),
			});

			service = new DrizzleService(mockConfigService as ConfigService);
			
			// We can't easily trigger the proxy's internal _toPositionalRows with complex queries in unit tests 
			// without mocking the whole drizzle internals, but we can test the method directly if we cast to any.
			const sql = "SELECT id, name FROM users";
			const result = (service as any)._toPositionalRows(sql, mockResults);
			
			expect(result).toEqual([[1, "Test"]]);
		});

    it("should return empty if no named rows provided", () => {
      service = new DrizzleService(mockConfigService as ConfigService);
      expect((service as any)._toPositionalRows("SELECT *", [])).toEqual([]);
    });

		it("should infer column names from first row when SQL column extraction fails (e.g., RETURNING *)", () => {
			service = new DrizzleService(mockConfigService as ConfigService);
			const sql = 'INSERT INTO "businesses" ("id", "user_id", "legal_name") VALUES (?, ?, ?) RETURNING *';
			const rows = [{ id: "biz-1", user_id: "user-1", legal_name: "Acme" }];
			const result = (service as any)._toPositionalRows(sql, rows);

			expect(result).toEqual([["biz-1", "user-1", "Acme"]]);
		});
	});

	describe("batchCallback", () => {
		it("should execute multiple queries sequentially and return positional rows", async () => {
			fetchMock
				.mockResolvedValueOnce({
					ok: true,
					json: () => Promise.resolve({
						result: [{ success: true, results: [{ id: 1, name: "User" }] }]
					}),
				})
				.mockResolvedValueOnce({
					ok: true,
					json: () => Promise.resolve({
						result: [{ success: true, results: [{ id: "biz-1", user_id: "user-1", legal_name: "Acme Corp" }] }]
					}),
				});

			service = new DrizzleService(mockConfigService as ConfigService);

			const batchCallback = (service as any).db.session.batchCLient as (batch: { sql: string; params: unknown[]; method: string }[]) => Promise<{ rows: unknown[] }[]>;

			const results = await batchCallback([
				{ sql: "SELECT id, name FROM users WHERE id = ?", params: ["user-1"], method: "all" },
				{ sql: 'INSERT INTO "businesses" ("id", "user_id", "legal_name") VALUES (?, ?, ?) RETURNING *', params: ["biz-1", "user-1", "Acme Corp"], method: "run" },
			]);

			expect(results).toHaveLength(2);
			expect(results[0]!.rows).toEqual([[1, "User"]]);
			expect(results[1]!.rows).toEqual([["biz-1", "user-1", "Acme Corp"]]);
		});
	});

	it("should handle onModuleDestroy", async () => {
    service = new DrizzleService(mockConfigService as ConfigService);
    await expect(service.onModuleDestroy()).resolves.toBeUndefined();
  });
});
