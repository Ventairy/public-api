import { describe, it, expect } from "vitest";
import { LiquidityProviderStatus } from "../liquidity-provider-status";

describe("LiquidityProviderStatus", () => {
	it("should have correct values", () => {
		expect(LiquidityProviderStatus.ACTIVE).toBe("ACTIVE");
		expect(LiquidityProviderStatus.INACTIVE).toBe("INACTIVE");
		expect(LiquidityProviderStatus.PENDING).toBe("PENDING");
		expect(LiquidityProviderStatus.REJECTED).toBe("REJECTED");
	});

	it("should have exactly 4 members", () => {
		expect(Object.keys(LiquidityProviderStatus)).toHaveLength(4);
	});
});
