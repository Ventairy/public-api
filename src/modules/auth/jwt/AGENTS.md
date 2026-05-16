# JWT Service

## Purpose

HS256 JWT signing and verification layer using the `jose` library. Generates access tokens with `sub` (userId), `sid` (sessionId), `user_type` (UserType), `wallet_address` (wallet address), and `chain_id` (blockchain network) claims. Tokens are verified by the global `JwtAuthGuard` on every protected request.

## Subdirectories

| Subdirectory  | Description                       |
| ------------- | --------------------------------- |
| `interfaces/` | JWT-related TypeScript interfaces |

## JWT Claims

| Claim            | Description                                                          |
| ---------------- | -------------------------------------------------------------------- |
| `sub`            | User ID (UUID)                                                       |
| `sid`            | Session ID (UUID)                                                    |
| `user_type`      | User type (e.g., `BUSINESS`)                                         |
| `wallet_address` | Ethereum wallet address (lowercased). Embedded for stateless access. |
| `chain_id`       | Blockchain chain ID (e.g., `8453` for Base).                         |
