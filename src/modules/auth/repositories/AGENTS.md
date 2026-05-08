# Auth Repositories

## Purpose

Data access layer for the Auth module. Encapsulates all database queries related to SIWE nonces and authentication flows. Injects the raw Drizzle query builder via `DRIZZLE_DB` token.

## Files

| File                                 | Description                                                                                                         |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `signature-nonce.repository.ts`      | CRUD operations on the `signature_nonces` table (create, findByNonce, deleteByNonceAndWalletAddress, deleteExpired) |
| `signature-nonce.repository.spec.ts` | Unit tests for SignatureNonceRepository                                                                             |

## Principles

- Repository methods are single-purpose and thin — they translate a method call into a Drizzle query and return raw DB row types
- No business logic or exception throwing (except for "insert returned no rows" guards)
- No cross-table queries
