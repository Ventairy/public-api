import { describe, it, expect } from "vitest";
import { HttpStatus } from "@nestjs/common";
import { ERROR_CODES } from "@shared/constants/error-codes";
import { NonceChainIdMismatchException } from "../nonce-chain-id-mismatch.exception";

describe("NonceChainIdMismatchException", () => {
	it("should have correct properties", () => {
		const exception = new NonceChainIdMismatchException({
			nonceChainId: 8453,
			messageChainId: 1,
		});
		expect(exception.domainCode).toBe(ERROR_CODES.NONCE_CHAIN_ID_MISMATCH);
		expect(exception.statusCode).toBe(HttpStatus.BAD_REQUEST);
		expect(exception.details?.["context"]).toEqual({
			nonceChainId: 8453,
			messageChainId: 1,
		});
	});
});
