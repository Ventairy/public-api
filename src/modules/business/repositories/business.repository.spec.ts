import { describe, it, expect, vi, beforeEach } from "vitest";
import { DRIZZLE_DB, type DrizzleDb } from "@core/database";
import { BusinessRepository } from "./business.repository";
import { BusinessFileType } from "@shared/enums/business-file-type";
import { BusinessControllerFileType } from "@shared/enums/business-controller-file-type";
import { BusinessControllerRole } from "@shared/enums/business-controller-role";

const MOCK_USER_ID = "user-123";
const MOCK_BUSINESS_ID = "biz-456";
const MOCK_CONTROLLER_ID = "ctrl-789";

function createMockDb() {
	return {
		select: vi.fn().mockReturnThis(),
		from: vi.fn().mockReturnThis(),
		where: vi.fn(),
		insert: vi.fn().mockReturnThis(),
		values: vi.fn().mockReturnThis(),
		returning: vi.fn(),
		update: vi.fn().mockReturnThis(),
		set: vi.fn().mockReturnThis(),
		delete: vi.fn().mockReturnThis(),
	};
}

describe("BusinessRepository", () => {
	let repository: BusinessRepository;
	let mockDb: ReturnType<typeof createMockDb>;

	beforeEach(() => {
		vi.clearAllMocks();
		mockDb = createMockDb();
		repository = new BusinessRepository(mockDb as unknown as DrizzleDb);
	});

	describe("findBusinessByUserId", () => {
		it("should return business when found", async () => {
			const expected = { id: MOCK_BUSINESS_ID, user_id: MOCK_USER_ID };
			const selectBuilder = { from: vi.fn().mockReturnThis(), where: vi.fn() };
			mockDb.select.mockReturnValue(selectBuilder);
			selectBuilder.where.mockResolvedValue([expected]);

			const result = await repository.findBusinessByUserId(MOCK_USER_ID);

			expect(result).toEqual(expected);
		});

		it("should return null when not found", async () => {
			const selectBuilder = { from: vi.fn().mockReturnThis(), where: vi.fn() };
			mockDb.select.mockReturnValue(selectBuilder);
			selectBuilder.where.mockResolvedValue([]);

			const result = await repository.findBusinessByUserId("nonexistent");

			expect(result).toBeNull();
		});
	});

	describe("insertBusiness", () => {
		it("should insert and return the business row", async () => {
			const inserted = { id: MOCK_BUSINESS_ID, user_id: MOCK_USER_ID };
			const insertBuilder = { values: vi.fn().mockReturnThis(), returning: vi.fn() };
			mockDb.insert.mockReturnValue(insertBuilder);
			insertBuilder.returning.mockResolvedValue([inserted]);

			const result = await repository.insertBusiness({ id: MOCK_BUSINESS_ID, user_id: MOCK_USER_ID });

			expect(result).toEqual(inserted);
		});

		it("should throw when insert returns empty", async () => {
			const insertBuilder = { values: vi.fn().mockReturnThis(), returning: vi.fn() };
			mockDb.insert.mockReturnValue(insertBuilder);
			insertBuilder.returning.mockResolvedValue([]);

			await expect(repository.insertBusiness({ id: MOCK_BUSINESS_ID, user_id: MOCK_USER_ID })).rejects.toThrow(
				"Business insert returned no rows",
			);
		});
	});

	describe("updateBusiness", () => {
		it("should update and return the updated row", async () => {
			const updated = { id: MOCK_BUSINESS_ID, user_id: MOCK_USER_ID, legal_name: "Updated" };
			const updateBuilder = { set: vi.fn().mockReturnThis(), where: vi.fn().mockReturnThis(), returning: vi.fn() };
			mockDb.update.mockReturnValue(updateBuilder);
			updateBuilder.returning.mockResolvedValue([updated]);

			const result = await repository.updateBusiness(MOCK_BUSINESS_ID, { legal_name: "Updated" });

			expect(result).toEqual(updated);
		});

		it("should return undefined when no row matches", async () => {
			const updateBuilder = { set: vi.fn().mockReturnThis(), where: vi.fn().mockReturnThis(), returning: vi.fn() };
			mockDb.update.mockReturnValue(updateBuilder);
			updateBuilder.returning.mockResolvedValue([]);

			const result = await repository.updateBusiness("nonexistent", { legal_name: "Updated" });

			expect(result).toBeUndefined();
		});
	});

	describe("findControllersByBusinessId", () => {
		it("should return controllers for a business", async () => {
			const expected = [{ id: MOCK_CONTROLLER_ID, business_id: MOCK_BUSINESS_ID }];
			const selectBuilder = { from: vi.fn().mockReturnThis(), where: vi.fn() };
			mockDb.select.mockReturnValue(selectBuilder);
			selectBuilder.where.mockResolvedValue(expected);

			const result = await repository.findControllersByBusinessId(MOCK_BUSINESS_ID);

			expect(result).toEqual(expected);
		});

		it("should return empty array when no controllers exist", async () => {
			const selectBuilder = { from: vi.fn().mockReturnThis(), where: vi.fn() };
			mockDb.select.mockReturnValue(selectBuilder);
			selectBuilder.where.mockResolvedValue([]);

			const result = await repository.findControllersByBusinessId(MOCK_BUSINESS_ID);

			expect(result).toEqual([]);
		});
	});

	describe("findControllerById", () => {
		it("should return controller when found", async () => {
			const expected = { id: MOCK_CONTROLLER_ID, business_id: MOCK_BUSINESS_ID };
			const selectBuilder = { from: vi.fn().mockReturnThis(), where: vi.fn() };
			mockDb.select.mockReturnValue(selectBuilder);
			selectBuilder.where.mockResolvedValue([expected]);

			const result = await repository.findBusinessControllerById(MOCK_CONTROLLER_ID);

			expect(result).toEqual(expected);
		});

		it("should return null when not found", async () => {
			const selectBuilder = { from: vi.fn().mockReturnThis(), where: vi.fn() };
			mockDb.select.mockReturnValue(selectBuilder);
			selectBuilder.where.mockResolvedValue([]);

			const result = await repository.findBusinessControllerById("nonexistent");

			expect(result).toBeNull();
		});
	});

	describe("insertController", () => {
		it("should insert and return the controller row", async () => {
			const inserted = { id: MOCK_CONTROLLER_ID, business_id: MOCK_BUSINESS_ID };
			const insertBuilder = { values: vi.fn().mockReturnThis(), returning: vi.fn() };
			mockDb.insert.mockReturnValue(insertBuilder);
			insertBuilder.returning.mockResolvedValue([inserted]);

			const result = await repository.insertBusinessController({
				id: MOCK_CONTROLLER_ID,
				business_id: MOCK_BUSINESS_ID,
			});

			expect(result).toEqual(inserted);
		});

		it("should throw when insert returns empty", async () => {
			const insertBuilder = { values: vi.fn().mockReturnThis(), returning: vi.fn() };
			mockDb.insert.mockReturnValue(insertBuilder);
			insertBuilder.returning.mockResolvedValue([]);

			await expect(
				repository.insertBusinessController({ id: MOCK_CONTROLLER_ID, business_id: MOCK_BUSINESS_ID }),
			).rejects.toThrow("Controller insert returned no rows");
		});
	});

	describe("updateController", () => {
		it("should update and return the updated row", async () => {
			const updated = { id: MOCK_CONTROLLER_ID, business_id: MOCK_BUSINESS_ID, legal_first_name: "John" };
			const updateBuilder = { set: vi.fn().mockReturnThis(), where: vi.fn().mockReturnThis(), returning: vi.fn() };
			mockDb.update.mockReturnValue(updateBuilder);
			updateBuilder.returning.mockResolvedValue([updated]);

			const result = await repository.updateBusinessController(MOCK_CONTROLLER_ID, { legal_first_name: "John" });

			expect(result).toEqual(updated);
		});

		it("should return undefined when no row matches", async () => {
			const updateBuilder = { set: vi.fn().mockReturnThis(), where: vi.fn().mockReturnThis(), returning: vi.fn() };
			mockDb.update.mockReturnValue(updateBuilder);
			updateBuilder.returning.mockResolvedValue([]);

			const result = await repository.updateBusinessController("nonexistent", { legal_first_name: "John" });

			expect(result).toBeUndefined();
		});
	});

	describe("insertBusinessFile", () => {
		it("should insert and return the file row", async () => {
			const inserted = { id: "file-1", user_id: MOCK_USER_ID, file_name: "doc.pdf" };
			const insertBuilder = { values: vi.fn().mockReturnThis(), returning: vi.fn() };
			mockDb.insert.mockReturnValue(insertBuilder);
			insertBuilder.returning.mockResolvedValue([inserted]);

			const result = await repository.insertBusinessFile(inserted as any);

			expect(result).toEqual(inserted);
		});

		it("should throw when insert returns empty", async () => {
			const insertBuilder = { values: vi.fn().mockReturnThis(), returning: vi.fn() };
			mockDb.insert.mockReturnValue(insertBuilder);
			insertBuilder.returning.mockResolvedValue([]);

			await expect(repository.insertBusinessFile({} as any)).rejects.toThrow("File insert returned no rows");
		});
	});

	describe("findBusinessFile", () => {
		it("should return file row when found", async () => {
			const expected = { id: "file-1", user_id: MOCK_USER_ID, file_type: BusinessFileType.INCORPORATION_DOCUMENT };
			const selectBuilder = { from: vi.fn().mockReturnThis(), where: vi.fn() };
			mockDb.select.mockReturnValue(selectBuilder);
			selectBuilder.where.mockResolvedValue([expected]);

			const result = await repository.findBusinessFile(MOCK_USER_ID, BusinessFileType.INCORPORATION_DOCUMENT);

			expect(result).toEqual(expected);
		});

		it("should return undefined when not found", async () => {
			const selectBuilder = { from: vi.fn().mockReturnThis(), where: vi.fn() };
			mockDb.select.mockReturnValue(selectBuilder);
			selectBuilder.where.mockResolvedValue([]);

			const result = await repository.findBusinessFile(MOCK_USER_ID, BusinessFileType.PROOF_OF_ADDRESS);

			expect(result).toBeUndefined();
		});
	});

	describe("findBusinessFileTypesByUserId", () => {
		it("should return file types for a user", async () => {
			const selectBuilder = { from: vi.fn().mockReturnThis(), where: vi.fn() };
			mockDb.select.mockReturnValue(selectBuilder);
			selectBuilder.where.mockResolvedValue([{ file_type: BusinessFileType.INCORPORATION_DOCUMENT }]);

			const result = await repository.findBusinessFileTypesByUserId(MOCK_USER_ID);

			expect(result).toEqual([BusinessFileType.INCORPORATION_DOCUMENT]);
		});
	});

	describe("insertControllerFile", () => {
		it("should insert and return the controller file row", async () => {
			const inserted = { id: "file-1", controller_id: MOCK_CONTROLLER_ID };
			const insertBuilder = { values: vi.fn().mockReturnThis(), returning: vi.fn() };
			mockDb.insert.mockReturnValue(insertBuilder);
			insertBuilder.returning.mockResolvedValue([inserted]);

			const result = await repository.insertControllerFile(inserted as any);

			expect(result).toEqual(inserted);
		});

		it("should throw when insert returns empty", async () => {
			const insertBuilder = { values: vi.fn().mockReturnThis(), returning: vi.fn() };
			mockDb.insert.mockReturnValue(insertBuilder);
			insertBuilder.returning.mockResolvedValue([]);

			await expect(repository.insertControllerFile({} as any)).rejects.toThrow(
				"Controller file insert returned no rows",
			);
		});
	});

	describe("findControllerFile", () => {
		it("should return controller file when found", async () => {
			const expected = {
				id: "file-1",
				controller_id: MOCK_CONTROLLER_ID,
				file_type: BusinessControllerFileType.IDENTIFICATION_FRONT,
			};
			const selectBuilder = { from: vi.fn().mockReturnThis(), where: vi.fn() };
			mockDb.select.mockReturnValue(selectBuilder);
			selectBuilder.where.mockResolvedValue([expected]);

			const result = await repository.findControllerFile(
				MOCK_CONTROLLER_ID,
				BusinessControllerFileType.IDENTIFICATION_FRONT,
			);

			expect(result).toEqual(expected);
		});

		it("should return undefined when not found", async () => {
			const selectBuilder = { from: vi.fn().mockReturnThis(), where: vi.fn() };
			mockDb.select.mockReturnValue(selectBuilder);
			selectBuilder.where.mockResolvedValue([]);

			const result = await repository.findControllerFile(
				MOCK_CONTROLLER_ID,
				BusinessControllerFileType.IDENTIFICATION_BACK,
			);

			expect(result).toBeUndefined();
		});
	});

	describe("findControllerFileTypesByControllerIds", () => {
		it("should return file types map for given controller ids", async () => {
			const selectBuilder = { from: vi.fn().mockReturnThis(), where: vi.fn() };
			mockDb.select.mockReturnValue(selectBuilder);
			selectBuilder.where.mockResolvedValue([
				{ controller_id: MOCK_CONTROLLER_ID, file_type: BusinessControllerFileType.IDENTIFICATION_FRONT },
			]);

			const result = await repository.findControllerFileTypesByControllerIds([MOCK_CONTROLLER_ID]);

			expect(result).toBeInstanceOf(Map);
			expect(result.get(MOCK_CONTROLLER_ID)).toEqual([BusinessControllerFileType.IDENTIFICATION_FRONT]);
		});

		it("should return empty map when controllerIds is empty", async () => {
			const result = await repository.findControllerFileTypesByControllerIds([]);

			expect(result).toBeInstanceOf(Map);
			expect(result.size).toBe(0);
			expect(mockDb.select).not.toHaveBeenCalled();
		});
	});
});
