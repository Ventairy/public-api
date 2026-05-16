# ☁️ Cloudflare Worker

Entry point for the Ventairy Public API running on Cloudflare Workers using Cloudflare Containers.

## Purpose

This folder contains the **Cloudflare Worker shim**. Instead of running the NestJS application directly in the Worker's V8 isolate (which has limitations), we use `@cloudflare/containers` to run the application as a container. This allows us to use a full Bun runtime and provides a more predictable execution environment while still leveraging Cloudflare's global network.

## Principles

- **Explicit Environment Injection**: Environment variables are NOT automatically inherited by the container. They must be explicitly passed from the Worker's `env` object to the container instance.
- **Container Lifecycle Management**: The worker is responsible for starting the container, waiting for it to be ready, and forwarding requests.
- **Clean Failure States**: If the container fails to start, the worker must return a `503 Service Unavailable` response with a sanitized error message.
- **Type Safety**: The `Env` interface in `env.d.ts` must always match the variables defined in the main application's `validation.schema.ts`.

## Strict Rules

1.  **Environment Sync**: Whenever a new environment variable is added to the application (in `src/core/config/validation.schema.ts`), it **MUST** also be added to:
    - `wrangler.jsonc` (under `vars` or provided as a secret).
    - `src/worker/env.d.ts` (to ensure type safety in the worker).
    - `src/worker/index.ts` inside the `envVars` object in `startAndWaitForPorts`.
2.  **No Direct Logic**: The worker should remain a thin proxy. Do NOT add business logic, validation, or complex transformations here. All logic belongs in the main NestJS application.
3.  **Endpoint Sync**: If the global API prefix (currently `/v1`) or the health check path (currently `/health/live`) changes in the NestJS app, the `PING_ENDPOINT` in `src/worker/index.ts` MUST be updated accordingly.
4.  **Port Sync**: The `CONTAINER_PORT` in `src/worker/index.ts` must match the `PORT` defined in `app.config.ts` (default: 3000).
