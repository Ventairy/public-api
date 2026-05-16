# Verification Module

## Purpose

Handles all verification workflows: status tracking, submission for verification, and determining what data fields and files are still missing before verification can be submitted. The module is split into a common `VerificationService` that dispatches based on user type, and a `KybService` (Know Your Business) for business-specific verification logic.

## Endpoints

| Method | Route                  | Rate Limit     | Description                                                                                              |
| ------ | ---------------------- | -------------- | -------------------------------------------------------------------------------------------------------- |
| `POST` | `/verification/submit` | 3 req / 15 min | Submit verification for review — gated on status (PENDING) AND requirements (all fields + files present) |
| `GET`  | `/verification/status` | 20 req / 60s   | Get verification status + missing fields/files for submission readiness                                  |

## Principles

- Missing fields and files are computed dynamically based on `actor.userType` — currently only `BUSINESS` is supported via `KybService`
- The `@RequiredForVerification([UserType])` decorator on input DTO properties marks which data fields are required for verification per user type
- `can_submit` is determined by `_canSubmitVerification(verificationStatus, missing)` — true only when status is PENDING and both `missing.fields` and `missing.files` are empty
- `submitVerification` gates submission; if requirements aren't met, throws `VerificationSubmissionRequirementsNotMetException` (422) with missing details
- Controller role distribution is NOT validated by this endpoint — it is checked at submission time with a specific error
- `fantasy_name` is NOT a verification requirement; `IDENTIFICATION_BACK` is NOT required (only front)
- No business data yet → all required fields and files appear in `missing`
- Missing controller fields are identified by controller ID (e.g., `"controllers.abc-123.legal_first_name"`)
