# Shared Enums

## Purpose

Domain enumerations used across the Ventairy Public API. All enums are exported from `index.ts` as a single barrel for convenient imports.

## Principles

- All enums are re-exported through `index.ts` — prefer importing from `@shared/enums` rather than individual file paths
- Aliased exports are provided where enum names differ from their conventional usage (e.g., `AddressProofType` is also exported as `ProofAddressType`, `BusinessControllerRole` as `ControllerRole`)
