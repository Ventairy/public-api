import { describe, it, expect } from "vitest";
import { HttpStatus } from "@nestjs/common";
import { ERROR_CODES } from "@shared/constants/error-codes";
import { InvalidSiweSignatureException } from "../invalid-siwe-signature.exception";

describe("InvalidSiweSignatureException", () => {
	it("should have correct properties", () => {
		const wallet = "0x123";
		const exception = new InvalidSiweSignatureException(wallet);
		expect(exception.domainCode).toBe(ERROR_CODES.INVALID_SIGNATURE);
		expect(exception.statusCode).toBe(HttpStatus.UNAUTHORIZED);
		expect(exception.details?.["context"]).toEqual({ walletAddress: wallet });
	});
});
