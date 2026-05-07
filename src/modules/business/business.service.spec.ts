import { describe, it, expect, vi, beforeEach } from "vitest";
import { BusinessFileType } from "@shared/enums/business-file-type";
import { BusinessControllerFileType } from "@shared/enums/business-controller-file-type";
import { BusinessControllerRole } from "@shared/enums/business-controller-role";
import { R2BucketType } from "@shared/enums/r2-bucket-type";
import { FileTooLargeException } from "@shared/exceptions/file-too-large.exception";
import { BusinessFileNotFoundException } from "@shared/exceptions/business-file-not-found.exception";
import { BusinessControllerFileNotFoundException } from "@shared/exceptions/business-controller-file-not-found.exception";
import { BusinessControllerNotFoundException } from "@shared/exceptions/business-controller-not-found.exception";
import { BusinessNotFoundException } from "@shared/exceptions/business-not-found.exception";
import { UserNotFoundException } from "@shared/exceptions/user-not-found.exception";
import { BusinessService } from "./business.service";
import { BUSINESS_MAX_FILE_SIZE_BYTES } from "./business.constants";
import { businessesTable } from "@db/schema/businesses-table";
import { businessControllersTable } from "@db/schema/business-controllers-table";

const MOCK_USER_ID = "user-123";
const MOCK_FILE_ID = "file-abc";
const MOCK_BUSINESS_ID = "biz-456";
const MOCK_CONTROLLER_ID = "ctrl-789";

function createMockDb() {
	return {
		select: vi.fn().mockReturnThis(),
		from: vi.fn().mockReturnThis(),
		where: vi.fn().mockReturnThis(),
		set: vi.fn().mockReturnThis(),
		values: vi.fn().mockReturnThis(),
		returning: vi.fn(),
		insert: vi.fn().mockReturnThis(),
		update: vi.fn().mockReturnThis(),
		delete: vi.fn().mockReturnThis(),
	};
}

function createMockDrizzleService() {
	return { db: createMockDb() };
}

function createMockR2StorageService() {
	return {
		uploadFile: vi.fn().mockResolvedValue(undefined),
		getFileBuffer: vi.fn().mockResolvedValue(Buffer.from("file-content")),
		deleteFile: vi.fn().mockResolvedValue(undefined),
		generateFileKey: vi.fn(
			(params: { folder: string; fileId: string; fileName: string }) =>
				`${params.folder}/${params.fileId}-${params.fileName}`,
		),
	};
}

function createMockUser(overrides: Record<string, unknown> = {}) {
	return {
		id: MOCK_USER_ID,
		wallet_address: "0x742d35cc6634c0532925a3b844bc9e7595f0beb1",
		created_at: "2026-05-04T14:48:00.000Z",
		...overrides,
	};
}

function createMockBusiness(overrides: Record<string, unknown> = {}) {
	return {
		id: MOCK_BUSINESS_ID,
		user_id: MOCK_USER_ID,
		legal_name: "Acme Corp",
		fantasy_name: "Acme",
		formation_date: "2020-01-01",
		email: "contact@acme.com",
		tax_id: "123456789",
		phone_number: "+5511999999999",
		website: "https://acme.com",
		country_code: "BR",
		street: "Rua Test 123",
		city: "Sao Paulo",
		state: "SP",
		postal_code: "01310-100",
		address_proof_type: "UTILITY_BILL",
		created_at: "2026-05-04T14:48:00.000Z",
		...overrides,
	};
}

function createMockController(overrides: Record<string, unknown> = {}) {
	return {
		id: MOCK_CONTROLLER_ID,
		business_id: MOCK_BUSINESS_ID,
		role: BusinessControllerRole.CONTROLLING_PERSON,
		ownership_percentage: 25,
		title: "CEO",
		legal_first_name: "John",
		legal_last_name: "Doe",
		date_of_birth: "1990-01-15",
		tax_id: "987654321",
		identification_country_code: "BR",
		identification_document_type: "PASSPORT",
		address_country_code: "BR",
		address_street: "Rua Test 456",
		address_city: "Sao Paulo",
		address_state: "SP",
		address_postal_code: "01310-200",
		address_proof_type: "UTILITY_BILL",
		created_at: "2026-05-04T14:48:00.000Z",
		...overrides,
	};
}

function createMockFileRow() {
	return {
		id: MOCK_FILE_ID,
		user_id: MOCK_USER_ID,
		file_name: "document.pdf",
		file_size: 1024,
		mime_type: "application/pdf",
		file_type: BusinessFileType.INCORPORATION_DOCUMENT,
		r2_key: `business/${MOCK_USER_ID}/${MOCK_FILE_ID}-document.pdf`,
		created_at: "2026-05-04T14:48:00.000Z",
	};
}

