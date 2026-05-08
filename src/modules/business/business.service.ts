import { Injectable } from "@nestjs/common";
import { R2StorageService } from "@core/storage/r2-storage.service";
import { UserRepository } from "@modules/users/repositories/user.repository";
import { BusinessRepository } from "./repositories/business.repository";
import { type BusinessDatabaseRow } from "@db/schema/businesses-table";
import { type BusinessControllerDatabaseRow } from "@db/schema/business-controllers-table";
import { BusinessFileType, BusinessControllerFileType, R2BucketType } from "@shared/constants";
import { FileTooLargeException } from "@shared/exceptions/file-too-large.exception";
import { InvalidFileMimeTypeException, FileMimeTypeMismatchException } from "@shared/exceptions";
import { BusinessFileNotFoundException } from "@shared/exceptions/business-file-not-found.exception";
import { BusinessFileTypeUtils } from "./business-file-type.utils";
import { BusinessControllerFileTypeUtils } from "./business-controller-file-type.utils";
import { BusinessControllerFileNotFoundException } from "@shared/exceptions/business-controller-file-not-found.exception";
import { BusinessControllerNotFoundException } from "@shared/exceptions/business-controller-not-found.exception";
import { BusinessNotFoundException } from "@shared/exceptions/business-not-found.exception";
import { UserNotFoundException } from "@shared/exceptions/user-not-found.exception";
import { fileTypeFromBuffer } from "file-type";
import { ObjectUtils } from "@shared/utils";
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
		private readonly _userRepository: UserRepository,
		private readonly _businessRepository: BusinessRepository,
		private readonly r2StorageService: R2StorageService,
	) {}

	public async uploadBusinessFile(
		userId: string,
		file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
		fileType: BusinessFileType,
	): Promise<UploadFileOutputDto> {
		await this._validateFileToUpload({
			fileName: file.originalname,
			fileSize: file.size,
			mimeType: file.mimetype,
			allowedMimeTypes: BusinessFileTypeUtils.allowedMimeTypes(fileType),
			fileType,
			buffer: file.buffer,
		});

		const r2Key = this.r2StorageService.generateFileKey(userId);

		const [existingFile] = await Promise.all([
			this._businessRepository.findBusinessFile(userId, fileType),
			this.r2StorageService.uploadFile({
				bucketType: R2BucketType.BUSINESS_FILES,
				key: r2Key,
				body: file.buffer,
				contentType: file.mimetype,
			}),
		]);

		if (existingFile) {
			const updatedRow = await this._businessRepository.updateBusinessFile(existingFile.id, {
				file_name: file.originalname,
				file_size: file.size,
				mime_type: file.mimetype,
				r2_key: r2Key,
			});

			await this.r2StorageService.deleteFile(R2BucketType.BUSINESS_FILES, existingFile.r2_key);

			return UploadFileOutputDto.fromDatabaseRow(updatedRow);
		}

		const insertedRow = await this._businessRepository.insertBusinessFile({
			id: crypto.randomUUID(),
			user_id: userId,
			file_name: file.originalname,
			file_size: file.size,
			mime_type: file.mimetype,
			file_type: fileType,
			r2_key: r2Key,
		});

		return UploadFileOutputDto.fromDatabaseRow(insertedRow);
	}

	public async uploadBusinessControllerFile(
		userId: string,
		controllerId: string,
		file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
		fileType: BusinessControllerFileType,
	): Promise<UploadBusinessControllerFileOutputDto> {
		await this._validateFileToUpload({
			fileName: file.originalname,
			fileSize: file.size,
			mimeType: file.mimetype,
			allowedMimeTypes: BusinessControllerFileTypeUtils.allowedMimeTypes(fileType),
			fileType,
			buffer: file.buffer,
		});

		const business = await this._businessRepository.findBusinessByUserId(userId);
		if (!business) throw new BusinessNotFoundException(userId);

		const controller = await this._businessRepository.findBusinessControllerById(controllerId);

		if (!controller || controller.business_id !== business.id) {
			throw new BusinessControllerNotFoundException(userId, controllerId);
		}

		const r2Key = this.r2StorageService.generateFileKey(userId);

		const [existingFile] = await Promise.all([
			this._businessRepository.findBusinessControllerFile(userId, controllerId, fileType),
			this.r2StorageService.uploadFile({
				bucketType: R2BucketType.BUSINESS_FILES,
				key: r2Key,
				body: file.buffer,
				contentType: file.mimetype,
			}),
		]);

		if (existingFile) {
			const updatedRow = await this._businessRepository.updateBusinessControllerFile(existingFile.id, {
				file_name: file.originalname,
				file_size: file.size,
				mime_type: file.mimetype,
				r2_key: r2Key,
			});

			await this.r2StorageService.deleteFile(R2BucketType.BUSINESS_FILES, existingFile.r2_key);

			return UploadBusinessControllerFileOutputDto.fromDatabaseRow(updatedRow);
		}

		const insertedRow = await this._businessRepository.insertBusinessControllerFile({
			id: crypto.randomUUID(),
			controller_id: controllerId,
			user_id: userId,
			file_name: file.originalname,
			file_size: file.size,
			mime_type: file.mimetype,
			file_type: fileType,
			r2_key: r2Key,
		});

		return UploadBusinessControllerFileOutputDto.fromDatabaseRow(insertedRow);
	}

	public async saveBusiness(userId: string, business: BusinessInputDto): Promise<BusinessOutputDto> {
		const [user, existingBusiness] = await Promise.all([
			this._userRepository.findById(userId),
			this._businessRepository.findBusinessByUserId(userId),
		]);

		if (!user) throw new UserNotFoundException(userId);

		const [updatedBusiness, existingControllers] = await Promise.all([
			this._upsertBusiness(userId, existingBusiness, business),
			Promise.resolve(
				existingBusiness ? this._businessRepository.findControllersByBusinessId(existingBusiness.id) : [],
			),
		]);

		const updatedControllers = await this._upsertBusinessControllers(
			userId,
			updatedBusiness.id,
			existingControllers,
			business.controllers,
		);

		const [businessFileTypes, controllerFileTypes] = await Promise.all([
			this._businessRepository.findBusinessFileTypesByUserId(userId),
			this._businessRepository.findBusinessControllerFileTypesByControllerIds(updatedControllers.map((c) => c.id)),
		]);

		return BusinessOutputDto.fromDatabaseRow(
			updatedBusiness,
			updatedControllers,
			businessFileTypes,
			controllerFileTypes,
		);
	}

	public async getBusiness(userId: string): Promise<BusinessOutputDto> {
		const business = await this._businessRepository.findBusinessByUserId(userId);
		if (!business) throw new BusinessNotFoundException(userId);

		const [controllers, businessFileTypes] = await Promise.all([
			this._businessRepository.findControllersByBusinessId(business.id),
			this._businessRepository.findBusinessFileTypesByUserId(userId),
		]);

		const controllerFileTypes = await this._businessRepository.findBusinessControllerFileTypesByControllerIds(
			controllers.map((c) => c.id),
		);

		return BusinessOutputDto.fromDatabaseRow(business, controllers, businessFileTypes, controllerFileTypes);
	}

	public async getBusinessFile(params: {
		userId: string;
		fileType: BusinessFileType;
	}): Promise<{ buffer: Buffer; fileName: string; mimeType: string }> {
		const fileRow = await this._businessRepository.findBusinessFile(params.userId, params.fileType);

		if (!fileRow) throw new BusinessFileNotFoundException(params.userId, params.fileType);

		const buffer = await this.r2StorageService.getFileBuffer(R2BucketType.BUSINESS_FILES, fileRow.r2_key);
		return { buffer, fileName: fileRow.file_name, mimeType: fileRow.mime_type };
	}

	public async getBusinessControllerFile(params: {
		userId: string;
		controllerId: string;
		fileType: BusinessControllerFileType;
	}): Promise<{ buffer: Buffer; fileName: string; mimeType: string }> {
		const fileRow = await this._businessRepository.findBusinessControllerFile(
			params.userId,
			params.controllerId,
			params.fileType,
		);

		if (!fileRow) throw new BusinessControllerFileNotFoundException(params.userId, params.controllerId);

		const buffer = await this.r2StorageService.getFileBuffer(R2BucketType.BUSINESS_FILES, fileRow.r2_key);
		return { buffer, fileName: fileRow.file_name, mimeType: fileRow.mime_type };
	}

	private async _validateFileToUpload(params: {
		fileName: string;
		fileSize: number;
		mimeType: string;
		allowedMimeTypes: readonly string[];
		fileType: string;
		buffer: Buffer;
	}): Promise<void> {
		if (params.fileSize > BUSINESS_MAX_FILE_SIZE_BYTES) {
			throw new FileTooLargeException({
				fileName: params.fileName,
				fileSize: params.fileSize,
				maxSize: BUSINESS_MAX_FILE_SIZE_BYTES,
			});
		}

		const detectedType = await fileTypeFromBuffer(params.buffer);

		if (!detectedType || !params.allowedMimeTypes.includes(detectedType.mime)) {
			throw new InvalidFileMimeTypeException({
				fileName: params.fileName,
				mimeType: detectedType?.mime ?? "unknown",
				allowedMimeTypes: params.allowedMimeTypes,
				fileType: params.fileType,
			});
		}

		if (detectedType.mime !== params.mimeType) {
			throw new FileMimeTypeMismatchException({
				fileName: params.fileName,
				contentType: params.mimeType,
				detectedMimeType: detectedType.mime,
				allowedMimeTypes: params.allowedMimeTypes,
				fileType: params.fileType,
			});
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

			return this._businessRepository.updateBusiness(existingBusiness.id, fieldsToUpdate);
		}

		const inserted = await this._businessRepository.insertBusiness({
			id: crypto.randomUUID(),
			user_id: userId,
			...rawUpdate,
		});

		return inserted;
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
					const existingRow = existingControllers.find((c) => c.id === controllerToUpdate.id)!;
					writeOperations.push(Promise.resolve([existingRow]));
					continue;
				}

				writeOperations.push(
					this._businessRepository.updateBusinessController(controllerToUpdate.id, updateFields).then((r) => [r]),
				);
			} else {
				writeOperations.push(
					this._businessRepository
						.insertBusinessController({
							id: crypto.randomUUID(),
							business_id: businessId,
							...rawUpdate,
						})
						.then((r) => [r]),
				);
			}
		}

		const writeResults = await Promise.all(writeOperations);
		const updatedControllers = writeResults
			.flatMap((rows) => rows)
			.filter((r): r is BusinessControllerDatabaseRow => r !== undefined);

		return [...untouchedControllers, ...updatedControllers];
	}
}
