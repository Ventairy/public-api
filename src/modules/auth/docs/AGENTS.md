# Auth Swagger Docs

## Purpose

Swagger/OpenAPI documentation decorators for every auth endpoint. Each decorator contains a thorough `ApiOperation` description covering inputs, cookies, status codes, and security implications — written for developers with zero project context.

## Files

| File                                   | Description                                  |
| -------------------------------------- | -------------------------------------------- |
| `api-create-nonce-docs.decorator.ts`   | Docs for `POST /auth/wallet/nonce/create`    |
| `api-login-docs.decorator.ts`          | Docs for `POST /auth/wallet/login`           |
| `api-refresh-docs.decorator.ts`        | Docs for `POST /auth/refresh`                |
| `api-logout-docs.decorator.ts`         | Docs for `POST /auth/logout`                 |
| `api-list-sessions-docs.decorator.ts`  | Docs for `GET /auth/sessions`                |
| `api-revoke-session-docs.decorator.ts` | Docs for `DELETE /auth/sessions/:session_id` |
| `api-logout-all-docs.decorator.ts`     | Docs for `POST /auth/logout/others`          |
