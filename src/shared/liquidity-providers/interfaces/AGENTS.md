# Liquidity Provider Interfaces

## Purpose

Defines the `ILiquidityProvider` contract and `ILiquidityProviderQuote` shape that all provider implementations must follow.

## Principles

- All provider implementations MUST implement `ILiquidityProvider`
- Quotes are returned as a plain object matching `ILiquidityProviderQuote`
