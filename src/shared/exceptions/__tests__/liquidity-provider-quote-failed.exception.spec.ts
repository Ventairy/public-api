import { describe, it, expect } from "vitest";
import { HttpStatus } from "@nestjs/common";
import { ERROR_CODES } from "@shared/constants/error-codes";
import { LiquidityProviderId } from "@shared/enums/liquidity-provider-id";
import { LiquidityProviderQuoteFailedException } from "../liquidity-provider-quote-failed.exception";

describe("LiquidityProviderQuoteFailedException", () => {
	it("should have correct properties", () => {
		const exception = new LiquidityProviderQuoteFailedException({
			providerId: LiquidityProviderId.BLINDPAY,
			errorMessage: "API timeout",
		});

		expect(exception.domainCode).toBe(ERROR_CODES.LIQUIDITY_PROVIDER_QUOTE_FAILED);
		expect(exception.statusCode).toBe(HttpStatus.BAD_GATEWAY);
		expect(exception.details?.["providerId"]).toBe(LiquidityProviderId.BLINDPAY);
		expect(exception.details?.["errorMessage"]).toBe("API timeout");
	});
});
