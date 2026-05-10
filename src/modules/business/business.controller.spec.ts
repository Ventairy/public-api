import { describe, it, expect, vi, beforeEach } from "vitest";
import { StreamableFile } from "@nestjs/common";
import { BusinessFileType } from "@shared/constants";
import { BusinessControllerFileType } from "@shared/constants";
import { BusinessController } from "./business.controller";
import { BusinessService } from "./business.service";
import { UploadBusinessFileBodyDto } from "./dto/upload-business-file-body.dto";
import { UploadBusinessControllerFileBodyDto } from "./dto/upload-business-controller-file-body.dto";

const MOCK_ACTOR = { id: "user-1", sessionId: "s-1" };

function createMockBusinessService() {
	return {
		uploadBusinessFile: vi.fn(),
		uploadBusinessControllerFile: vi.fn(),
		saveBusiness: vi.fn(),
		getBusiness: vi.fn(),
		getBusinessFile: vi.fn(),
		getBusinessControllerFile: vi.fn(),
	};
}

describe("BusinessController", () => {
	let controller: BusinessController;
	let mockService: ReturnType<typeof createMockBusinessService>;

	beforeEach(() => {
		mockService = createMockBusinessService();
		controller = new BusinessController(mockService as unknown as BusinessService);
	});

	describe("uploadFile", () => {
		it("should delegate to service.uploadBusinessFile with actor.id as userId", async () => {
			const mockFile = {
				buffer: Buffer.from("test"),
				originalname: "doc.pdf",
				mimetype: "application/pdf",
				size: 1024,
			} as Express.Multer.File;
			const mockResult = {
				id: "file-1",
				fileName: "doc.pdf",
				fileSize: 1024,
				mimeType: "application/pdf",
				fileType: BusinessFileType.INCORPORATION_DOCUMENT,
				createdAt: "2026-01-01T00:00:00.000Z",
			};
			mockService.uploadBusinessFile.mockResolvedValue(mockResult);

			const body = { fileType: "BUSINESS_INCORPORATION_DOCUMENT" as any } as UploadBusinessFileBodyDto;
			const result = await controller.uploadFile(MOCK_ACTOR, mockFile, body);

			expect(mockService.uploadBusinessFile).toHaveBeenCalledWith(
				"user-1",
				mockFile,
				"BUSINESS_INCORPORATION_DOCUMENT",
			);
			expect(result).toEqual(mockResult);
		});
	});

	describe("uploadBusinessControllerFile", () => {
		it("should delegate to service.uploadBusinessControllerFile with actor.id as userId", async () => {
			const mockFile = {
				buffer: Buffer.from("test"),
				originalname: "passport.jpg",
				mimetype: "image/jpeg",
				size: 2048,
			} as Express.Multer.File;
			const mockResult = {
				id: "file-2",
				fileName: "passport.jpg",
				fileSize: 2048,
				mimeType: "image/jpeg",
				fileType: BusinessControllerFileType.IDENTIFICATION_FRONT,
				createdAt: "2026-01-01T00:00:00.000Z",
			};
			mockService.uploadBusinessControllerFile.mockResolvedValue(mockResult);

			const body = { fileType: "CONTROLLER_IDENTIFICATION_FRONT" as any } as UploadBusinessControllerFileBodyDto;
			const result = await controller.uploadBusinessControllerFile(MOCK_ACTOR, "ctrl-1", mockFile, body);

			expect(mockService.uploadBusinessControllerFile).toHaveBeenCalledWith(
				"user-1",
				"ctrl-1",
				mockFile,
				"CONTROLLER_IDENTIFICATION_FRONT",
			);
			expect(result).toEqual(mockResult);
		});
	});

	describe("saveBusiness", () => {
		it("should delegate to service.saveBusiness with actor.id as userId", async () => {
			const body = { legalName: "Acme" };
			const mockResult = {
				id: "biz-1",
				legalName: "Acme",
				fileTypesUploaded: [],
				controllers: [],
				createdAt: "2026-01-01T00:00:00.000Z",
			};
			mockService.saveBusiness.mockResolvedValue(mockResult);

			const result = await controller.saveBusiness(MOCK_ACTOR, body as any);

			expect(mockService.saveBusiness).toHaveBeenCalledWith("user-1", body);
			expect(result).toEqual(mockResult);
		});
	});

	describe("getBusiness", () => {
		it("should delegate to service.getBusiness with actor.id", async () => {
			const mockResult = {
				id: "biz-1",
				legalName: "Acme",
				fileTypesUploaded: [],
				controllers: [],
				createdAt: "2026-01-01T00:00:00.000Z",
			};
			mockService.getBusiness.mockResolvedValue(mockResult);

			const result = await controller.getBusiness(MOCK_ACTOR);

			expect(mockService.getBusiness).toHaveBeenCalledWith("user-1");
			expect(result).toEqual(mockResult);
		});
	});

	describe("getBusinessFile", () => {
		it("should delegate to service.getBusinessFile with actor.id and fileType", async () => {
			const mockBuffer = Buffer.from("file-content");
			mockService.getBusinessFile.mockResolvedValue({
				buffer: mockBuffer,
				fileName: "doc.pdf",
				mimeType: "application/pdf",
			});

			const result = await controller.getBusinessFile(MOCK_ACTOR, {
				fileType: BusinessFileType.INCORPORATION_DOCUMENT,
			});

			expect(mockService.getBusinessFile).toHaveBeenCalledWith({
				userId: "user-1",
				fileType: BusinessFileType.INCORPORATION_DOCUMENT,
			});
			expect(result).toBeInstanceOf(StreamableFile);
		});
	});

	describe("getBusinessControllerFile", () => {
		it("should delegate with actor.id, controllerId and fileType", async () => {
			const mockBuffer = Buffer.from("file-content");
			mockService.getBusinessControllerFile.mockResolvedValue({
				buffer: mockBuffer,
				fileName: "passport.jpg",
				mimeType: "image/jpeg",
			});

			const result = await controller.getBusinessControllerFile(MOCK_ACTOR, "ctrl-1", {
				fileType: BusinessControllerFileType.IDENTIFICATION_FRONT,
			});

			expect(mockService.getBusinessControllerFile).toHaveBeenCalledWith({
				userId: "user-1",
				controllerId: "ctrl-1",
				fileType: BusinessControllerFileType.IDENTIFICATION_FRONT,
			});
			expect(result).toBeInstanceOf(StreamableFile);
		});
	});
});
