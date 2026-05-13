import { describe, it, expect } from "vitest";
import { PaymentMethod } from "../payment-method";

describe("PaymentMethod", () => {
	it("should have correct values", () => {
		expect(PaymentMethod.PIX).toBe("PIX");
	});

	it("should have exactly 1 member", () => {
		expect(Object.keys(PaymentMethod)).toHaveLength(1);
	});
});
