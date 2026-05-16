# JWT Service

## Purpose

HS256 JWT signing and verification layer using the `jose` library. Generates access tokens with `sub` (userId), `sid` (sessionId), `user_type` (UserType), and `verification_status` (VerificationStatus) claims. Tokens are verified by the global `JwtAuthGuard` on every protected request.

## Subdirectories

| Subdirectory  | Description                       |
| ------------- | --------------------------------- |
| `interfaces/` | JWT-related TypeScript interfaces |

## JWT Claims

| Claim                 | Description                                                                                                                            |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `sub`                 | User ID (UUID)                                                                                                                         |
| `sid`                 | Session ID (UUID)                                                                                                                      |
| `user_type`           | User type (e.g., `BUSINESS`)                                                                                                           |
| `wallet_address`      | Ethereum wallet address (lowercased). Embedded for stateless access.                                                                   |
| `chain_id`            | Blockchain chain ID (e.g., `8453` for Base).                                                                                           |
| `verification_status` | Verification status (`APPROVED`, `PENDING`, `VERIFYING`, `REJECTED`). Embedded for stateless KYC authorization by `VerificationGuard`. |
