# Auth Guards

## Purpose

NestJS guards that protect routes by (1) validating JWT access tokens, (2) rate limiting, and (3) enforcing user type restrictions. Three global `APP_GUARD` providers run in order: `JwtAuthGuard` (authenticates), `RateLimitGuard` (rate limits — defined in `@shared/rate-limit/`), `UserTypeGuard` (authorizes by user type).

## Files

| File                      | Description                                                                                                                                                        |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `jwt-auth.guard.ts`       | Global guard — extracts `__Host-ventairy-access` cookie, verifies via `JwtService`, sets `request.user` with `{ id, sessionId, userType, walletAddress, chainId }` |
| `jwt-auth.guard.spec.ts`  | Unit tests for JwtAuthGuard                                                                                                                                        |
| `user-type.guard.ts`      | Global guard — reads `@BusinessUserOnly()` metadata, checks `request.user.userType`, throws `ForbiddenException` (403) if the user type mismatches                 |
| `user-type.guard.spec.ts` | Unit tests for UserTypeGuard                                                                                                                                       |
