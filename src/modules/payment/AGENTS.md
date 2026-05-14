# Payment Module

## Purpose

Handles payment operations: quoting, execution, and status tracking. Currently supports only the "receive" variation (fiat-to-crypto). Future blocks will add "send" (crypto-to-fiat).

## Files

| File                      | Description                                                                             |
| ------------------------- | --------------------------------------------------------------------------------------- |
| `payment.module.ts`       | NestJS module definition — registers controller and service                             |
| `payment.service.ts`      | Business logic: `getReceiveQuote` — orchestrates quotes from active liquidity providers |
| `payment.service.spec.ts` | Unit tests for PaymentService                                                           |

### Controllers

| File                                     | Description                                      |
| ---------------------------------------- | ------------------------------------------------ |
| `controllers/payment.controller.ts`      | REST endpoints: `POST /v1/payment/receive/quote` |
| `controllers/payment.controller.spec.ts` | Unit tests for PaymentController                 |

### DTOs

| File                                             | Class                       | Description                                                      |
| ------------------------------------------------ | --------------------------- | ---------------------------------------------------------------- |
| `dto/receive-quote-input.dto.ts`                 | `ReceiveQuoteInputDto`      | Input: `amount` (string) + `payment_method` (PaymentMethod enum) |
| `dto/receive-quote-output.dto.ts`                | `ReceiveQuoteOutputDto`     | Output: `quotes` array of `LiquidityProviderQuoteDto`            |
| `dto/liquidity-provider-quote-output.dto.ts`     | `LiquidityProviderQuoteDto` | Single quote with provider, currencies, amounts, expiry          |
| `dto/__tests__/receive-quote-input.dto.spec.ts`  | —                           | Tests for ReceiveQuoteInputDto                                   |
| `dto/__tests__/receive-quote-output.dto.spec.ts` | —                           | Tests for ReceiveQuoteOutputDto and LiquidityProviderQuoteDto    |

### Docs

| File                                       | Description                           |
| ------------------------------------------ | ------------------------------------- |
| `docs/api-receive-quote-docs.decorator.ts` | Swagger docs for `POST receive/quote` |

## Endpoints

| Method | Route                       | Rate Limit   | Description                                                            |
| ------ | --------------------------- | ------------ | ---------------------------------------------------------------------- |
| `POST` | `/v1/payment/receive/quote` | 10 req / 60s | Get quotes from active liquidity providers for receiving fiat payments |

## Principles

- All endpoints require authentication (no `@Public` decorator)
- All endpoints require KYC approval (`@KYCRequired()` on controller). Non‑APPROVED KYC status returns 403.
- Quotes are returned sorted by target amount descending (best rate first)
- Failed provider quotes are silently skipped — only successful quotes are returned
