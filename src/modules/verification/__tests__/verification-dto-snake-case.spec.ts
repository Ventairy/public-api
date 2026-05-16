import { describe, it, expect } from "vitest";
import { instanceToPlain } from "class-transformer";
import { VerificationSubmissionOutputDto } from "../dto/verification-submission-output.dto";
import { VerificationStatusOutputDto } from "../dto/verification-status-output.dto";
import { VerificationMissingDataDto } from "../dto/verification-missing.dto";
import { VerificationStatus } from "@shared/enums";

describe("VerificationSubmissionOutputDto - Snake Case Mapping", () => {
	it("should map camelCase to snake_case when serialized", () => {
		const dto = new VerificationSubmissionOutputDto({
			id: "sub-001",
			userId: "user-123",
			verificationStatus: VerificationStatus.VERIFYING,
			submittedAt: "2026-05-05T10:00:00.000Z",
			createdAt: "2026-05-04T14:48:00.000Z",
		});

		const plain = instanceToPlain(dto) as Record<string, unknown>;

		expect(plain).toHaveProperty("id", "sub-001");
		expect(plain).toHaveProperty("user_id", "user-123");
		expect(plain).toHaveProperty("verification_status", "VERIFYING");
		expect(plain).toHaveProperty("submitted_at", "2026-05-05T10:00:00.000Z");
		expect(plain).toHaveProperty("created_at", "2026-05-04T14:48:00.000Z");

		expect(plain).not.toHaveProperty("userId");
		expect(plain).not.toHaveProperty("verificationStatus");
		expect(plain).not.toHaveProperty("submittedAt");
		expect(plain).not.toHaveProperty("createdAt");
	});
});

describe("VerificationStatusOutputDto - Snake Case Mapping", () => {
	it("should map camelCase to snake_case when serialized", () => {
		const dto = new VerificationStatusOutputDto({
			userId: "user-123",
			verificationStatus: VerificationStatus.VERIFYING,
			canSubmit: true,
			submittedAt: "2026-05-05T10:00:00.000Z",
			missing: new VerificationMissingDataDto({
				fields: [],
				files: [],
			}),
		});

		const plain = instanceToPlain(dto) as Record<string, unknown>;

		expect(plain).toHaveProperty("user_id", "user-123");
		expect(plain).toHaveProperty("verification_status", "VERIFYING");
		expect(plain).toHaveProperty("can_submit", true);
		expect(plain).toHaveProperty("submitted_at", "2026-05-05T10:00:00.000Z");
		expect(plain).toHaveProperty("missing");

		expect(plain).not.toHaveProperty("userId");
		expect(plain).not.toHaveProperty("verificationStatus");
		expect(plain).not.toHaveProperty("canSubmit");
		expect(plain).not.toHaveProperty("submittedAt");
		expect(plain).not.toHaveProperty("createdAt");
	});
});

describe("VerificationMissingDto - Snake Case Mapping", () => {
	it("should map camelCase to snake_case when serialized", () => {
		const dto = new VerificationMissingDataDto({
			fields: ["business.legal_name", "business.address.country_code"],
			files: ["business.PROOF_OF_ADDRESS", "business.INCORPORATION_DOCUMENT"],
		});

		const plain = instanceToPlain(dto) as Record<string, unknown>;

		expect(plain).toHaveProperty("fields");
		expect(plain).toHaveProperty("files");
		expect((plain as any).fields).toEqual(["business.legal_name", "business.address.country_code"]);
		expect((plain as any).files).toEqual(["business.PROOF_OF_ADDRESS", "business.INCORPORATION_DOCUMENT"]);
	});
});
