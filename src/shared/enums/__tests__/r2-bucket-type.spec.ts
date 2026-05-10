import { describe, it, expect } from "vitest";
import { R2BucketType } from "../r2-bucket-type";

describe("R2BucketType", () => {
	it("should have correct values", () => {
		expect(R2BucketType.BUSINESS_FILES).toBe("BUSINESS_FILES");
	});

	it("should have exactly 1 member", () => {
		expect(Object.keys(R2BucketType)).toHaveLength(1);
	});
});
