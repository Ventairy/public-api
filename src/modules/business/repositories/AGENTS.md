# Business Repositories

## Purpose

Data access layer for the Business module. Encapsulates all database queries related to businesses, controllers, and file uploads.

## Files

| File                          | Description                                                                                                                       |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `business.repository.ts`      | CRUD operations across 4 tables: `businesses`, `business_controllers`, `business_files`, `business_controller_files` (16 methods) |
| `business.repository.spec.ts` | Unit tests for BusinessRepository                                                                                                 |

## Methods

### Business table

- `findBusinessByUserId` — lookup business by owner user ID
- `insertBusiness` — create new business row
- `updateBusiness` — update existing business row

### Controllers table

- `findControllersByBusinessId` — get all controllers for a business
- `findBusinessControllerById` — lookup single controller by ID
- `insertBusinessController` — create new controller row
- `updateBusinessController` — update existing controller row

### Business Files table

- `insertBusinessFile` — store file metadata
- `updateBusinessFile` — update existing file row metadata (used when replacing a file)
- `findBusinessFile` — lookup file by user + type
- `findBusinessFileTypesByUserId` — list uploaded file types for a user (returns `BusinessFileType[]`)

### Controller Files table

- `insertBusinessControllerFile` — store controller file metadata
- `updateBusinessControllerFile` — update existing controller file row metadata (used when replacing a file)
- `findBusinessControllerFile` — lookup file by user + controller + type (validates ownership chain)
- `findBusinessControllerFileTypesByControllerIds` — list uploaded file types for controllers (batched by IDs, returns `Map<controllerId, BusinessControllerFileType[]>`)

## Principles

- No business logic or exception throwing (except for "returned no rows" guards on all write operations — both inserts and updates)
- Batch operations handled at the service level via `Promise.all`, never in the repository
- Find methods return `undefined` or `null` for not-found cases — the service decides whether to throw
