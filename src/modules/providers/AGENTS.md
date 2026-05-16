# User Liquidity Providers Module

## Purpose

Manages liquidity provider access for Ventairy users. Provides read-only queries to determine which liquidity providers are available for a given user.

## Endpoints

This module has no endpoints in this block. It is a data-access layer for other modules (e.g., payment orchestration).

## Principles

- Read-only access — this Public API does not insert or update liquidity provider rows. Admin operations belong to a separate Admin API.
- Consumers call `getActiveLiquidityProviders` to discover which providers are available for a user.
