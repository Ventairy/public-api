# Business DTOs

## Purpose

Data Transfer Objects for the Business module — input validation, output serialization, and database-to-DTO mapping.

## Principles

- Input DTOs (used for API input) have all fields `@IsOptional()` — partial updates
- `fromDatabaseRow()` converts DB `null` to `undefined` for consistent comparison with API input
- Output DTOs use constructor injection with all fields required (non-nullable or `T | null`)
