# Auth Guards

## Purpose

NestJS guards that protect routes by (1) validating JWT access tokens, (2) rate limiting, (3) enforcing user type restrictions. Three global `APP_GUARD` providers run in order: `JwtAuthGuard` (authenticates), `RateLimitGuard` (rate limits — defined in `@shared/rate-limit/`), `UserTypeGuard` (authorizes by user type).
