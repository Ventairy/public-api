# User Liquidity Providers Repositories

## Purpose

Data access layer for the User Liquidity Providers module. Encapsulates all database queries related to user liquidity provider assignments.

## Principles

- Repository methods are single-purpose and thin — they translate a method call into a Drizzle query and return raw DB row types
- No business logic or exception throwing
- This API is read-only for liquidity providers — all write operations belong to the Admin API
