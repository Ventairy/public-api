# 🧰 Shared Utils

Generic, reusable utility functions that don't belong to any specific domain module.

## Purpose

This folder holds **pure utility functions** — stateless, side-effect-free helpers that operate on primitive types or plain objects. They are imported by modules across the codebase to avoid duplicating common patterns.

## Principles

- **Pure functions only** — no I/O, no state, no side effects. Same input always produces same output.
- **Generic + typed** — use TypeScript generics to keep utilities broadly applicable.
- **Tested exhaustively** — every function has its own spec file with edge cases.
- **Single responsibility** — one util file per category (objects, arrays, strings, etc.).
