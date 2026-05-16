# Business Module

## Purpose

Handles business registration, controller management, and file upload workflows. Used by Ventairy dashboards, admin tools, and external API consumers.

## Subdirectories

| Directory       | Description               |
| --------------- | ------------------------- |
| `__tests__/`    | Unit tests for the module |
| `docs/`         | Module documentation      |
| `dto/`          | Data transfer objects     |
| `repositories/` | Database repository files |

## Principles

- All file uploads validated against a MIME type whitelist per file type enum
- Size validation and MIME validation consolidated in `_validateFile()`
- Controller existence and ownership verified before controller file upload
- File uploads are upserts — re-uploading the same file type replaces the existing DB row and R2 object instead of creating a duplicate
