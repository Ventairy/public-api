# Auth Repositories

## Purpose

Data access layer for the Auth module. Encapsulates all database queries related to SIWE nonces and session management. Injects the raw Drizzle query builder via `DRIZZLE_DB` token.

## Principles

- Repository methods are single-purpose and thin — they translate a method call into a Drizzle query and return raw DB row types
- No business logic or exception throwing (except for "insert returned no rows" guards)
- No cross-table queries
