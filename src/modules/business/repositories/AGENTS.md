# Business Repositories

## Purpose

Data access layer for the Business module. Encapsulates all database queries related to businesses, controllers, and file uploads.

## Files

| File                          | Description                                                                                                                       |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `business.repository.ts`      | CRUD operations across 4 tables: `businesses`, `business_controllers`, `business_files`, `business_controller_files` (14 methods) |
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
- `findBusinessFile` — lookup file by user + type
- `findBusinessFileTypesByUserId` — list uploaded file types for a user (returns `BusinessFileType[]`)

### Controller Files table

- `insertControllerFile` — store controller file metadata
- `findControllerFile` — lookup file by controller + type
- `findControllerFileTypesByControllerIds` — list uploaded file types for controllers (batched by IDs, returns `Map<controllerId, BusinessControllerFileType[]>`)

## Principles

- No business logic or exception throwing (except for "insert returned no rows" guards)
- Batch operations handled at the service level via `Promise.all`, never in the repository
- Methods return `undefined` or `null` for not-found cases — the service decides whether to throw
