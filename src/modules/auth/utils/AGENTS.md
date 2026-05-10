# Auth Utils

## Purpose

Stateless utility helpers used by the Auth module controllers to centralize cookie management. Ensures cookie settings (names, TTLs, security flags) are defined in one place and reused across all auth-related endpoints.

## Files

| File                   | Description                                                                                                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cookie.utils.ts`      | `CookieUtils` namespace — `setAuthCookies()` sets access + refresh cookies, `clearAuthCookies()` removes both, `extractCookie()` reads a named cookie from the raw header |
| `cookie.utils.spec.ts` | Unit tests for CookieUtils                                                                                                                                                |

## Principles

- Pure functions only — no I/O, no state, no side effects beyond the response object
- All cookie security flags (httpOnly, secure, sameSite, path) centralized in one `COOKIE_OPTIONS` constant
- TTL values derived from `token.constants.ts` — never hardcoded
