# Modules

## Purpose

Feature modules for the Ventairy Public API. Each module is self-contained with its own controller, service, DTOs, guards, and tests.

## Subdirectories

| Directory   | Description                                                                 |
| ----------- | --------------------------------------------------------------------------- |
| `auth/`     | SIWE authentication, JWT sessions, refresh token rotation                   |
| `business/` | Business registration, business controller management, business file upload |
| `health/`   | Health check endpoints                                                      |
| `kyc/`      | KYC submission and status workflows                                         |
| `user/`     | User profile and account management                                         |

## Principles

- **Every endpoint MUST have a dedicated rate limit** suited to its specific use case. Use the `@RateLimit()` decorator from `@shared/rate-limit/` to set appropriate limits. Auth and user-creation endpoints require tight limits (prevent brute-force, nonce spam, account farming); read-only endpoints can have generous limits. Public endpoints use IP-based tracking; authenticated endpoints use user-ID-based tracking.
