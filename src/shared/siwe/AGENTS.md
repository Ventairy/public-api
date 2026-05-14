# SIWE Utilities

## Purpose

Pure utility functions for parsing and validating ERC-4361 (Sign-In with Ethereum) messages. These functions are consumed by `SiweVerifierService` and provide stateless, side-effect-free validation of SIWE message fields.

## Files

| File                           | Description                                                                                                                                                                                                              |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `siwe-utils.ts`                | `parseSiweMessage`, `validateSiweMessageDomain`, `validateSiweMessageUri`, `validateSiweMessageChainId`, `validateSiweMessageExpiration`, `validateSiweMessageNonce`, `parseAndValidateSiweMessage` — all pure functions |
| `__tests__/siwe-utils.spec.ts` | Unit tests covering all functions — parsing, domain/URI/chainId/expiration/nonce validation, and orchestration                                                                                                           |
| `index.ts`                     | Barrel export                                                                                                                                                                                                            |

## Principles

- **Pure functions only** — no I/O, no state, no side effects.
- **Mock external dependencies** — `siwe` library's `SiweMessage` constructor and `@shared/blockchain`'s `getBlockchainByChainId` are mocked in tests.
- **One exception type** — all validation failures throw `SiweMessageInvalidException`.
