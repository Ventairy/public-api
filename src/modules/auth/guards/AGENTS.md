# Auth Guards

## Purpose

NestJS guards that protect routes by validating JWT access tokens. Registered as a global `APP_GUARD` — all routes require a valid access token unless marked with `@Public()`.

## Files

| File                     | Description                                                                                                                      |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| `jwt-auth.guard.ts`      | Global guard — extracts `__Host-ventairy-access` cookie, verifies via `JwtService`, sets `request.user` with `{ id, sessionId }` |
| `jwt-auth.guard.spec.ts` | Unit tests for JwtAuthGuard                                                                                                      |
