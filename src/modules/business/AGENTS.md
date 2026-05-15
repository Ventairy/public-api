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

## Files

| File                                     | Description                                                                                                       |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `business.module.ts`                     | NestJS module definition — registers service, controller, and imports shared dependencies                         |
| `business.controller.ts`                 | REST endpoints for business CRUD, file upload, and file retrieval                                                 |
| `business.service.ts`                    | Business logic: upsert business/controllers, file upload with MIME + size validation, file download               |
| `business.constants.ts`                  | Business domain constants (e.g., `BUSINESS_MAX_FILE_SIZE_BYTES`)                                                  |
| `business-file-type.utils.ts`            | `BusinessFileTypeUtils` namespace — maps `BusinessFileType` enum values to allowed MIME types                     |
| `business-controller-file-type.utils.ts` | `BusinessControllerFileTypeUtils` namespace — maps `BusinessControllerFileType` enum values to allowed MIME types |
| `index.ts`                               | Module barrel exports                                                                                             |

## Principles

- All file uploads validated against a MIME type whitelist per file type enum
- Size validation and MIME validation consolidated in `_validateFile()`
- Controller existence and ownership verified before controller file upload
- File uploads are upserts — re-uploading the same file type replaces the existing DB row and R2 object instead of creating a duplicate
