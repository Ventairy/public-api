import { describe, it, expect } from "vitest";
import { plainToInstance } from "class-transformer";
import { KycSubmissionOutputDto } from "../dto/kyc-submission-output.dto";
import { KycStatusOutputDto } from "../dto/kyc-status-output.dto";

describe("KycSubmissionOutputDto - Snake Case Mapping", () => {
	it("should map snake_case user_id to camelCase userId", () => {
		const payload = { user_id: "user-123" };
		const dto = plainToInstance(KycSubmissionOutputDto, payload);

		expect(dto.userId).toBe("user-123");
	});

	it("should map snake_case ventairy_kyc_status to camelCase ventairyKycStatus", () => {
		const payload = { ventairy_kyc_status: "VERIFYING" };
		const dto = plainToInstance(KycSubmissionOutputDto, payload);

		expect(dto.ventairyKycStatus).toBe("VERIFYING");
	});

	it("should map snake_case submitted_at to camelCase submittedAt", () => {
		const payload = { submitted_at: "2026-05-05T10:00:00.000Z" };
		const dto = plainToInstance(KycSubmissionOutputDto, payload);

		expect(dto.submittedAt).toBe("2026-05-05T10:00:00.000Z");
	});

	it("should map snake_case created_at to camelCase createdAt", () => {
		const payload = { created_at: "2026-05-04T14:48:00.000Z" };
		const dto = plainToInstance(KycSubmissionOutputDto, payload);

		expect(dto.createdAt).toBe("2026-05-04T14:48:00.000Z");
	});

	it("should transform a full payload with all snake_case fields", () => {
		const payload = {
			id: "sub-001",
			user_id: "user-123",
			ventairy_kyc_status: "VERIFYING",
			submitted_at: "2026-05-05T10:00:00.000Z",
			created_at: "2026-05-04T14:48:00.000Z",
		};
		const dto = plainToInstance(KycSubmissionOutputDto, payload);

		expect(dto.id).toBe("sub-001");
		expect(dto.userId).toBe("user-123");
		expect(dto.ventairyKycStatus).toBe("VERIFYING");
		expect(dto.submittedAt).toBe("2026-05-05T10:00:00.000Z");
		expect(dto.createdAt).toBe("2026-05-04T14:48:00.000Z");
	});
});

describe("KycStatusOutputDto - Snake Case Mapping", () => {
	it("should map snake_case user_id to camelCase userId", () => {
		const payload = { user_id: "user-123" };
		const dto = plainToInstance(KycStatusOutputDto, payload);

		expect(dto.userId).toBe("user-123");
	});

	it("should map snake_case ventairy_kyc_status to camelCase ventairyKycStatus", () => {
		const payload = { ventairy_kyc_status: "VERIFYING" };
		const dto = plainToInstance(KycStatusOutputDto, payload);

		expect(dto.ventairyKycStatus).toBe("VERIFYING");
	});

	it("should map snake_case submitted_at to camelCase submittedAt", () => {
		const payload = { submitted_at: "2026-05-05T10:00:00.000Z" };
		const dto = plainToInstance(KycStatusOutputDto, payload);

		expect(dto.submittedAt).toBe("2026-05-05T10:00:00.000Z");
	});

	it("should map snake_case created_at to camelCase createdAt", () => {
		const payload = { created_at: "2026-05-04T14:48:00.000Z" };
		const dto = plainToInstance(KycStatusOutputDto, payload);

		expect(dto.createdAt).toBe("2026-05-04T14:48:00.000Z");
	});

	it("should transform a full payload with all snake_case fields", () => {
		const payload = {
			user_id: "user-123",
			ventairy_kyc_status: "VERIFYING",
			submitted_at: "2026-05-05T10:00:00.000Z",
			created_at: "2026-05-04T14:48:00.000Z",
		};
		const dto = plainToInstance(KycStatusOutputDto, payload);

		expect(dto.userId).toBe("user-123");
		expect(dto.ventairyKycStatus).toBe("VERIFYING");
		expect(dto.submittedAt).toBe("2026-05-05T10:00:00.000Z");
		expect(dto.createdAt).toBe("2026-05-04T14:48:00.000Z");
	});
});
