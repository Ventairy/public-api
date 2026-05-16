# Verification Repositories

## Purpose

Data access layer for the Verification module. Encapsulates all database queries related to verification records.

## Principles

- Repository methods are single-purpose and thin — they translate a method call into a Drizzle query and return raw DB row types
- Not-found cases throw `Error` (internal) in write operations; read-only lookups return `undefined`; `getVerificationStatus` returns the current status
- Parameters derive from schema types (e.g., `Partial<VerificationRow>`) — never inline object literals for DB fields
