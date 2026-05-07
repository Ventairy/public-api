import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { ConfigService } from "@nestjs/config";
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { R2BucketType } from "@shared/enums/r2-bucket-type";
import { R2StorageService } from "../r2-storage.service";

const mockS3Send = vi.fn();
const mockS3Destroy = vi.fn();

vi.mock("@aws-sdk/client-s3", () => ({
	S3Client: vi.fn(() => ({
		send: mockS3Send,
		destroy: mockS3Destroy,
	})),
	PutObjectCommand: vi.fn((args) => args),
	GetObjectCommand: vi.fn((args) => args),
	DeleteObjectCommand: vi.fn((args) => args),
}));

describe("R2StorageService", () => {
	let service: R2StorageService;
	let mockConfigService: ConfigService;

	const testConfig = {
		endpoint: "https://test.r2.cloudflarestorage.com",
		buckets: {
			[R2BucketType.BUSINESS_FILES]: {
				bucketName: "test-business-bucket",
				accessKeyId: "test-access-key",
				secretAccessKey: "test-secret-key",
			},
		},
	};

	beforeEach(() => {
		vi.clearAllMocks();

		mockConfigService = {
			get: vi.fn().mockReturnValue(testConfig),
		} as unknown as ConfigService;

		service = new R2StorageService(mockConfigService);
	});

	describe("constructor", () => {
		it("should throw when R2 configuration is missing", () => {
			const emptyConfigService = { get: vi.fn().mockReturnValue(undefined) } as unknown as ConfigService;

			expect(() => new R2StorageService(emptyConfigService)).toThrow("R2 configuration is missing");
		});
	});

	describe("uploadFile", () => {
		const testKey = "business/user-123/file-abc.pdf";
		const testBody = Buffer.from("test-content");
		const testContentType = "application/pdf";

		it("should send PutObjectCommand with correct parameters", async () => {
			mockS3Send.mockResolvedValue({});

			await service.uploadFile({
				bucketType: R2BucketType.BUSINESS_FILES,
				key: testKey,
				body: testBody,
				contentType: testContentType,
			});

			expect(PutObjectCommand).toHaveBeenCalledWith({
				Bucket: "test-business-bucket",
				Key: testKey,
				Body: testBody,
				ContentType: testContentType,
			});
			expect(mockS3Send).toHaveBeenCalledWith(expect.any(Object));
		});

		it("should create S3Client with correct per-bucket credentials", async () => {
			mockS3Send.mockResolvedValue({});

			await service.uploadFile({
				bucketType: R2BucketType.BUSINESS_FILES,
				key: testKey,
				body: testBody,
				contentType: testContentType,
			});

			expect(S3Client).toHaveBeenCalledWith({
				region: "auto",
				endpoint: testConfig.endpoint,
				credentials: {
					accessKeyId: testConfig.buckets[R2BucketType.BUSINESS_FILES].accessKeyId,
					secretAccessKey: testConfig.buckets[R2BucketType.BUSINESS_FILES].secretAccessKey,
				},
			});
		});

		it("should reuse S3Client for same bucket type", async () => {
			mockS3Send.mockResolvedValue({});

			await service.uploadFile({
				bucketType: R2BucketType.BUSINESS_FILES,
				key: "key1",
				body: testBody,
				contentType: testContentType,
			});
			await service.uploadFile({
				bucketType: R2BucketType.BUSINESS_FILES,
				key: "key2",
				body: testBody,
				contentType: testContentType,
			});

			expect((S3Client as unknown as Mock).mock.calls.length).toBe(1);
		});

		it("should throw when bucket type is not configured", async () => {
			const invalidConfigService = {
				get: vi.fn().mockReturnValue({ ...testConfig, buckets: {} }),
			} as unknown as ConfigService;

			const invalidService = new R2StorageService(invalidConfigService);

			await expect(
				invalidService.uploadFile({
					bucketType: R2BucketType.BUSINESS_FILES,
					key: testKey,
					body: testBody,
					contentType: testContentType,
				}),
			).rejects.toThrow("R2 bucket config not found for type: BUSINESS_FILES");
		});

		it("should throw 'no bucket name' error when bucket name is missing", async () => {
			const noNameConfigService = {
				get: vi.fn().mockReturnValue({
					endpoint: testConfig.endpoint,
					buckets: {
						[R2BucketType.BUSINESS_FILES]: {
							bucketName: undefined,
							accessKeyId: "key",
							secretAccessKey: "secret",
						},
					},
				}),
			} as unknown as ConfigService;

			const noNameService = new R2StorageService(noNameConfigService);

			await expect(
				noNameService.uploadFile({
					bucketType: R2BucketType.BUSINESS_FILES,
					key: testKey,
					body: testBody,
					contentType: testContentType,
				}),
			).rejects.toThrow("R2 bucket name not configured for type: BUSINESS_FILES");
		});

		it("should propagate errors from S3Client", async () => {
			const error = new Error("S3 Upload Error");
			mockS3Send.mockRejectedValue(error);

			await expect(
				service.uploadFile({
					bucketType: R2BucketType.BUSINESS_FILES,
					key: testKey,
					body: testBody,
					contentType: testContentType,
				}),
			).rejects.toThrow("S3 Upload Error");
		});
	});

	describe("getFileBuffer", () => {
		const testKey = "business/user-123/file-abc.pdf";
		const testContent = "file-content-here";

		it("should return buffer when file exists", async () => {
			mockS3Send.mockResolvedValue({
				Body: {
					transformToByteArray: vi.fn().mockResolvedValue(new Uint8Array(Buffer.from(testContent))),
				},
			});

			const result = await service.getFileBuffer(R2BucketType.BUSINESS_FILES, testKey);

			expect(GetObjectCommand).toHaveBeenCalledWith({
				Bucket: "test-business-bucket",
				Key: testKey,
			});
			expect(result).toEqual(Buffer.from(testContent));
		});

		it("should throw when file body is missing in response", async () => {
			mockS3Send.mockResolvedValue({ Body: null });

			await expect(service.getFileBuffer(R2BucketType.BUSINESS_FILES, testKey)).rejects.toThrow(
				`File not found at key: ${testKey}`,
			);
		});

		it("should propagate errors from S3Client.send", async () => {
			mockS3Send.mockRejectedValue(new Error("S3 Get Error"));

			await expect(service.getFileBuffer(R2BucketType.BUSINESS_FILES, testKey)).rejects.toThrow("S3 Get Error");
		});

		it("should propagate errors from body transformation", async () => {
			mockS3Send.mockResolvedValue({
				Body: {
					transformToByteArray: vi.fn().mockRejectedValue(new Error("Transform Error")),
				},
			});

			await expect(service.getFileBuffer(R2BucketType.BUSINESS_FILES, testKey)).rejects.toThrow("Transform Error");
		});
	});

	describe("deleteFile", () => {
		const testKey = "business/user-123/file-abc.pdf";

		it("should send DeleteObjectCommand with correct parameters", async () => {
			mockS3Send.mockResolvedValue({});

			await service.deleteFile(R2BucketType.BUSINESS_FILES, testKey);

			expect(DeleteObjectCommand).toHaveBeenCalledWith({
				Bucket: "test-business-bucket",
				Key: testKey,
			});
			expect(mockS3Send).toHaveBeenCalled();
		});

		it("should propagate errors from S3Client", async () => {
			mockS3Send.mockRejectedValue(new Error("S3 Delete Error"));

			await expect(service.deleteFile(R2BucketType.BUSINESS_FILES, testKey)).rejects.toThrow("S3 Delete Error");
		});
	});

	describe("generateFileKey", () => {
		it("should generate a valid file key with sanitized filename", () => {
			const result = service.generateFileKey({
				folder: "business/user-123",
				fileId: "file-abc",
				fileName: "my document (1).pdf",
			});
			expect(result).toBe("business/user-123/file-abc-my_document__1_.pdf");
		});

		it("should preserve allowed characters and replace others", () => {
			const cases = [
				{ input: "valid-name_123.txt", expected: "prefix/id-valid-name_123.txt" },
				{ input: "file with spaces.pdf", expected: "prefix/id-file_with_spaces.pdf" },
				{ input: "special!@#$%^&*().pdf", expected: "prefix/id-special__________.pdf" },
				{ input: "../traversal.txt", expected: "prefix/id-.._traversal.txt" },
			];

			for (const { input, expected } of cases) {
				expect(
					service.generateFileKey({
						folder: "prefix",
						fileId: "id",
						fileName: input,
					}),
				).toBe(expected);
			}
		});

		it("should handle empty or minimal inputs", () => {
			expect(service.generateFileKey({ folder: "", fileId: "", fileName: "" })).toBe("/-");
			expect(service.generateFileKey({ folder: "a", fileId: "b", fileName: "c" })).toBe("a/b-c");
		});
	});

	describe("onModuleDestroy", () => {
		it("should destroy all S3 clients", async () => {
			mockS3Send.mockResolvedValue({});
			await service
				.uploadFile({
					bucketType: R2BucketType.BUSINESS_FILES,
					key: "test-key",
					body: Buffer.from("a"),
					contentType: "text/plain",
				})
				.catch(() => {});
			service.onModuleDestroy();
			expect(mockS3Destroy).toHaveBeenCalled();
		});
	});
});
