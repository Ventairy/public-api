import { describe, it, expect } from "vitest";
import { BUSINESS_MAX_FILE_SIZE_BYTES } from "../business.constants";

describe("BusinessConstants", () => {
	it("should have BUSINESS_MAX_FILE_SIZE_BYTES set to 5MB", () => {
		const expectedBytes = 5 * 1024 * 1024;
		expect(BUSINESS_MAX_FILE_SIZE_BYTES).toBe(expectedBytes);
	});
});
