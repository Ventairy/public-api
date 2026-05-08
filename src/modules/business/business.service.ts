import { Injectable } from "@nestjs/common";
import { and, eq, inArray } from "drizzle-orm";
import { DrizzleService } from "@core/database/drizzle.service";
import { R2StorageService } from "@core/storage/r2-storage.service";
import { usersTable } from "@db/schema/users-table";
import { businessesTable, type BusinessDatabaseRow } from "@db/schema/businesses-table";
import { businessControllersTable, type BusinessControllerDatabaseRow } from "@db/schema/business-controllers-table";
import { businessFilesTable } from "@db/schema/business-files-table";
import { businessControllerFilesTable } from "@db/schema/business-controller-files-table";
import { BusinessFileType, BusinessControllerFileType, R2BucketType } from "@shared/constants";
import { FileTooLargeException } from "@shared/exceptions/file-too-large.exception";
import { BusinessFileNotFoundException } from "@shared/exceptions/business-file-not-found.exception";
import { BusinessControllerFileNotFoundException } from "@shared/exceptions/business-controller-file-not-found.exception";
import { BusinessControllerNotFoundException } from "@shared/exceptions/business-controller-not-found.exception";
import { BusinessNotFoundException } from "@shared/exceptions/business-not-found.exception";
import { UserNotFoundException } from "@shared/exceptions/user-not-found.exception";
import { ObjectUtils } from "@shared/utils/object.utils";
import { BUSINESS_MAX_FILE_SIZE_BYTES } from "./business.constants";
import {
	type BusinessInputDto,
	UploadFileOutputDto,
	BusinessOutputDto,
	UploadBusinessControllerFileOutputDto,
} from "./dto";

@Injectable()
export class BusinessService {
	constructor(
		private readonly drizzleService: DrizzleService,
		private readonly r2StorageService: R2StorageService,
	) {}

	public async uploadBusinessFile(
		userId: string,
		file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
		fileType: BusinessFileType,
	): Promise<UploadFileOutputDto> {
		this._validateFileSize(file.originalname, file.size);

		const fileId = crypto.randomUUID();
		const r2Key = this.r2StorageService.generateFileKey({
			folder: userId,
			fileId: fileId,
			fileName: file.originalname,
		});

		await this.r2StorageService.uploadFile({
			bucketType: R2BucketType.BUSINESS_FILES,
			key: r2Key,
			body: file.buffer,
			contentType: file.mimetype,
		});

		const rows = await this.drizzleService.db
			.insert(businessFilesTable)
			.values({
				id: fileId,
				user_id: userId,
				file_name: file.originalname,
				file_size: file.size,
				mime_type: file.mimetype,
				file_type: fileType,
				r2_key: r2Key,
			})
			.returning();

		const insertedRow = rows[0];
		if (!insertedRow) throw new Error("File insert returned no rows");

		return UploadFileOutputDto.fromDatabaseRow(insertedRow);
	}

	public async uploadBusinessControllerFile(
		userId: string,
		controllerId: string,
		file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
		fileType: BusinessControllerFileType,
	): Promise<UploadBusinessControllerFileOutputDto> {
		this._validateFileSize(file.originalname, file.size);

		const business = await this._getBusinessByUserId(userId);
		if (!business) throw new BusinessNotFoundException(userId);

		const controller = await this._getControllerById(controllerId);

		if (!controller || controller.business_id !== business.id) {
			throw new BusinessControllerNotFoundException(userId, controllerId);
		}

		const fileId = crypto.randomUUID();
		const r2Key = this.r2StorageService.generateFileKey({
			folder: userId,
			fileId: fileId,
			fileName: file.originalname,
		});

		await this.r2StorageService.uploadFile({
			bucketType: R2BucketType.BUSINESS_FILES,
			key: r2Key,
			body: file.buffer,
			contentType: file.mimetype,
		});

		const rows = await this.drizzleService.db
			.insert(businessControllerFilesTable)
			.values({
				id: fileId,
				controller_id: controllerId,
				file_name: file.originalname,
				file_size: file.size,
				mime_type: file.mimetype,
				file_type: fileType,
				r2_key: r2Key,
			})
			.returning();

		const insertedRow = rows[0];
		if (!insertedRow) throw new Error("File insert returned no rows");

		return UploadBusinessControllerFileOutputDto.fromDatabaseRow(insertedRow);
	}

