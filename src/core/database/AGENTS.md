# Database Module

## Purpose

Core database infrastructure for the Ventairy API. Manages the Cloudflare D1 connection via HTTP proxy (`drizzle-orm/sqlite-proxy`), provides the `DRIZZLE_DB` injectable token for repositories, and enables atomic batch operations via `AtomicExecutionService`.

## Key Types

- **`DrizzleDb`** — `SqliteRemoteDatabase<typeof schema>`, injected into all repositories
- **`AtomicDatabaseCall<TResult>`** (public alias `AtomicCall<TResult>`) — Wraps a Drizzle query builder + `processResult` function for deferred atomic execution

## Key Services

- **`DrizzleService`** — Bootstraps the Drizzle ORM instance with `remoteCallback` (single queries) and `batchCallback` (batched queries). Both callbacks communicate with Cloudflare D1 via HTTP API.
- **`AtomicDatabaseExecutionService`** (public alias `AtomicExecutionService`) — Accepts `AtomicCall` instances via `execute()`, delegates to `db.batch()`, and maps results through each call's `processResult`. All queries execute atomically as a single D1 HTTP batch request.

## D1 Batch Semantics

The `batchCallback` sends all queries in a single HTTP request using the D1 batch API (`{ "batch": [...] }`). D1 executes these as a SQL transaction: all statements succeed or all are rolled back. This provides true atomicity for batch operations. The `AtomicExecutionService` wraps this mechanism.

## Principles

- `remoteCallback` handles single queries (used by `db.transaction()` and non-batched operations)
- `batchCallback` sends all queries in a single request for atomic batch execution
- The `DrizzleService` is a singleton — no per-request state
- `AtomicExecutionService` is stateless and injectable
