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

| File                             | Description                                                                                                                                                                      |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `object.utils.ts`                | `ObjectUtils` namespace with `filterUndefined()` — strips `undefined` values from objects while preserving `null`. Used for building sparse DB update objects from partial DTOs. |
| `__tests__/object.utils.spec.ts` | Unit tests for `object.utils.ts` covering all edge cases.                                                                                                                        |
| `crypto.utils.ts`                | `CryptoUtils` namespace with `generateSecureRandom()` (crypto.randomBytes → hex) and `hashSha256()` (SHA-256 hex digest). Used for refresh token generation and session hashing. |
| `__tests__/crypto.utils.spec.ts` | Unit tests for `crypto.utils.ts` — hex length, determinism, correctness.                                                                                                         |
