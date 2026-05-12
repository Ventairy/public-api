# KYC Module

## Purpose

Handles Know Your Customer (KYC) workflows: status tracking, submission for verification, and determining what data fields and files are still missing before KYC can be submitted. Used by Ventairy dashboards and API consumers.

## Files

| File                     | Description                                                                      |
| ------------------------ | -------------------------------------------------------------------------------- |
| `kyc.module.ts`          | NestJS module definition — registers service, controller, imports BusinessModule |
| `kyc.controller.ts`      | REST endpoints for KYC operations: submit, status                                |
| `kyc.controller.spec.ts` | Unit tests for KycController                                                     |
| `kyc.service.ts`         | Business logic: KYC submission guard, status retrieval, missing computation      |
| `kyc.service.spec.ts`    | Unit tests for KycService                                                        |

### Docs

| File                                        | Description                         |
| ------------------------------------------- | ----------------------------------- |
| `docs/api-submit-kyc-docs.decorator.ts`     | Swagger docs for `POST /kyc/submit` |
| `docs/api-get-kyc-status-docs.decorator.ts` | Swagger docs for `GET /kyc/status`  |

### DTOs

| File                           | Class                | Description                                                                   |
| ------------------------------ | -------------------- | ----------------------------------------------------------------------------- |
| `dto/kyc-status-output.dto.ts` | `KycStatusOutputDto` | KYC status response with user_id, status, can_submit_kyc, missing, timestamps |
| `dto/kyc-missing.dto.ts`       | `KycMissingDto`      | Lists missing data fields and files required for KYC submission               |

### Repositories

| File                                  | Description                        |
| ------------------------------------- | ---------------------------------- |
| `repositories/kyc.repository.ts`      | CRUD operations on the `kyc` table |
| `repositories/kyc.repository.spec.ts` | Unit tests for KycRepository       |
| `repositories/AGENTS.md`              | Repository-level documentation     |

## Endpoints

| Method | Route         | Rate Limit     | Description                                                        |
| ------ | ------------- | -------------- | ------------------------------------------------------------------ |
| `POST` | `/kyc/submit` | 3 req / 15 min | Submit KYC for verification                                        |
| `GET`  | `/kyc/status` | 20 req / 60s   | Get KYC status + missing fields/files for KYC submission readiness |

## Principles

- Missing fields and files are computed dynamically based on `actor.userType` — currently only `BUSINESS` is supported
- The `@RequiredForKYC([UserType])` decorator on input DTO properties marks which data fields are required for KYC per user type
- Required file types are defined in `KYC_REQUIRED_BUSINESS_FILES` and `KYC_REQUIRED_CONTROLLER_FILES` constants
- `can_submit_kyc` is true only when both `missing.fields` and `missing.files` are empty AND the KYC status is `PENDING`
- Controller role distribution is NOT validated by this endpoint — it is checked at submission time with a specific error
- `fantasy_name` is NOT a KYC requirement; `IDENTIFICATION_BACK` is NOT required (only front)
- No business data yet → all required fields and files appear in `missing`
- Missing controller fields are identified by controller ID (e.g., `"controllers.abc-123.legal_first_name"`)
