# Liquidity Provider Interfaces

## Purpose

Defines the `ILiquidityProvider` contract and `ILiquidityProviderQuote` shape that all provider implementations must follow.

## Files

| File                                    | Description                                                                                         |
| --------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `liquidity-provider.interface.ts`       | `ILiquidityProvider` — contract: `liquidityProviderId`, `supportedPaymentMethods`, `quoteReceive()` |
| `liquidity-provider-quote.interface.ts` | `ILiquidityProviderQuote` — shape of a quote response (amounts, currencies, expiry)                 |
| `index.ts`                              | Barrel exports for both interfaces                                                                  |

## Principles

- All provider implementations MUST implement `ILiquidityProvider`
- Quotes are returned as a plain object matching `ILiquidityProviderQuote`
