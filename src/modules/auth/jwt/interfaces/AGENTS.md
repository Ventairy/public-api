# JWT Interfaces

## Purpose

TypeScript interfaces for JWT-related data structures. Interfaces use the `I` prefix convention to distinguish them from DTOs and types.

## Files

| File                                | Description                                                                                                                          |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `access-token-payload.interface.ts` | `IAccessTokenPayload` — defines the shape of the JWT payload (`sub`, `sid`, `user_type`, `wallet_address`, `chain_id`, `kyc_status`) |

## Principles

- All interfaces prefixed with `I` (e.g., `IAccessTokenPayload`)
- Pure type definitions only — no logic, validation, or serialization decorators
