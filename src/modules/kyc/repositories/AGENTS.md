# KYC Repositories

## Purpose

Data access layer for the KYC module. Encapsulates all database queries related to KYC (Know Your Customer) records.

## Files

| File                     | Description                                                                                                                |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| `kyc.repository.ts`      | CRUD operations on the `kyc` table (findByUserId, getKycStatus, create, create_atomicCall for batch, updateStatusByUserId) |
| `kyc.repository.spec.ts` | Unit tests for KycRepository                                                                                               |

## Principles

- Repository methods are single-purpose and thin — they translate a method call into a Drizzle query and return raw DB row types
- Not-found cases throw `Error` (internal) in write operations and `getKycStatus`; read-only lookups return `undefined`
- Parameters derive from schema types (e.g., `Partial<KycRow>`) — never inline object literals for DB fields
