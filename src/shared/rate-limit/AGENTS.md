# Rate Limit

## Purpose

Cross-cutting rate limiting infrastructure for the Ventairy API. Leverages `@nestjs/throttler` v6 for sliding-window rate limit counting, with a custom guard that differentiates between **authenticated routes** (track by user ID) and **public routes** (track by client IP).

## Files

| File                      | Description                                                                                                                                                                           |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rate-limit.decorator.ts` | `@RateLimit()` and `@SkipRateLimit()` decorators — uses `SetMetadata` to set the same metadata keys the `ThrottlerGuard` reads (`THROTTLER:LIMIT`, `THROTTLER:TTL`, `THROTTLER:SKIP`) |
| `rate-limit.guard.ts`     | `RateLimitGuard extends ThrottlerGuard` — overrides tracker (user ID vs IP) and exception type                                                                                        |
| `ip.utils.ts`             | `IpUtils.extractClientIp()` — extracts real client IP (CF-Connecting-IP → X-Forwarded-For → req.ip → 'unknown')                                                                       |
| `index.ts`                | Barrel exports                                                                                                                                                                        |
| `__tests__/`              | Unit tests for all files                                                                                                                                                              |

## Decorator API

```typescript
// Apply per-endpoint rate limit (requests per time window in seconds)
@RateLimit({ limit: 5, ttlSeconds: 60 })

// Skip rate limiting entirely
@SkipRateLimit()

// No decorator → defaults to 20 req / 60s
```

## Guard Behavior

- **Authenticated routes** (`request.user.id` exists): tracked by `user:{userId}`
- **Public routes** (no `request.user`): tracked by `ip:{clientIp}`
- **Rate-limited response**: HTTP 429 + `RateLimitException` (DomainException) + standard rate-limit headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `Retry-After`)

## Principles

- Keep limits tight on auth and user-creation endpoints (prevent brute-force, nonce spam, account farming)
- Keep limits generous on read-only endpoints (sessions, KYC status, business queries)
- Use IP-based tracking for public (unauthenticated) endpoints
- Use user-ID-based tracking for authenticated endpoints to avoid one user's behavior affecting others on the same IP
