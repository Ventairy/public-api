import { describe, it, expect } from "vitest";
import { UserType } from "../user-type";

describe("UserType", () => {
	it("should have correct values", () => {
		expect(UserType.BUSINESS).toBe("BUSINESS");
	});

	it("should have exactly 1 member", () => {
		expect(Object.keys(UserType)).toHaveLength(1);
	});
});