	public async saveBusiness(userId: string, business: BusinessInputDto): Promise<BusinessOutputDto> {
		const [userRows, businessRows] = await this.drizzleService.db.batch([
			this.drizzleService.db.select().from(usersTable).where(eq(usersTable.id, userId)),
			this.drizzleService.db.select().from(businessesTable).where(eq(businessesTable.user_id, userId)),
		]);

		const user = userRows[0];
		if (!user) throw new UserNotFoundException(userId);

		const existingBusiness = businessRows[0] ?? null;

		const [updatedBusiness, existingControllers] = await Promise.all([
			this._upsertBusiness(userId, existingBusiness, business),
			Promise.resolve(existingBusiness ? this._getBusinessControllers(existingBusiness.id) : []),
		]);

		const updatedControllers = await this._upsertBusinessControllers(
			userId,
			updatedBusiness.id,
			existingControllers,
			business.controllers,
		);

		const [businessFileTypes, controllerFileTypes] = await Promise.all([
			this._getBusinessFileTypesUploaded(userId),
			this._getBusinessControllerFileTypesUploaded(updatedControllers.map((c) => c.id)),
		]);

		return BusinessOutputDto.fromDatabaseRow(
			updatedBusiness,
			updatedControllers,
			businessFileTypes,
			controllerFileTypes,
		);
	}

	public async getBusiness(userId: string): Promise<BusinessOutputDto> {
		const business = await this._getBusinessByUserId(userId);
		if (!business) throw new BusinessNotFoundException(userId);

		const [controllers, businessFileTypes] = await Promise.all([
			this._getBusinessControllers(business.id),
			this._getBusinessFileTypesUploaded(userId),
		]);

		const controllerFileTypes = await this._getBusinessControllerFileTypesUploaded(controllers.map((c) => c.id));

		return BusinessOutputDto.fromDatabaseRow(business, controllers, businessFileTypes, controllerFileTypes);
	}

	public async getBusinessFile(params: {
		userId: string;
		fileType: BusinessFileType;
	}): Promise<{ buffer: Buffer; fileName: string; mimeType: string }> {
		const rows = await this.drizzleService.db
			.select()
			.from(businessFilesTable)
			.where(and(eq(businessFilesTable.user_id, params.userId), eq(businessFilesTable.file_type, params.fileType)));

		const fileRow = rows[0];

		if (!fileRow) throw new BusinessFileNotFoundException(params.userId, params.fileType);

		const buffer = await this.r2StorageService.getFileBuffer(R2BucketType.BUSINESS_FILES, fileRow["r2_key"]);
		return { buffer, fileName: fileRow["file_name"], mimeType: fileRow["mime_type"] };
	}

	public async getBusinessControllerFile(params: {
		userId: string;
		controllerId: string;
		fileType: BusinessControllerFileType;
	}): Promise<{ buffer: Buffer; fileName: string; mimeType: string }> {
		const rows = await this.drizzleService.db
			.select()
			.from(businessControllerFilesTable)
			.where(
				and(
					eq(businessControllerFilesTable.controller_id, params.controllerId),
					eq(businessControllerFilesTable.file_type, params.fileType),
				),
			);

		const fileRow = rows[0];

		if (!fileRow) throw new BusinessControllerFileNotFoundException(params.userId, params.controllerId);

		const buffer = await this.r2StorageService.getFileBuffer(R2BucketType.BUSINESS_FILES, fileRow["r2_key"]);
		return { buffer, fileName: fileRow["file_name"], mimeType: fileRow["mime_type"] };
	}

	private _validateFileSize(fileName: string, fileSize: number): void {
		if (fileSize > BUSINESS_MAX_FILE_SIZE_BYTES) {
			throw new FileTooLargeException({ fileName, fileSize, maxSize: BUSINESS_MAX_FILE_SIZE_BYTES });
		}
	}

	private async _upsertBusiness(
		userId: string,
		existingBusiness: BusinessDatabaseRow | null,
		data: BusinessInputDto,
	): Promise<BusinessDatabaseRow> {
		const rawUpdate: {
			[K in keyof Omit<BusinessDatabaseRow, "id" | "user_id" | "created_at">]-?: BusinessDatabaseRow[K] | undefined;
		} = {
			legal_name: data.legalName,
			fantasy_name: data.fantasyName,
			formation_date: data.formationDate,
			email: data.email,
			tax_id: data.taxId,
			phone_number: data.phoneNumber,
			website: data.website,
			country_code: data.address?.countryCode,
			street: data.address?.street,
			city: data.address?.city,
			state: data.address?.state,
			postal_code: data.address?.postalCode,
			address_proof_type: data.address?.addressProofType,
		};

		if (existingBusiness) {
			const fieldsToUpdate = ObjectUtils.filterUndefined(rawUpdate);
			if (Object.keys(fieldsToUpdate).length === 0) return existingBusiness;

			const rows = await this.drizzleService.db
				.update(businessesTable)
				.set(fieldsToUpdate)
				.where(eq(businessesTable.id, existingBusiness.id))
				.returning();

			return rows[0] ?? existingBusiness;
		}

		const newBusinessId = crypto.randomUUID();

		const rows = await this.drizzleService.db
			.insert(businessesTable)
			.values({
				id: newBusinessId,
				user_id: userId,
				...rawUpdate,
			})
			.returning();

		if (!rows[0]) throw new Error("Business insert returned no rows");
		return rows[0];
	}

