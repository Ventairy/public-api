import { describe, it, expect } from "vitest";
import { instanceToPlain } from "class-transformer";
import { KycSubmissionOutputDto } from "../dto/kyc-submission-output.dto";
import { KycStatusOutputDto } from "../dto/kyc-status-output.dto";
import { VentairyKycStatus } from "@shared/constants";

describe("KycSubmissionOutputDto - Snake Case Mapping", () => {
	it("should map camelCase to snake_case when serialized", () => {
		const dto = new KycSubmissionOutputDto({
			id: "sub-001",
			userId: "user-123",
			ventairyKycStatus: VentairyKycStatus.VERIFYING,
			submittedAt: "2026-05-05T10:00:00.000Z",
			createdAt: "2026-05-04T14:48:00.000Z",
		});

		const plain = instanceToPlain(dto) as Record<string, unknown>;

		expect(plain).toHaveProperty("id", "sub-001");
		expect(plain).toHaveProperty("user_id", "user-123");
		expect(plain).toHaveProperty("ventairy_kyc_status", "VERIFYING");
		expect(plain).toHaveProperty("submitted_at", "2026-05-05T10:00:00.000Z");
		expect(plain).toHaveProperty("created_at", "2026-05-04T14:48:00.000Z");
		
		expect(plain).not.toHaveProperty("userId");
		expect(plain).not.toHaveProperty("ventairyKycStatus");
		expect(plain).not.toHaveProperty("submittedAt");
		expect(plain).not.toHaveProperty("createdAt");
	});
});

describe("KycStatusOutputDto - Snake Case Mapping", () => {
	it("should map camelCase to snake_case when serialized", () => {
		const dto = new KycStatusOutputDto({
			userId: "user-123",
			ventairyKycStatus: VentairyKycStatus.VERIFYING,
			submittedAt: "2026-05-05T10:00:00.000Z",
			createdAt: "2026-05-04T14:48:00.000Z",
		});

		const plain = instanceToPlain(dto) as Record<string, unknown>;

		expect(plain).toHaveProperty("user_id", "user-123");
		expect(plain).toHaveProperty("ventairy_kyc_status", "VERIFYING");
		expect(plain).toHaveProperty("submitted_at", "2026-05-05T10:00:00.000Z");
		expect(plain).toHaveProperty("created_at", "2026-05-04T14:48:00.000Z");
		
		expect(plain).not.toHaveProperty("userId");
		expect(plain).not.toHaveProperty("ventairyKycStatus");
		expect(plain).not.toHaveProperty("submittedAt");
		expect(plain).not.toHaveProperty("createdAt");
	});
});
