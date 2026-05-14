# Shared Constants

## Purpose

Application-wide constants and error codes for the Ventairy Public API.

## Files

| File             | Description                                                   |
| ---------------- | ------------------------------------------------------------- |
| `index.ts`       | Barrel export — re-exports `ERROR_CODES` and `ErrorCode` type |
| `error-codes.ts` | Error code enum and type used across all domain exceptions    |

## Notes

- Enum values (`MimeType`, `UserType`, `LiquidityProviderId`, etc.) are exported from `@shared/enums`, not from this module
- Any new constant files should be added here and re-exported through `index.ts`
