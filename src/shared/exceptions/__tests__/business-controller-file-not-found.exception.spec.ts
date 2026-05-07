import { describe, it, expect } from "vitest";
import { HttpStatus } from "@nestjs/common";
import { ERROR_CODES } from "@shared/constants/error-codes";
import { BusinessControllerFileNotFoundException } from "../business-controller-file-not-found.exception";

describe("BusinessControllerFileNotFoundException", () => {
	it("should have correct properties", () => {
		const exception = new BusinessControllerFileNotFoundException("user-123", "controller-456");
		expect(exception.domainCode).toBe(ERROR_CODES.BUSINESS_CONTROLLER_FILE_NOT_FOUND);
		expect(exception.statusCode).toBe(HttpStatus.NOT_FOUND);
		expect(exception.details?.["userId"]).toBe("user-123");
		expect(exception.details?.["controllerId"]).toBe("controller-456");
	});
});
