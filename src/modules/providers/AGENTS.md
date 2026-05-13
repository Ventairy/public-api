# User Liquidity Providers Module

## Purpose

Manages liquidity provider access for Ventairy users. Provides read-only queries to determine which liquidity providers are available for a given user.

## Files

| File                                       | Description                                                             |
| ------------------------------------------ | ----------------------------------------------------------------------- |
| `user-liquidity-providers.module.ts`       | NestJS module definition — registers service, repository, and providers |
| `user-liquidity-providers.service.ts`      | Business logic: `getActiveLiquidityProviders`                           |
| `user-liquidity-providers.service.spec.ts` | Unit tests for UserLiquidityProvidersService                            |

### DTOs

| File                                        | Class                            | Description                                         |
| ------------------------------------------- | -------------------------------- | --------------------------------------------------- |
| `dto/user-liquidity-provider-output.dto.ts` | `UserLiquidityProviderOutputDto` | Output: maps a user liquidity provider row to a DTO |
| `dto/liquidity-provider-output.dto.spec.ts` | —                                | Tests for UserLiquidityProviderOutputDto            |

### Repositories

| File                                                       | Description                                               |
| ---------------------------------------------------------- | --------------------------------------------------------- |
| `repositories/user-liquidity-providers.repository.ts`      | Read-only queries on the `user_liquidity_providers` table |
| `repositories/user-liquidity-providers.repository.spec.ts` | Unit tests for UserLiquidityProvidersRepository           |
| `repositories/AGENTS.md`                                   | Repository-level documentation                            |

## Endpoints

This module has no endpoints in this block. It is a data-access layer for other modules (e.g., payment orchestration).

## Principles

- Read-only access — this Public API does not insert or update liquidity provider rows. Admin operations belong to a separate Admin API.
- Consumers call `getActiveLiquidityProviders` to discover which providers are available for a user.
