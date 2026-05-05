# syntax=docker/dockerfile:1

# ── Builder ────────────────────────────────────────────────────────────────────
FROM oven/bun:1 AS builder
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# ── Runner ──────────────────────────────────────────────────────────────────────
FROM oven/bun:1-slim AS runner
WORKDIR /app

RUN groupadd --system --gid 1001 appgroup && \
    useradd --system --uid 1001 --gid 1001 appuser

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

USER appuser

EXPOSE 3000

CMD ["bun", "run", "start:prod"]
