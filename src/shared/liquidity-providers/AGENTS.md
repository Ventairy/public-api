# Shared Liquidity Providers

## Purpose

Defines the contract and implementations for external liquidity provider integrations. Each provider (e.g., Blindpay) implements the `ILiquidityProvider` interface and is injected into the providers module via `LIQUIDITY_PROVIDERS_INJECTION_TOKEN`.

## Files

| File       | Description                                     |
| ---------- | ----------------------------------------------- |
| `index.ts` | Barrel export for the liquidity-provider module |

## Subdirectories

| Directory          | Description                                                       |
| ------------------ | ----------------------------------------------------------------- |
| `interfaces/`      | `ILiquidityProvider` contract and `ILiquidityProviderQuote` shape |
| `implementations/` | Concrete provider implementations (Blindpay, etc.)                |

## Principles

- All providers implement `ILiquidityProvider` interface
- Providers are registered in `UserLiquidityProvidersModule` using `LIQUIDITY_PROVIDERS_INJECTION_TOKEN`
- Monetary values are strings to avoid floating-point precision issues
