import { describe, it, expect } from "vitest";
import { getValidationHint } from "@shared/errors/validation-hint.map";

describe("getValidationHint", () => {
	it("returns the mapped hint for a known constraint", () => {
		const hint = getValidationHint(
			"isEthereumAddress",
			"wallet_address must be an Ethereum address",
		);
		expect(hint).toContain("0x-prefixed");
		expect(hint).toContain("40-character");
	});

	it("returns the mapped hint for isString", () => {
		const hint = getValidationHint("isString", "must be a string");
		expect(hint).toBe("Provide a valid string value.");
	});

	it("returns the mapped hint for isUUID", () => {
		const hint = getValidationHint("isUUID", "must be a UUID");
		expect(hint).toContain("UUID");
	});

	it("returns the mapped hint for whitelistValidation", () => {
		const hint = getValidationHint(
			"whitelistValidation",
			"property should not exist",
		);
		expect(hint).toContain("Remove this field");
	});

	it("falls back to the default message for an unknown constraint", () => {
		const defaultMessage = "some custom constraint message";
		const hint = getValidationHint("someUnknownConstraint", defaultMessage);
		expect(hint).toBe(defaultMessage);
	});

	it("returns a hint for every commonly mapped constraint", () => {
		const constraints = [
			"isEthereumAddress",
			"isString",
			"isNumber",
			"isInt",
			"isUUID",
			"isEmail",
			"isUrl",
			"isNotEmpty",
			"minLength",
			"maxLength",
			"min",
			"max",
			"isObject",
			"isArray",
			"isBoolean",
			"isDefined",
			"whitelistValidation",
		];

		for (const constraint of constraints) {
			const hint = getValidationHint(constraint, "fallback");
			expect(hint).toBeTruthy();
			expect(typeof hint).toBe("string");
			expect(hint.length).toBeGreaterThan(0);
		}
	});
});
