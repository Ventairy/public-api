# Payment Module

## Purpose

Handles payment operations: quoting, execution, and status tracking. Currently supports only the "receive" variation (fiat-to-crypto). Future blocks will add "send" (crypto-to-fiat).

## Endpoints

| Method | Route                       | Rate Limit   | Description                                                            |
| ------ | --------------------------- | ------------ | ---------------------------------------------------------------------- |
| `POST` | `/v1/payment/receive/quote` | 10 req / 60s | Get quotes from active liquidity providers for receiving fiat payments |

## Principles

- All endpoints require authentication (no `@Public` decorator)
- All endpoints require KYC approval (`@KYCRequired()` on controller). Non‑APPROVED KYC status returns 403.
- Quotes are returned sorted by target amount descending (best rate first)
- Failed provider quotes are silently skipped — only successful quotes are returned
