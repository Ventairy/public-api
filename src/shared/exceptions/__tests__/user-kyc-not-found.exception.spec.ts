import { describe, it, expect } from "vitest";
import { HttpStatus } from "@nestjs/common";
import { UserKycNotFoundException } from "../user-kyc-not-found.exception";

describe("UserKycNotFoundException", () => {
	it("should create a 404 exception with KYC_NOT_FOUND code", () => {
		const exception = new UserKycNotFoundException("user-123");

		expect(exception.statusCode).toBe(HttpStatus.NOT_FOUND);
		expect(exception.domainCode).toBe("KYC_NOT_FOUND");
		expect(exception.message).toBe('KYC record not found for user "user-123"');
	});

	it("should include userId in details", () => {
		const exception = new UserKycNotFoundException("user-456");

		expect(exception.details).toEqual({ userId: "user-456" });
	});
});
