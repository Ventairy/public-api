# Shared Exceptions

## Purpose

Domain-specific exception classes for the Ventairy Public API. All exceptions extend `DomainException`, which in turn extends NestJS `HttpException`. This ensures every error produces a standardized response with `statusCode`, `code`, `message`, and optional `details`.

## Files

| File                                               | Description                                                                                                           |
| -------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `domain.exception.ts`                              | Base class for all domain exceptions                                                                                  |
| `validation.exception.ts`                          | Validation errors with per-field error details                                                                        |
| `business-not-found.exception.ts`                  | Business profile not found for the given user                                                                         |
| `business-controller-not-found.exception.ts`       | Specific business controller not found                                                                                |
| `business-controller-file-not-found.exception.ts`  | File not found for a specific business controller                                                                     |
| `business-field-immutable.exception.ts`            | Immutable business field cannot be changed after KYC approval (409) — raised by `ImmutableBusinessGuard`              |
| `business-file-immutable.exception.ts`             | File upload rejected because KYC is APPROVED and the file type already exists (409) — raised by immutable file guards |
| `business-file-not-found.exception.ts`             | File not found for a business                                                                                         |
| `business-only.exception.ts`                       | Endpoint restricted to BUSINESS user type                                                                             |
| `file-mime-type-mismatch.exception.ts`             | Uploaded file MIME type does not match the declared type                                                              |
| `file-too-large.exception.ts`                      | Uploaded file exceeds maximum size                                                                                    |
| `invalid-file-mime-type.exception.ts`              | Uploaded file has an unsupported MIME type                                                                            |
| `invalid-siwe-signature.exception.ts`              | SIWE signature is invalid                                                                                             |
| `kyc-not-approved.exception.ts`                    | KYC not APPROVED when `@KYCRequired()` is set (403) — raised by `KYCGuard` with differentiated messages per status    |
| `kyc-status-not-allowed.exception.ts`              | Current KYC status not in allowed set from `@KYCStatus()` (403) — raised by `KYCGuard`                                |
| `user-kyc-not-found.exception.ts`                  | KYC record not found for a user (404) — raised by `KycService._getKycDatabaseRow`                                     |
| `kyc-submission-locked.exception.ts`               | KYC submission locked because status is not PENDING (403)                                                             |
| `kyc-submission-requirements-not-met.exception.ts` | KYC submission blocked by missing data/fields requirements (422)                                                      |
| `kyc-submission-not-found.exception.ts`            | KYC record not found for user                                                                                         |
| `nonce-expired.exception.ts`                       | Authentication nonce has expired                                                                                      |
| `nonce-not-found.exception.ts`                     | Authentication nonce not found                                                                                        |
| `nonce-wallet-mismatch.exception.ts`               | Authentication nonce wallet does not match request                                                                    |
| `nonce-chain-id-mismatch.exception.ts`             | Authentication nonce chain ID does not match SIWE message chain                                                       |
| `rate-limit.exception.ts`                          | Rate limit exceeded                                                                                                   |
| `session-expired.exception.ts`                     | User session has expired                                                                                              |
| `session-not-found.exception.ts`                   | User session not found                                                                                                |
| `signature-verification-unavailable.exception.ts`  | Signature verification service unavailable                                                                            |
| `signer-mismatch.exception.ts`                     | Signer does not match expected address                                                                                |
| `siwe-message-invalid.exception.ts`                | SIWE message format is invalid                                                                                        |
| `user-already-exists.exception.ts`                 | User already registered                                                                                               |
| `user-not-found.exception.ts`                      | User not found in the database                                                                                        |
| `no-active-liquidity-provider.exception.ts`        | User has no active liquidity providers (422)                                                                          |
| `liquidity-provider-quote-failed.exception.ts`     | Liquidity provider API returned an error while requesting a quote (502)                                               |

| `wallet-at-liquidity-provider-mismatch.exception.ts` | User has wallets at the liquidity provider but none match the Ventairy address (403) |
| `liquidity-provider-api.exception.ts` | Liquidity provider API call failed (502) |

## Conventions

- All exceptions accept a single named-parameter object to avoid positional confusion
- HTTP status codes differentiate error categories: 403 (forbidden/locked), 404 (not found), 409 (conflict), 422 (unprocessable), 429 (rate limited)
- Error codes are defined in `src/shared/constants/error-codes.ts` under `ERROR_CODES`
- New exceptions MUST add a new error code and export from `src/shared/exceptions/index.ts`
