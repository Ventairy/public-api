import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { BlindPay, type CreatePayinQuoteInput, type ListBlockchainWalletsResponse } from "@blindpay/node";
import { BLINDPAY_CONFIG_KEY, type BlindpayConfig } from "@core/config";
import { LiquidityProviderId, PaymentMethod } from "@shared/constants";
import { LiquidityProviderApiException, LiquidityProviderQuoteFailedException } from "@shared/exceptions";
import { SupportedBlockchain } from "@shared/blockchain";
import type { ILiquidityProvider, ILiquidityProviderQuote } from "../../interfaces";
import { WalletNotFoundAtLiquidityProviderException } from "@shared/exceptions/wallet-not-found-at-liquidity-provider.exception";

@Injectable()
export class BlindpayLiquidityProvider implements ILiquidityProvider {
	public readonly liquidityProviderId = LiquidityProviderId.BLINDPAY;
	public readonly supportedPaymentMethods: PaymentMethod[] = [PaymentMethod.PIX];

	private readonly _blindpay: BlindPay;

	constructor(configService: ConfigService) {
		const config = configService.get<BlindpayConfig>(BLINDPAY_CONFIG_KEY);
		if (!config) throw new Error("BlindPay configuration is missing");

		this._blindpay = new BlindPay({ apiKey: config.apiKey, instanceId: config.instanceId });
	}

	public async quoteReceive(params: {
		liquidityProviderUserId: string;
		receiverWalletAddress: string;
		chainId: SupportedBlockchain;
		amount: string;
		paymentMethod: PaymentMethod;
	}): Promise<ILiquidityProviderQuote> {
		const blindpayReceiverWalletId = await this._findBlindPayReceiverWalletAddress({
			receiverId: params.liquidityProviderUserId,
			expectedWalletAddress: params.receiverWalletAddress,
			expectedChainId: params.chainId,
		});

		const quoteResult = await this._blindpay.payins.quotes.create({
			blockchain_wallet_id: blindpayReceiverWalletId.id,
			currency_type: "sender",
			cover_fees: false,
			request_amount: this._parseStringAmountToBlindPayAmount(params.amount),
			payment_method: this._mapReceivePaymentMethodToBlindPay(params.paymentMethod),
			token: this._mapChainIdToBlindpayToken(params.chainId),
			partner_fee_id: null,
		});

		if (quoteResult.error) {
			throw new LiquidityProviderQuoteFailedException({
				providerId: LiquidityProviderId.BLINDPAY,
				errorMessage: quoteResult.error.message,
			});
		}

		const blindpayResponse = quoteResult.data;

		return {
			liquidityProvider: LiquidityProviderId.BLINDPAY,
			paymentMethod: params.paymentMethod,
			sourceAmount: this._parseBlindPayAmountToStringAmount(blindpayResponse.sender_amount),
			targetAmount: this._parseBlindPayAmountToStringAmount(blindpayResponse.receiver_amount),
			targetCurrency: this._mapChainIdToBlindpayToken(params.chainId),
			expiresAt: new Date(blindpayResponse.expires_at).toISOString(),
		};
	}

	private async _findBlindPayReceiverWalletAddress(params: {
		receiverId: string;
		expectedWalletAddress: string;
		expectedChainId: SupportedBlockchain;
	}): Promise<{ id: string; network: string }> {
		const receiverWallets = await this._blindpay.wallets.blockchain.list(params.receiverId);

		if (receiverWallets.error) {
			throw new LiquidityProviderApiException({
				liquidityProviderId: LiquidityProviderId.BLINDPAY,
				errorMessage: receiverWallets.error.message,
			});
		}

		const receiverWallet = receiverWallets.data.find((wallet) => {
			const isChainIdExpected = this._mapChainIdToBlindpayNetwork(params.expectedChainId) === wallet.network;
			const isWalletAddressExpected = wallet.address?.toLowerCase() === params.expectedWalletAddress.toLowerCase();

			return isWalletAddressExpected && isChainIdExpected;
		});

		if (!receiverWallet) {
			throw new WalletNotFoundAtLiquidityProviderException({
				liquidityProviderId: this.liquidityProviderId,
				walletAddress: params.expectedWalletAddress,
				chainId: params.expectedChainId,
			});
		}

		return receiverWallet;
	}

	private _mapChainIdToBlindpayToken(chainId: SupportedBlockchain): CreatePayinQuoteInput["token"] {
		const mapping: Record<SupportedBlockchain, CreatePayinQuoteInput["token"]> = {
			[SupportedBlockchain.BASE]: "USDC",
			[SupportedBlockchain.BASE_SEPOLIA]: "USDB",
		};

		return mapping[chainId];
	}

	private _mapChainIdToBlindpayNetwork(
		chainId: SupportedBlockchain,
	): ListBlockchainWalletsResponse[number]["network"] | undefined {
		const mapping: Record<SupportedBlockchain, ListBlockchainWalletsResponse[number]["network"] | undefined> = {
			[SupportedBlockchain.BASE]: "base",
			[SupportedBlockchain.BASE_SEPOLIA]: "base_sepolia",
		};

		return mapping[chainId];
	}

	private _mapReceivePaymentMethodToBlindPay(paymentMethod: PaymentMethod): CreatePayinQuoteInput["payment_method"] {
		switch (paymentMethod) {
			case PaymentMethod.PIX:
				return "pix";
			default:
				throw new Error(`Unsupported payment method: ${paymentMethod}`);
		}
	}

	private _parseStringAmountToBlindPayAmount(amount: string): number {
		return Math.round(parseFloat(amount) * 100);
	}

	private _parseBlindPayAmountToStringAmount(cents: number): string {
		return (cents / 100).toFixed(2);
	}
}
