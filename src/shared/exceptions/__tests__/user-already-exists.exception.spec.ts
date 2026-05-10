import { describe, it, expect } from "vitest";
import { HttpStatus } from "@nestjs/common";
import { ERROR_CODES } from "@shared/constants/error-codes";
import { UserAlreadyExistsException } from "../user-already-exists.exception";

describe("UserAlreadyExistsException", () => {
	it("should have correct properties", () => {
		const wallet = "0x123";
		const exception = new UserAlreadyExistsException(wallet);
		expect(exception.domainCode).toBe(ERROR_CODES.CONFLICT);
		expect(exception.statusCode).toBe(HttpStatus.CONFLICT);
		expect(exception.details?.["context"]).toEqual({ walletAddress: wallet });
	});
});
