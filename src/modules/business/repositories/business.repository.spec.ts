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

		it("should throw when no row matches", async () => {
			const updateBuilder = { set: vi.fn().mockReturnThis(), where: vi.fn().mockReturnThis(), returning: vi.fn() };
			mockDb.update.mockReturnValue(updateBuilder);
			updateBuilder.returning.mockResolvedValue([]);

			await expect(repository.updateBusiness("nonexistent", { legal_name: "Updated" })).rejects.toThrow(
				"Business nonexistent not updated",
			);
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

		it("should throw when no row matches", async () => {
			const updateBuilder = { set: vi.fn().mockReturnThis(), where: vi.fn().mockReturnThis(), returning: vi.fn() };
			mockDb.update.mockReturnValue(updateBuilder);
			updateBuilder.returning.mockResolvedValue([]);

			await expect(repository.updateBusinessController("nonexistent", { legal_first_name: "John" })).rejects.toThrow(
				"Business controller nonexistent not updated",
			);
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

	describe("updateBusinessFile", () => {
		it("should update and return the updated file row", async () => {
			const updated = {
				id: "file-1",
				user_id: MOCK_USER_ID,
				file_name: "new-doc.pdf",
				file_size: 2048,
				mime_type: "application/pdf",
				file_type: BusinessFileType.INCORPORATION_DOCUMENT,
				r2_key: "new-r2-key",
				created_at: "2026-05-04T14:48:00.000Z",
			};
			const updateBuilder = { set: vi.fn().mockReturnThis(), where: vi.fn().mockReturnThis(), returning: vi.fn() };
			mockDb.update.mockReturnValue(updateBuilder);
			updateBuilder.returning.mockResolvedValue([updated]);

			const result = await repository.updateBusinessFile("file-1", {
				file_name: "new-doc.pdf",
				file_size: 2048,
				mime_type: "application/pdf",
				r2_key: "new-r2-key",
			});

			expect(result).toEqual(updated);
		});

		it("should throw when no row matches", async () => {
			const updateBuilder = { set: vi.fn().mockReturnThis(), where: vi.fn().mockReturnThis(), returning: vi.fn() };
			mockDb.update.mockReturnValue(updateBuilder);
			updateBuilder.returning.mockResolvedValue([]);

			await expect(repository.updateBusinessFile("nonexistent", { file_name: "new.pdf", file_size: 100, mime_type: "application/pdf", r2_key: "key" })).rejects.toThrow(
				"Business file nonexistent not updated",
			);
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

	describe("insertBusinessControllerFile", () => {
		it("should insert and return the controller file row", async () => {
			const inserted = { id: "file-1", controller_id: MOCK_CONTROLLER_ID, user_id: MOCK_USER_ID };
			const insertBuilder = { values: vi.fn().mockReturnThis(), returning: vi.fn() };
			mockDb.insert.mockReturnValue(insertBuilder);
			insertBuilder.returning.mockResolvedValue([inserted]);

			const result = await repository.insertBusinessControllerFile(inserted as any);

			expect(result).toEqual(inserted);
		});

		it("should throw when insert returns empty", async () => {
			const insertBuilder = { values: vi.fn().mockReturnThis(), returning: vi.fn() };
			mockDb.insert.mockReturnValue(insertBuilder);
			insertBuilder.returning.mockResolvedValue([]);

			await expect(repository.insertBusinessControllerFile({} as any)).rejects.toThrow(
				"Controller file insert returned no rows",
			);
		});
	});

	describe("updateControllerFile", () => {
		it("should update and return the updated controller file row", async () => {
			const updated = {
				id: "file-1",
				controller_id: MOCK_CONTROLLER_ID,
				user_id: MOCK_USER_ID,
				file_name: "new-passport.jpg",
				file_size: 4096,
				mime_type: "image/jpeg",
				file_type: BusinessControllerFileType.IDENTIFICATION_FRONT,
				r2_key: "new-r2-key",
				created_at: "2026-05-04T14:48:00.000Z",
			};
			const updateBuilder = { set: vi.fn().mockReturnThis(), where: vi.fn().mockReturnThis(), returning: vi.fn() };
			mockDb.update.mockReturnValue(updateBuilder);
			updateBuilder.returning.mockResolvedValue([updated]);

			const result = await repository.updateBusinessControllerFile("file-1", {
				file_name: "new-passport.jpg",
				file_size: 4096,
				mime_type: "image/jpeg",
				r2_key: "new-r2-key",
			});

			expect(result).toEqual(updated);
		});

		it("should throw when no row matches", async () => {
			const updateBuilder = { set: vi.fn().mockReturnThis(), where: vi.fn().mockReturnThis(), returning: vi.fn() };
			mockDb.update.mockReturnValue(updateBuilder);
			updateBuilder.returning.mockResolvedValue([]);

			await expect(repository.updateBusinessControllerFile("nonexistent", { file_name: "new.jpg", file_size: 100, mime_type: "image/jpeg", r2_key: "key" })).rejects.toThrow(
				"Business controller file nonexistent not updated",
			);
		});
	});

	describe("findBusinessControllerFile", () => {
		it("should return controller file when found", async () => {
			const expectedFile = {
				id: "file-1",
				controller_id: MOCK_CONTROLLER_ID,
				file_type: BusinessControllerFileType.IDENTIFICATION_FRONT,
			};
			const selectBuilder = { from: vi.fn().mockReturnThis(), where: vi.fn() };
			mockDb.select.mockReturnValue(selectBuilder);
			selectBuilder.where.mockResolvedValueOnce([expectedFile]);

			const result = await repository.findBusinessControllerFile(
				MOCK_USER_ID,
				MOCK_CONTROLLER_ID,
				BusinessControllerFileType.IDENTIFICATION_FRONT,
			);

			expect(result).toEqual(expectedFile);
		});

		it("should return undefined when file not found", async () => {
			const selectBuilder = { from: vi.fn().mockReturnThis(), where: vi.fn() };
			mockDb.select.mockReturnValue(selectBuilder);
			selectBuilder.where.mockResolvedValueOnce([]);

			const result = await repository.findBusinessControllerFile(
				MOCK_USER_ID,
				MOCK_CONTROLLER_ID,
				BusinessControllerFileType.IDENTIFICATION_BACK,
			);

			expect(result).toBeUndefined();
		});

		it("should return undefined when controller does not belong to the user", async () => {
			const selectBuilder = { from: vi.fn().mockReturnThis(), where: vi.fn() };
			mockDb.select.mockReturnValue(selectBuilder);
			selectBuilder.where.mockResolvedValueOnce([]);

			const result = await repository.findBusinessControllerFile(
				MOCK_USER_ID,
				"controller-from-other-business",
				BusinessControllerFileType.IDENTIFICATION_FRONT,
			);

			expect(result).toBeUndefined();
		});

		it("should return undefined when user has no business", async () => {
			const selectBuilder = { from: vi.fn().mockReturnThis(), where: vi.fn() };
			mockDb.select.mockReturnValue(selectBuilder);
			selectBuilder.where.mockResolvedValueOnce([]);

			const result = await repository.findBusinessControllerFile(
				MOCK_USER_ID,
				MOCK_CONTROLLER_ID,
				BusinessControllerFileType.IDENTIFICATION_FRONT,
			);

			expect(result).toBeUndefined();
		});
	});

	describe("findBusinessControllerFileTypesByControllerIds", () => {
		it("should return file types map for given controller ids", async () => {
			const selectBuilder = { from: vi.fn().mockReturnThis(), where: vi.fn() };
			mockDb.select.mockReturnValue(selectBuilder);
			selectBuilder.where.mockResolvedValue([
				{ controller_id: MOCK_CONTROLLER_ID, file_type: BusinessControllerFileType.IDENTIFICATION_FRONT },
			]);

			const result = await repository.findBusinessControllerFileTypesByControllerIds([MOCK_CONTROLLER_ID]);

			expect(result).toBeInstanceOf(Map);
			expect(result.get(MOCK_CONTROLLER_ID)).toEqual([BusinessControllerFileType.IDENTIFICATION_FRONT]);
		});

		it("should return empty map when controllerIds is empty", async () => {
			const result = await repository.findBusinessControllerFileTypesByControllerIds([]);

			expect(result).toBeInstanceOf(Map);
			expect(result.size).toBe(0);
			expect(mockDb.select).not.toHaveBeenCalled();
		});
	});
});
