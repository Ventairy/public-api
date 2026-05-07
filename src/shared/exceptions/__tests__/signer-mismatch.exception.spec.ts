import { describe, it, expect } from "vitest";
import { HttpStatus } from "@nestjs/common";
import { ERROR_CODES } from "@shared/constants/error-codes";
import { SignerMismatchException } from "../signer-mismatch.exception";

describe("SignerMismatchException", () => {
	it("should have correct properties", () => {
		const exception = new SignerMismatchException({
			expectedWalletAddress: "0x1",
			actualWalletAddress: "0x2",
		});
		expect(exception.domainCode).toBe(ERROR_CODES.SIGNER_MISMATCH);
		expect(exception.statusCode).toBe(HttpStatus.UNAUTHORIZED);
		expect(exception.details?.["context"]).toEqual({
			expectedWalletAddress: "0x1",
			actualWalletAddress: "0x2",
		});
	});
});
