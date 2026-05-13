import { describe, it, expect } from "vitest";
import { LiquidityProviderId } from "../liquidity-provider-id";

describe("LiquidityProvider", () => {
	it("should have correct values", () => {
		expect(LiquidityProviderId.BLINDPAY).toBe("BLINDPAY");
	});

	it("should have exactly 1 member", () => {
		expect(Object.keys(LiquidityProviderId)).toHaveLength(1);
	});
});
