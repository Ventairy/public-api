import { describe, it, expect, vi, beforeEach } from "vitest";
import { DRIZZLE_DB, type DrizzleDb, type AtomicDatabaseCall } from "../drizzle-db.provider";
import { AtomicDatabaseExecutionService } from "../atomic-database-execution.service";

describe("AtomicExecutionService", () => {
	let service: AtomicDatabaseExecutionService;
	let mockDb: { batch: ReturnType<typeof vi.fn> };

	beforeEach(() => {
		vi.clearAllMocks();
		mockDb = { batch: vi.fn() };
		service = new AtomicDatabaseExecutionService(mockDb as unknown as DrizzleDb);
	});

	describe("execute", () => {
		it("should execute a single AtomicCall and return processed result", async () => {
			mockDb.batch.mockResolvedValue([[{ id: 1 }]]);

			const processResult = vi.fn().mockReturnValue({ id: 1 });
			const query = "select-query" as any;

			const result = await service.execute({ query, processResult } as unknown as AtomicDatabaseCall<unknown>);

			expect(result).toEqual([{ id: 1 }]);
			expect(mockDb.batch).toHaveBeenCalledWith([query]);
			expect(processResult).toHaveBeenCalledWith([{ id: 1 }]);
		});

		it("should execute multiple AtomicCalls and return tuple of processed results", async () => {
			mockDb.batch.mockResolvedValue([[{ id: 1 }], [{ id: 2 }]]);

			const processResult1 = vi.fn().mockReturnValue({ id: 1 });
			const processResult2 = vi.fn().mockReturnValue({ id: 2 });
			const query1 = "query-1" as any;
			const query2 = "query-2" as any;

			const result = await service.execute(
				{ query: query1, processResult: processResult1 } as unknown as AtomicDatabaseCall<unknown>,
				{ query: query2, processResult: processResult2 } as unknown as AtomicDatabaseCall<unknown>,
			);

			expect(result).toEqual([{ id: 1 }, { id: 2 }]);
			expect(mockDb.batch).toHaveBeenCalledWith([query1, query2]);
			expect(processResult1).toHaveBeenCalledWith([{ id: 1 }]);
			expect(processResult2).toHaveBeenCalledWith([{ id: 2 }]);
		});

		it("should handle void AtomicCalls (e.g. inserts without returning)", async () => {
			mockDb.batch.mockResolvedValue([[]]);

			const processResult = vi.fn().mockReturnValue(undefined);

			const [result] = await service.execute({
				query: "insert-query" as any,
				processResult,
			} as unknown as AtomicDatabaseCall<void>);

			expect(result).toBeUndefined();
		});

		it("should propagate error from db.batch", async () => {
			const dbError = new Error("Batch execution failed");
			mockDb.batch.mockRejectedValue(dbError);

			await expect(
				service.execute({ query: "q" as any, processResult: vi.fn() } as unknown as AtomicDatabaseCall<unknown>),
			).rejects.toThrow(dbError);
		});

		it("should propagate error from processResult", async () => {
			mockDb.batch.mockResolvedValue([[{ id: 1 }]]);

			const processError = new Error("Processing failed");
			const processResult = vi.fn().mockImplementation(() => {
				throw processError;
			});

			await expect(
				service.execute({ query: "q" as any, processResult } as unknown as AtomicDatabaseCall<unknown>),
			).rejects.toThrow(processError);
		});

		it("should call processResult for each call in order", async () => {
			mockDb.batch.mockResolvedValue([["a"], ["b"], ["c"]]);

			const processResult1 = vi.fn();
			const processResult2 = vi.fn();
			const processResult3 = vi.fn();

			await service.execute(
				{ query: "q1" as any, processResult: processResult1 } as unknown as AtomicDatabaseCall<unknown>,
				{ query: "q2" as any, processResult: processResult2 } as unknown as AtomicDatabaseCall<unknown>,
				{ query: "q3" as any, processResult: processResult3 } as unknown as AtomicDatabaseCall<unknown>,
			);

			expect(processResult1).toHaveBeenCalledWith(["a"]);
			expect(processResult2).toHaveBeenCalledWith(["b"]);
			expect(processResult3).toHaveBeenCalledWith(["c"]);
		});
	});
});
