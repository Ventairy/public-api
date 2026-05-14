# Shared Enums

## Purpose

Domain enumerations used across the Ventairy Public API. All enums are exported from `index.ts` as a single barrel for convenient imports.

## Files

| File                                       | Description                                         |
| ------------------------------------------ | --------------------------------------------------- |
| `index.ts`                                 | Barrel export re-exporting all enums                |
| `address-proof-type.ts`                    | Types of address proof documents                    |
| `business-controller-file-type.ts`         | File types for business controller documents        |
| `business-controller-role.ts`              | Roles a business controller can hold                |
| `business-file-type.ts`                    | File types for business documents                   |
| `liquidity-provider-id.ts`                 | Identifiers for supported liquidity providers       |
| `mime-type.ts`                             | Supported MIME types for file uploads               |
| `payment-method.ts`                        | Supported payment methods                           |
| `personal-identification-document-type.ts` | Types of personal identification documents          |
| `r2-bucket-type.ts`                        | R2 bucket identifiers for file storage              |
| `user-liquidity-provider-status.ts`        | Status values for user-liquidity-provider relations |
| `user-type.ts`                             | User types (BUSINESS, PERSONAL)                     |
| `ventairy-kyc-status.ts`                   | KYC status values                                   |

## Principles

- All enums are re-exported through `index.ts` — prefer importing from `@shared/enums` rather than individual file paths
- Aliased exports are provided where enum names differ from their conventional usage (e.g., `AddressProofType` is also exported as `ProofAddressType`, `BusinessControllerRole` as `ControllerRole`)
