import { describe, it, expect } from "vitest";
import { ObjectUtils } from "../object.utils";

describe("ObjectUtils", () => {
	it("all-undefined input returns {}", () => {
		const input = { a: undefined, b: undefined };

		const result = ObjectUtils.filterUndefined(input);

		expect(result).toEqual({});
	});

	it("mixed defined and undefined keeps only defined keys", () => {
		const input = { a: "hello", b: undefined, c: 42 };

		const result = ObjectUtils.filterUndefined(input);

		expect(result).toEqual({ a: "hello", c: 42 });
	});

	it("null values are preserved", () => {
		const input = { a: null, b: "keep" };

		const result = ObjectUtils.filterUndefined(input);

		expect(result).toEqual({ a: null, b: "keep" });
	});

	it("nested object preserved by reference", () => {
		const nested = { x: 1 };
		const input = { nested, b: undefined };

		const result = ObjectUtils.filterUndefined(input);

		expect(result).toEqual({ nested: { x: 1 } });
		expect(result.nested).toBe(nested);
	});

	it("empty object returns {}", () => {
		const result = ObjectUtils.filterUndefined({});

		expect(result).toEqual({});
	});

	it("no undefined values returns identical keys", () => {
		const input = { a: 1, b: "two", c: true };

		const result = ObjectUtils.filterUndefined(input);

		expect(result).toEqual({ a: 1, b: "two", c: true });
	});

	it("false and 0 are preserved (not treated as undefined)", () => {
		const input = { a: false, b: 0, c: undefined };

		const result = ObjectUtils.filterUndefined(input);

		expect(result).toEqual({ a: false, b: 0 });
	});
});
