q# SIWE Verification

## Purpose

Sign-In with Ethereum (EIP-4361) verification logic. Parses SIWE messages, validates domain/URI/address/chainId/expiration/nonce against configuration, and verifies the ECDSA signature on-chain via viem + public RPC endpoints.

## Files

| File                            | Description                                                                                                                                                                                                                                   |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `siwe-verifier.service.ts`      | `SiweVerifierService` — full verification flow: SIWE message parsing (domain/uri/chainId/expiration/nonce), nonce lookup, wallet address and chain ID matching against stored nonce, on-chain signature verification, consumed nonce deletion |
| `siwe-verifier.service.spec.ts` | Unit tests for SiweVerifierService                                                                                                                                                                                                            |
| `index.ts`                      | Barrel export                                                                                                                                                                                                                                 |
