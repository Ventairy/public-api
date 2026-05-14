import { describe, it, expect } from "vitest";
import { HttpStatus } from "@nestjs/common";
import { ERROR_CODES } from "@shared/constants/error-codes";
import { LiquidityProviderId } from "@shared/enums/liquidity-provider-id";
import { LiquidityProviderApiException } from "../liquidity-provider-api.exception";

describe("LiquidityProviderApiException", () => {
	it("should have correct properties", () => {
		const exception = new LiquidityProviderApiException({
			liquidityProviderId: LiquidityProviderId.BLINDPAY,
			errorMessage: "API timeout",
		});

		expect(exception.domainCode).toBe(ERROR_CODES.LIQUIDITY_PROVIDER_API_ERROR);
		expect(exception.statusCode).toBe(HttpStatus.BAD_GATEWAY);
		expect(exception.details?.["liquidityProviderId"]).toBe(LiquidityProviderId.BLINDPAY);
		expect(exception.details?.["errorMessage"]).toBe("API timeout");
	});
});
