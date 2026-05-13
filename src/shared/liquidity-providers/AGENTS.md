# Shared Liquidity Providers

## Purpose

Defines the contract and implementations for external liquidity provider integrations. Each provider (e.g., Blindpay) implements the `ILiquidityProvider` interface and is injected into the providers module via `LIQUIDITY_PROVIDERS_INJECTION_TOKEN`.

## Files

| File                                                           | Description                                                                   |
| -------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `interfaces/liquidity-provider-quote.interface.ts`             | Shape of a provider's quote response (`ILiquidityProviderQuote`)              |
| `interfaces/liquidity-provider.interface.ts`                   | Contract all liquidity provider implementations follow (`ILiquidityProvider`) |
| `interfaces/index.ts`                                          | Barrel exports for interfaces                                                 |
| `implementations/blindpay/blindpay-liquidity-provider.ts`      | Blindpay provider stub (throws "not implemented")                             |
| `implementations/blindpay/blindpay-liquidity-provider.spec.ts` | Unit tests for BlindpayLiquidityProvider                                      |

## Principles

- All providers implement `ILiquidityProvider` interface
- Providers are registered in `UserLiquidityProvidersModule` using `LIQUIDITY_PROVIDERS_INJECTION_TOKEN`
- Monetary values are strings to avoid floating-point precision issues
