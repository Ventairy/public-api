# Blindpay Liquidity Provider

## Purpose

Blindpay (via `@blindpay/node` SDK) liquidity provider implementation. Handles payin quote creation, blockchain wallet resolution, and network-to-chain-id mapping.

## Principles

- All BlindPay API calls are wrapped in try/catch and throw `LiquidityProviderApiException` on failure
- Wallet network validation uses `_mapBlindpayNetworkToSupportedBlockchain` for exhaustive network→chainId mapping
- Amounts are parsed/converted between BlindPay's cent-based format and Ventairy's string-based amount format
