# Liquidity Provider Implementations

## Purpose

Concrete implementations of the `ILiquidityProvider` interface for specific external liquidity providers.

## Subdirectories

| Directory   | Description                   |
| ----------- | ----------------------------- |
| `blindpay/` | Blindpay provider integration |

## Principles

- Each implementation is a self-contained `@Injectable()` class
- All provider-specific logic (API calls, amount parsing, network mapping) lives within the implementation
