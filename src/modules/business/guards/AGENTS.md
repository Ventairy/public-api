# Business Guards

## Purpose

Route guards specific to the Business module. Contains immutable field enforcement guard.

## Files

| File                                         | Description                                                                                                                    |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `immutable-business.guard.ts`                | Enforces that @Immutable-decorated fields cannot be changed after KYC is APPROVED. Refetches KYC status from DB for freshness. |
| `__tests__/immutable-business.guard.spec.ts` | Unit tests for ImmutableBusinessGuard                                                                                          |

## Principles

- KYC status is always refetched from the database rather than using the JWT claim to avoid staleness
- The guard returns 409 Conflict when immutable fields are violated
