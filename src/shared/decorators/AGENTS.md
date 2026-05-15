# Shared Decorators

## Purpose

Custom decorators used across the Ventairy Public API for route protection, metadata injection, and DTO field annotations.

## Files

| File                            | Description                                                                                                                                                   |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `current-actor.decorator.ts`    | `@CurrentActor()` parameter decorator — injects `request.user` as an `Actor` type                                                                             |
| `public.decorator.ts`           | `@Public()` method decorator — bypasses JWT authentication                                                                                                    |
| `user-type.decorator.ts`        | `@BusinessUserOnly()` method/class decorator — restricts to BUSINESS user type                                                                                |
| `kyc-required.decorator.ts`     | `@KYCRequired()` method decorator — requires KYC APPROVED status                                                                                              |
| `kyc-status.decorator.ts`       | `@KYCStatus(...)` method decorator — allows specific KYC statuses                                                                                             |
| `required-for-kyc.decorator.ts` | `@RequiredForKYC([UserType])` property decorator — marks DTO fields required for KYC submission                                                               |
| `immutable.decorator.ts`        | `@Immutable()` property decorator — marks DTO fields as "cannot change once set". Used by `ImmutableBusinessGuard` to enforce immutability after KYC approval |

## Principles

- All decorators follow the same `Reflect.defineMetadata` pattern with a `DECORATOR_KEY` constant and metadata interface
- Decorators only store metadata — enforcement is done by guards or services
