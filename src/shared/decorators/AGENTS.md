# Shared Decorators

## Purpose

Custom decorators used across the Ventairy Public API for route protection, metadata injection, and DTO field annotations.

## Principles

- All decorators follow the same `Reflect.defineMetadata` pattern with a `DECORATOR_KEY` constant and metadata interface
- Decorators only store metadata — enforcement is done by guards or services
