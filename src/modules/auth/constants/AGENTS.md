# Auth Constants

## Purpose

Exported constants for the Auth module — nonce generation parameters and JWT/session TTLs. Keeps magic numbers and security-sensitive values in a single source of truth.

## Files

| File                 | Description                                                                                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `auth.constants.ts`  | `NONCE_BYTE_LENGTH` (16 bytes) and `NONCE_BASE32_CHARSET` for SIWE nonce generation                                 |
| `token.constants.ts` | TTLs (15m access token, 7d refresh token), `REFRESH_TOKEN_BYTE_LENGTH` (32 bytes), `__Host-ventairy-*` cookie names |
| `index.ts`           | Barrel export of both constants files                                                                               |
