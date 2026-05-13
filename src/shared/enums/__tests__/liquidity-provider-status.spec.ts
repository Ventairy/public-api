import { describe, it, expect } from "vitest";
import { UserLiquidityProviderStatus } from "../user-liquidity-provider-status";

describe("LiquidityProviderStatus", () => {
	it("should have correct values", () => {
		expect(UserLiquidityProviderStatus.ACTIVE).toBe("ACTIVE");
		expect(UserLiquidityProviderStatus.INACTIVE).toBe("INACTIVE");
		expect(UserLiquidityProviderStatus.PENDING).toBe("PENDING");
		expect(UserLiquidityProviderStatus.REJECTED).toBe("REJECTED");
	});

	it("should have exactly 4 members", () => {
		expect(Object.keys(UserLiquidityProviderStatus)).toHaveLength(4);
	});
});
