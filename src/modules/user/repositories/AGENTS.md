# User Repositories

## Purpose

Data access layer for the User module. Encapsulates all database queries related to user accounts.

## Principles

- Repository methods are single-purpose and thin — they translate a method call into a Drizzle query and return raw DB row types
- `create()` throws an error if the insert returns no rows (DB constraint)
- No business logic cross-table concerns (KYC is handled by KycRepository)
