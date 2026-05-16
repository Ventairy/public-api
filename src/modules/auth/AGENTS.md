# Auth Module

## Purpose

Handles all authentication concerns: SIWE (Sign-In with Ethereum) nonce creation and verification, JWT-based session management with access + refresh tokens, and multi-device session tracking. Auth endpoints are public (no JWT required). All other routes require a valid JWT access token in the `__Host-ventairy-access` cookie.

## Subdirectories

Each subdirectory has its own `AGENTS.md` — refer to those for details on `constants/`, `docs/`, `dto/`, `guards/`, `jwt/`, `repositories/`, `utils/`, `verification/`, and `wallet/`.

## Public Routes (no auth required)

- `POST /v1/auth/register`
- `POST /v1/auth/wallet/nonce/create`
- `POST /v1/auth/login`
- `POST /v1/auth/refresh`

## Security

- Three global `APP_GUARD` providers run in order: `JwtAuthGuard` (authenticates), `RateLimitGuard` (rate limits), `UserTypeGuard` (authorizes by user type). Verification is enforced per-route via `@RequireVerification()` from `@modules/verification/guards/`.
- Rate limiting is enforced globally via `RateLimitGuard` (registered 2nd, between JwtAuthGuard and UserTypeGuard). Authenticated endpoints are throttled by user ID; public endpoints by client IP.
- Access tokens: HS256, 15-minute TTL, delivered via `__Host-ventairy-access` HTTP-only cookie (SameSite=Strict, Secure). Contains `user_type`, `wallet_address`, and `chain_id` claims. Verification status is fetched from the database on each guarded request.
- Refresh tokens: 256-bit random, SHA-256 hashed in DB, rotated on every use, delivered via `__Host-ventairy-refresh` cookie
- Lazy cleanup: `deleteExpired()` called at the start of every session operation
- Session listing shows active sessions only (excludes expired), flags current session with `is_current`