	private async _upsertBusinessControllers(
		userId: string,
		businessId: string,
		existingControllers: BusinessControllerDatabaseRow[],
		controllersToUpdate: BusinessInputDto["controllers"],
	): Promise<BusinessControllerDatabaseRow[]> {
		if (controllersToUpdate === undefined || controllersToUpdate.length === 0) {
			return [...existingControllers];
		}

		const existingControllersIds = new Set(existingControllers.map((c) => c.id));
		const untouchedControllers = existingControllers.filter((c) => !controllersToUpdate.some((u) => u.id === c.id));
		const writeOperations: Promise<BusinessControllerDatabaseRow[]>[] = [];

		for (const controllerToUpdate of controllersToUpdate) {
			const rawUpdate: {
				[K in keyof Omit<BusinessControllerDatabaseRow, "id" | "business_id" | "created_at">]-?:
					| BusinessControllerDatabaseRow[K]
					| undefined;
			} = {
				role: controllerToUpdate.role,
				ownership_percentage: controllerToUpdate.ownershipPercentage,
				title: controllerToUpdate.title,
				legal_first_name: controllerToUpdate.legalFirstName,
				legal_last_name: controllerToUpdate.legalLastName,
				date_of_birth: controllerToUpdate.dateOfBirth,
				tax_id: controllerToUpdate.taxId,
				identification_country_code: controllerToUpdate.identification?.countryCode,
				identification_document_type: controllerToUpdate.identification?.documentType,
				address_country_code: controllerToUpdate.address?.countryCode,
				address_street: controllerToUpdate.address?.street,
				address_city: controllerToUpdate.address?.city,
				address_state: controllerToUpdate.address?.state,
				address_postal_code: controllerToUpdate.address?.postalCode,
				address_proof_type: controllerToUpdate.address?.addressProofType,
			};

			if (controllerToUpdate.id) {
				if (!existingControllersIds.has(controllerToUpdate.id)) {
					throw new BusinessControllerNotFoundException(userId, controllerToUpdate.id);
				}

				const updateFields = ObjectUtils.filterUndefined(rawUpdate) as Partial<BusinessControllerDatabaseRow>;

				if (Object.keys(updateFields).length === 0) {
					const existingRow = existingControllers.find((c) => c.id === controllerToUpdate.id);
					writeOperations.push(Promise.resolve(existingRow ? [existingRow] : []));
					continue;
				}

				writeOperations.push(
					this.drizzleService.db
						.update(businessControllersTable)
						.set(updateFields)
						.where(eq(businessControllersTable.id, controllerToUpdate.id))
						.returning(),
				);
			} else {
				const newControllerId = crypto.randomUUID();

				writeOperations.push(
					this.drizzleService.db
						.insert(businessControllersTable)
						.values({
							id: newControllerId,
							business_id: businessId,
							...rawUpdate,
						})
						.returning(),
				);
			}
		}

		const writeResults = await Promise.all(writeOperations);
		const updatedControllers = writeResults
			.map((rows) => rows[0])
			.filter((r): r is BusinessControllerDatabaseRow => r !== undefined);

		return [...untouchedControllers, ...updatedControllers];
	}

	private async _getBusinessByUserId(userId: string): Promise<BusinessDatabaseRow | null> {
		const businessRows = await this.drizzleService.db
			.select()
			.from(businessesTable)
			.where(eq(businessesTable.user_id, userId));

		return businessRows[0] ?? null;
	}

	private async _getBusinessControllers(businessId: string): Promise<BusinessControllerDatabaseRow[]> {
		const controllerRows = await this.drizzleService.db
			.select()
			.from(businessControllersTable)
			.where(eq(businessControllersTable.business_id, businessId));

		return controllerRows;
	}

	private async _getControllerById(controllerId: string): Promise<BusinessControllerDatabaseRow | null> {
		const rows = await this.drizzleService.db
			.select()
			.from(businessControllersTable)
			.where(eq(businessControllersTable.id, controllerId));

		return rows[0] ?? null;
	}

	private async _getBusinessFileTypesUploaded(userId: string): Promise<BusinessFileType[]> {
		const files = await this.drizzleService.db
			.select({ file_type: businessFilesTable.file_type })
			.from(businessFilesTable)
			.where(eq(businessFilesTable.user_id, userId));

		return files.map((f) => f.file_type);
	}

	private async _getBusinessControllerFileTypesUploaded(
		controllerIds: string[],
	): Promise<Map<string, BusinessControllerFileType[]>> {
		const controllerIdToFileTypeMap = new Map<string, BusinessControllerFileType[]>();

		if (controllerIds.length === 0) return controllerIdToFileTypeMap;

		const files = await this.drizzleService.db
			.select({
				controller_id: businessControllerFilesTable.controller_id,
				file_type: businessControllerFilesTable.file_type,
			})
			.from(businessControllerFilesTable)
			.where(inArray(businessControllerFilesTable.controller_id, controllerIds));

		for (const file of files) {
			controllerIdToFileTypeMap.set(file.controller_id, [
				...(controllerIdToFileTypeMap.get(file.controller_id) ?? []),
				file.file_type,
			]);
		}

		return controllerIdToFileTypeMap;
	}
}