function createMockControllerFileRow() {
	return {
		id: MOCK_FILE_ID,
		controller_id: MOCK_CONTROLLER_ID,
		file_name: "passport_front.jpg",
		file_size: 2048,
		mime_type: "image/jpeg",
		file_type: BusinessControllerFileType.IDENTIFICATION_FRONT,
		r2_key: `business/${MOCK_USER_ID}/${MOCK_FILE_ID}-passport_front.jpg`,
		created_at: "2026-05-04T14:48:00.000Z",
	};
}

function mockWhereSequence(db: ReturnType<typeof createMockDb>, sequences: unknown[][]) {
	db.select.mockReturnThis();
	db.from.mockReturnThis();
	let chain = db.where.mockReturnThis();
	for (const seq of sequences) {
		chain = chain.mockResolvedValueOnce(seq);
	}
}

describe("BusinessService", () => {
	let service: BusinessService;
	let mockDrizzleService: ReturnType<typeof createMockDrizzleService>;
	let mockR2StorageService: ReturnType<typeof createMockR2StorageService>;
	let mockUsersService: { getUserDatabaseRow: ReturnType<typeof vi.fn> };

	beforeEach(() => {
		vi.clearAllMocks();
		mockDrizzleService = createMockDrizzleService();
		mockR2StorageService = createMockR2StorageService();
		mockUsersService = { getUserDatabaseRow: vi.fn() };
		service = new BusinessService(
			mockDrizzleService as unknown as import("@core/database/drizzle.service").DrizzleService,
			mockR2StorageService as unknown as import("@core/storage/r2-storage.service").R2StorageService,
			mockUsersService as unknown as import("@modules/users/users.service").UsersService,
		);
	});

	describe("uploadBusinessFile", () => {
		const validFile = {
			buffer: Buffer.from("test-content"),
			originalname: "document.pdf",
			mimetype: "application/pdf",
			size: 1024,
		};

		it("should upload a file and return file metadata", async () => {
			const fileRow = createMockFileRow();
			mockDrizzleService.db.insert.mockReturnThis();
			mockDrizzleService.db.values.mockReturnThis();
			mockDrizzleService.db.returning.mockResolvedValue([fileRow]);

			const result = await service.uploadBusinessFile(MOCK_USER_ID, validFile, BusinessFileType.INCORPORATION_DOCUMENT);

			expect(mockR2StorageService.uploadFile).toHaveBeenCalledWith({
				bucketType: R2BucketType.BUSINESS_FILES,
				key: expect.any(String),
				body: expect.any(Buffer),
				contentType: "application/pdf",
			});
			expect(mockR2StorageService.generateFileKey).toHaveBeenCalledWith({
				folder: MOCK_USER_ID,
				fileId: expect.any(String),
				fileName: "document.pdf",
			});
			expect(mockDrizzleService.db.insert).toHaveBeenCalled();
			expect(result).toEqual({
				id: fileRow.id,
				fileName: fileRow.file_name,
				fileSize: fileRow.file_size,
				mimeType: fileRow.mime_type,
				fileType: fileRow.file_type,
				createdAt: fileRow.created_at,
			});
		});

		it("should throw KycFileTooLargeException when file exceeds max size", async () => {
			const oversizedFile = { ...validFile, size: BUSINESS_MAX_FILE_SIZE_BYTES + 1 };

			await expect(
				service.uploadBusinessFile(MOCK_USER_ID, oversizedFile, BusinessFileType.INCORPORATION_DOCUMENT),
			).rejects.toThrow(FileTooLargeException);
		});

		it("should accept file at exactly max size", async () => {
			const maxSizedFile = { ...validFile, size: BUSINESS_MAX_FILE_SIZE_BYTES };
			const fileRow = { ...createMockFileRow(), file_size: BUSINESS_MAX_FILE_SIZE_BYTES };
			mockDrizzleService.db.insert.mockReturnThis();
			mockDrizzleService.db.values.mockReturnThis();
			mockDrizzleService.db.returning.mockResolvedValue([fileRow]);

			await expect(
				service.uploadBusinessFile(MOCK_USER_ID, maxSizedFile, BusinessFileType.PROOF_OF_ADDRESS),
			).resolves.toBeDefined();
		});

		it("should throw when insert returns empty array", async () => {
			mockDrizzleService.db.insert.mockReturnThis();
			mockDrizzleService.db.values.mockReturnThis();
			mockDrizzleService.db.returning.mockResolvedValue([]);

			await expect(
				service.uploadBusinessFile(MOCK_USER_ID, validFile, BusinessFileType.INCORPORATION_DOCUMENT),
			).rejects.toThrow("File insert returned no rows");
		});

		it("should accept all valid file types", async () => {
			const fileTypes = Object.values(BusinessFileType);
			const fileRow = createMockFileRow();

			for (const fileType of fileTypes) {
				mockDrizzleService.db.insert.mockReturnThis();
				mockDrizzleService.db.values.mockReturnThis();
				mockDrizzleService.db.returning.mockResolvedValue([fileRow]);

				await expect(
					service.uploadBusinessFile(MOCK_USER_ID, validFile, fileType as BusinessFileType),
				).resolves.toBeDefined();
			}
		});
	});

	describe("uploadBusinessControllerFile", () => {
		const validFile = {
			buffer: Buffer.from("test-content"),
			originalname: "passport_front.jpg",
			mimetype: "image/jpeg",
			size: 2048,
		};

		it("should throw BusinessNotFoundException when business does not exist", async () => {
			mockUsersService.getUserDatabaseRow.mockResolvedValue(createMockUser());
			mockWhereSequence(mockDrizzleService.db, [[]]);

			await expect(
				service.uploadBusinessControllerFile(
					MOCK_USER_ID,
					MOCK_CONTROLLER_ID,
					validFile,
					BusinessControllerFileType.IDENTIFICATION_FRONT,
				),
			).rejects.toThrow(BusinessNotFoundException);
		});

		it("should throw BusinessControllerNotFoundException when controller not found or not owned by business", async () => {
			const mockUser = createMockUser();
			const mockBusiness = createMockBusiness();
			mockUsersService.getUserDatabaseRow.mockResolvedValue(mockUser);
			mockWhereSequence(mockDrizzleService.db, [
				[mockBusiness], // _getBusinessByUserId
				[], // _getControllerById - not found
			]);

			await expect(
				service.uploadBusinessControllerFile(
					MOCK_USER_ID,
					MOCK_CONTROLLER_ID,
					validFile,
					BusinessControllerFileType.IDENTIFICATION_FRONT,
				),
			).rejects.toThrow(BusinessControllerNotFoundException);
		});

		it("should upload a controller file and return metadata", async () => {
			const mockUser = createMockUser();
			const mockBusiness = createMockBusiness();
			const mockController = createMockController();
			const fileRow = createMockControllerFileRow();

			mockUsersService.getUserDatabaseRow.mockResolvedValue(mockUser);
			mockWhereSequence(mockDrizzleService.db, [
				[mockBusiness], // _getBusinessByUserId
				[mockController], // _getControllerById
			]);
			mockDrizzleService.db.insert.mockReturnThis();
			mockDrizzleService.db.values.mockReturnThis();
			mockDrizzleService.db.returning.mockResolvedValue([fileRow]);

			const result = await service.uploadBusinessControllerFile(
				MOCK_USER_ID,
				MOCK_CONTROLLER_ID,
				validFile,
				BusinessControllerFileType.IDENTIFICATION_FRONT,
			);

			expect(mockR2StorageService.uploadFile).toHaveBeenCalledWith({
				bucketType: R2BucketType.BUSINESS_FILES,
				key: expect.any(String),
				body: expect.any(Buffer),
				contentType: "image/jpeg",
			});
			expect(result).toEqual({
				id: fileRow.id,
				fileName: fileRow.file_name,
				fileSize: fileRow.file_size,
				mimeType: fileRow.mime_type,
				fileType: fileRow.file_type,
				createdAt: fileRow.created_at,
			});
		});

		it("should throw BusinessFileTooLargeException when controller file exceeds max size", async () => {
			const oversizedFile = { ...validFile, size: BUSINESS_MAX_FILE_SIZE_BYTES + 1 };

			await expect(
				service.uploadBusinessControllerFile(
					MOCK_USER_ID,
					MOCK_CONTROLLER_ID,
					oversizedFile,
					BusinessControllerFileType.IDENTIFICATION_FRONT,
				),
			).rejects.toThrow(FileTooLargeException);
		});

		it("should throw when controller file insert returns empty array", async () => {
			const mockUser = createMockUser();
			const mockBusiness = createMockBusiness();
			const mockController = createMockController();

			mockUsersService.getUserDatabaseRow.mockResolvedValue(mockUser);
			mockWhereSequence(mockDrizzleService.db, [
				[mockBusiness], // _getBusinessByUserId
				[mockController], // _getControllerById
			]);
			mockDrizzleService.db.insert.mockReturnThis();
			mockDrizzleService.db.values.mockReturnThis();
			mockDrizzleService.db.returning.mockResolvedValue([]);

			await expect(
				service.uploadBusinessControllerFile(
					MOCK_USER_ID,
					MOCK_CONTROLLER_ID,
					validFile,
					BusinessControllerFileType.IDENTIFICATION_FRONT,
				),
			).rejects.toThrow("File insert returned no rows");
		});
	});

	describe("saveBusiness", () => {
		it("should throw UserNotFoundException when user does not exist", async () => {
			mockUsersService.getUserDatabaseRow.mockResolvedValue(null);

			await expect(service.saveBusiness(MOCK_USER_ID, {})).rejects.toThrow(UserNotFoundException);
		});

		it("should return business data without updating if business input is undefined", async () => {
			const mockUser = createMockUser();
			const mockBusiness = createMockBusiness();

			mockUsersService.getUserDatabaseRow.mockResolvedValue(mockUser);
			mockWhereSequence(mockDrizzleService.db, [
				[mockBusiness], // getBusiness -> _getBusinessByUserId
				[], // getBusiness -> _getBusinessControllers
				[], // _getBusinessFileTypes
			]);

			const result = await service.saveBusiness(MOCK_USER_ID, undefined as any);

			expect(mockDrizzleService.db.update).not.toHaveBeenCalled();
			expect(mockDrizzleService.db.insert).not.toHaveBeenCalled();
			expect(result).toBeDefined();
			expect(result.id).toBe(MOCK_BUSINESS_ID);
		});

		it("should not call _upsertBusinessControllers if controllers is undefined", async () => {
			const mockUser = createMockUser();
			const mockBusiness = createMockBusiness();

			mockUsersService.getUserDatabaseRow.mockResolvedValue(mockUser);
			mockWhereSequence(mockDrizzleService.db, [
				[mockBusiness], // _upsertBusiness -> _getBusinessByUserId
				[], // _upsertBusiness -> update().where()
				[mockBusiness], // getBusiness -> _getBusinessByUserId
				[], // getBusiness -> _getBusinessControllers
				[], // _getBusinessFileTypes
			]);

			await service.saveBusiness(MOCK_USER_ID, {
				legalName: "Only Name",
			});

			// Only 1 update call for the business, none for controllers
			expect(mockDrizzleService.db.update).toHaveBeenCalledTimes(1);
			expect(mockDrizzleService.db.update).toHaveBeenCalledWith(businessesTable);
			expect(mockDrizzleService.db.update).not.toHaveBeenCalledWith(businessControllersTable);
		});

		it("should strip undefined values and only update provided fields", async () => {
			const mockUser = createMockUser({ business_id: MOCK_BUSINESS_ID });
			const mockBusiness = createMockBusiness({ tax_id: "existing_tax_id" });

			mockUsersService.getUserDatabaseRow.mockResolvedValue(mockUser);
			mockWhereSequence(mockDrizzleService.db, [
				[mockBusiness], // _upsertBusiness -> _getBusinessByUserId
				[], // _upsertBusiness -> update().where()
				[mockBusiness], // getBusiness -> _getBusinessByUserId
				[], // getBusiness -> _getBusinessControllers
				[{ file_type: BusinessFileType.PROOF_OF_ADDRESS }], // _getBusinessFileTypes
				// _getControllerFileTypes returns empty because no controllers
			]);

			mockDrizzleService.db.update.mockReturnThis();
			mockDrizzleService.db.set.mockReturnThis();

			await service.saveBusiness(MOCK_USER_ID, {
				legalName: "Updated Corp",
			});

			const setCallArgs = mockDrizzleService.db.set.mock.calls[0]![0] as Record<string, unknown>;

			expect(setCallArgs).toHaveProperty("legal_name", "Updated Corp");
			expect(setCallArgs).not.toHaveProperty("tax_id");
			expect(Object.keys(setCallArgs)).not.toContain("tax_id");
		});

		it("should set fields to null in database when explicitly passed as null", async () => {
			const mockUser = createMockUser({ business_id: MOCK_BUSINESS_ID });
			const mockBusiness = createMockBusiness({ legal_name: "Old Name" });

			mockUsersService.getUserDatabaseRow.mockResolvedValue(mockUser);
			mockWhereSequence(mockDrizzleService.db, [
				[mockBusiness], // _upsertBusiness -> _getBusinessByUserId
				[], // _upsertBusiness -> update().where()
				[mockBusiness], // getBusiness -> _getBusinessByUserId
				[], // getBusiness -> _getBusinessControllers
				[{ file_type: BusinessFileType.PROOF_OF_ADDRESS }], // _getBusinessFileTypes
			]);

			mockDrizzleService.db.update.mockReturnThis();
			mockDrizzleService.db.set.mockReturnThis();

			await service.saveBusiness(MOCK_USER_ID, {
				legalName: null as any,
			});

			const setCallArgs = mockDrizzleService.db.set.mock.calls[0]![0] as Record<string, unknown>;

			expect(setCallArgs).toHaveProperty("legal_name", null);
		});

		it("should only update and not insert if business already exists", async () => {
			const mockUser = createMockUser({ business_id: MOCK_BUSINESS_ID });
			const mockBusiness = createMockBusiness();

			mockUsersService.getUserDatabaseRow.mockResolvedValue(mockUser);
			mockWhereSequence(mockDrizzleService.db, [
				[mockBusiness], // _upsertBusiness -> _getBusinessByUserId
				[], // _upsertBusiness -> update().where()
				[mockBusiness], // getBusiness -> _getBusinessByUserId
				[], // getBusiness -> _getBusinessControllers
				[{ file_type: BusinessFileType.PROOF_OF_ADDRESS }], // _getBusinessFileTypes
			]);

			mockDrizzleService.db.update.mockReturnThis();
			mockDrizzleService.db.set.mockReturnThis();

			await service.saveBusiness(MOCK_USER_ID, {
				legalName: "Updated Name",
			});

			expect(mockDrizzleService.db.update).toHaveBeenCalledWith(businessesTable);
			expect(mockDrizzleService.db.insert).not.toHaveBeenCalledWith(businessesTable);
		});

		it("should save business data and return updated business", async () => {
			const mockUser = createMockUser({ business_id: MOCK_BUSINESS_ID });
			const mockBusiness = createMockBusiness();

			mockUsersService.getUserDatabaseRow.mockResolvedValue(mockUser);
			mockWhereSequence(mockDrizzleService.db, [
				[mockBusiness], // _upsertBusiness -> _getBusinessByUserId
				[], // _upsertBusiness -> update().where()
				[mockBusiness], // getBusiness -> _getBusinessByUserId
				[], // getBusiness -> _getBusinessControllers
				[{ file_type: BusinessFileType.PROOF_OF_ADDRESS }], // _getBusinessFileTypes
			]);

			mockDrizzleService.db.update.mockReturnThis();
			mockDrizzleService.db.set.mockReturnThis();

			const result = await service.saveBusiness(MOCK_USER_ID, {
				legalName: "Updated Corp",
			});

			expect(result).toBeDefined();
			expect(result.id).toBe(MOCK_BUSINESS_ID);
			expect(result.legalName).toBe("Acme Corp");
		});

		it("should throw BusinessNotFoundException when saving controllers for user without business", async () => {
			const mockUser = createMockUser({ business_id: null });

			mockUsersService.getUserDatabaseRow.mockResolvedValue(mockUser);
			mockWhereSequence(mockDrizzleService.db, [[]]); // _upsertBusiness -> _getBusinessByUserId returns empty

			await expect(
				service.saveBusiness(MOCK_USER_ID, {
					controllers: [{ role: BusinessControllerRole.CONTROLLING_PERSON }],
				}),
			).rejects.toThrow(BusinessNotFoundException);
		});

		it("should perform progressive update on controllers and not delete omitted ones", async () => {
			const mockUser = createMockUser();
			const mockBusiness = createMockBusiness();
			const mockController1 = createMockController({ id: "ctrl-1" });
			const mockController2 = createMockController({ id: "ctrl-2" });

			mockUsersService.getUserDatabaseRow.mockResolvedValue(mockUser);
			mockWhereSequence(mockDrizzleService.db, [
				[mockBusiness], // _upsertBusiness -> _getBusinessByUserId
				[], // _upsertBusiness -> update().where()
				[mockBusiness], // _upsertControllers -> _getBusinessByUserId
				[mockController1, mockController2], // _upsertControllers -> _getBusinessControllers
				[], // _upsertControllers -> update(ctrl-1).where()
				[mockBusiness], // getBusiness -> _getBusinessByUserId
				[mockController1, mockController2], // getBusiness -> _getBusinessControllers
				[{ file_type: BusinessFileType.PROOF_OF_ADDRESS }], // _getBusinessFileTypes
				[
					{ controller_id: "ctrl-1", file_type: BusinessControllerFileType.IDENTIFICATION_FRONT },
					{ controller_id: "ctrl-2", file_type: BusinessControllerFileType.PROOF_OF_ADDRESS },
				], // _getControllerFileTypes
			]);

			await service.saveBusiness(MOCK_USER_ID, {
				controllers: [{ id: "ctrl-1", role: BusinessControllerRole.CONTROLLING_PERSON }],
			});

			expect(mockDrizzleService.db.update).toHaveBeenCalledWith(businessControllersTable);
			expect(mockDrizzleService.db.delete).not.toHaveBeenCalledWith(businessControllersTable);
		});

		it("should update a controller when its ID exists in the database", async () => {
			const mockUser = createMockUser();
			const mockBusiness = createMockBusiness();
			const mockController = createMockController({ id: "existing-id" });

			mockUsersService.getUserDatabaseRow.mockResolvedValue(mockUser);
			mockWhereSequence(mockDrizzleService.db, [
				[mockBusiness], // _upsertBusiness -> _getBusinessByUserId
				[], // _upsertBusiness -> update().where()
				[mockBusiness], // _upsertControllers -> _getBusinessByUserId
				[mockController], // _upsertControllers -> existingControllers
				[], // _upsertControllers -> update(existing-id).where()
				[mockBusiness], // getBusiness -> _getBusinessByUserId
				[mockController], // getBusiness -> _getBusinessControllers
				[{ file_type: BusinessFileType.PROOF_OF_ADDRESS }], // _getBusinessFileTypes
				[
					{
						controller_id: "existing-id",
						file_type: BusinessControllerFileType.IDENTIFICATION_FRONT,
					},
				], // _getControllerFileTypes
			]);

			await service.saveBusiness(MOCK_USER_ID, {
				controllers: [{ id: "existing-id", role: BusinessControllerRole.CONTROLLING_PERSON }],
			});

			expect(mockDrizzleService.db.update).toHaveBeenCalledTimes(2);
			expect(mockDrizzleService.db.update).toHaveBeenCalledWith(businessControllersTable);
			expect(mockDrizzleService.db.insert).not.toHaveBeenCalledWith(businessControllersTable);
		});

		it("should create a new controller when ID is not provided or doesn't exist", async () => {
			const mockUser = createMockUser();
			const mockBusiness = createMockBusiness();

			mockUsersService.getUserDatabaseRow.mockResolvedValue(mockUser);
			mockWhereSequence(mockDrizzleService.db, [
				[mockBusiness], // _upsertBusiness -> _getBusinessByUserId
				[], // _upsertBusiness -> update().where()
				[mockBusiness], // _upsertControllers -> _getBusinessByUserId
				[], // _upsertControllers -> existingControllers (empty)
				[mockBusiness], // getBusiness -> _getBusinessByUserId
				[], // getBusiness -> _getBusinessControllers
				[], // _getBusinessFileTypes
			]);

			await service.saveBusiness(MOCK_USER_ID, {
				controllers: [{ role: BusinessControllerRole.CONTROLLING_PERSON }],
			});

			expect(mockDrizzleService.db.insert).toHaveBeenCalledWith(businessControllersTable);
			expect(mockDrizzleService.db.update).toHaveBeenCalledTimes(1);
			expect(mockDrizzleService.db.update).not.toHaveBeenCalledWith(businessControllersTable);
		});

		it("should process all controllers in the list (mixture of updates and creations)", async () => {
			const mockUser = createMockUser();
			const mockBusiness = createMockBusiness();
			const mockController1 = createMockController({ id: "ctrl-1" });
			const mockController2 = createMockController({ id: "ctrl-2" });

			mockUsersService.getUserDatabaseRow.mockResolvedValue(mockUser);
			mockWhereSequence(mockDrizzleService.db, [
				[mockBusiness], // _upsertBusiness -> _getBusinessByUserId
				[], // _upsertBusiness -> update().where()
				[mockBusiness], // _upsertControllers -> _getBusinessByUserId
				[mockController1, mockController2], // _upsertControllers -> existingControllers
				[], // _upsertControllers -> update(ctrl-1).where()
				[], // _upsertControllers -> update(ctrl-2).where()
				[mockBusiness], // getBusiness -> _getBusinessByUserId
				[mockController1, mockController2], // getBusiness -> _getBusinessControllers
				[{ file_type: BusinessFileType.PROOF_OF_ADDRESS }], // _getBusinessFileTypes
				[{ controller_id: "ctrl-1", file_type: BusinessControllerFileType.IDENTIFICATION_FRONT }], // _getControllerFileTypes
			]);

			await service.saveBusiness(MOCK_USER_ID, {
				controllers: [
					{ id: "ctrl-1", role: BusinessControllerRole.CONTROLLING_PERSON },
					{ role: BusinessControllerRole.CONTROLLING_PERSON },
					{ id: "ctrl-2", role: BusinessControllerRole.CONTROLLING_PERSON },
				],
			});

			expect(mockDrizzleService.db.update).toHaveBeenCalledWith(businessControllersTable);
			expect(mockDrizzleService.db.update).toHaveBeenCalledTimes(3);
			expect(mockDrizzleService.db.insert).toHaveBeenCalledWith(businessControllersTable);
			expect(mockDrizzleService.db.insert).toHaveBeenCalledTimes(1);
			expect(mockDrizzleService.db.delete).not.toHaveBeenCalledWith(businessControllersTable);
		});

		it("should create new business when none exists", async () => {
			const mockUser = createMockUser({ business_id: null });
			const mockBusiness = createMockBusiness();

			mockUsersService.getUserDatabaseRow.mockResolvedValue(mockUser);
			mockWhereSequence(mockDrizzleService.db, [
				[], // _upsertBusiness -> _getBusinessByUserId (none exists)
				[mockBusiness], // getBusiness -> _getBusinessByUserId
				[], // getBusiness -> _getBusinessControllers
				[{ file_type: BusinessFileType.PROOF_OF_ADDRESS }], // _getBusinessFileTypes
			]);

			mockDrizzleService.db.insert.mockReturnThis();
			mockDrizzleService.db.values.mockReturnThis();
			mockDrizzleService.db.update.mockReturnThis();
			mockDrizzleService.db.set.mockReturnThis();
			mockDrizzleService.db.returning.mockResolvedValue([mockBusiness]);

			const result = await service.saveBusiness(MOCK_USER_ID, {
				legalName: "New Corp",
			});

			expect(result).toBeDefined();
			expect(result.id).toBe(MOCK_BUSINESS_ID);
		});
	});

	describe("getBusiness", () => {
		it("should throw BusinessNotFoundException when business does not exist", async () => {
			mockDrizzleService.db.select.mockReturnThis();
			mockDrizzleService.db.from.mockReturnThis();
			mockDrizzleService.db.where.mockResolvedValue([]);

			await expect(service.getBusiness(MOCK_USER_ID)).rejects.toThrow(BusinessNotFoundException);
		});

		it("should return business data with fileTypesUploaded", async () => {
			const mockBusiness = createMockBusiness();

			mockWhereSequence(mockDrizzleService.db, [
				[mockBusiness], // getBusiness -> _getBusinessByUserId
				[], // getBusiness -> _getBusinessControllers
				[{ file_type: BusinessFileType.INCORPORATION_DOCUMENT }], // _getBusinessFileTypes
			]);

			const result = await service.getBusiness(MOCK_USER_ID);

			expect(result).toBeDefined();
			expect(result.id).toBe(MOCK_BUSINESS_ID);
			expect(result.legalName).toBe("Acme Corp");
			expect(result.fileTypesUploaded).toBeDefined();
			expect(result.fileTypesUploaded).toContain(BusinessFileType.INCORPORATION_DOCUMENT);
			expect(result.address).toBeDefined();
			expect(result.address!.countryCode).toBe("BR");
		});

		it("should return null address when business has no address data", async () => {
			const mockBusiness = createMockBusiness({
				country_code: null,
				street: null,
				city: null,
				state: null,
				postal_code: null,
				address_proof_type: null,
			});

			mockWhereSequence(mockDrizzleService.db, [
				[mockBusiness], // getBusiness -> _getBusinessByUserId
				[], // getBusiness -> _getBusinessControllers
				[], // _getBusinessFileTypes (empty)
			]);
			const result = await service.getBusiness(MOCK_USER_ID);

			expect(result.address).toEqual({
				countryCode: null,
				street: null,
				city: null,
				state: null,
				postalCode: null,
				addressProofType: null,
			});
		});

		it("should include addressProofType in address output", async () => {
			const mockBusiness = createMockBusiness();

			mockWhereSequence(mockDrizzleService.db, [
				[mockBusiness], // getBusiness -> _getBusinessByUserId
				[], // getBusiness -> _getBusinessControllers
				[{ file_type: BusinessFileType.PROOF_OF_ADDRESS }], // _getBusinessFileTypes
			]);

			const result = await service.getBusiness(MOCK_USER_ID);

			expect(result.address).toBeDefined();
			expect(result.address!.addressProofType).toBe("UTILITY_BILL");
		});

		it("should include controller fileTypesUploaded when controllers exist", async () => {
			const mockBusiness = createMockBusiness();
			const mockController = createMockController();

			mockWhereSequence(mockDrizzleService.db, [
				[mockBusiness], // _getBusinessByUserId
				[mockController], // _getBusinessControllers
				[{ file_type: BusinessFileType.INCORPORATION_DOCUMENT }], // _getBusinessFileTypes
				[
					{
						controller_id: MOCK_CONTROLLER_ID,
						file_type: BusinessControllerFileType.IDENTIFICATION_FRONT,
					},
				], // _getControllerFileTypes
			]);

			const result = await service.getBusiness(MOCK_USER_ID);

			expect(result.controllers).toHaveLength(1);
			expect(result.controllers[0]!.fileTypesUploaded).toContain(BusinessControllerFileType.IDENTIFICATION_FRONT);
		});

		it("should handle empty controller list when fetching uploaded file types", async () => {
			const mockBusiness = createMockBusiness();

			mockWhereSequence(mockDrizzleService.db, [
				[mockBusiness], // _getBusinessByUserId
				[], // _getBusinessControllers (empty)
				[], // _getBusinessFileTypes
			]);

			const result = await service.getBusiness(MOCK_USER_ID);

			expect(result.controllers).toHaveLength(0);
			// Verify that inArray was NOT called (which happens when controllerIds.length === 0)
			// Since we can't easily check inArray call from here with the current mock setup,
			// we just ensure the result is correct.
		});
	});

	describe("getFile", () => {
		it("should throw BusinessFileNotFoundException when file does not exist for user and file type", async () => {
			mockDrizzleService.db.select.mockReturnThis();
			mockDrizzleService.db.from.mockReturnThis();
			mockDrizzleService.db.where.mockResolvedValue([]);

			await expect(
				service.getBusinessFile({ userId: MOCK_USER_ID, fileType: BusinessFileType.INCORPORATION_DOCUMENT }),
			).rejects.toThrow(BusinessFileNotFoundException);
		});

		it("should return file buffer and metadata when file exists", async () => {
			const mockFileRow = createMockFileRow();
			mockDrizzleService.db.select.mockReturnThis();
			mockDrizzleService.db.from.mockReturnThis();
			mockDrizzleService.db.where.mockResolvedValue([mockFileRow]);

			const result = await service.getBusinessFile({
				userId: MOCK_USER_ID,
				fileType: BusinessFileType.INCORPORATION_DOCUMENT,
			});

			expect(result.fileName).toBe("document.pdf");
			expect(result.mimeType).toBe("application/pdf");
			expect(mockR2StorageService.getFileBuffer).toHaveBeenCalledWith(R2BucketType.BUSINESS_FILES, mockFileRow.r2_key);
		});

		it("should query by user_id and file_type", async () => {
			const mockFileRow = createMockFileRow();
			mockDrizzleService.db.select.mockReturnThis();
			mockDrizzleService.db.from.mockReturnThis();
			mockDrizzleService.db.where.mockResolvedValue([mockFileRow]);

			await service.getBusinessFile({ userId: MOCK_USER_ID, fileType: BusinessFileType.PROOF_OF_ADDRESS });

			expect(mockDrizzleService.db.select).toHaveBeenCalled();
			expect(mockDrizzleService.db.from).toHaveBeenCalled();
			expect(mockDrizzleService.db.where).toHaveBeenCalled();
		});
	});

	describe("getBusinessControllerFile", () => {
		it("should throw ControllerFileNotFoundException when file does not exist", async () => {
			mockDrizzleService.db.select.mockReturnThis();
			mockDrizzleService.db.from.mockReturnThis();
			mockDrizzleService.db.where.mockResolvedValue([]);

			await expect(
				service.getBusinessControllerFile({
					userId: MOCK_USER_ID,
					controllerId: MOCK_CONTROLLER_ID,
					fileType: BusinessControllerFileType.IDENTIFICATION_FRONT,
				}),
			).rejects.toThrow(BusinessControllerFileNotFoundException);
		});

		it("should return file buffer and metadata when controller file exists", async () => {
			const mockFileRow = createMockControllerFileRow();
			mockDrizzleService.db.select.mockReturnThis();
			mockDrizzleService.db.from.mockReturnThis();
			mockDrizzleService.db.where.mockResolvedValue([mockFileRow]);

			const result = await service.getBusinessControllerFile({
				userId: MOCK_USER_ID,
				controllerId: MOCK_CONTROLLER_ID,
				fileType: BusinessControllerFileType.IDENTIFICATION_FRONT,
			});

			expect(result.fileName).toBe("passport_front.jpg");
			expect(result.mimeType).toBe("image/jpeg");
			expect(mockR2StorageService.getFileBuffer).toHaveBeenCalledWith(R2BucketType.BUSINESS_FILES, mockFileRow.r2_key);
		});
	});
});
