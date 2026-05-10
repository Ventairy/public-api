# Auth Module

## Purpose

Handles all authentication concerns: SIWE (Sign-In with Ethereum) nonce creation and verification, JWT-based session management with access + refresh tokens, and multi-device session tracking. Auth endpoints are public (no JWT required). All other routes require a valid JWT access token in the `__Host-ventairy-access` cookie.

## Files

| File                      | Description                                                                      |
| ------------------------- | -------------------------------------------------------------------------------- |
| `auth.controller.ts`      | REST endpoints — nonce creation, login, refresh, logout, sessions, logout/others |
| `auth.controller.spec.ts` | Unit tests for AuthController                                                    |
| `auth.module.ts`          | NestJS module definition — registers providers, APP_GUARD (JwtAuthGuard)         |
| `auth.service.ts`         | Orchestration — login, refresh (rotation), logout, session management            |
| `auth.service.spec.ts`    | Unit tests for AuthService                                                       |

## Subdirectories

Each subdirectory has its own `AGENTS.md` — refer to those for details on `constants/`, `docs/`, `dto/`, `guards/`, `jwt/`, `repositories/`, `utils/`, `verification/`, and `wallet/`.

## Public Routes (no auth required)

- `POST /v1/auth/wallet/nonce/create`
- `POST /v1/auth/wallet/login`
- `POST /v1/auth/refresh`

## Security

- Access tokens: HS256, 15-minute TTL, delivered via `__Host-ventairy-access` HTTP-only cookie (SameSite=Strict, Secure)
- Refresh tokens: 256-bit random, SHA-256 hashed in DB, rotated on every use, delivered via `__Host-ventairy-refresh` cookie
- Lazy cleanup: `deleteExpired()` called at the start of every session operation
- Session listing shows active sessions only (excludes expired), flags current session with `is_current`
