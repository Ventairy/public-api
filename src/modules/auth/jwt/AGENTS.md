# JWT Service

## Purpose

HS256 JWT signing and verification layer using the `jose` library. Generates access tokens with `sub` (userId), `sid` (sessionId), and `user_type` (UserType) claims. Tokens are verified by the global `JwtAuthGuard` on every protected request.

## Files

| File                  | Description                                                                                                     |
| --------------------- | --------------------------------------------------------------------------------------------------------------- |
| `jwt.service.ts`      | `JwtService` — `generateAccessToken()` signs HS256 JWTs, `verifyAccessToken()` verifies and returns the payload |
| `jwt.service.spec.ts` | Unit tests for JwtService                                                                                       |

## Subdirectories

| Subdirectory  | Description                       |
| ------------- | --------------------------------- |
| `interfaces/` | JWT-related TypeScript interfaces |
