import { describe, it, expect } from "vitest";
import { HttpStatus } from "@nestjs/common";
import { ERROR_CODES } from "@shared/constants/error-codes";
import { LiquidityProviderId } from "@shared/enums/liquidity-provider-id";
import { SupportedBlockchain } from "@shared/blockchain";
import { WalletNotFoundAtLiquidityProviderException } from "../wallet-not-found-at-liquidity-provider.exception";

describe("WalletAtLiquidityProviderMismatchException", () => {
	it("should have correct properties", () => {
		const exception = new WalletNotFoundAtLiquidityProviderException({
			liquidityProviderId: LiquidityProviderId.BLINDPAY,
			walletAddress: "0xabc",
			chainId: SupportedBlockchain.BASE,
		});

		expect(exception.domainCode).toBe(ERROR_CODES.WALLET_NOT_FOUND_AT_LIQUIDITY_PROVIDER);
		expect(exception.statusCode).toBe(HttpStatus.NOT_FOUND);
		expect(exception.details?.["liquidityProviderId"]).toBe(LiquidityProviderId.BLINDPAY);
		expect(exception.details?.["walletAddress"]).toBe("0xabc");
		expect(exception.details?.["chainId"]).toBe(SupportedBlockchain.BASE);
	});
});
