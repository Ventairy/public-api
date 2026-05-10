import { describe, it, expect } from "vitest";
import { HttpStatus } from "@nestjs/common";
import { ERROR_CODES } from "@shared/constants/error-codes";
import { NonceWalletMismatchException } from "../nonce-wallet-mismatch.exception";

describe("NonceWalletMismatchException", () => {
	it("should have correct properties", () => {
		const exception = new NonceWalletMismatchException({
			requestedWalletAddress: "0x1",
			nonceWalletAddress: "0x2",
		});
		expect(exception.domainCode).toBe(ERROR_CODES.NONCE_WALLET_MISMATCH);
		expect(exception.statusCode).toBe(HttpStatus.BAD_REQUEST);
		expect(exception.details?.["context"]).toEqual({
			requestedWalletAddress: "0x1",
			nonceWalletAddress: "0x2",
		});
	});
});
