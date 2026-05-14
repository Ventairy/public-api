import { describe, it, expect } from "vitest";
import { DateUtils } from "../date.utils";

describe("DateUtils", () => {
	describe("unixSecondsTimestampToISO", () => {
		it("should convert Unix timestamp to ISO string", () => {
			const result = DateUtils.unixSecondsTimestampToISO(1715536800);

			expect(result).toBe(new Date(1715536800 * 1000).toISOString());
		});

		it("should handle Unix epoch (0)", () => {
			const result = DateUtils.unixSecondsTimestampToISO(0);

			expect(result).toBe("1970-01-01T00:00:00.000Z");
		});

		it("should handle large timestamps", () => {
			const result = DateUtils.unixSecondsTimestampToISO(1700000000);

			expect(result).toBe("2023-11-14T22:13:20.000Z");
		});
	});
});
