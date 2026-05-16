q# SIWE Verification

## Purpose

Sign-In with Ethereum (EIP-4361) verification logic. Parses SIWE messages, validates domain/URI/address/chainId/expiration/nonce against configuration, and verifies the ECDSA signature on-chain via viem + public RPC endpoints.
