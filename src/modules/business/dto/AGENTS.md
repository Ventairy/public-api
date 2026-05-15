# Business DTOs

## Purpose

Data Transfer Objects for the Business module — input validation, output serialization, and database-to-DTO mapping.

## Files

| File                                               | Class                                       | Description                                                                                                                                                                                     |
| -------------------------------------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `business-input.dto.ts`                            | `BusinessInputDto`                          | Input for creating/updating business data. All fields optional. Has `fromDatabaseRow()` for reconstructing from DB rows. Fields marked with `@Immutable()` become immutable after KYC approval. |
| `business-address-input.dto.ts`                    | `BusinessAddressInputDto`                   | Input for business address (flattened into businesses table). Has `fromDatabaseRow()`.                                                                                                          |
| `business-controller-input.dto.ts`                 | `BusinessControllerInputDto`                | Input for business controllers. Has `fromDatabaseRow()`. Fields marked with `@Immutable()` (not `id`).                                                                                          |
| `business-controller-identification-input.dto.ts`  | `BusinessControllerIdentificationInputDto`  | Input for controller identification document. Has `fromDatabaseRow()`.                                                                                                                          |
| `business-controller-address-input.dto.ts`         | `BusinessControllerAddressInputDto`         | Input for controller personal address. Has `fromDatabaseRow()`.                                                                                                                                 |
| `business-output.dto.ts`                           | `BusinessOutputDto`                         | Output DTO for business data                                                                                                                                                                    |
| `business-address-output.dto.ts`                   | `BusinessAddressOutputDto`                  | Output DTO for business address                                                                                                                                                                 |
| `business-controller-output.dto.ts`                | `BusinessControllerOutputDto`               | Output DTO for business controller                                                                                                                                                              |
| `business-controller-identification-output.dto.ts` | `BusinessControllerIdentificationOutputDto` | Output DTO for controller identification                                                                                                                                                        |
| `business-controller-address-output.dto.ts`        | `BusinessControllerAddressOutputDto`        | Output DTO for controller address                                                                                                                                                               |
| `business-file-output.dto.ts`                      | `BusinessFileOutputDto`                     | Output DTO for business file                                                                                                                                                                    |
| `upload-business-file-body.dto.ts`                 | `UploadBusinessFileBodyDto`                 | Input for file upload body                                                                                                                                                                      |
| `upload-business-file-output.dto.ts`               | `UploadBusinessFileOutputDto`               | Output for file upload                                                                                                                                                                          |
| `upload-business-controller-file-body.dto.ts`      | `UploadBusinessControllerFileBodyDto`       | Input for controller file upload                                                                                                                                                                |
| `upload-business-controller-file-output.dto.ts`    | `UploadBusinessControllerFileOutputDto`     | Output for controller file upload                                                                                                                                                               |
| `get-business-file-query.dto.ts`                   | `GetBusinessFileQueryDto`                   | Query params for business file retrieval                                                                                                                                                        |
| `get-business-controller-file-query.dto.ts`        | `GetBusinessControllerFileQueryDto`         | Query params for controller file retrieval                                                                                                                                                      |
| `index.ts`                                         |                                             | Barrel exports for all DTOs                                                                                                                                                                     |

## Principles

- Input DTOs (used for API input) have all fields `@IsOptional()` — partial updates
- `fromDatabaseRow()` converts DB `null` to `undefined` for consistent comparison with API input
- Output DTOs use constructor injection with all fields required (non-nullable or `T | null`)
