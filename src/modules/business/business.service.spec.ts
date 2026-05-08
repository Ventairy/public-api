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
import { ObjectUtils } from "@shared/utils/object.utils";
import { BusinessService } from "./business.service";
import { BUSINESS_MAX_FILE_SIZE_BYTES } from "./business.constants";
import { businessesTable } from "@db/schema/businesses-table";
import { businessControllersTable } from "@db/schema/business-controllers-table";

const MOCK_USER_ID = "user-123";
const MOCK_FILE_ID = "file-abc";
const MOCK_BUSINESS_ID = "biz-456";
const MOCK_CONTROLLER_ID = "ctrl-789";

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

describe("BusinessService", () => {
	let service: BusinessService;
	let mockUserRepository: {
		findById: ReturnType<typeof vi.fn>;
		create: ReturnType<typeof vi.fn>;
	};
	let mockBusinessRepository: {
		findBusinessByUserId: ReturnType<typeof vi.fn>;
		insertBusiness: ReturnType<typeof vi.fn>;
		updateBusiness: ReturnType<typeof vi.fn>;
		findControllersByBusinessId: ReturnType<typeof vi.fn>;
		findBusinessControllerById: ReturnType<typeof vi.fn>;
		insertBusinessController: ReturnType<typeof vi.fn>;
		updateBusinessController: ReturnType<typeof vi.fn>;
		insertBusinessFile: ReturnType<typeof vi.fn>;
		findBusinessFile: ReturnType<typeof vi.fn>;
		findBusinessFileTypesByUserId: ReturnType<typeof vi.fn>;
		insertControllerFile: ReturnType<typeof vi.fn>;
		findControllerFile: ReturnType<typeof vi.fn>;
		findControllerFileTypesByControllerIds: ReturnType<typeof vi.fn>;
	};
	let mockR2StorageService: {
		uploadFile: ReturnType<typeof vi.fn>;
		getFileBuffer: ReturnType<typeof vi.fn>;
		deleteFile: ReturnType<typeof vi.fn>;
		generateFileKey: ReturnType<typeof vi.fn>;
	};

	beforeEach(() => {
		vi.clearAllMocks();
		mockUserRepository = {
			findById: vi.fn(),
			create: vi.fn(),
		};
		mockBusinessRepository = {
			findBusinessByUserId: vi.fn(),
			insertBusiness: vi.fn(),
			updateBusiness: vi.fn(),
			findControllersByBusinessId: vi.fn(),
			findBusinessControllerById: vi.fn(),
			insertBusinessController: vi.fn(),
			updateBusinessController: vi.fn(),
			insertBusinessFile: vi.fn(),
			findBusinessFile: vi.fn(),
			findBusinessFileTypesByUserId: vi.fn(),
			insertControllerFile: vi.fn(),
			findControllerFile: vi.fn(),
			findControllerFileTypesByControllerIds: vi.fn(),
		};
		mockR2StorageService = {
			uploadFile: vi.fn().mockResolvedValue(undefined),
			getFileBuffer: vi.fn().mockResolvedValue(Buffer.from("file-content")),
			deleteFile: vi.fn().mockResolvedValue(undefined),
			generateFileKey: vi.fn(
				(params: { folder: string; fileId: string; fileName: string }) =>
					`${params.folder}/${params.fileId}-${params.fileName}`,
			),
		};
		service = new BusinessService(
			mockUserRepository as any,
			mockBusinessRepository as any,
			mockR2StorageService as any,
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
			mockBusinessRepository.insertBusinessFile.mockResolvedValue(fileRow);

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
			expect(mockBusinessRepository.insertBusinessFile).toHaveBeenCalled();
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
			mockBusinessRepository.insertBusinessFile.mockResolvedValue(fileRow);

			await expect(
				service.uploadBusinessFile(MOCK_USER_ID, maxSizedFile, BusinessFileType.PROOF_OF_ADDRESS),
			).resolves.toBeDefined();
		});

		it("should throw when insert returns empty array", async () => {
			mockBusinessRepository.insertBusinessFile.mockRejectedValue(new Error("File insert returned no rows"));

			await expect(
				service.uploadBusinessFile(MOCK_USER_ID, validFile, BusinessFileType.INCORPORATION_DOCUMENT),
			).rejects.toThrow("File insert returned no rows");
		});

		it("should accept all valid file types", async () => {
			const fileTypes = Object.values(BusinessFileType);
			const fileRow = createMockFileRow();

			for (const fileType of fileTypes) {
				mockBusinessRepository.insertBusinessFile.mockResolvedValue(fileRow);

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
			mockBusinessRepository.findBusinessByUserId.mockResolvedValue(null);

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
			const mockBusiness = createMockBusiness();
			mockBusinessRepository.findBusinessByUserId.mockResolvedValue(mockBusiness);
			mockBusinessRepository.findBusinessControllerById.mockResolvedValue(null);

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
			const mockBusiness = createMockBusiness();
			const mockController = createMockController();
			const fileRow = createMockControllerFileRow();

			mockBusinessRepository.findBusinessByUserId.mockResolvedValue(mockBusiness);
			mockBusinessRepository.findBusinessControllerById.mockResolvedValue(mockController);
			mockBusinessRepository.insertControllerFile.mockResolvedValue(fileRow);

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
			const mockBusiness = createMockBusiness();
			const mockController = createMockController();

			mockBusinessRepository.findBusinessByUserId.mockResolvedValue(mockBusiness);
			mockBusinessRepository.findBusinessControllerById.mockResolvedValue(mockController);
			mockBusinessRepository.insertControllerFile.mockRejectedValue(new Error("Controller file insert returned no rows"));

			await expect(
				service.uploadBusinessControllerFile(
					MOCK_USER_ID,
					MOCK_CONTROLLER_ID,
					validFile,
					BusinessControllerFileType.IDENTIFICATION_FRONT,
				),
			).rejects.toThrow("Controller file insert returned no rows");
		});
	});

	describe("saveBusiness", () => {
		it("should throw UserNotFoundException when user does not exist", async () => {
			mockUserRepository.findById.mockResolvedValue(null);
			mockBusinessRepository.findBusinessByUserId.mockResolvedValue(null);

			await expect(service.saveBusiness(MOCK_USER_ID, {} as any)).rejects.toThrow(UserNotFoundException);
		});

		it("should throw when business input is undefined (controller-level validation expected)", async () => {
			const mockUser = createMockUser();
			mockUserRepository.findById.mockResolvedValue(mockUser);
			mockBusinessRepository.findBusinessByUserId.mockResolvedValue(null);

			await expect(service.saveBusiness(MOCK_USER_ID, undefined as any)).rejects.toThrow(TypeError);
		});

		it("should not call _upsertBusinessControllers if controllers is undefined", async () => {
			const mockUser = createMockUser();
			const mockBusiness = createMockBusiness();

			mockUserRepository.findById.mockResolvedValue(mockUser);
			mockBusinessRepository.findBusinessByUserId.mockResolvedValue(mockBusiness);
			mockBusinessRepository.updateBusiness.mockResolvedValue(mockBusiness);
			mockBusinessRepository.findControllersByBusinessId.mockResolvedValue([]);
			mockBusinessRepository.findBusinessFileTypesByUserId.mockResolvedValue([]);
			mockBusinessRepository.findControllerFileTypesByControllerIds.mockResolvedValue(new Map());

			await service.saveBusiness(MOCK_USER_ID, {
				legalName: "Only Name",
			});

			expect(mockBusinessRepository.updateBusiness).toHaveBeenCalled();
			expect(mockBusinessRepository.insertBusinessController).not.toHaveBeenCalled();
			expect(mockBusinessRepository.updateBusinessController).not.toHaveBeenCalled();
		});

		it("should strip undefined values and only update provided fields", async () => {
			const mockUser = createMockUser();
			const mockBusiness = createMockBusiness({ tax_id: "existing_tax_id" });

			mockUserRepository.findById.mockResolvedValue(mockUser);
			mockBusinessRepository.findBusinessByUserId.mockResolvedValue(mockBusiness);
			mockBusinessRepository.updateBusiness.mockResolvedValue(mockBusiness);
			mockBusinessRepository.findControllersByBusinessId.mockResolvedValue([]);
			mockBusinessRepository.findBusinessFileTypesByUserId.mockResolvedValue([
				BusinessFileType.PROOF_OF_ADDRESS,
			]);
			mockBusinessRepository.findControllerFileTypesByControllerIds.mockResolvedValue(new Map());

			await service.saveBusiness(MOCK_USER_ID, {
				legalName: "Updated Corp",
			});

			const setCallArgs = mockBusinessRepository.updateBusiness.mock.calls[0]![1] as Record<string, unknown>;

			expect(setCallArgs).toHaveProperty("legal_name", "Updated Corp");
			expect(setCallArgs).not.toHaveProperty("tax_id");
			expect(Object.keys(setCallArgs)).not.toContain("tax_id");
		});

		it("should set fields to null in database when explicitly passed as null", async () => {
			const mockUser = createMockUser();
			const mockBusiness = createMockBusiness({ legal_name: "Old Name" });

			mockUserRepository.findById.mockResolvedValue(mockUser);
			mockBusinessRepository.findBusinessByUserId.mockResolvedValue(mockBusiness);
			mockBusinessRepository.updateBusiness.mockResolvedValue(mockBusiness);
			mockBusinessRepository.findControllersByBusinessId.mockResolvedValue([]);
			mockBusinessRepository.findBusinessFileTypesByUserId.mockResolvedValue([
				BusinessFileType.PROOF_OF_ADDRESS,
			]);
			mockBusinessRepository.findControllerFileTypesByControllerIds.mockResolvedValue(new Map());

			await service.saveBusiness(MOCK_USER_ID, {
				legalName: null as any,
			});

			const setCallArgs = mockBusinessRepository.updateBusiness.mock.calls[0]![1] as Record<string, unknown>;

			expect(setCallArgs).toHaveProperty("legal_name", null);
		});

		it("should only update and not insert if business already exists", async () => {
			const mockUser = createMockUser();
			const mockBusiness = createMockBusiness();

			mockUserRepository.findById.mockResolvedValue(mockUser);
			mockBusinessRepository.findBusinessByUserId.mockResolvedValue(mockBusiness);
			mockBusinessRepository.updateBusiness.mockResolvedValue(mockBusiness);
			mockBusinessRepository.findControllersByBusinessId.mockResolvedValue([]);
mockBusinessRepository.findBusinessFileTypesByUserId.mockResolvedValue([
				BusinessFileType.PROOF_OF_ADDRESS,
			]);
			mockBusinessRepository.findControllerFileTypesByControllerIds.mockResolvedValue(new Map());

			await service.saveBusiness(MOCK_USER_ID, {
				legalName: "Only Name",
			});

			expect(mockBusinessRepository.updateBusiness).toHaveBeenCalled();
			expect(mockBusinessRepository.insertBusiness).not.toHaveBeenCalled();
		});

		it("should save business data and return updated business", async () => {
			const mockUser = createMockUser();
			const mockBusiness = createMockBusiness();

			mockUserRepository.findById.mockResolvedValue(mockUser);
			mockBusinessRepository.findBusinessByUserId.mockResolvedValue(mockBusiness);
			mockBusinessRepository.updateBusiness.mockResolvedValue(mockBusiness);
			mockBusinessRepository.findControllersByBusinessId.mockResolvedValue([]);
			mockBusinessRepository.findBusinessFileTypesByUserId.mockResolvedValue([
				BusinessFileType.PROOF_OF_ADDRESS,
			]);
			mockBusinessRepository.findControllerFileTypesByControllerIds.mockResolvedValue(new Map());

			const result = await service.saveBusiness(MOCK_USER_ID, {
				legalName: "Updated Corp",
			});

			expect(result).toBeDefined();
			expect(result.id).toBe(MOCK_BUSINESS_ID);
			expect(result.legalName).toBe("Acme Corp");
		});

		it("should create business stub and insert controllers when user has no business yet", async () => {
			const mockUser = createMockUser();
			const mockInsertedBusiness = createMockBusiness();
			const mockInsertedController = createMockController({ id: "ctrl-001" });

			mockUserRepository.findById.mockResolvedValue(mockUser);
			mockBusinessRepository.findBusinessByUserId.mockResolvedValue(null);
			mockBusinessRepository.insertBusiness.mockResolvedValue(mockInsertedBusiness);
			mockBusinessRepository.findControllersByBusinessId.mockResolvedValue([]);
			mockBusinessRepository.insertBusinessController.mockResolvedValue(mockInsertedController);
			mockBusinessRepository.findBusinessFileTypesByUserId.mockResolvedValue([
				BusinessFileType.PROOF_OF_ADDRESS,
			]);
			mockBusinessRepository.findControllerFileTypesByControllerIds.mockResolvedValue(
				new Map([[mockInsertedController.id, [BusinessControllerFileType.IDENTIFICATION_FRONT]]]),
			);

			const result = await service.saveBusiness(MOCK_USER_ID, {
				controllers: [{ role: BusinessControllerRole.CONTROLLING_PERSON }],
			});

			expect(result).toBeDefined();
			expect(mockBusinessRepository.insertBusiness).toHaveBeenCalled();
			expect(mockBusinessRepository.insertBusinessController).toHaveBeenCalled();
		});

		it("should update existing and insert new controllers", async () => {
			const mockUser = createMockUser();
			const mockBusiness = createMockBusiness();
			const mockController1 = createMockController({ id: "ctrl-001" });

			mockUserRepository.findById.mockResolvedValue(mockUser);
			mockBusinessRepository.findBusinessByUserId.mockResolvedValue(mockBusiness);
			mockBusinessRepository.updateBusiness.mockResolvedValue(mockBusiness);
			mockBusinessRepository.findControllersByBusinessId.mockResolvedValue([mockController1]);
			mockBusinessRepository.updateBusinessController.mockResolvedValue(mockController1);
			mockBusinessRepository.insertBusinessController.mockResolvedValue(createMockController({ id: "ctrl-002" }));
			mockBusinessRepository.findBusinessFileTypesByUserId.mockResolvedValue([
				BusinessFileType.PROOF_OF_ADDRESS,
			]);
			mockBusinessRepository.findControllerFileTypesByControllerIds.mockResolvedValue(
				new Map([["ctrl-001", [BusinessControllerFileType.IDENTIFICATION_FRONT]]]),
			);

			await service.saveBusiness(MOCK_USER_ID, {
				legalName: "Updated Corp",
				controllers: [
					{ id: "ctrl-001", role: BusinessControllerRole.CONTROLLING_PERSON },
					{ legalFirstName: "New", role: BusinessControllerRole.CONTROLLING_PERSON },
				],
			});

			expect(mockBusinessRepository.updateBusinessController).toHaveBeenCalled();
			expect(mockBusinessRepository.insertBusinessController).toHaveBeenCalled();
		});

		it("should not update controllers if all fields are undefined", async () => {
			const mockUser = createMockUser();
			const mockBusiness = createMockBusiness();
			const mockController1 = createMockController({ id: "ctrl-001" });

			mockUserRepository.findById.mockResolvedValue(mockUser);
			mockBusinessRepository.findBusinessByUserId.mockResolvedValue(mockBusiness);
			mockBusinessRepository.updateBusiness.mockResolvedValue(mockBusiness);
			mockBusinessRepository.findControllersByBusinessId.mockResolvedValue([mockController1]);
			mockBusinessRepository.findBusinessFileTypesByUserId.mockResolvedValue([
				BusinessFileType.PROOF_OF_ADDRESS,
			]);
			mockBusinessRepository.findControllerFileTypesByControllerIds.mockResolvedValue(new Map());

			await service.saveBusiness(MOCK_USER_ID, {
				legalName: "Updated Corp",
				controllers: [{ id: "ctrl-001" }],
			});

			expect(mockBusinessRepository.updateBusinessController).not.toHaveBeenCalled();
		});

		it("should return the updated controller data when updating an existing controller (regression)", async () => {
			const mockUser = createMockUser();
			const mockBusiness = createMockBusiness();
			const mockController = createMockController({ id: "ctrl-001", legal_first_name: "OldName" });
			const updatedController = { ...mockController, legal_first_name: "NewName" };

			mockUserRepository.findById.mockResolvedValue(mockUser);
			mockBusinessRepository.findBusinessByUserId.mockResolvedValue(mockBusiness);
			mockBusinessRepository.updateBusiness.mockResolvedValue(mockBusiness);
			mockBusinessRepository.findControllersByBusinessId.mockResolvedValue([mockController]);
			mockBusinessRepository.updateBusinessController.mockResolvedValue(updatedController);
			mockBusinessRepository.findBusinessFileTypesByUserId.mockResolvedValue([
				BusinessFileType.PROOF_OF_ADDRESS,
			]);
			mockBusinessRepository.findControllerFileTypesByControllerIds.mockResolvedValue(
				new Map([["ctrl-001", [BusinessControllerFileType.IDENTIFICATION_FRONT]]]),
			);

			const result = await service.saveBusiness(MOCK_USER_ID, {
				legalName: "Updated Corp",
				controllers: [{ id: "ctrl-001", legalFirstName: "NewName", role: BusinessControllerRole.CONTROLLING_PERSON }],
			});

			expect(mockBusinessRepository.updateBusinessController).toHaveBeenCalled();
			expect(result.controllers[0]?.legalFirstName).toBe("NewName");
		});

		it("should throw BusinessControllerNotFoundException if an invalid controller ID is provided", async () => {
			const mockUser = createMockUser();
			const mockBusiness = createMockBusiness();

			mockUserRepository.findById.mockResolvedValue(mockUser);
			mockBusinessRepository.findBusinessByUserId.mockResolvedValue(mockBusiness);
			mockBusinessRepository.updateBusiness.mockResolvedValue(mockBusiness);
			mockBusinessRepository.findControllersByBusinessId.mockResolvedValue([]);

			await expect(
				service.saveBusiness(MOCK_USER_ID, {
					controllers: [{ id: "invalid-id", role: BusinessControllerRole.CONTROLLING_PERSON }],
				}),
			).rejects.toThrow(BusinessControllerNotFoundException);
		});
	});

	describe("getBusiness", () => {
		it("should throw BusinessNotFoundException when business does not exist", async () => {
			mockBusinessRepository.findBusinessByUserId.mockResolvedValue(null);

			await expect(service.getBusiness(MOCK_USER_ID)).rejects.toThrow(BusinessNotFoundException);
		});

		it("should return business data with fileTypesUploaded", async () => {
			const mockBusiness = createMockBusiness();

			mockBusinessRepository.findBusinessByUserId.mockResolvedValue(mockBusiness);
			mockBusinessRepository.findControllersByBusinessId.mockResolvedValue([]);
			mockBusinessRepository.findBusinessFileTypesByUserId.mockResolvedValue([
				BusinessFileType.INCORPORATION_DOCUMENT,
			]);
			mockBusinessRepository.findControllerFileTypesByControllerIds.mockResolvedValue(new Map());

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

			mockBusinessRepository.findBusinessByUserId.mockResolvedValue(mockBusiness);
			mockBusinessRepository.findControllersByBusinessId.mockResolvedValue([]);
			mockBusinessRepository.findBusinessFileTypesByUserId.mockResolvedValue([]);
			mockBusinessRepository.findControllerFileTypesByControllerIds.mockResolvedValue(new Map());

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

			mockBusinessRepository.findBusinessByUserId.mockResolvedValue(mockBusiness);
			mockBusinessRepository.findControllersByBusinessId.mockResolvedValue([]);
			mockBusinessRepository.findBusinessFileTypesByUserId.mockResolvedValue([
				BusinessFileType.PROOF_OF_ADDRESS,
			]);
			mockBusinessRepository.findControllerFileTypesByControllerIds.mockResolvedValue(new Map());

			const result = await service.getBusiness(MOCK_USER_ID);

			expect(result.address).toBeDefined();
			expect(result.address!.addressProofType).toBe("UTILITY_BILL");
		});

		it("should include controller fileTypesUploaded when controllers exist", async () => {
			const mockBusiness = createMockBusiness();
			const mockController = createMockController();

			mockBusinessRepository.findBusinessByUserId.mockResolvedValue(mockBusiness);
			mockBusinessRepository.findControllersByBusinessId.mockResolvedValue([mockController]);
			mockBusinessRepository.findBusinessFileTypesByUserId.mockResolvedValue([
				BusinessFileType.INCORPORATION_DOCUMENT,
			]);
			mockBusinessRepository.findControllerFileTypesByControllerIds.mockResolvedValue(
				new Map([[MOCK_CONTROLLER_ID, [BusinessControllerFileType.IDENTIFICATION_FRONT]]]),
			);

			const result = await service.getBusiness(MOCK_USER_ID);

			expect(result.controllers).toHaveLength(1);
			expect(result.controllers[0]!.fileTypesUploaded).toContain(BusinessControllerFileType.IDENTIFICATION_FRONT);
		});

		it("should handle empty controller list when fetching uploaded file types", async () => {
			const mockBusiness = createMockBusiness();

			mockBusinessRepository.findBusinessByUserId.mockResolvedValue(mockBusiness);
			mockBusinessRepository.findControllersByBusinessId.mockResolvedValue([]);
			mockBusinessRepository.findBusinessFileTypesByUserId.mockResolvedValue([]);
			mockBusinessRepository.findControllerFileTypesByControllerIds.mockResolvedValue(new Map());

			const result = await service.getBusiness(MOCK_USER_ID);

			expect(result.controllers).toHaveLength(0);
		});
	});

	describe("getFile", () => {
		it("should throw BusinessFileNotFoundException when file does not exist for user and file type", async () => {
			mockBusinessRepository.findBusinessFile.mockResolvedValue(undefined);

			await expect(
				service.getBusinessFile({ userId: MOCK_USER_ID, fileType: BusinessFileType.INCORPORATION_DOCUMENT }),
			).rejects.toThrow(BusinessFileNotFoundException);
		});

		it("should return file buffer and metadata when file exists", async () => {
			const mockFileRow = createMockFileRow();
			mockBusinessRepository.findBusinessFile.mockResolvedValue(mockFileRow);

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
			mockBusinessRepository.findBusinessFile.mockResolvedValue(mockFileRow);

			await service.getBusinessFile({ userId: MOCK_USER_ID, fileType: BusinessFileType.PROOF_OF_ADDRESS });

			expect(mockBusinessRepository.findBusinessFile).toHaveBeenCalledWith(MOCK_USER_ID, BusinessFileType.PROOF_OF_ADDRESS);
		});
	});

	describe("getBusinessControllerFile", () => {
		it("should throw ControllerFileNotFoundException when file does not exist", async () => {
			mockBusinessRepository.findControllerFile.mockResolvedValue(undefined);

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
			mockBusinessRepository.findControllerFile.mockResolvedValue(mockFileRow);

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

	describe("filterUndefined", () => {
		it("all-undefined input returns {}", () => {
			const input = { a: undefined, b: undefined };

			const result = ObjectUtils.filterUndefined(input);

			expect(result).toEqual({});
		});

		it("mixed defined and undefined keeps only defined keys", () => {
			const input = { a: "hello", b: undefined, c: 42 };

			const result = ObjectUtils.filterUndefined(input);

			expect(result).toEqual({ a: "hello", c: 42 });
		});

		it("null values are preserved", () => {
			const input = { a: null, b: "keep" };

			const result = ObjectUtils.filterUndefined(input);

			expect(result).toEqual({ a: null, b: "keep" });
		});

		it("nested object preserved by reference", () => {
			const input = { nested: { x: 1 }, b: undefined };

			const result = ObjectUtils.filterUndefined(input);

			expect(result).toEqual({ nested: { x: 1 } });
			expect(result.nested).toBe(input.nested);
		});
	});
});
