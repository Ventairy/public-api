# Liquidity Provider Module

## Purpose

Manages liquidity provider access for Ventairy users. Provides read-only queries to determine which liquidity providers are available for a given user.

## Files

| File                                 | Description                                                 |
| ------------------------------------ | ----------------------------------------------------------- |
| `liquidity-provider.module.ts`       | NestJS module definition — registers service and repository |
| `liquidity-provider.service.ts`      | Business logic: `getActiveLiquidityProvidersForUser`        |
| `liquidity-provider.service.spec.ts` | Unit tests for LiquidityProviderService                     |

### Repositories

| File                                                      | Description                                               |
| --------------------------------------------------------- | --------------------------------------------------------- |
| `repositories/user-liquidity-provider.repository.ts`      | Read-only queries on the `user_liquidity_providers` table |
| `repositories/user-liquidity-provider.repository.spec.ts` | Unit tests for UserLiquidityProviderRepository            |
| `repositories/AGENTS.md`                                  | Repository-level documentation                            |

## Endpoints

This module has no endpoints in this block. It is a data-access layer for other modules (e.g., payment orchestration).

## Principles

- Read-only access — this Public API does not insert or update liquidity provider rows. Admin operations belong to a separate Admin API.
- Consumers call `getActiveLiquidityProvidersForUser` to discover which liquidity providers the user can use.
