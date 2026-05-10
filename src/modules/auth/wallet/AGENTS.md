# Wallet Auth Services

## Purpose

Wallet-facing authentication services — creating and managing SIWE nonces. The nonce creation endpoint generates wallet-bound, time-limited nonces that clients must sign to prove wallet ownership.

## Files

| File                           | Description                                                                                         |
| ------------------------------ | --------------------------------------------------------------------------------------------------- |
| `wallet-auth.service.ts`       | `WalletAuthService` — orchestrates nonce creation with lazy expired cleanup                         |
| `wallet-auth.service.spec.ts`  | Unit tests for WalletAuthService                                                                    |
| `wallet-nonce.service.ts`      | `WalletNonceService` — random base32 nonce generation, CRUD wrapper over `SignatureNonceRepository` |
| `wallet-nonce.service.spec.ts` | Unit tests for WalletNonceService                                                                   |
