# Shared Exceptions

## Purpose

Domain-specific exception classes for the Ventairy Public API. All exceptions extend `DomainException`, which in turn extends NestJS `HttpException`. This ensures every error produces a standardized response with `statusCode`, `code`, `message`, and optional `details`.

## Conventions

- All exceptions accept a single named-parameter object to avoid positional confusion
- HTTP status codes differentiate error categories: 403 (forbidden/locked), 404 (not found), 409 (conflict), 422 (unprocessable), 429 (rate limited)
- Error codes are defined in `src/shared/constants/error-codes.ts` under `ERROR_CODES`
- New exceptions MUST add a new error code and export from `src/shared/exceptions/index.ts`
