import { describe, it, expect } from "vitest";
import { LiquidityProvider } from "../liquidity-provider";

describe("LiquidityProvider", () => {
	it("should have correct values", () => {
		expect(LiquidityProvider.BLINDPAY).toBe("BLINDPAY");
	});

	it("should have exactly 1 member", () => {
		expect(Object.keys(LiquidityProvider)).toHaveLength(1);
	});
});
