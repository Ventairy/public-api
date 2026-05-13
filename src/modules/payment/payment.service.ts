import { Inject, Injectable } from "@nestjs/common";
import { UserLiquidityProvidersService } from "@modules/providers/user-liquidity-providers.service";
import { type ILiquidityProvider, type ILiquidityProviderQuote } from "@shared/liquidity-providers";
import { NoActiveLiquidityProviderException } from "@shared/exceptions/no-active-liquidity-provider.exception";
import { ReceiveQuoteOutputDto } from "./dto";
import type { Actor } from "@shared/types/actor.type";
import { type PaymentMethod } from "@shared/constants";
import { AVAILABLE_LIQUIDITY_PROVIDERS_INJECTION_TOKEN } from "@modules/providers/user-liquidity-providers.module";

@Injectable()
export class PaymentService {
	constructor(
		private readonly _userLiquidityProvidersService: UserLiquidityProvidersService,
		@Inject(AVAILABLE_LIQUIDITY_PROVIDERS_INJECTION_TOKEN)
		private readonly _allSupportedProvidersImpl: ILiquidityProvider[],
	) {}

	public async getReceiveQuote(params: {
		actor: Actor;
		amount: string;
		paymentMethod: PaymentMethod;
	}): Promise<ReceiveQuoteOutputDto> {
		const userActiveLiquidityProviders = await this._userLiquidityProvidersService.getActiveLiquidityProviders({
			userId: params.actor.id,
		});

		if (userActiveLiquidityProviders.length === 0) throw new NoActiveLiquidityProviderException(params.actor.id);

		const userActiveLiquidityProvidersIds = userActiveLiquidityProviders.map(
			(liquidityProvider) => liquidityProvider.liquidityProviderId,
		);

		const eligibleLiquidityProvidersImpl = this._allSupportedProvidersImpl.filter(
			(supportedProviderImpl) =>
				userActiveLiquidityProvidersIds.includes(supportedProviderImpl.liquidityProviderId) &&
				supportedProviderImpl.supportedPaymentMethods.includes(params.paymentMethod),
		);

		const quoteResults: ILiquidityProviderQuote[] = (
			await Promise.allSettled(
				eligibleLiquidityProvidersImpl.map((liquidityProviderImpl) => {
					const userLiquidityProvider = userActiveLiquidityProviders.find(
						(userLiquidityProvider) =>
							userLiquidityProvider.liquidityProviderId === liquidityProviderImpl.liquidityProviderId,
					);

					if (!userLiquidityProvider || !userLiquidityProvider.liquidityProviderUserId) {
						return Promise.reject(
							new Error(`No liquidity provider user ID for ${liquidityProviderImpl.liquidityProviderId}`),
						);
					}

					return liquidityProviderImpl.quote({
						liquidityProviderUserId: userLiquidityProvider.liquidityProviderUserId,
						amount: params.amount,
						paymentMethod: params.paymentMethod,
					});
				}),
			)
		)
			.filter((result) => result.status === "fulfilled")
			.map((result) => result.value);

		quoteResults.sort((a, b) => {
			const targetA = parseFloat(a.targetAmount);
			const targetB = parseFloat(b.targetAmount);

			return targetB - targetA;
		});

		return ReceiveQuoteOutputDto.fromLiquidityProvidersQuotes(quoteResults);
	}
}
