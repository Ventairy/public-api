# 🧰 Shared Utils

Generic, reusable utility functions that don't belong to any specific domain module.

## Purpose

This folder holds **pure utility functions** — stateless, side-effect-free helpers that operate on primitive types or plain objects. They are imported by modules across the codebase to avoid duplicating common patterns.

## Principles

- **Pure functions only** — no I/O, no state, no side effects. Same input always produces same output.
- **Generic + typed** — use TypeScript generics to keep utilities broadly applicable.
- **Tested exhaustively** — every function has its own spec file with edge cases.
- **Single responsibility** — one util file per category (objects, arrays, strings, etc.).

## Files

| File                                      | Description                                                                                                                                                                              |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `object.utils.ts`                         | `ObjectUtils` namespace with `filterUndefined()` — strips `undefined` values from objects while preserving `null`. Used for building sparse DB update objects from partial DTOs.         |
| `__tests__/object.utils.spec.ts`          | Unit tests for `object.utils.ts` covering all edge cases.                                                                                                                                |
| `crypto.utils.ts`                         | `CryptoUtils` namespace with `generateSecureRandom()` (crypto.randomBytes → hex) and `hashSha256()` (SHA-256 hex digest). Used for refresh token generation and session hashing.         |
| `__tests__/crypto.utils.spec.ts`          | Unit tests for `crypto.utils.ts` — hex length, determinism, correctness.                                                                                                                 |
| `class-metadata.utils.ts`                 | `ClassMetadataUtils` namespace — reads `@Expose` and `@Type` decorator metadata via `class-transformer` internals. Traverses nested DTOs, resolves wire-format paths to property access. |
| `__tests__/class-metadata.utils.spec.ts`  | Unit tests for `ClassMetadataUtils` — expose name extraction, nested class discovery, field path collection, path resolution.                                                            |
| `date.utils.ts`                           | `DateUtils` namespace with `unixSecondsTimestampToISO()` — converts Unix timestamps (seconds) to ISO-8601 strings.                                                                       |
| `__tests__/date.utils.spec.ts`            | Unit tests for `DateUtils`.                                                                                                                                                              |
| `immutable-field.utils.ts`                | `ImmutableFieldUtils` namespace with `hasImmutableViolations()` — recursively checks if any `@Immutable`-decorated field is being changed from a previously-set value. Short-circuits.   |
| `__tests__/immutable-field.utils.spec.ts` | Unit tests for `ImmutableFieldUtils` — violations, nested DTOs, array items by id, short-circuit, undefined/null handling.                                                               |
