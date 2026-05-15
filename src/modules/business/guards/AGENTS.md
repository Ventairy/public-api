# Business Guards

## Purpose

Route guards specific to the Business module. Currently contains the immutable business field enforcement guard.

## Files

| File                                         | Description                                                                                                                              |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `immutable-business.guard.ts`                | Enforces that @Immutable-decorated fields cannot be changed after KYC is APPROVED. Refetches KYC status from DB (not JWT) for freshness. |
| `__tests__/immutable-business.guard.spec.ts` | Unit tests for ImmutableBusinessGuard                                                                                                    |

## Principles

- Guards are method-level (applied via `@UseGuards()` on specific controller methods), not global
- KYC status is always refetched from the database rather than using the JWT claim to avoid staleness
- The guard returns 409 Conflict when immutable fields are violated
